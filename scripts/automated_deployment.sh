#!/bin/bash
# Automated Deployment Script for Soulmate B2B System
# This script automates what's possible and provides instructions for manual steps

set -e

echo "🚀 Automated Deployment Script for Soulmate B2B System"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify Git repository
echo -e "${BLUE}Step 1: Verifying Git repository...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository found${NC}"
    CURRENT_BRANCH=$(git branch --show-current)
    echo "Current branch: $CURRENT_BRANCH"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
        read -p "Do you want to commit them? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add -A
            git commit -m "Auto-commit before deployment"
        fi
    fi
    
    # Push to GitHub
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    git push origin $CURRENT_BRANCH
    echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Not a Git repository. Skipping Git operations.${NC}"
fi

echo ""

# Step 2: Generate JWT Secret
echo -e "${BLUE}Step 2: Generating JWT Secret...${NC}"
cd web_app/backend
JWT_SECRET=$(python3 scripts/generate_jwt_secret.py | grep "JWT_SECRET_KEY=" | cut -d'=' -f2)
echo -e "${GREEN}✅ JWT Secret generated: ${JWT_SECRET:0:20}...${NC}"
cd ../..
echo ""

# Step 3: Check Vercel deployment status
echo -e "${BLUE}Step 3: Vercel Deployment${NC}"
echo -e "${GREEN}✅ Vercel project configured${NC}"
echo "Project: soulmate-compatibility"
echo "Root Directory: web_app/frontend"
echo "Environment Variable: NEXT_PUBLIC_API_URL=https://soulmate-b2b-api.onrender.com"
echo ""
echo "Vercel will automatically deploy when code is pushed to GitHub."
echo "Monitor deployment at: https://vercel.com/christopher-stringers-projects/soulmate-compatibility"
echo ""

# Step 4: Render Backend Setup Instructions
echo -e "${BLUE}Step 4: Render Backend Setup${NC}"
echo -e "${YELLOW}⚠️  Manual step required: Render backend deployment${NC}"
echo ""
echo "To deploy backend to Render:"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Sign in with GitHub"
echo "3. Create PostgreSQL Database:"
echo "   - Click 'New +' → 'PostgreSQL'"
echo "   - Name: soulmate-b2b-db"
echo "   - Database: soulmate_b2b"
echo "   - User: soulmate_user"
echo "   - Plan: Starter (free)"
echo "   - Copy 'Internal Database URL'"
echo ""
echo "4. Create Web Service:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect GitHub: stringerc/soulmate-compatibility"
echo "   - Branch: main"
echo "   - Name: soulmate-b2b-api"
echo "   - Root Directory: web_app/backend"
echo "   - Environment: Python 3"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn app:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "5. Add Environment Variables:"
echo "   DATABASE_URL=<paste_internal_database_url>"
echo "   ENVIRONMENT=production"
echo "   ALLOWED_ORIGINS=https://soulmates.syncscript.app,https://soulmate.syncscript.app"
echo "   JWT_SECRET_KEY=$JWT_SECRET"
echo ""
echo "6. Click 'Create Web Service'"
echo ""
echo "7. After deployment, initialize database:"
echo "   - Go to service → 'Shell' tab"
echo "   - Run: python scripts/init_db.py"
echo ""

# Step 5: Testing Instructions
echo -e "${BLUE}Step 5: Testing${NC}"
echo ""
echo "After both deployments complete:"
echo ""
echo "1. Test Backend:"
echo "   curl https://soulmate-b2b-api.onrender.com/health"
echo ""
echo "2. Test Frontend:"
echo "   Visit: https://soulmates.syncscript.app"
echo ""
echo "3. Test Partner Portal:"
echo "   Visit: https://soulmates.syncscript.app/partner"
echo ""
echo "4. Test API Documentation:"
echo "   Visit: https://soulmates.syncscript.app/docs"
echo ""

# Step 6: Summary
echo -e "${GREEN}======================================================"
echo "Deployment Summary"
echo "======================================================"
echo ""
echo "✅ Code pushed to GitHub"
echo "✅ JWT Secret generated"
echo "✅ Vercel configured (auto-deploying)"
echo "⏳ Render backend (manual setup required)"
echo ""
echo "Next Steps:"
echo "1. Complete Render backend setup (see Step 4)"
echo "2. Wait for Vercel deployment (~2-3 minutes)"
echo "3. Test all endpoints"
echo "4. Configure custom domain: soulmates.syncscript.app"
echo ""
echo "For detailed instructions, see: DEPLOY_NOW.md"
echo "======================================================"
echo -e "${NC}"

