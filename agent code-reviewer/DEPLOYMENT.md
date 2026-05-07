# Deployment & Setup Guide

## Quick Start (5 minutes)

### 1. Prerequisites
```bash
# Check Node.js version (16+)
node --version

# Check npm
npm --version
```

### 2. Installation
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### 3. Setup Gemini API

**Get Free API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

**Configure locally:**
```bash
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY
```

### 4. Test on Sample Project
```bash
# Create test project
mkdir test-project
cd test-project
echo "function process(data) { console.log(data); }" > index.js
cd ..

# Run review
npm run review ./test-project
```

## Platform-Specific Setup

### Windows

```powershell
# Install Node.js from https://nodejs.org
# Then:
npm install
npm run build

# Set environment variable
$env:GEMINI_API_KEY="your-api-key"
npm run review "C:\path\to\project"
```

### macOS

```bash
# Install Node.js
brew install node

npm install
npm run build

export GEMINI_API_KEY="your-api-key"
npm run review ./path/to/project
```

### Linux

```bash
# Install Node.js (Ubuntu/Debian)
sudo apt-get install nodejs npm

npm install
npm run build

export GEMINI_API_KEY="your-api-key"
npm run review ./path/to/project
```

## Docker Deployment

### Build Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Run with Docker

```bash
# Build image
docker build -t agentic-reviewer .

# Run container
docker run \
  -e GEMINI_API_KEY="your-api-key" \
  -v /path/to/project:/project \
  agentic-reviewer \
  npm run review /project
```

## GitHub Actions Integration

### Setup Workflow

Create `.github/workflows/code-review.yml`:

```yaml
name: Agentic Code Review

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Run code review
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run review .
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: code-review-report
          path: code-review-report.json
```

### Configure Secret

1. Go to GitHub repository → Settings → Secrets
2. Create new secret: `GEMINI_API_KEY`
3. Paste your Gemini API key

## CI/CD Pipeline Integration

### GitLab CI

```yaml
stages:
  - setup
  - analyze

code_review:
  stage: analyze
  image: node:18
  script:
    - npm install
    - npm run build
    - npm run review .
  artifacts:
    paths:
      - code-review-report.json
  only:
    - merge_requests
```

### Jenkins

```groovy
pipeline {
    agent any
    
    environment {
        GEMINI_API_KEY = credentials('gemini-api-key')
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Code Review') {
            steps {
                sh 'npm run review .'
            }
        }
        
        stage('Archive Results') {
            steps {
                archiveArtifacts 'code-review-report.json'
            }
        }
    }
}
```

## Production Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed: `npm install`
- [ ] Build successful: `npm run build`
- [ ] Gemini API key configured
- [ ] Environment variable set: `GEMINI_API_KEY`
- [ ] Test on sample project
- [ ] Review output format
- [ ] Save report: `code-review-report.json`
- [ ] Archive results (CI/CD)
- [ ] Monitor API usage

## Troubleshooting

### Issue: "GEMINI_API_KEY not set"

```bash
# Solution 1: Set environment variable
export GEMINI_API_KEY="your-key"

# Solution 2: Create .env file
echo 'GEMINI_API_KEY=your-key' > .env

# Solution 3: Pass directly
GEMINI_API_KEY=your-key npm run review .
```

### Issue: "Cannot find project"

```bash
# Use absolute path
npm run review "$(pwd)/my-project"

# Or relative from current directory
npm run review ./my-project
```

### Issue: "API request failed"

```bash
# Check API key validity
# Check internet connection
# Check API quota
# Try with smaller project
npm run review ./test-project
```

### Issue: "Out of memory"

```bash
# Increase Node.js heap size
node --max-old-space-size=4096 dist/cli.js ./project

# Or use script:
export NODE_OPTIONS="--max-old-space-size=4096"
npm run review ./large-project
```

## Performance Tuning

### For Large Projects

```bash
# Limit file depth
export MAX_DEPTH=5
npm run review ./project

# Or implement in code
const agent = new CodeReviewerAgent(apiKey);
// Modify maxDepth in configuration
```

### For Slow Networks

```bash
# Increase timeout
export TIMEOUT_SECONDS=600
npm run review ./project
```

## API Key Management

### Best Practices

1. **Never commit API keys**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment variables**
   ```bash
   export GEMINI_API_KEY="your-key"
   ```

3. **Rotate keys regularly**
   - Generate new keys in Google AI Studio
   - Update in CI/CD secrets

4. **Monitor usage**
   - Check API dashboard
   - Set up quota alerts
   - Monitor for unauthorized access

## Monitoring & Logging

### Enable Verbose Logging

```bash
# Modify index.ts to add logging
DEBUG=* npm run review ./project
```

### Log Files

```bash
# Capture to file
npm run review ./project > review.log 2>&1

# View real-time
tail -f review.log
```

## Scaling Considerations

### For Multiple Projects

```bash
# Create script for batch processing
for project in ./projects/*; do
  npm run review "$project" > "${project}-report.json"
done
```

### For Team Usage

```bash
# Share as npm package
npm publish

# Then teams can use:
npx agentic-code-reviewer ./project
```

## Update & Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Install latest
npm install @latest
```

### Rebuild After Changes

```bash
npm run build
```

## Support & Resources

- **Gemini API Docs**: https://ai.google.dev
- **TypeScript Docs**: https://www.typescriptlang.org
- **Node.js Docs**: https://nodejs.org

## Next Steps

1. ✅ Complete setup
2. ✅ Test with sample project
3. ✅ Review output
4. ✅ Integrate with CI/CD
5. ✅ Add to portfolio
6. ✅ Share with team

---

Need help? Check README.md and ARCHITECTURE.md for more details.
