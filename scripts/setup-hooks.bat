@echo off
REM Setup Git Hooks for Frontend Validation (Windows)
REM This script sets up the pre-push hook for frontend validation

echo Setting up Git hooks for frontend validation...

REM Get the project root (parent of frontend directory)
cd /d "%~dp0\.."
set PROJECT_ROOT=%CD%
cd /d "%~dp0\..\.."
set GIT_HOOKS_DIR=%CD%\.git\hooks
set PRE_PUSH_HOOK=%GIT_HOOKS_DIR%\pre-push

REM Check if .git directory exists
if not exist "%CD%\.git" (
    echo Error: .git directory not found. Are you in a Git repository?
    exit /b 1
)

REM Create .git/hooks directory if it doesn't exist
if not exist "%GIT_HOOKS_DIR%" mkdir "%GIT_HOOKS_DIR%"

REM Create pre-push hook
echo Creating pre-push hook...

(
echo #!/bin/sh
echo #
echo # Git pre-push hook for frontend validation
echo # This script runs before pushing to master/main branch
echo #
echo.
echo # Colors for output
echo RED='\033[0;31m'
echo GREEN='\033[0;32m'
echo YELLOW='\033[1;33m'
echo NC='\033[0m' # No Color
echo.
echo echo "${YELLOW}Running pre-push validation...${NC}"
echo.
echo # Change to frontend directory
echo cd "$(git rev-parse --show-toplevel)/frontend" ^|^| exit 1
echo.
echo # Check if we're pushing to master/main
echo while read local_ref local_sha remote_ref remote_sha
echo do
echo   if [ "$remote_ref" = "refs/heads/master" ] ^|^| [ "$remote_ref" = "refs/heads/main" ]; then
echo     echo "${YELLOW}Warning: You are pushing to ${remote_ref}${NC}"
echo     echo "${YELLOW}Running full validation...${NC}"
echo     echo.
echo     # Run full validation
echo     npm run validate:full
echo     echo.
echo     if [ $? -ne 0 ]; then
echo       echo "${RED}Validation failed! Please fix the issues before pushing.${NC}"
echo       echo "${YELLOW}To skip validation (not recommended), use: git push --no-verify${NC}"
echo       exit 1
echo     fi
echo     echo.
echo     echo "${GREEN}Validation passed! Proceeding with push...${NC}"
echo   else
echo     echo "${YELLOW}Running quick validation...${NC}"
echo     echo.
echo     # Run quick validation for other branches
echo     npm run validate:quick
echo     echo.
echo     if [ $? -ne 0 ]; then
echo       echo "${RED}Quick validation failed! Please fix the issues before pushing.${NC}"
echo       echo "${YELLOW}To skip validation (not recommended), use: git push --no-verify${NC}"
echo       exit 1
echo     fi
echo   fi
echo done
echo.
echo exit 0
) > "%PRE_PUSH_HOOK%"

echo.
echo Pre-push hook installed successfully!
echo Hook location: %PRE_PUSH_HOOK%
echo.
echo The pre-push hook will now automatically run validation before pushing.
echo To test it, try: git push
echo To skip validation (not recommended): git push --no-verify

