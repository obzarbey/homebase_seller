@echo off
REM Production deployment script for Render (Windows)

echo 🚀 Deploying Oshan Product API to Production (Render)...

REM Build step (if needed)
echo 📦 Installing production dependencies...
npm ci --only=production

REM Database migration (if needed)
if "%MIGRATE_ON_DEPLOY%"=="true" (
    echo 🔄 Running database migration...
    npm run migrate
)

echo ✅ Production deployment ready!
echo 🌐 API will be available at: https://your-app-name.onrender.com
pause
