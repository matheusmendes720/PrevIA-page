#!/bin/bash
# Netlify Deployment Script for Gran Prix Frontend
# Optimized with Bun for faster builds

set -e  # Exit on error

echo "🚀 Starting Gran Prix Frontend Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bun not found. Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

echo -e "${GREEN}✓ Bun version: $(bun --version)${NC}"

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies with Bun...${NC}"
bun install

# Run type check
echo -e "${YELLOW}🔍 Running type check...${NC}"
bun run type-check || {
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
}

# Run linting
echo -e "${YELLOW}🔎 Running linter...${NC}"
bun run lint || {
    echo -e "${YELLOW}⚠️  Linting issues found (continuing anyway)${NC}"
}

# Build with Bun
echo -e "${YELLOW}🏗️  Building with Bun...${NC}"
export NODE_ENV=production
export NEXT_PUBLIC_USE_MOCK_DATA=true
bun run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Check build output
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ .next directory created${NC}"
    echo -e "${YELLOW}📊 Build size:${NC}"
    du -sh .next
else
    echo -e "${RED}❌ .next directory not found${NC}"
    exit 1
fi

# Deploy to Netlify (if netlify-cli is installed)
if command -v netlify &> /dev/null; then
    echo -e "${YELLOW}🌐 Deploying to Netlify...${NC}"
    netlify deploy --prod --dir=.next || {
        echo -e "${RED}❌ Netlify deployment failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Deployed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Skipping deployment.${NC}"
    echo -e "${YELLOW}   Install with: npm install -g netlify-cli${NC}"
    echo -e "${YELLOW}   Or push to connected Git repo for auto-deploy${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo -e "✅ Deployment process completed!"
echo -e "==========================================${NC}"
