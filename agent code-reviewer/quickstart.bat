@echo off
REM Quick Start Script for Windows
REM Get the Code Reviewer Running in 5 Minutes

setlocal enabledelayedexpansion

echo.
echo 🚀 Agentic Code Reviewer - Quick Start
echo ======================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo    Install from: https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install > nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Build TypeScript
echo 🏗️  Building TypeScript...
call npm run build > nul 2>&1
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build complete
echo.

REM Setup .env if not exists
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env > nul
    echo ⚠️  Please add your GEMINI_API_KEY to .env
    echo    Get it from: https://makersuite.google.com/app/apikey
    echo.
    echo    Edit .env and run again:
    echo    npm run review .\my-project
    echo.
    exit /b 0
)

REM Check for API key
findstr /M "GEMINI_API_KEY" .env > nul
if errorlevel 1 (
    echo ⚠️  GEMINI_API_KEY not found in .env
    echo    Edit .env and add your API key
    exit /b 1
)

findstr "GEMINI_API_KEY=your-api-key" .env > nul
if not errorlevel 1 (
    echo ⚠️  GEMINI_API_KEY not configured in .env
    echo    Edit .env and replace 'your-api-key' with your actual key
    exit /b 1
)

echo ✅ .env configured
echo.

REM Create test project if needed
if not exist test-project (
    echo 📁 Creating test project...
    mkdir test-project
    
    (
        echo // Example code with issues for the reviewer to find
        echo export class DataProcessor {
        echo   constructor(
        echo     private api: any,
        echo     private cache: any,
        echo     private db: any,
        echo     private email: any,
        echo     private logger: any,
        echo     private auth: any,
        echo     private validator: any
        echo   ) {}
        echo.
        echo   async process(data: any) {
        echo     try {
        echo       if (data) {
        echo         if (data.user) {
        echo           if (data.user.email) {
        echo             if (this.validator.isEmail(data.user.email)) {
        echo               const result = await this.db.save(data);
        echo               this.cache.set('key', result);
        echo               return result;
        echo             }
        echo           }
        echo         }
        echo       }
        echo     } catch (e) {
        echo       console.log(e);
        echo     }
        echo   }
        echo.
        echo   async sendEmail(email: string) {
        echo     const mailer = require('nodemailer');
        echo     await mailer.send({
        echo       to: email,
        echo       password: 'secret123'
        echo     });
        echo   }
        echo }
    ) > test-project\index.ts
    echo ✅ Test project created
) else (
    echo 📁 Test project already exists
)

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Add Gemini API Key to .env (if not already done)
echo 2. Run: npm run review .\test-project
echo 3. Check code-review-report.json
echo.
echo More info:
echo   README.md      - Full documentation
echo   DEPLOYMENT.md  - Deployment options
echo   EXAMPLES.md    - Usage examples
echo   PORTFOLIO.md   - Interview tips
echo.
