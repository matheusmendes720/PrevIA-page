#!/bin/bash
# Quick Deploy Script for Netlify
# This script builds and deploys in one command

set -e

echo ""
echo "========================================"
echo "  GRAN PRIX - QUICK NETLIFY DEPLOY"
echo "========================================"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: Not in frontend directory!"
    echo "Please run: cd frontend"
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "⚠️  WARNING: Bun not found!"
    echo ""
    echo "Please install Bun first:"
    echo "curl -fsSL https://bun.sh/install | bash"
    echo ""
    echo "Alternatively, you can use npm:"
    echo "  npm install"
    echo "  npm run build"
    exit 1
fi

echo "[1/4] Installing dependencies..."
bun install

echo ""
echo "[2/4] Running type check..."
bun run type-check || echo "⚠️  Type check failed, but continuing..."

echo ""
echo "[3/4] Building for production..."
bun run build

echo ""
echo "[4/4] Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo ""
    echo "ℹ️  Netlify CLI not found."
    echo ""
    echo "Option 1: Install Netlify CLI"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  netlify deploy --prod --dir=.next"
    echo ""
    echo "Option 2: Deploy via Git"
    echo "  git add ."
    echo "  git commit -m 'deploy: frontend to Netlify'"
    echo "  git push origin main"
    echo "  Then connect repo at: https://app.netlify.com"
    echo ""
    echo "Option 3: Manual Deploy"
    echo "  Go to: https://app.netlify.com/drop"
    echo "  Drag and drop the .next folder"
    echo ""
else
    echo ""
    echo "ℹ️  Deploying to Netlify..."
    netlify deploy --prod --dir=.next
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "========================================"
        echo "  ✅ DEPLOYMENT SUCCESSFUL!"
        echo "========================================"
        echo ""
        echo "Your site is now live!"
        echo "Run: netlify open"
        echo ""
    else
        echo "❌ ERROR: Netlify deployment failed"
        echo "Run: netlify login"
        echo "Then try again"
    fi
fi

