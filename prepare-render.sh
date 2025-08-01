#!/bin/bash

# Quick deployment script for Render
echo "🚀 Preparing for Render deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the backend directory."
    exit 1
fi

# Validate required files exist
echo "✅ Checking required files..."
files=("server.js" "package.json" "models/Product.js" "config/database.js" "config/firebase.js")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file not found."
        exit 1
    fi
done

# Test environment variables template
echo "✅ Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Creating from template..."
    cp .env.example .env.production
fi

# Run tests if available
echo "🧪 Running pre-deployment tests..."
if command -v npm &> /dev/null; then
    if [ -f "test-api.js" ]; then
        echo "Skipping API tests (requires running server)"
    fi
else
    echo "⚠️  npm not found, skipping tests"
fi

# Validate package.json for production
echo "📦 Validating package.json..."
if ! grep -q '"start"' package.json; then
    echo "❌ Error: No 'start' script found in package.json"
    exit 1
fi

if ! grep -q '"engines"' package.json; then
    echo "⚠️  Warning: No 'engines' field in package.json. Render will use default Node.js version."
fi

echo ""
echo "🎉 Ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Render"
echo "3. Set environment variables in Render dashboard"
echo "4. Deploy!"
echo ""
echo "📚 See PRODUCTION_DEPLOYMENT.md for detailed instructions"
echo ""

# Check if git is initialized and suggest commit
if [ -d ".git" ]; then
    echo "📤 Git repository detected. Consider committing your changes:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for production deployment'"
    echo "   git push origin main"
else
    echo "📤 Initialize git repository:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit for production deployment'"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    echo "   git push -u origin main"
fi
