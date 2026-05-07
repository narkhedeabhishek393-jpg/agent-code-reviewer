/**
 * Design Pattern & Architecture Analyzer
 * Detects SOLID violations, architecture anti-patterns, and suggests improvements
 */

import { CodeFile, DesignIssue } from './types';

export class ArchitectureAnalyzer {
  /**
   * Analyze code for architecture and SOLID violations
   */
  async analyzeArchitecture(files: CodeFile[]): Promise<DesignIssue[]> {
    const issues: DesignIssue[] = [];

    // Run different analysis passes
    issues.push(...this.checkSOLIDViolations(files));
    issues.push(...this.checkMaintainabilityIssues(files));
    issues.push(...this.checkSecurityConcerns(files));
    issues.push(...this.checkPerformanceIssues(files));
    issues.push(...this.checkScalabilityIssues(files));

    // Deduplicate and sort by severity
    return this.deduplicateAndSort(issues);
  }

  /**
   * Single Responsibility Principle
   */
  private checkSOLIDViolations(files: CodeFile[]): DesignIssue[] {
    const issues: DesignIssue[] = [];

    for (const file of files) {
      // Check Single Responsibility
      const classes = this.extractClasses(file.content, file.language);
      for (const cls of classes) {
        if (this.isClassTooLarge(cls.content)) {
          issues.push({
            severity: 'high',
            category: 'solid',
            description: `Class "${cls.name}" violates Single Responsibility Principle - class is too large (${cls.size} lines)`,
            affectedFiles: [file.path],
            suggestedImprovement: `Break down "${cls.name}" into smaller, focused classes. Consider separating concerns like I/O, validation, and business logic.`,
            estimatedEffort: 'medium'
          });
        }

        // Check for God Object (too many dependencies)
        const dependencies = cls.dependencies;
        if (dependencies.length > 8) {
          issues.push({
            severity: 'medium',
            category: 'solid',
            description: `Class "${cls.name}" has too many dependencies (${dependencies.length}) - violates Dependency Inversion Principle`,
            affectedFiles: [file.path],
            suggestedImprovement: `Use Dependency Injection and apply the Facade pattern. Consider grouping related dependencies into aggregates.`,
            estimatedEffort: 'high'
          });
        }
      }

      // Check for tight coupling
      if (this.hasDirectDependencyOnImplementations(file.content)) {
        issues.push({
          severity: 'high',
          category: 'solid',
          description: `File depends on concrete implementations instead of abstractions/interfaces`,
          affectedFiles: [file.path],
          suggestedImprovement: `Refactor to depend on interfaces/abstract classes rather than concrete implementations. Use Dependency Injection.`,
          estimatedEffort: 'medium'
        });
      }
    }

    return issues;
  }

  /**
   * Check maintainability issues
   */
  private checkMaintainabilityIssues(files: CodeFile[]): DesignIssue[] {
    const issues: DesignIssue[] = [];

    for (const file of files) {
      // Check for duplicate code
      const duplicates = this.findDuplicateCode(file.content);
      if (duplicates.length > 0) {
        issues.push({
          severity: 'medium',
          category: 'maintainability',
          description: `Detected ${duplicates.length} instances of duplicate code patterns`,
          affectedFiles: [file.path],
          suggestedImprovement: `Extract duplicate logic into shared utility functions or base classes to improve maintainability and reduce bugs.`,
          estimatedEffort: 'low'
        });
      }

      // Check for deeply nested code
      if (this.hasDeepNesting(file.content)) {
        issues.push({
          severity: 'medium',
          category: 'maintainability',
          description: `File contains deeply nested code (>4 levels) - reduces readability`,
          affectedFiles: [file.path],
          suggestedImprovement: `Refactor using guard clauses, extract functions, or use early returns to flatten nesting and improve readability.`,
          estimatedEffort: 'low'
        });
      }

      // Check for lack of error handling
      if (this.hasInsufficientErrorHandling(file.content)) {
        issues.push({
          severity: 'high',
          category: 'maintainability',
          description: `Insufficient error handling detected - many operations lack try/catch or error checks`,
          affectedFiles: [file.path],
          suggestedImprovement: `Add comprehensive error handling with specific error types. Consider using Result types or custom error classes.`,
          estimatedEffort: 'medium'
        });
      }
    }

    return issues;
  }

  /**
   * Check security concerns
   */
  private checkSecurityConcerns(files: CodeFile[]): DesignIssue[] {
    const issues: DesignIssue[] = [];

    for (const file of files) {
      const content = file.content;

      // Check for hardcoded secrets
      if (/password|secret|api[_-]?key|token|auth/.test(content)) {
        if (/['"](.*?password.*?|.*?secret.*?|.*?key.*?)['"]\s*[:=]/i.test(content)) {
          issues.push({
            severity: 'critical',
            category: 'security',
            description: `Potential hardcoded secrets or credentials detected`,
            affectedFiles: [file.path],
            suggestedImprovement: `Never hardcode secrets. Use environment variables, secure vaults, or configuration management systems.`,
            estimatedEffort: 'low'
          });
        }
      }

      // Check for SQL injection vulnerabilities
      if (/SQL|database|query/.test(content) && /\+\s*['"].*['"]|\$\{/.test(content)) {
        issues.push({
          severity: 'critical',
          category: 'security',
          description: `Potential SQL injection vulnerability - string concatenation in SQL queries`,
          affectedFiles: [file.path],
          suggestedImprovement: `Use parameterized queries or prepared statements to prevent SQL injection attacks.`,
          estimatedEffort: 'medium'
        });
      }

      // Check for eval usage
      if (/\beval\s*\(/.test(content)) {
        issues.push({
          severity: 'critical',
          category: 'security',
          description: `Usage of eval() detected - major security risk`,
          affectedFiles: [file.path],
          suggestedImprovement: `Remove eval() immediately. Use JSON.parse(), Function constructors with sanitized input, or safe alternatives.`,
          estimatedEffort: 'high'
        });
      }
    }

    return issues;
  }

  /**
   * Check performance issues
   */
  private checkPerformanceIssues(files: CodeFile[]): DesignIssue[] {
    const issues: DesignIssue[] = [];

    for (const file of files) {
      const content = file.content;

      // Check for synchronous operations in async context
      if (/async\s+function/.test(content) && /fs\.readFileSync|fs\.writeFileSync/.test(content)) {
        issues.push({
          severity: 'high',
          category: 'performance',
          description: `Synchronous file operations in async function - blocks event loop`,
          affectedFiles: [file.path],
          suggestedImprovement: `Replace sync operations with async alternatives (readFile, writeFile) to prevent blocking.`,
          estimatedEffort: 'low'
        });
      }

      // Check for N+1 queries pattern
      if (/for\s*\(.*in.*\{.*query|foreach.*{.*query/.test(content)) {
        issues.push({
          severity: 'high',
          category: 'performance',
          description: `Potential N+1 query problem - database queries in loops`,
          affectedFiles: [file.path],
          suggestedImprovement: `Use batch queries or joins instead of querying in loops. Consider using eager loading or query optimization.`,
          estimatedEffort: 'medium'
        });
      }

      // Check for unbounded array operations
      if (/\.map\(|\.filter\(|\.reduce\(/.test(content) && /while|for.*length/i.test(content)) {
        issues.push({
          severity: 'medium',
          category: 'performance',
          description: `Potential unbounded array operations - may impact memory usage with large datasets`,
          affectedFiles: [file.path],
          suggestedImprovement: `Consider pagination, streaming, or lazy evaluation for large datasets instead of loading everything into memory.`,
          estimatedEffort: 'medium'
        });
      }
    }

    return issues;
  }

  /**
   * Check scalability issues
   */
  private checkScalabilityIssues(files: CodeFile[]): DesignIssue[] {
    const issues: DesignIssue[] = [];

    for (const file of files) {
      const content = file.content;

      // Check for global state
      if (/^(const|let|var)\s+\w+\s*=/.test(content) && /module\.exports|export\s+(const|let)/.test(content)) {
        if (/(cache|store|state|data|config)\s*=\s*\{/.test(content)) {
          issues.push({
            severity: 'medium',
            category: 'architecture',
            description: `Global mutable state detected - problematic for scalability and testing`,
            affectedFiles: [file.path],
            suggestedImprovement: `Encapsulate state in classes or modules. Use dependency injection to pass state explicitly.`,
            estimatedEffort: 'high'
          });
        }
      }

      // Check for missing logging/monitoring
      if (!/console\.|logger\.|log\.|monitor\(|track\(/.test(content) && content.length > 1000) {
        issues.push({
          severity: 'low',
          category: 'scalability',
          description: `Large file with minimal logging - harder to debug in production`,
          affectedFiles: [file.path],
          suggestedImprovement: `Add structured logging and monitoring points for critical operations and error cases.`,
          estimatedEffort: 'low'
        });
      }

      // Check for hardcoded configuration
      if ((/localhost|127\.0\.0\.1|hardcoded|todo|FIXME|XXX/.test(content)) && 
          (/database|server|port|url/.test(content))) {
        issues.push({
          severity: 'medium',
          category: 'architecture',
          description: `Hardcoded configuration detected - limits environment flexibility`,
          affectedFiles: [file.path],
          suggestedImprovement: `Move configuration to environment variables, config files, or configuration management system.`,
          estimatedEffort: 'low'
        });
      }
    }

    return issues;
  }

  // Helper methods
  private extractClasses(content: string, language: string): Array<{ name: string; content: string; size: number; dependencies: string[] }> {
    const classes: Array<{ name: string; content: string; size: number; dependencies: string[] }> = [];
    
    if (['TypeScript', 'JavaScript'].includes(language)) {
      const classRegex = /class\s+(\w+)[\s\S]*?(?=class\s+\w+|$)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        const dependencies = (match[0].match(/new\s+\w+|this\.\w+\s*=/g) || []).length;
        classes.push({
          name: match[1],
          content: match[0],
          size: match[0].split('\n').length,
          dependencies: []
        });
      }
    }

    return classes;
  }

  private isClassTooLarge(content: string): boolean {
    return content.split('\n').length > 200;
  }

  private hasDirectDependencyOnImplementations(content: string): boolean {
    return /new\s+\w+\(/.test(content) && !/interface|abstract|extends/.test(content);
  }

  private findDuplicateCode(content: string): string[] {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const duplicates: string[] = [];
    const seen = new Map<string, number>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 20) {
        seen.set(trimmed, (seen.get(trimmed) || 0) + 1);
      }
    }

    for (const [line, count] of seen) {
      if (count > 1) duplicates.push(line);
    }

    return duplicates;
  }

  private hasDeepNesting(content: string): boolean {
    const lines = content.split('\n');
    for (const line of lines) {
      const indent = line.search(/\S/);
      if (indent > 20) return true; // More than 5 levels
    }
    return false;
  }

  private hasInsufficientErrorHandling(content: string): boolean {
    const tryBlocks = (content.match(/try\s*\{/g) || []).length;
    const asyncFunctions = (content.match(/async\s+function|async\s*\(/g) || []).length;
    const awaitCalls = (content.match(/await\s+/g) || []).length;

    if (asyncFunctions > 0 && tryBlocks === 0 && awaitCalls > 0) {
      return true;
    }

    return false;
  }

  private deduplicateAndSort(issues: DesignIssue[]): DesignIssue[] {
    const unique = new Map<string, DesignIssue>();

    for (const issue of issues) {
      const key = `${issue.category}:${issue.description}`;
      if (!unique.has(key)) {
        unique.set(key, issue);
      } else {
        const existing = unique.get(key)!;
        existing.affectedFiles = [...new Set([...existing.affectedFiles, ...issue.affectedFiles])];
      }
    }

    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = Array.from(unique.values()).sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return sorted;
  }
}
