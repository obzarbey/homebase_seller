@echo off
REM Quick deployment script for Render (Windows)

echo 🚀 Preparing for Render deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Run this script from the backend directory.
    pause
    exit /b 1
)

REM Validate required files exist
echo ✅ Checking required files...
if not exist "server.js" (
    echo ❌ Error: Required file server.js not found.
    pause
    exit /b 1
)
if not exist "models\Product.js" (
    echo ❌ Error: Required file models\Product.js not found.
    pause
    exit /b 1
)
if not exist "config\database.js" (
    echo ❌ Error: Required file config\database.js not found.
    pause
    exit /b 1
)
if not exist "config\firebase.js" (
    echo ❌ Error: Required file config\firebase.js not found.
    pause
    exit /b 1
)

REM Test environment variables template
echo ✅ Checking environment configuration...
if not exist ".env.production" (
    echo ⚠️  Warning: .env.production not found. Creating from template...
    copy .env.example .env.production
)

REM Validate package.json for production
echo 📦 Validating package.json...
findstr /C:"\"start\"" package.json >nul
if %errorlevel% neq 0 (
    echo ❌ Error: No 'start' script found in package.json
    pause
    exit /b 1
)

findstr /C:"\"engines\"" package.json >nul
if %errorlevel% neq 0 (
    echo ⚠️  Warning: No 'engines' field in package.json. Render will use default Node.js version.
)

echo.
echo 🎉 Ready for Render deployment!
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Connect your GitHub repo to Render
echo 3. Set environment variables in Render dashboard
echo 4. Deploy!
echo.
echo 📚 See PRODUCTION_DEPLOYMENT.md for detailed instructions
echo.

REM Check if git is initialized and suggest commit
if exist ".git\" (
    echo 📤 Git repository detected. Consider committing your changes:
    echo    git add .
    echo    git commit -m "Prepare for production deployment"
    echo    git push origin main
) else (
    echo 📤 Initialize git repository:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit for production deployment"
    echo    git remote add origin YOUR_GITHUB_REPO_URL
    echo    git push -u origin main
)

pause
