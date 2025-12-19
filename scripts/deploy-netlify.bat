@echo off
REM Netlify Deployment Script for Gran Prix Frontend (Windows)
REM Optimized with Bun for faster builds

echo.
echo ========================================
echo Starting Gran Prix Frontend Deployment
echo ========================================
echo.

REM Check if Bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Bun not found. Please install Bun first:
    echo https://bun.sh/
    exit /b 1
)

echo [OK] Bun version:
bun --version

REM Clean previous build
echo.
echo [INFO] Cleaning previous build...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Install dependencies
echo.
echo [INFO] Installing dependencies with Bun...
bun install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Run type check
echo.
echo [INFO] Running type check...
bun run type-check
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Type check failed
    exit /b 1
)

REM Run linting
echo.
echo [INFO] Running linter...
bun run lint
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Linting issues found (continuing anyway)
)

REM Build with Bun
echo.
echo [INFO] Building with Bun...
set NODE_ENV=production
set NEXT_PUBLIC_USE_MOCK_DATA=true
bun run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

echo.
echo [OK] Build completed successfully!

REM Check build output
if exist .next (
    echo [OK] .next directory created
    dir .next
) else (
    echo [ERROR] .next directory not found
    exit /b 1
)

REM Deploy to Netlify (if netlify-cli is installed)
where netlify >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [INFO] Deploying to Netlify...
    netlify deploy --prod --dir=.next
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Netlify deployment failed
        exit /b 1
    )
    echo [OK] Deployed successfully!
) else (
    echo.
    echo [WARNING] Netlify CLI not found. Skipping deployment.
    echo            Install with: npm install -g netlify-cli
    echo            Or push to connected Git repo for auto-deploy
)

echo.
echo ========================================
echo Deployment process completed!
echo ========================================
pause

