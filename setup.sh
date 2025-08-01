#!/bin/bash

# Oshan Product API Setup Script
echo "🚀 Setting up Oshan Product API Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit the .env file with your actual credentials:"
    echo "   - MongoDB Atlas connection string"
    echo "   - Firebase Admin SDK credentials"
    echo ""
    echo "   Then run: npm run dev"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. The API will be available at http://localhost:5000"
echo ""
echo "API Endpoints:"
echo "- Health check: GET http://localhost:5000/health"
echo "- Products: http://localhost:5000/api/products"
echo ""
