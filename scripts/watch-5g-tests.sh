#!/bin/bash

# Watch mode script for 5G feature tests
# Continuously runs tests when files change

set -e

echo "👀 Starting 5G Feature Test Watch Mode..."
echo "Press Ctrl+C to stop"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "Error: Must be run from frontend directory"
    exit 1
fi

# Run tests in watch mode for 5G features
npm test -- --testPathPattern="5g" --watch --coverage=false










