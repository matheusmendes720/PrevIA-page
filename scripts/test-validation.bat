@echo off
REM Test Validation System
REM This script runs all validation tests

echo ========================================
echo Running Validation System Tests
echo ========================================
echo.

REM Get the frontend directory
cd /d "%~dp0\.."

REM Check if node_modules exists
if not exist "node_modules" (
    echo Warning: node_modules not found. Installing dependencies...
    call npm install
)

echo Running validation tests...
echo.

REM Run validation tests
call npm run test:validation

if %ERRORLEVEL% EQU 0 (
    echo.
    echo All validation tests passed!
    echo.
    echo To run specific test suites:
    echo   npm test -- validation/validate
    echo   npm test -- validation/build
    echo   npm test -- validation/install
    echo   npm test -- validation/scripts
    echo   npm test -- validation/type-check
    echo   npm test -- validation/integration
    exit /b 0
) else (
    echo.
    echo Some validation tests failed.
    echo Please fix the issues above.
    exit /b 1
)


