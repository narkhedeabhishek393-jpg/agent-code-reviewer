#!/bin/bash
# Quick Start Script - Get the Code Reviewer Running in 5 Minutes

set -e

echo "🚀 Agentic Code Reviewer - Quick Start"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install > /dev/null 2>&1
echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🏗️  Building TypeScript..."
npm run build > /dev/null 2>&1
echo "✅ Build complete"
echo ""

# Setup .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please add your GEMINI_API_KEY to .env"
    echo "   Get it from: https://makersuite.google.com/app/apikey"
    echo ""
    echo "   Edit .env and run again:"
    echo "   npm run review ./my-project"
    exit 0
fi

# Check for API key
if ! grep -q "GEMINI_API_KEY" .env || grep "GEMINI_API_KEY=your-api-key" .env > /dev/null; then
    echo "⚠️  GEMINI_API_KEY not configured"
    echo "   Edit .env and add your API key"
    exit 1
fi

echo "✅ .env configured"
echo ""

# Create test project if needed
if [ ! -d test-project ]; then
    echo "📁 Creating test project..."
    mkdir -p test-project
    
    cat > test-project/index.ts << 'EOF'
// Example code with issues for the reviewer to find
export class DataProcessor {
  constructor(
    private api: any,
    private cache: any,
    private db: any,
    private email: any,
    private logger: any,
    private auth: any,
    private validator: any
  ) {}

  async process(data: any) {
    try {
      if (data) {
        if (data.user) {
          if (data.user.email) {
            if (this.validator.isEmail(data.user.email)) {
              const result = await this.db.save(data);
              this.cache.set('key', result);
              return result;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async sendEmail(email: string) {
    const mailer = require('nodemailer');
    await mailer.send({
      to: email,
      password: 'secret123'
    });
  }
}
EOF
    echo "✅ Test project created"
else
    echo "📁 Test project already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add Gemini API Key to .env (if not already done)"
echo "2. Run: npm run review ./test-project"
echo "3. Check code-review-report.json"
echo ""
echo "More info:"
echo "  README.md      - Full documentation"
echo "  DEPLOYMENT.md  - Deployment options"
echo "  EXAMPLES.md    - Usage examples"
echo "  PORTFOLIO.md   - Interview tips"
echo ""
