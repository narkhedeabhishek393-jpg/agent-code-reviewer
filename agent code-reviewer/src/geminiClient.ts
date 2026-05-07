/**
 * Gemini API Client
 * Handles communication with Google's Gemini API for intelligent code analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProjectContext, DesignIssue, ReviewResult, ConversationTurn } from './types';

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: any;
  private conversationHistory: ConversationTurn[] = [];
  private systemPrompt: string;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    this.systemPrompt = this.buildSystemPrompt();
  }

  private buildSystemPrompt(): string {
    return `You are an expert Senior Software Engineer AI Agent specializing in architectural code review. 
You have deep knowledge of design patterns, SOLID principles, system architecture, and best practices.

Your responsibilities:
1. Analyze code structures and identify architectural issues
2. Provide actionable suggestions for improvement
3. Explain your reasoning clearly
4. Consider trade-offs and implementation effort
5. Give priority to security, scalability, and maintainability

When analyzing code, consider:
- SOLID Principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)
- Design Patterns (Factory, Observer, Singleton, Strategy, etc.)
- Code metrics (complexity, duplication, size)
- Security concerns
- Performance implications
- Testability and maintainability
- Scalability for growth

Format your analysis clearly with:
- Issue identification
- Severity assessment
- Recommended solutions
- Implementation effort estimation
- Expected benefits

Be specific with file references and provide concrete code suggestions when possible.`;
  }

  /**
   * Analyze project with multi-turn conversation
   */
  async analyzeProjectConversational(
    context: ProjectContext,
    issues: DesignIssue[]
  ): Promise<ReviewResult> {
    const analysisPrompt = this.buildAnalysisPrompt(context, issues);
    
    // First turn: Initial analysis
    const initialAnalysis = await this.sendMessage(analysisPrompt);
    
    // Second turn: Deep dive into critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      const criticalPrompt = `Based on your analysis, let's focus on the ${criticalIssues.length} critical issues. 
Please provide detailed remediation strategies for each, including code examples and migration steps.`;
      await this.sendMessage(criticalPrompt);
    }

    // Third turn: Generate recommendations
    const recommendationsPrompt = `Now, summarize the top 5 architectural improvements that would have the most impact on this project's quality and scalability. 
Consider implementation effort vs. benefit. Format as prioritized recommendations.`;
    const recommendations = await this.sendMessage(recommendationsPrompt);

    // Extract structured data from conversation
    const result = this.parseAnalysisResult(context, issues, recommendations);
    return result;
  }

  /**
   * Send message in conversation
   */
  async sendMessage(message: string): Promise<string> {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      const response = await this.model.generateContent({
        contents: this.conversationHistory.map(turn => ({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }]
        }))
      });

      const responseText = response.response.text();
      
      this.conversationHistory.push({
        role: 'agent',
        content: responseText,
        timestamp: new Date().toISOString()
      });

      return responseText;
    } catch (error) {
      console.error('Error communicating with Gemini:', error);
      throw new Error(`Gemini API error: ${error}`);
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(context: ProjectContext, issues: DesignIssue[]): string {
    const summary = context.summary;
    const issuesSummary = this.categorizeIssues(issues);

    return `I need you to analyze this project and provide architectural recommendations.

PROJECT OVERVIEW:
- Total Files: ${summary.totalFiles}
- Languages: ${Object.entries(summary.languages).map(([lang, count]) => `${lang} (${count})`).join(', ')}
- Estimated Complexity: ${summary.estimatedComplexity}
- Detected Patterns: ${summary.potentialPatterns.join(', ')}

IDENTIFIED ISSUES:
Critical (${issuesSummary.critical}):
${issues.filter(i => i.severity === 'critical').slice(0, 3).map(i => `- ${i.description}`).join('\n')}

High (${issuesSummary.high}):
${issues.filter(i => i.severity === 'high').slice(0, 3).map(i => `- ${i.description}`).join('\n')}

Medium (${issuesSummary.medium}):
${issues.filter(i => i.severity === 'medium').slice(0, 3).map(i => `- ${i.description}`).join('\n')}

SAMPLE FILES ANALYZED:
${context.files.slice(0, 3).map(f => `- ${f.path} (${f.language}, ${f.content.split('\n').length} lines)`).join('\n')}

Please provide:
1. Your assessment of the overall architecture quality
2. Root causes of the most critical issues
3. Specific architectural patterns that could improve the codebase
4. Proposed refactoring strategy
5. Impact analysis and effort estimation`;
  }

  /**
   * Parse analysis result from conversation
   */
  private parseAnalysisResult(
    context: ProjectContext,
    issues: DesignIssue[],
    analysisText: string
  ): ReviewResult {
    // Calculate architecture score
    const issueWeights = {
      critical: 25,
      high: 10,
      medium: 5,
      low: 1
    };

    let scoreDeduction = 0;
    for (const issue of issues) {
      scoreDeduction += issueWeights[issue.severity];
    }

    const architectureScore = Math.max(0, Math.min(100, 100 - scoreDeduction));

    // Extract recommendations from analysis
    const recommendations = this.extractRecommendations(analysisText);

    // Build reasoning from conversation
    const agentReasoning = this.buildReasoningNarrative();

    return {
      projectPath: context.files[0]?.path || 'unknown',
      timestamp: new Date().toISOString(),
      totalFilesAnalyzed: context.summary.totalFiles,
      issues,
      architectureScore,
      recommendations,
      agentReasoning
    };
  }

  /**
   * Extract recommendations from analysis text
   */
  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];

    // Parse numbered lists
    const numberPattern = /^\d+\.\s+(.+)$/gm;
    let match;
    while ((match = numberPattern.exec(text)) !== null) {
      if (match[1].length > 10 && match[1].length < 200) {
        recommendations.push(match[1]);
      }
    }

    // Parse bullet points
    const bulletPattern = /^[-*]\s+(.+)$/gm;
    while ((match = bulletPattern.exec(text)) !== null) {
      if (match[1].length > 10 && match[1].length < 200 && !recommendations.includes(match[1])) {
        recommendations.push(match[1]);
      }
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Build reasoning narrative from conversation history
   */
  private buildReasoningNarrative(): string {
    const turns = this.conversationHistory.filter(t => t.role === 'agent');
    if (turns.length === 0) return '';

    // Take the last agent response as the main reasoning
    return turns[turns.length - 1].content.substring(0, 1000) + '...';
  }

  /**
   * Categorize issues by severity
   */
  private categorizeIssues(issues: DesignIssue[]): Record<string, number> {
    return {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationTurn[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }
}
