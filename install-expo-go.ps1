# Install Expo Go on Android Emulator
# This script downloads and installs Expo Go APK on the connected emulator

Write-Host "📱 Installing Expo Go on Android Emulator" -ForegroundColor Cyan
Write-Host ""

# Check if emulator is connected
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "emulator-5554") {
    Write-Host "✅ Emulator found: emulator-5554" -ForegroundColor Green
} else {
    Write-Host "❌ No emulator found. Please start your Android emulator first." -ForegroundColor Red
    exit 1
}

# Download Expo Go APK
$apkUrl = "https://d1ahtucjixef4r.cloudfront.net/Exponent-2.32.10.apk"
$apkPath = "$env:TEMP\expo-go-latest.apk"

Write-Host ""
Write-Host "Downloading Expo Go APK..." -ForegroundColor Yellow
Write-Host "URL: $apkUrl" -ForegroundColor Gray

try {
    # Remove old APK if exists
    if (Test-Path $apkPath) {
        Remove-Item $apkPath -Force
    }
    
    # Download with progress
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $apkUrl -OutFile $apkPath -UseBasicParsing
    $ProgressPreference = 'Continue'
    
    Write-Host "✅ Download complete!" -ForegroundColor Green
    
    # Check file size
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

# Install APK on emulator
Write-Host ""
Write-Host "Installing Expo Go on emulator..." -ForegroundColor Yellow

try {
    $result = adb -s emulator-5554 install -r $apkPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Expo Go installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Installation failed:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Installation error: $_" -ForegroundColor Red
    exit 1
}

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
$packages = adb -s emulator-5554 shell pm list packages | Select-String "expo"

if ($packages) {
    Write-Host "✅ Expo Go is installed!" -ForegroundColor Green
    Write-Host $packages -ForegroundColor Gray
} else {
    Write-Host "⚠️  Installation completed but package not found" -ForegroundColor Yellow
}

# Cleanup
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item $apkPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✨ Done! You can now press 'a' in the Expo terminal to open your app." -ForegroundColor Green
Write-Host ""
