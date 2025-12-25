# M4Hub Development Environment Stop Script

Write-Host "🛑 Stopping M4Hub Development Environment..." -ForegroundColor Red

# Stop Docker containers
Write-Host "`n🗄️  Stopping Database..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot"
docker-compose -f infra/docker-compose.dev.yml down

Write-Host "`n☕ Stopping Backend processes..." -ForegroundColor Yellow
Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*mvn*" -or $_.CommandLine -like "*spring-boot*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n⚛️  Stopping Frontend processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n✅ All services stopped!" -ForegroundColor Green
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
