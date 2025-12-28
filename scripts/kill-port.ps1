# Script to kill any process using port 3003
param(
    [int]$Port = 3003
)

Write-Host "Checking for processes using port $Port..."

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($connections) {
    $pids = $connections.OwningProcess | Select-Object -Unique
    foreach ($processId in $pids) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing process $processId ($($process.ProcessName))..."
            taskkill /F /PID $processId
        }
    }
    Write-Host "Port $Port is now free."
} else {
    Write-Host "Port $Port is already free."
}






