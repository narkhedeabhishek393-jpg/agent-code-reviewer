/**
 * CLI Interface for Agentic Code Reviewer
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodeReviewerAgent } from './agent';
import { ReviewRequest } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const projectPath = args[0];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.error('   Please set your Gemini API key:');
    console.error('   export GEMINI_API_KEY="your-api-key"');
    process.exit(1);
  }

  if (!fs.existsSync(projectPath)) {
    console.error(`❌ Error: Project path does not exist: ${projectPath}`);
    process.exit(1);
  }

  const request: ReviewRequest = {
    projectPath: path.resolve(projectPath),
    maxDepth: 10,
    focusAreas: 'all'
  };

  // Parse additional options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--extensions') {
      request.fileExtensions = args[i + 1]?.split(',') || [];
      i++;
    }
  }

  console.log('\n🚀 Starting Agentic Code Reviewer...\n');
  console.log('📂 Project Path:', request.projectPath);
  console.log('🎯 Focus Area:', request.focusAreas);
  console.log('');

  const agent = new CodeReviewerAgent(apiKey);

  try {
    const result = await agent.reviewProject(request);

    // Print results
    printResults(result);

    // Save report
    const reportPath = path.join(process.cwd(), 'code-review-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    console.log(`\n✅ Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('\n❌ Review failed:', error);
    const state = agent.getState();
    const errors = agent.getErrors();

    if (errors.length > 0) {
      console.log('\n📋 Errors encountered:');
      for (const err of errors) {
        console.log(`  - [${err.code}] ${err.message}`);
        if (err.suggestion) console.log(`    💡 ${err.suggestion}`);
      }
    }
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Usage: npx ts-node src/cli.ts <project-path> [options]

Options:
  --extensions <ext1,ext2>    File extensions to analyze (default: all supported)
  
Example:
  npx ts-node src/cli.ts ./my-project
  npx ts-node src/cli.ts ./backend --extensions ts,js
  `);
}

function printResults(result: any) {
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const red = '\x1b[31m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  console.log(`\n${bold}═══════════════════════════════════════════════════════════${reset}`);
  console.log(`${bold}          CODE REVIEW ANALYSIS REPORT${reset}`);
  console.log(`${bold}═══════════════════════════════════════════════════════════${reset}\n`);

  // Architecture Score
  const score = result.architectureScore;
  const scoreColor = score >= 80 ? green : score >= 60 ? yellow : red;
  console.log(`${bold}Architecture Score: ${scoreColor}${score}/100${reset}`);

  // Statistics
  console.log(`\n${bold}📊 Analysis Statistics:${reset}`);
  console.log(`  Files Analyzed: ${result.totalFilesAnalyzed}`);
  console.log(`  Total Issues Found: ${result.issues.length}`);

  // Issues by severity
  const critical = result.issues.filter((i: any) => i.severity === 'critical');
  const high = result.issues.filter((i: any) => i.severity === 'high');
  const medium = result.issues.filter((i: any) => i.severity === 'medium');
  const low = result.issues.filter((i: any) => i.severity === 'low');

  console.log(`\n${bold}📋 Issues by Severity:${reset}`);
  if (critical.length > 0) console.log(`  ${red}🔴 Critical: ${critical.length}${reset}`);
  if (high.length > 0) console.log(`  ${red}⚠️  High: ${high.length}${reset}`);
  if (medium.length > 0) console.log(`  ${yellow}🟡 Medium: ${medium.length}${reset}`);
  if (low.length > 0) console.log(`  ${yellow}🔵 Low: ${low.length}${reset}`);

  // Top issues
  if (result.issues.length > 0) {
    console.log(`\n${bold}🎯 Top Issues:${reset}`);
    const topIssues = result.issues.slice(0, 5);
    for (let i = 0; i < topIssues.length; i++) {
      const issue = topIssues[i];
      const severityEmoji = {
        critical: '🔴',
        high: '⚠️',
        medium: '🟡',
        low: '🔵'
      }[issue.severity];

      console.log(`\n  ${severityEmoji} ${i + 1}. [${issue.category.toUpperCase()}] ${issue.description}`);
      console.log(`     Effort: ${issue.estimatedEffort}`);
      console.log(`     Solution: ${issue.suggestedImprovement.substring(0, 100)}...`);
    }
  }

  // Recommendations
  if (result.recommendations.length > 0) {
    console.log(`\n${bold}💡 AI Recommendations:${reset}`);
    for (let i = 0; i < result.recommendations.length; i++) {
      console.log(`  ${i + 1}. ${result.recommendations[i]}`);
    }
  }

  console.log(`\n${bold}═══════════════════════════════════════════════════════════${reset}`);
}

main().catch(console.error);
