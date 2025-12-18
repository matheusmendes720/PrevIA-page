#!/bin/bash

# Test Validation System
# This script runs all validation tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Running Validation System Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the frontend directory
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Warning: node_modules not found. Installing dependencies...${NC}"
  npm install
fi

echo -e "${BLUE}Running validation tests...${NC}"
echo ""

# Run validation tests
npm run test:validation

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ All validation tests passed!${NC}"
  echo ""
  echo -e "${BLUE}To run specific test suites:${NC}"
  echo -e "  npm test -- validation/validate"
  echo -e "  npm test -- validation/build"
  echo -e "  npm test -- validation/install"
  echo -e "  npm test -- validation/scripts"
  echo -e "  npm test -- validation/type-check"
  echo -e "  npm test -- validation/integration"
  exit 0
else
  echo ""
  echo -e "${RED}✗ Some validation tests failed.${NC}"
  echo -e "${YELLOW}Please fix the issues above.${NC}"
  exit 1
fi


