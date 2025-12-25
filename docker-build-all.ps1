# Build and Run All Docker Layers
# This script builds and starts all application layers in Docker containers

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     M4HUB - Docker Build & Deploy All Layers       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if (-not $dockerRunning -and $LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running`n" -ForegroundColor Green

# Navigate to infra directory
Set-Location "$PSScriptRoot\infra"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please review and update if needed.`n" -ForegroundColor Green
}

# Stop any running containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.complete.yml down
Write-Host ""

# Build all images
Write-Host "Building Docker images for all layers..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes on first run...`n" -ForegroundColor Gray

docker-compose -f docker-compose.complete.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Docker build failed. Check logs above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ All images built successfully!`n" -ForegroundColor Green

# Start all containers
Write-Host "Starting all containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.complete.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Failed to start containers." -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ All containers started!`n" -ForegroundColor Green

# Wait for services to be healthy
Write-Host "Waiting for services to be ready (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check container status
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            Container Status                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

docker-compose -f docker-compose.complete.yml ps

# Test all layers
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            Testing All Layers                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Database:" -ForegroundColor Yellow
$dbStatus = docker ps --filter "name=m4hub-db-complete" --format "{{.Status}}"
if ($dbStatus) {
    Write-Host "   ✓ Running: $dbStatus" -ForegroundColor Green
} else {
    Write-Host "   ✗ Not running" -ForegroundColor Red
}

Write-Host "`n2. Backend API (http://localhost:8080):" -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/send-otp" `
        -Method POST `
        -Body '{"phoneNumber":"+919876543210"}' `
        -ContentType "application/json" `
        -TimeoutSec 10
    Write-Host "   ✓ API is working!" -ForegroundColor Green
    Write-Host "   Response: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠ Backend starting (may take 1-2 minutes)" -ForegroundColor Yellow
}

Write-Host "`n3. Frontend Web (http://localhost:3000):" -ForegroundColor Yellow
try {
    $web = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Frontend is accessible (Status: $($web.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Frontend starting" -ForegroundColor Yellow
}

Write-Host "`n4. Mobile Dev Server (http://localhost:8081):" -ForegroundColor Yellow
try {
    $mobile = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Expo dev server running" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Mobile server starting" -ForegroundColor Yellow
}

# Show logs command
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            Access Information                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🌐 Application URLs:" -ForegroundColor Green
Write-Host "   Frontend:  http://localhost:3000"
Write-Host "   Backend:   http://localhost:8080"
Write-Host "   Mobile:    http://localhost:8081"
Write-Host "   Database:  localhost:5432`n"

Write-Host "📊 Useful Commands:" -ForegroundColor Green
Write-Host "   View logs:     docker-compose -f infra/docker-compose.complete.yml logs -f"
Write-Host "   Stop all:      docker-compose -f infra/docker-compose.complete.yml down"
Write-Host "   Restart:       docker-compose -f infra/docker-compose.complete.yml restart"
Write-Host "   Check status:  docker-compose -f infra/docker-compose.complete.yml ps`n"

Write-Host "✅ Docker deployment complete!`n" -ForegroundColor Green
