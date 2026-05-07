/**
 * Core type definitions for the Agentic Code Reviewer
 */

export interface ReviewRequest {
  projectPath: string;
  fileExtensions?: string[];
  maxDepth?: number;
  designPatterns?: string[];
  focusAreas?: 'architecture' | 'performance' | 'security' | 'scalability' | 'all';
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  size: number;
  dependencies: string[];
}

export interface ProjectContext {
  files: CodeFile[];
  structure: FileTree;
  summary: ProjectSummary;
}

export interface FileTree {
  [key: string]: {
    type: 'file' | 'directory';
    children?: FileTree;
  };
}

export interface ProjectSummary {
  totalFiles: number;
  languages: Record<string, number>;
  estimatedComplexity: 'low' | 'medium' | 'high' | 'very-high';
  potentialPatterns: string[];
}

export interface DesignIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'architecture' | 'solid' | 'performance' | 'maintainability' | 'security';
  description: string;
  affectedFiles: string[];
  suggestedImprovement: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface ReviewResult {
  projectPath: string;
  timestamp: string;
  totalFilesAnalyzed: number;
  issues: DesignIssue[];
  architectureScore: number; // 0-100
  recommendations: string[];
  agentReasoning: string;
}

export interface AgentState {
  status: 'idle' | 'analyzing' | 'thinking' | 'generating' | 'complete' | 'error';
  progress: number;
  currentTask: string;
  errors: AgentError[];
}

export interface AgentError {
  code: string;
  message: string;
  timestamp: string;
  recoverable: boolean;
  suggestion?: string;
}

export interface ConversationTurn {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}
