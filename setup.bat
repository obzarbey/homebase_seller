@echo off
REM Oshan Product API Setup Script for Windows

echo 🚀 Setting up Oshan Product API Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env file exists
if not exist ".env" (
    echo ⚙️ Creating .env file from template...
    copy .env.example .env
    echo 📝 Please edit the .env file with your actual credentials:
    echo    - MongoDB Atlas connection string
    echo    - Firebase Admin SDK credentials
    echo.
    echo    Then run: npm run dev
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your credentials
echo 2. Run 'npm run dev' to start the development server
echo 3. The API will be available at http://localhost:5000
echo.
echo API Endpoints:
echo - Health check: GET http://localhost:5000/health
echo - Products: http://localhost:5000/api/products
echo.
pause
