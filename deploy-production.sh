#!/bin/bash

# Production deployment script for Render
echo "🚀 Deploying Oshan Product API to Production (Render)..."

# Build step (if needed)
echo "📦 Installing production dependencies..."
npm ci --only=production

# Database migration (if needed)
if [ "$MIGRATE_ON_DEPLOY" = "true" ]; then
    echo "🔄 Running database migration..."
    npm run migrate
fi

echo "✅ Production deployment ready!"
echo "🌐 API will be available at: https://your-app-name.onrender.com"
