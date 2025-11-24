#!/bin/bash
# Automated Environment Setup Script
# This script helps set up environment variables for deployment

echo "🔧 Setting up environment variables..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy example file
cp .env.example .env.local

echo "✅ Created .env.local from .env.example"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and fill in your actual values:"
echo "   - JWT_SECRET: Generate a secure random string"
echo "   - RESEND_API_KEY: Get from https://resend.com/api-keys"
echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID: Get from Google Analytics"
echo ""
echo "2. For Vercel deployment, set these in:"
echo "   Project Settings → Environment Variables"
echo ""
echo "3. Generate JWT_SECRET:"
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""

