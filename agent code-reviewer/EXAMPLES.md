# Examples & Usage Guide

## Running the Code Reviewer

### Basic Usage

```bash
# Review a project
npm run review ./my-project

# Review with specific file types
npm run review ./backend --extensions ts,js

# Using the agent programmatically
npm run dev
```

## Example Projects

### 1. Analyzing Bad Code (`bad-example.ts`)

This file intentionally contains multiple SOLID violations and anti-patterns:

```bash
# Copy example to test directory
cp examples/bad-example.ts test-project/
npm run review ./test-project
```

**Expected Issues Found:**
- ❌ SRP violations (multiple responsibilities)
- ❌ Too many dependencies (DIP violation)
- ❌ Deeply nested code (maintainability issue)
- ❌ N+1 query pattern (performance issue)
- ❌ Code duplication (maintainability)
- ❌ Hardcoded secrets (security issue)
- ❌ Use of eval() (critical security risk)
- ❌ Insufficient error handling

### 2. Analyzing Improved Code (`good-example.ts`)

The refactored version follows SOLID principles:

```bash
# Copy improved example
cp examples/good-example.ts test-project/
npm run review ./test-project
```

**Expected Improvements:**
- ✅ Clear separation of concerns
- ✅ Dependency injection
- ✅ Proper interfaces
- ✅ No security vulnerabilities
- ✅ Better error handling
- ✅ Easy to test and extend
- ✅ Maintainable code structure

## Programmatic Usage

```typescript
import { CodeReviewerAgent } from './src/agent';
import { ReviewRequest } from './src/types';

async function main() {
  const agent = new CodeReviewerAgent(process.env.GEMINI_API_KEY!);
  
  const request: ReviewRequest = {
    projectPath: './my-project',
    focusAreas: 'architecture',
    maxDepth: 10
  };

  try {
    const result = await agent.reviewProject(request);
    
    console.log(`✅ Review Complete`);
    console.log(`Architecture Score: ${result.architectureScore}/100`);
    console.log(`Issues Found: ${result.issues.length}`);
    
    // Access specific issues
    const criticalIssues = result.issues.filter(i => i.severity === 'critical');
    console.log(`Critical Issues: ${criticalIssues.length}`);
    
    // Get AI recommendations
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    
  } catch (error) {
    console.error('Review failed:', error);
  }
}

main();
```

## Sample Output

### Console Output

```
🚀 Starting Agentic Code Reviewer...

📂 Project Path: /path/to/project
🎯 Focus Area: all

[ANALYZING] Starting project analysis...
✓ Analyzed 42 files
  Languages: TypeScript (25), JavaScript (12), JSON (5)
  Complexity: high

[ANALYZING] Detecting architecture issues...
✓ Detected 23 issues
  Critical: 3, High: 8, Medium: 10, Low: 2

[THINKING] Engaging AI for deep analysis...
✓ Sending code context to Gemini...
✓ AI Analysis complete
  Architecture Score: 62/100
  Recommendations: 5

═══════════════════════════════════════════════════════════
          CODE REVIEW ANALYSIS REPORT
═══════════════════════════════════════════════════════════

Architecture Score: 62/100

📊 Analysis Statistics:
  Files Analyzed: 42
  Total Issues Found: 23

📋 Issues by Severity:
  🔴 Critical: 3
  ⚠️  High: 8
  🟡 Medium: 10
  🔵 Low: 2

🎯 Top Issues:
  🔴 1. [SOLID] Class "UserService" violates Single Responsibility Principle
     Effort: medium
     Solution: Break down "UserService" into smaller, focused classes...

  ⚠️  2. [SOLID] Class has too many dependencies - violates DIP
     Effort: high
     Solution: Use Dependency Injection and apply Facade pattern...

💡 AI Recommendations:
  1. Implement Dependency Injection pattern across the codebase
  2. Extract business logic into separate domain layer
  3. Add comprehensive error handling with custom error types
  4. Implement caching strategy for better performance
  5. Add structured logging for production debugging

═══════════════════════════════════════════════════════════

✅ Report saved to: code-review-report.json
```

### JSON Report

```json
{
  "projectPath": "/path/to/project",
  "timestamp": "2026-05-07T10:30:45Z",
  "totalFilesAnalyzed": 42,
  "architectureScore": 62,
  "issues": [
    {
      "severity": "critical",
      "category": "security",
      "description": "Potential hardcoded secrets detected",
      "affectedFiles": [
        "src/config.ts"
      ],
      "suggestedImprovement": "Use environment variables and secure vaults instead of hardcoding",
      "estimatedEffort": "low"
    },
    {
      "severity": "high",
      "category": "solid",
      "description": "Class 'UserService' violates SRP - too large",
      "affectedFiles": [
        "src/services/user.ts"
      ],
      "suggestedImprovement": "Break into smaller classes: UserCreationService, UserUpdateService, etc.",
      "estimatedEffort": "medium"
    }
  ],
  "recommendations": [
    "Implement Dependency Injection pattern",
    "Extract business logic into separate layers",
    "Add comprehensive error handling",
    "Implement caching strategy",
    "Add structured logging"
  ],
  "agentReasoning": "Based on the analysis of 42 files across the codebase, I've identified..."
}
```

## Integration Examples

### GitHub PR Comment Bot

```typescript
// Could be extended to post comments on PRs
async function postReviewToGitHub(result: ReviewResult) {
  const criticalIssues = result.issues.filter(i => i.severity === 'critical');
  
  const comment = `
## 🤖 Agentic Code Review

Architecture Score: **${result.architectureScore}/100**

### Critical Issues
${criticalIssues.map(i => `- ${i.description}`).join('\n')}

### Recommendations
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

[Full Report](link-to-report.json)
  `;
  
  // Post to GitHub API
}
```

### Slack Notification

```typescript
async function notifySlack(result: ReviewResult) {
  const message = {
    channel: '#code-reviews',
    text: '🤖 Code Review Complete',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Architecture Score:* ${result.architectureScore}/100\n*Issues:* ${result.issues.length}`
        }
      }
    ]
  };
  
  // Send to Slack webhook
}
```

### Dashboard Integration

```typescript
// Send to monitoring dashboard
async function logToMonitoring(result: ReviewResult) {
  const metrics = {
    architectureScore: result.architectureScore,
    criticalIssues: result.issues.filter(i => i.severity === 'critical').length,
    highIssues: result.issues.filter(i => i.severity === 'high').length,
    timestamp: new Date().toISOString()
  };
  
  // Send to Datadog, New Relic, etc.
}
```

## Workflow Examples

### Continuous Integration

```bash
#!/bin/bash
# .github/workflows/check.sh

echo "Running Code Review..."
GEMINI_API_KEY=$GEMINI_API_KEY npm run review . > review.log

# Check for critical issues
CRITICAL=$(grep -c '"severity": "critical"' code-review-report.json)

if [ "$CRITICAL" -gt 0 ]; then
  echo "❌ Found $CRITICAL critical issues!"
  exit 1
fi

echo "✅ Code review passed"
exit 0
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run on staged files only
STAGING_AREA=$(git diff --cached --name-only)
echo "STAGING_AREA=$STAGING_AREA" > /tmp/staging.txt

npm run review . 

if [ $? -ne 0 ]; then
  echo "❌ Code review failed. Commit aborted."
  exit 1
fi
```

## Tips for Best Results

1. **Large Projects**: Break into modules for analysis
2. **Mix of Languages**: The tool handles multiple languages
3. **Deep Understanding**: Review the agent's reasoning, not just scores
4. **Actionable Items**: Pick top 5 recommendations to implement first
5. **Iteration**: Run after refactoring to track improvements

## Next Steps

1. ✅ Run on your own project
2. ✅ Review generated report
3. ✅ Implement top recommendations
4. ✅ Re-run to track improvements
5. ✅ Integrate into CI/CD pipeline

---

See DEPLOYMENT.md for more integration options.
