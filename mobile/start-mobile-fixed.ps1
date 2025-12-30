# Start Mobile App (Expo) - Fixed Version

Write-Host "📱 MOBILE APP (EXPO)" -ForegroundColor Cyan
Write-Host "Location: $PWD" -ForegroundColor Gray
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Expo with cache cleared..." -ForegroundColor Yellow
Write-Host ""

# Start Expo without auto-opening emulator
npx expo start --clear --host tunnel
