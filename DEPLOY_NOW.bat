@echo off
REM Quick Deploy Script for Netlify
REM This script builds and deploys in one command

echo.
echo ========================================
echo   GRAN PRIX - QUICK NETLIFY DEPLOY
echo ========================================
echo.

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo [ERROR] Not in frontend directory!
    echo Please run: cd frontend
    exit /b 1
)

REM Check if Bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Bun not found!
    echo.
    echo Please install Bun first:
    echo https://bun.sh/
    echo.
    echo Alternatively, you can use npm:
    echo   npm install
    echo   npm run build
    exit /b 1
)

echo [1/4] Installing dependencies...
bun install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed
    exit /b 1
)

echo.
echo [2/4] Running type check...
bun run type-check
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Type check failed, but continuing...
)

echo.
echo [3/4] Building for production...
bun run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

echo.
echo [4/4] Checking Netlify CLI...
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Netlify CLI not found.
    echo.
    echo Option 1: Install Netlify CLI
    echo   npm install -g netlify-cli
    echo   netlify login
    echo   netlify deploy --prod --dir=.next
    echo.
    echo Option 2: Deploy via Git
    echo   git add .
    echo   git commit -m "deploy: frontend to Netlify"
    echo   git push origin main
    echo   Then connect repo at: https://app.netlify.com
    echo.
    echo Option 3: Manual Deploy
    echo   Go to: https://app.netlify.com/drop
    echo   Drag and drop the .next folder
    echo.
) else (
    echo.
    echo [INFO] Deploying to Netlify...
    netlify deploy --prod --dir=.next
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo   DEPLOYMENT SUCCESSFUL!
        echo ========================================
        echo.
        echo Your site is now live!
        echo Run: netlify open
        echo.
    ) else (
        echo [ERROR] Netlify deployment failed
        echo Run: netlify login
        echo Then try again
    )
)

pause

