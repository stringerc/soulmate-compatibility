#!/bin/bash
# Render Deployment Automation Script
# This script automates the deployment of the Soulmate B2B API to Render

set -e

echo "🚀 Starting Render Deployment Automation..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ render.yaml found${NC}"

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo -e "${YELLOW}⚠️  Render CLI not found. Installing...${NC}"
    echo "Please install Render CLI: https://render.com/docs/cli"
    echo "Or use: curl -fsSL https://render.com/cli.sh | bash"
    exit 1
fi

echo -e "${GREEN}✅ Render CLI found${NC}"

# Check if logged in
if ! render whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Render. Please log in:${NC}"
    echo "render login"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Render${NC}"

# Deploy using render.yaml
echo -e "${GREEN}📦 Deploying services from render.yaml...${NC}"
render deploy

echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo -e "${YELLOW}📝 Note: Database initialization will happen automatically on first startup${NC}"
echo -e "${YELLOW}📝 Check the Render dashboard for deployment status${NC}"

