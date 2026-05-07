/**
 * Code Analyzer - Extracts and analyzes code structure
 * Handles multi-file context and dependency tracking
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodeFile, FileTree, ProjectContext, ProjectSummary } from './types';

export class CodeAnalyzer {
  private maxDepth: number = 10;
  private supportedExtensions: Set<string> = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.cpp', '.c',
    '.cs', '.rb', '.php', '.swift', '.kt', '.scala'
  ]);

  constructor(maxDepth: number = 10) {
    this.maxDepth = maxDepth;
  }

  /**
   * Analyze entire project and build context
   */
  async analyzeProject(projectPath: string, extensions?: string[]): Promise<ProjectContext> {
    if (extensions) {
      this.supportedExtensions = new Set(extensions);
    }

    const files = await this.getAllCodeFiles(projectPath);
    const structure = this.buildFileTree(projectPath, files);
    const summary = this.generateProjectSummary(files);

    return {
      files,
      structure,
      summary
    };
  }

  /**
   * Recursively get all code files from project
   */
  private async getAllCodeFiles(dir: string, depth: number = 0): Promise<CodeFile[]> {
    const files: CodeFile[] = [];

    if (depth > this.maxDepth) return files;

    // Skip common directories
    const skipDirs = new Set([
      'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
      'venv', '.venv', 'target', '.gradle'
    ]);

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (skipDirs.has(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getAllCodeFiles(fullPath, depth + 1);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.supportedExtensions.has(ext)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const dependencies = this.extractDependencies(content, ext);

            files.push({
              path: fullPath,
              content,
              language: this.getLanguage(ext),
              size: fs.statSync(fullPath).size,
              dependencies
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Error reading directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Build hierarchical file tree structure
   */
  private buildFileTree(basePath: string, files: CodeFile[]): FileTree {
    const tree: FileTree = {};

    for (const file of files) {
      const relativePath = path.relative(basePath, file.path);
      const parts = relativePath.split(path.sep);

      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = { type: 'file' };
        } else {
          if (!current[part]) {
            current[part] = { type: 'directory', children: {} };
          }
          if (current[part].type === 'directory' && current[part].children) {
            current = current[part].children!;
          }
        }
      }
    }

    return tree;
  }

  /**
   * Extract dependencies from code
   */
  private extractDependencies(content: string, ext: string): string[] {
    const dependencies = new Set<string>();

    // JavaScript/TypeScript imports
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        dependencies.add(match[1]);
      }
      while ((match = requireRegex.exec(content)) !== null) {
        dependencies.add(match[1]);
      }
    }

    // Python imports
    if (ext === '.py') {
      const importRegex = /^(?:from|import)\s+([^\s.][^\s]*)/gm;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        dependencies.add(match[1]);
      }
    }

    // Java imports
    if (ext === '.java') {
      const importRegex = /import\s+([^;]+);/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        dependencies.add(match[1]);
      }
    }

    return Array.from(dependencies);
  }

  /**
   * Generate project-level summary
   */
  private generateProjectSummary(files: CodeFile[]): ProjectSummary {
    const languages: Record<string, number> = {};
    let totalLines = 0;

    for (const file of files) {
      languages[file.language] = (languages[file.language] || 0) + 1;
      totalLines += file.content.split('\n').length;
    }

    // Estimate complexity
    let complexity: 'low' | 'medium' | 'high' | 'very-high' = 'low';
    if (files.length > 50 && totalLines > 10000) complexity = 'very-high';
    else if (files.length > 20 && totalLines > 5000) complexity = 'high';
    else if (files.length > 10 && totalLines > 1000) complexity = 'medium';

    // Detect potential patterns
    const potentialPatterns = this.detectPatterns(files);

    return {
      totalFiles: files.length,
      languages,
      estimatedComplexity: complexity,
      potentialPatterns
    };
  }

  /**
   * Detect design patterns in code
   */
  private detectPatterns(files: CodeFile[]): string[] {
    const patterns = new Set<string>();

    const content = files.map(f => f.content).join('\n');

    // Pattern detection heuristics
    if (/class\s+\w+\s+extends/.test(content)) patterns.add('Inheritance');
    if (/interface\s+\w+|implements\s+\w+/.test(content)) patterns.add('Interface Segregation');
    if (/Observer|EventEmitter|subscribe|publish/.test(content)) patterns.add('Observer Pattern');
    if (/Singleton|getInstance|static.*instance/.test(content)) patterns.add('Singleton Pattern');
    if (/Factory|createInstance/.test(content)) patterns.add('Factory Pattern');
    if (/async\s+function|Promise|async.*await/.test(content)) patterns.add('Async/Await');
    if (/\bmiddleware\b|use\s*\(|chain/.test(content)) patterns.add('Middleware Pattern');
    if (/reducer|dispatch|action/.test(content)) patterns.add('Redux-like Pattern');
    if (/Dependency\s*Injection|@Inject|constructor.*{/.test(content)) patterns.add('Dependency Injection');

    return Array.from(patterns);
  }

  /**
   * Get language from file extension
   */
  private getLanguage(ext: string): string {
    const langMap: Record<string, string> = {
      '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript',
      '.py': 'Python', '.java': 'Java', '.go': 'Go', '.rs': 'Rust',
      '.cpp': 'C++', '.c': 'C', '.cs': 'C#', '.rb': 'Ruby',
      '.php': 'PHP', '.swift': 'Swift', '.kt': 'Kotlin', '.scala': 'Scala'
    };
    return langMap[ext] || 'Unknown';
  }

  /**
   * Get code metrics for a file
   */
  getCodeMetrics(file: CodeFile): Record<string, number> {
    const lines = file.content.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
    const comments = (file.content.match(/\/\/|\/\*|#|--/g) || []).length;
    const functions = (file.content.match(/function\s+\w+|def\s+\w+|func\s+\w+|fn\s+\w+/g) || []).length;
    const classes = (file.content.match(/class\s+\w+/g) || []).length;

    return {
      totalLines: lines.length,
      nonEmptyLines,
      commentCount: comments,
      functionCount: functions,
      classCount: classes,
      complexity: nonEmptyLines / Math.max(functions, 1) // Average lines per function
    };
  }
}
