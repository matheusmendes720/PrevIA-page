#!/bin/bash
# Fast launch script using Bun for optimal performance

echo "🚀 Launching with Bun for faster performance..."
echo ""

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Installing..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

echo "✅ Bun version: $(bun --version)"
echo ""

# Install dependencies with Bun (faster than npm)
echo "📦 Installing dependencies with Bun..."
bun install

echo ""
echo "🔥 Starting development server with Bun..."
echo "   Access at: http://localhost:3001/features/5g"
echo ""

# Launch with Bun
bun run --bun next dev -p 3001




