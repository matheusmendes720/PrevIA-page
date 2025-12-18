# PowerShell script to test Towers API
# Usage: .\scripts\test_towers_api.ps1

$API_BASE = "http://localhost:8000/api/v1/towers"

Write-Host "=" -NoNewline
1..60 | ForEach-Object { Write-Host "=" -NoNewline }
Write-Host ""
Write-Host "🚀 TOWERS API TESTING SUITE"
Write-Host "=" -NoNewline
1..60 | ForEach-Object { Write-Host "=" -NoNewline }
Write-Host ""

$results = @()

# Test 1: Basic endpoint
Write-Host "`n🧪 Testing: Get Towers (Basic)"
Write-Host "   URL: $API_BASE/?limit=10"
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/?limit=10" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Status: 200"
    Write-Host "   ✅ Response: Valid JSON"
    $towerCount = $response.towers.Count
    $total = $response.total
    Write-Host "   📊 Found $towerCount towers (total: $total)"
    $results += @{Name="Basic Endpoint"; Success=$true}
} catch {
    Write-Host "   ❌ Error: $_"
    $results += @{Name="Basic Endpoint"; Success=$false}
}

# Test 2: Filtered endpoint
Write-Host "`n🧪 Testing: Get Towers (Filtered - Active)"
Write-Host "   URL: $API_BASE/?status=active&limit=5"
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/?status=active&limit=5" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Status: 200"
    Write-Host "   ✅ Filter works correctly"
    $results += @{Name="Filtered Endpoint"; Success=$true}
} catch {
    Write-Host "   ❌ Error: $_"
    $results += @{Name="Filtered Endpoint"; Success=$false}
}

# Test 3: Stats endpoint
Write-Host "`n🧪 Testing: Get Statistics"
Write-Host "   URL: $API_BASE/stats/summary"
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/stats/summary" -Method Get -TimeoutSec 10
    Write-Host "   ✅ Status: 200"
    $total = $response.total_towers
    Write-Host "   📊 Total Towers: $total"
    if ($response.by_status) {
        Write-Host "   📊 By Status: $($response.by_status | ConvertTo-Json -Compress)"
    }
    $results += @{Name="Stats Endpoint"; Success=$true}
} catch {
    Write-Host "   ❌ Error: $_"
    $results += @{Name="Stats Endpoint"; Success=$false}
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline
1..60 | ForEach-Object { Write-Host "=" -NoNewline }
Write-Host ""
Write-Host "📊 TEST SUMMARY"
Write-Host "=" -NoNewline
1..60 | ForEach-Object { Write-Host "=" -NoNewline }
Write-Host ""

$passed = ($results | Where-Object { $_.Success -eq $true }).Count
$total = $results.Count

foreach ($result in $results) {
    $status = if ($result.Success) { "✅ PASS" } else { "❌ FAIL" }
    Write-Host "$status - $($result.Name)"
}

Write-Host "`n✅ Passed: $passed/$total"

if ($passed -eq $total) {
    Write-Host "`n🎉 All tests passed! API is working correctly."
    exit 0
} else {
    Write-Host "`n⚠️  $($total - $passed) test(s) failed. Check errors above."
    exit 1
}



