/**
 * Code Reviewer Agent - Main Orchestrator
 * Coordinates analysis workflow with error handling and progress tracking
 */

import { CodeAnalyzer } from './codeAnalyzer';
import { ArchitectureAnalyzer } from './architectureAnalyzer';
import { GeminiClient } from './geminiClient';
import {
  ReviewRequest,
  ReviewResult,
  AgentState,
  AgentError,
  ProjectContext,
  DesignIssue
} from './types';

export class CodeReviewerAgent {
  private codeAnalyzer: CodeAnalyzer;
  private architectureAnalyzer: ArchitectureAnalyzer;
  private geminiClient: GeminiClient;
  private state: AgentState;
  private errors: AgentError[] = [];

  constructor(geminiApiKey: string) {
    this.codeAnalyzer = new CodeAnalyzer();
    this.architectureAnalyzer = new ArchitectureAnalyzer();
    this.geminiClient = new GeminiClient(geminiApiKey);
    this.state = {
      status: 'idle',
      progress: 0,
      currentTask: '',
      errors: []
    };
  }

  /**
   * Main review workflow with error handling
   */
  async reviewProject(request: ReviewRequest): Promise<ReviewResult> {
    try {
      this.setState('analyzing', 'Starting project analysis...');

      // Step 1: Analyze project structure
      const projectContext = await this.analyzeProjectStructure(request);
      this.updateProgress(25);

      // Step 2: Detect architecture issues
      const issues = await this.detectArchitectureIssues(projectContext);
      this.updateProgress(50);

      // Step 3: AI-powered analysis with Gemini
      const result = await this.performAIAnalysis(projectContext, issues);
      this.updateProgress(75);

      // Step 4: Generate final report
      const finalResult = await this.generateFinalReport(result);
      this.updateProgress(100);

      this.setState('complete', 'Analysis complete');
      return finalResult;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Analyze project structure and extract all code files
   */
  private async analyzeProjectStructure(request: ReviewRequest): Promise<ProjectContext> {
    this.setState('analyzing', 'Extracting project structure...');

    try {
      const context = await this.codeAnalyzer.analyzeProject(
        request.projectPath,
        request.fileExtensions
      );

      console.log(`✓ Analyzed ${context.summary.totalFiles} files`);
      console.log(`  Languages: ${Object.keys(context.summary.languages).join(', ')}`);
      console.log(`  Complexity: ${context.summary.estimatedComplexity}`);

      return context;
    } catch (error) {
      throw this.createError(
        'ANALYSIS_FAILED',
        `Failed to analyze project structure: ${error}`,
        true,
        'Check that the project path is correct and accessible'
      );
    }
  }

  /**
   * Detect architecture and design issues
   */
  private async detectArchitectureIssues(context: ProjectContext): Promise<DesignIssue[]> {
    this.setState('analyzing', 'Detecting architecture issues...');

    try {
      const issues = await this.architectureAnalyzer.analyzeArchitecture(context.files);

      const counts = {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      };

      console.log(`✓ Detected ${issues.length} issues`);
      console.log(`  Critical: ${counts.critical}, High: ${counts.high}, Medium: ${counts.medium}, Low: ${counts.low}`);

      return issues;
    } catch (error) {
      throw this.createError(
        'ANALYSIS_FAILED',
        `Failed to detect architecture issues: ${error}`,
        true,
        'Try analyzing a smaller subset of files'
      );
    }
  }

  /**
   * Perform AI-powered analysis using Gemini
   */
  private async performAIAnalysis(
    context: ProjectContext,
    issues: DesignIssue[]
  ): Promise<ReviewResult> {
    this.setState('thinking', 'Engaging AI for deep analysis...');

    try {
      console.log('✓ Sending code context to Gemini...');
      const result = await this.geminiClient.analyzeProjectConversational(context, issues);

      console.log(`✓ AI Analysis complete`);
      console.log(`  Architecture Score: ${result.architectureScore}/100`);
      console.log(`  Recommendations: ${result.recommendations.length}`);

      return result;
    } catch (error) {
      throw this.createError(
        'GEMINI_FAILED',
        `AI analysis failed: ${error}`,
        true,
        'Ensure your Gemini API key is valid and has sufficient quota'
      );
    }
  }

  /**
   * Generate final report
   */
  private async generateFinalReport(result: ReviewResult): Promise<ReviewResult> {
    this.setState('generating', 'Generating final report...');

    try {
      // Enhance result with conversation context
      const conversation = this.geminiClient.getConversationHistory();
      
      // Add metrics
      result.architectureScore = Math.max(0, Math.min(100, result.architectureScore));

      console.log('✓ Report generated successfully');
      return result;
    } catch (error) {
      throw this.createError(
        'REPORT_FAILED',
        `Failed to generate report: ${error}`,
        true
      );
    }
  }

  /**
   * Update agent state
   */
  private setState(status: AgentState['status'], task: string): void {
    this.state.status = status;
    this.state.currentTask = task;
    console.log(`[${status.toUpperCase()}] ${task}`);
  }

  /**
   * Update progress
   */
  private updateProgress(progress: number): void {
    this.state.progress = Math.min(100, progress);
  }

  /**
   * Create and log error
   */
  private createError(
    code: string,
    message: string,
    recoverable: boolean = false,
    suggestion?: string
  ): AgentError {
    const error: AgentError = {
      code,
      message,
      timestamp: new Date().toISOString(),
      recoverable,
      suggestion
    };

    this.errors.push(error);
    this.state.errors.push(error);

    console.error(`[ERROR] ${code}: ${message}`);
    if (suggestion) console.error(`[SUGGESTION] ${suggestion}`);

    return error;
  }

  /**
   * Handle errors gracefully
   */
  private handleError(error: any): void {
    const message = error instanceof Error ? error.message : String(error);
    
    if (!message.includes('Error') && !message.includes('error')) {
      this.createError(
        'UNKNOWN_ERROR',
        message,
        false,
        'Check logs for more details'
      );
    }

    this.setState('error', `Error occurred: ${message}`);
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get all errors
   */
  getErrors(): AgentError[] {
    return [...this.errors];
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.errors = [];
    this.state.errors = [];
  }

  /**
   * Reset agent
   */
  reset(): void {
    this.state = {
      status: 'idle',
      progress: 0,
      currentTask: '',
      errors: []
    };
    this.errors = [];
    this.geminiClient.clearConversationHistory();
  }
}
