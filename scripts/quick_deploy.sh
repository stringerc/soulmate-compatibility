#!/bin/bash
# Quick Deploy Script - One-click deployment to Render
# This script provides the easiest path to deployment

set -e

GITHUB_REPO="https://github.com/stringerc/soulmate-compatibility.git"
BLUEPRINT_URL="${GITHUB_REPO}/blob/main/render.yaml"

echo "🚀 Soulmate B2B API - Quick Deploy to Render"
echo "=============================================="
echo ""
echo "Repository: $GITHUB_REPO"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found!"
    exit 1
fi

echo "✅ render.yaml found"
echo ""

# Method 1: Try Render CLI if available
if command -v render &> /dev/null; then
    echo "📦 Method 1: Using Render CLI..."
    if render whoami &> /dev/null; then
        echo "✅ Logged in to Render"
        echo "🚀 Deploying..."
        render deploy
        echo ""
        echo "✅ Deployment initiated via Render CLI!"
        echo "Check dashboard: https://dashboard.render.com/"
        exit 0
    else
        echo "⚠️  Not logged in. Run: render login"
    fi
fi

# Method 2: Provide Blueprint URL
echo ""
echo "📦 Method 2: Deploy via Blueprint (Recommended)"
echo "================================================"
echo ""
echo "1. Go to: https://dashboard.render.com/new/blueprint"
echo "2. Paste this URL:"
echo ""
echo "   $BLUEPRINT_URL"
echo ""
echo "3. Click 'Apply' and Render will deploy automatically"
echo ""
echo "✅ This will:"
echo "   - Create the web service"
echo "   - Link to existing database (soulmate-b2b-db)"
echo "   - Set all environment variables"
echo "   - Deploy from your GitHub repo"
echo ""

# Method 3: Manual web service creation
echo ""
echo "📦 Method 3: Manual Web Service Creation"
echo "========================================="
echo ""
echo "If Blueprint doesn't work, create manually:"
echo ""
echo "1. Go to: https://dashboard.render.com/new/web-service"
echo "2. Connect repository: $GITHUB_REPO"
echo "3. Configure:"
echo "   - Name: soulmate-b2b-api"
echo "   - Root Directory: web_app/backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn app:app --host 0.0.0.0 --port \$PORT"
echo "   - Region: Oregon"
echo "4. Link database: soulmate-b2b-db (in Connections section)"
echo "5. Add environment variables (see DEPLOYMENT_AUTOMATION.md)"
echo ""

echo "📚 For detailed instructions, see: DEPLOYMENT_AUTOMATION.md"
echo ""

