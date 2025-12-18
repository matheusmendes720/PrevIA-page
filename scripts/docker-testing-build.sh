#!/bin/bash
# Script to run active testing builds in Docker
# Usage: ./scripts/docker-testing-build.sh [mode]
# Modes: watch, 5g, 5g:watch, validation, dev, all

set -e

MODE=${1:-watch}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$FRONTEND_DIR"

echo "🧪 Starting Active Testing Build..."
echo "📦 Test Mode: $MODE"
echo "📁 Working Directory: $FRONTEND_DIR"
echo ""

# Export TEST_MODE for docker-compose
export TEST_MODE=$MODE

# Run docker-compose with testing configuration
docker-compose -f docker-compose.testing.yml up --build
























