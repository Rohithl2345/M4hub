# M4Hub Services Test Script
# Tests all running services: Database, Backend, Frontend, Mobile

Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   M4HUB - Full Application Test Suite            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Database
Write-Host "🗄️  [1/4] Testing PostgreSQL Database..." -ForegroundColor Yellow
$dbStatus = docker ps --filter "name=m4hub-db-dev" --format "{{.Status}}"
if ($dbStatus -like "*Up*") {
    Write-Host "   ✓ Database is running" -ForegroundColor Green
    Write-Host "   Status: $dbStatus" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Database is not running" -ForegroundColor Red
    Write-Host "   Run: docker-compose -f infra/docker-compose.dev.yml up -d" -ForegroundColor Yellow
}

# Test 2: Backend API
Write-Host "`n☕ [2/4] Testing Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
$javaProcess = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcess) {
    Write-Host "   ✓ Java process running (PID: $($javaProcess.Id))" -ForegroundColor Green
    
    Start-Sleep -Seconds 2
    
    # Test Health Endpoint
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✓ Health endpoint: $($health.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ Health endpoint not configured" -ForegroundColor Yellow
    }
    
    # Test OTP API
    try {
        $body = @{phoneNumber="+919876543210"} | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/send-otp" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ✓ API endpoint working (OTP sent)" -ForegroundColor Green
        Write-Host "   Response: $($response.message)" -ForegroundColor Gray
    } catch {
        Write-Host "   ✗ API error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ Backend not running" -ForegroundColor Red
    Write-Host "   Run: cd backend && ./mvnw spring-boot:run" -ForegroundColor Yellow
}

# Test 3: Frontend Web App
Write-Host "`n[3/4] Testing Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   Success: Frontend server responding (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Check if it's rendering properly
    if ($response.Content -like "*M4Hub*" -or $response.Content -like "*phone*") {
        Write-Host "   Success: Application rendering correctly" -ForegroundColor Green
    } else {
        Write-Host "   Warning: Server running but may have errors" -ForegroundColor Yellow
    }
}
catch {
    if ($_.Exception.Message -like "*500*") {
        Write-Host "   Warning: Server running but returning 500 error" -ForegroundColor Yellow
        Write-Host "   Check console logs for environment variable errors" -ForegroundColor Gray
    }
    else {
        Write-Host "   Error: Frontend not responding" -ForegroundColor Red
        Write-Host "   Run: cd frontend && npm run dev" -ForegroundColor Yellow
    }
}

# Test 4: Mobile Expo Server
Write-Host "`n[4/4] Testing Expo Mobile App (Port 8081)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   Success: Expo dev server running (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Scan QR code in terminal to open app" -ForegroundColor Gray
}
catch {
    Write-Host "   Warning: Expo server not responding (may still be starting)" -ForegroundColor Yellow
    Write-Host "   Run: cd mobile && npm start" -ForegroundColor Yellow
}

# Summary
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Running Processes:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Get-Process -Name "java","node" -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}} | Format-Table

Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend (Web):  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend (API):   http://localhost:8080" -ForegroundColor White
Write-Host "   Expo (Mobile):   http://localhost:8081" -ForegroundColor White
Write-Host "   Database:        localhost:5432" -ForegroundColor White

Write-Host ""
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host ""
