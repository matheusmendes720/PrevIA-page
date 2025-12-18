# Fast launch script using Bun for optimal performance (PowerShell)

Write-Host "🚀 Launching with Bun for faster performance..." -ForegroundColor Green
Write-Host ""

# Check if Bun is installed
try {
    $bunVersion = bun --version 2>&1
    Write-Host "✅ Bun version: $bunVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Bun is not installed. Please install from https://bun.sh" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies with Bun (faster than npm)
Write-Host "📦 Installing dependencies with Bun..." -ForegroundColor Cyan
bun install

Write-Host ""
Write-Host "🔥 Starting development server with Bun..." -ForegroundColor Yellow
Write-Host "   Access at: http://localhost:3001/features/5g" -ForegroundColor Cyan
Write-Host ""

# Launch with Bun
bun run --bun next dev -p 3001




