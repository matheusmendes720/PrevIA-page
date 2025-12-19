# PowerShell script to keep active 5G testing builds running
# Usage: .\scripts\keep-active-5g-testing.ps1

Write-Host "🧪 Starting Active 5G Testing Builds..." -ForegroundColor Cyan
Write-Host "📦 Mode: Watch (Continuous Testing)" -ForegroundColor Yellow
Write-Host ""

$ErrorActionPreference = "Continue"

# Change to frontend directory
Set-Location $PSScriptRoot\..

# Function to run tests
function Run-5GTests {
    Write-Host "`n🔄 Running 5G tests..." -ForegroundColor Green
    npm run test:5g:watch
}

# Function to check if process is still running
function Test-ProcessRunning {
    param($ProcessName)
    $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    return $null -ne $process
}

# Main loop - keep testing active
Write-Host "✅ Active testing mode enabled" -ForegroundColor Green
Write-Host "👀 Watching for file changes..." -ForegroundColor Yellow
Write-Host "🛑 Press Ctrl+C to stop`n" -ForegroundColor Red

try {
    # Start watch mode
    Run-5GTests
} catch {
    Write-Host "`n❌ Error occurred: $_" -ForegroundColor Red
    Write-Host "🔄 Restarting in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Run-5GTests
}
























