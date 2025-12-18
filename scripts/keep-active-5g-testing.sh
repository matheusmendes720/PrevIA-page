#!/bin/bash
# Bash script to keep active 5G testing builds running
# Usage: ./scripts/keep-active-5g-testing.sh

echo "🧪 Starting Active 5G Testing Builds..."
echo "📦 Mode: Watch (Continuous Testing)"
echo ""

cd "$(dirname "$0")/.."

# Function to run tests
run_5g_tests() {
    echo ""
    echo "🔄 Running 5G tests..."
    npm run test:5g:watch
}

# Main loop - keep testing active
echo "✅ Active testing mode enabled"
echo "👀 Watching for file changes..."
echo "🛑 Press Ctrl+C to stop"
echo ""

# Start watch mode
run_5g_tests























