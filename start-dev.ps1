# M4Hub Development Environment Startup Script

Write-Host "Starting M4Hub Development Environment..." -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# 1. Start Docker Desktop if not running
Write-Host "`nChecking Docker Desktop..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting for Docker to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "Docker Desktop is running" -ForegroundColor Green
}

# 2. Start PostgreSQL Database
Write-Host "`nStarting PostgreSQL Database..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot"
docker-compose -f infra/docker-compose.dev.yml up -d 2>&1 | Out-Null
if (Test-Port 5433) {
    Write-Host "Database started on port 5433" -ForegroundColor Green
} else {
    Write-Host "Waiting for database..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# 3. Start Backend (Spring Boot) in new terminal
Write-Host "`nStarting Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'BACKEND SERVER' -ForegroundColor Cyan; mvn spring-boot:run '-Dspring-boot.run.profiles=dev'"

# Wait a bit for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Start Frontend (Next.js) in new terminal
Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'FRONTEND SERVER' -ForegroundColor Cyan; npm run dev"

Write-Host "`nAll services are starting!" -ForegroundColor Green
Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "  Database: localhost:5433" -ForegroundColor White
Write-Host "`nTo start Mobile App:" -ForegroundColor Cyan
Write-Host "  cd mobile" -ForegroundColor White
Write-Host "  .\\start-mobile.ps1" -ForegroundColor White
Write-Host "`nTo stop: Close terminal windows or run .\\stop-dev.ps1" -ForegroundColor Yellow
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
