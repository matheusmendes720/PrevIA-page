#!/bin/bash

# Setup Git Hooks for Frontend Validation
# This script sets up the pre-push hook for frontend validation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Git hooks for frontend validation...${NC}"

# Get the project root (parent of frontend directory)
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PRE_PUSH_HOOK="$GIT_HOOKS_DIR/pre-push"

# Check if .git directory exists
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo -e "${RED}Error: .git directory not found. Are you in a Git repository?${NC}"
  exit 1
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Create or update pre-push hook
echo -e "${YELLOW}Creating pre-push hook...${NC}"

cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/sh
#
# Git pre-push hook for frontend validation
# This script runs before pushing to master/main branch
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Running pre-push validation...${NC}"

# Change to frontend directory
cd "$(git rev-parse --show-toplevel)/frontend" || exit 1

# Check if we're pushing to master/main
while read local_ref local_sha remote_ref remote_sha
do
  if [ "$remote_ref" = "refs/heads/master" ] || [ "$remote_ref" = "refs/heads/main" ]; then
    echo "${YELLOW}Warning: You are pushing to ${remote_ref}${NC}"
    echo "${YELLOW}Running full validation...${NC}"
    
    # Run full validation
    npm run validate:full
    
    if [ $? -ne 0 ]; then
      echo "${RED}Validation failed! Please fix the issues before pushing.${NC}"
      echo "${YELLOW}To skip validation (not recommended), use: git push --no-verify${NC}"
      exit 1
    fi
    
    echo "${GREEN}Validation passed! Proceeding with push...${NC}"
  else
    echo "${YELLOW}Running quick validation...${NC}"
    
    # Run quick validation for other branches
    npm run validate:quick
    
    if [ $? -ne 0 ]; then
      echo "${RED}Quick validation failed! Please fix the issues before pushing.${NC}"
      echo "${YELLOW}To skip validation (not recommended), use: git push --no-verify${NC}"
      exit 1
    fi
  fi
done

exit 0
EOF

# Make the hook executable
chmod +x "$PRE_PUSH_HOOK"

echo -e "${GREEN}✓ Pre-push hook installed successfully!${NC}"
echo -e "${GREEN}✓ Hook location: $PRE_PUSH_HOOK${NC}"
echo ""
echo -e "${YELLOW}The pre-push hook will now automatically run validation before pushing.${NC}"
echo -e "${YELLOW}To test it, try: git push${NC}"
echo -e "${YELLOW}To skip validation (not recommended): git push --no-verify${NC}"

