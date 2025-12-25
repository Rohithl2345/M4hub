# Start Mobile App (Expo)

Write-Host "📱 MOBILE APP (EXPO)" -ForegroundColor Cyan
Write-Host "Location: $PWD" -ForegroundColor Gray
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Expo..." -ForegroundColor Yellow
Write-Host ""
npx expo start
