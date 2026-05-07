# 🤖 Agentic Code Reviewer - Production Grade AI Code Analysis

A sophisticated AI-powered code review system that acts as a senior engineer, analyzing entire projects for architectural issues, SOLID principle violations, and design improvements. Built with agentic workflows using Google's Gemini API.

## ✨ Key Features

### 🧠 Agentic Intelligence
- **Multi-turn conversations** with AI for deep reasoning
- **Contextual understanding** of entire project structure
- **Error recovery** with fallback strategies
- **Self-reasoning** explaining design decisions

### 🏗️ Architecture Analysis
- **SOLID Principles** violation detection
- **Design Pattern** recognition (Factory, Observer, Singleton, etc.)
- **Code complexity** metrics and analysis
- **Scalability** assessment for growth

### 🔒 Security & Quality
- **Security vulnerability** detection (SQL injection, hardcoded secrets, eval usage)
- **Performance issues** identification (N+1 queries, blocking operations)
- **Maintainability** assessment with duplicate code detection
- **Best practices** recommendations

### 📊 Project Understanding
- **Multi-file context** - analyzes connections between files
- **AST-like parsing** - understands code structure deeply
- **Dependency tracking** - follows imports and relationships
- **Language support** - TypeScript, JavaScript, Python, Java, Go, Rust, C++, etc.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Google Gemini API key (free tier available)
- TypeScript 5+

### Installation

1. **Clone or copy the project**
```bash
cd agent-code-reviewer
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Gemini API key**
```bash
# Get free API key: https://makersuite.google.com/app/apikey
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. **Build the project**
```bash
npm run build
```

## 📖 Usage

### Command Line Interface

```bash
# Basic usage
npx ts-node src/cli.ts ./my-project

# Analyze specific file types
npx ts-node src/cli.ts ./backend --extensions ts,js

# Full path analysis
npm run review /path/to/project
```

### Programmatic Usage

```typescript
import { CodeReviewerAgent } from './src/agent';
import { ReviewRequest } from './src/types';

const agent = new CodeReviewerAgent(process.env.GEMINI_API_KEY!);

const request: ReviewRequest = {
  projectPath: './my-project',
  focusAreas: 'all',
  maxDepth: 10
};

const result = await agent.reviewProject(request);

console.log(`Architecture Score: ${result.architectureScore}/100`);
console.log(`Issues Found: ${result.issues.length}`);
console.log(`Recommendations: ${result.recommendations.length}`);
```

## 🔍 What Gets Analyzed

### SOLID Violations
- ❌ Single Responsibility violations (God Objects)
- ❌ Open/Closed principle breaches
- ❌ Interface Segregation failures
- ❌ Dependency Inversion issues

### Code Quality
- ❌ Overly large classes (>200 lines)
- ❌ Excessive nesting (>4 levels)
- ❌ Code duplication
- ❌ Insufficient error handling

### Performance Issues
- ❌ Synchronous operations blocking event loop
- ❌ N+1 query patterns
- ❌ Unbounded array operations
- ❌ Memory inefficiencies

### Security Concerns
- 🔴 Hardcoded secrets/credentials
- 🔴 SQL injection vulnerabilities
- 🔴 Eval() usage
- 🔴 Unsafe input handling

### Scalability
- ⚠️ Global mutable state
- ⚠️ Hardcoded configuration
- ⚠️ Insufficient logging
- ⚠️ Missing monitoring points

## 📊 Report Output

The tool generates a comprehensive JSON report with:

```json
{
  "projectPath": "/path/to/project",
  "totalFilesAnalyzed": 42,
  "architectureScore": 72,
  "issues": [
    {
      "severity": "high",
      "category": "solid",
      "description": "Class 'UserService' violates SRP...",
      "affectedFiles": ["src/services/user.ts"],
      "suggestedImprovement": "Break into smaller classes...",
      "estimatedEffort": "medium"
    }
  ],
  "recommendations": [
    "Implement Dependency Injection pattern",
    "Extract business logic into separate domain layer",
    "Add comprehensive error handling",
    "Implement caching strategy for performance",
    "Add structured logging for production debugging"
  ],
  "agentReasoning": "Based on the analysis..."
}
```

## 🎯 Use Cases

### For Interviews with Big Tech
- **Show architectural thinking**: Demonstrate understanding of system design
- **Prove agentic capabilities**: Multi-turn reasoning and error handling
- **Portfolio project**: Build something production-grade, not just a chatbot

### For Production Teams
- **Code review automation**: Catch issues before human review
- **Onboarding teams**: Understand new codebases quickly
- **Quality gates**: Enforce architectural standards
- **Technical debt tracking**: Monitor codebase health over time

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      CodeReviewerAgent (Orchestrator)   │
└────────────┬────────────────────────────┘
             │
     ┌───────┼───────┐
     ▼       ▼       ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐
│CodeAnal.│ │ArchAnal. │ │GeminiClient  │
│(AST)    │ │(Patterns)│ │(AI Reasoning)│
└─────────┘ └──────────┘ └──────────────┘
     │          │              │
     └──────────┴──────────────┘
            │
            ▼
     ┌──────────────┐
     │ReviewResult  │
     │+ Architecture│
     │+ Issues      │
     │+ Recommend.  │
     │+ Reasoning   │
     └──────────────┘
```

## 🔧 Error Handling

The agent implements production-grade error handling:

- **Recoverable errors**: Retries or graceful fallbacks
- **Error context**: Suggestions for resolution
- **Error tracking**: All errors logged with timestamps
- **State management**: Can recover from failures

```typescript
try {
  const result = await agent.reviewProject(request);
} catch (error) {
  const errors = agent.getErrors();
  // Handle with detailed error info and suggestions
}
```

## 📈 Scaling Considerations

### For Large Codebases
- Respects project depth limits
- Skips node_modules and build directories
- Processes files incrementally
- Batches API requests efficiently

### Production Deployment
- TypeScript for type safety
- Comprehensive error handling
- Configurable analysis depth
- State persistence
- Conversation history tracking

## 💡 How to Impress Recruiters

1. **Show Understanding**: Explain SOLID principles, design patterns, and architecture
2. **Demonstrate Agentic Workflows**: Multi-turn reasoning, error handling, self-improvement
3. **Production Quality**: Error handling, logging, configuration, deployment-ready
4. **Real-World Problem Solving**: Analyze actual projects, provide actionable improvements
5. **Scalability Thinking**: Handle large projects, batch operations, state management

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Build for production
npm run build
npm start
```

## 📚 Technologies

- **Language**: TypeScript
- **AI**: Google Gemini API
- **Code Analysis**: Custom AST patterns
- **CLI**: Node.js with colored output
- **Configuration**: dotenv for secrets

## 🔑 API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key (free tier included)
3. Set environment variable: `GEMINI_API_KEY=your-key`
4. Or create `.env` file with `GEMINI_API_KEY=your-key`

## 🚨 Important Notes

- Never commit `.env` with real API keys
- Keep GEMINI_API_KEY private
- Monitor API usage for quota management
- Use on real projects for portfolio impact

## 📝 Next Steps

1. ✅ Set up environment with Gemini API key
2. ✅ Install dependencies
3. ✅ Run on sample project: `npm run review ./my-project`
4. ✅ Review generated report
5. ✅ Deploy to GitHub with README
6. ✅ Add to portfolio for interviews

## 🎓 Learning Resources

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Google Gemini API](https://ai.google.dev)

## 📄 License

MIT - Feel free to use this project for interviews, portfolio, and learning.

---

**Built to impress big tech companies in 2026** 🚀

This project demonstrates understanding of:
- ✅ Production-grade AI systems
- ✅ Agentic workflows with reasoning
- ✅ Multi-file code analysis
- ✅ Design patterns and architecture
- ✅ Error handling and resilience
- ✅ Scalable system design
