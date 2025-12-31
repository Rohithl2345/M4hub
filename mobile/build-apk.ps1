# M4Hub Mobile - Production Build Script
# This script helps you build production APK easily

Write-Host "🚀 M4Hub Mobile - Production APK Builder" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the mobile directory
if (-not (Test-Path "app.json")) {
    Write-Host "❌ Error: Please run this script from the mobile directory" -ForegroundColor Red
    Write-Host "   Run: cd mobile" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Build Options:" -ForegroundColor Green
Write-Host "  1. Production APK (Recommended for testing & distribution)"
Write-Host "  2. Production AAB (For Google Play Store)"
Write-Host "  3. Preview APK (Quick testing)"
Write-Host "  4. Check build status"
Write-Host "  5. List all builds"
Write-Host ""

$choice = Read-Host "Select an option (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏗️  Building Production APK..." -ForegroundColor Cyan
        Write-Host "   This will take approximately 10-15 minutes" -ForegroundColor Yellow
        Write-Host ""
        eas build --platform android --profile production
    }
    "2" {
        Write-Host ""
        Write-Host "🏗️  Building Production AAB for Play Store..." -ForegroundColor Cyan
        Write-Host "   This will take approximately 10-15 minutes" -ForegroundColor Yellow
        Write-Host ""
        eas build --platform android --profile production-aab
    }
    "3" {
        Write-Host ""
        Write-Host "🏗️  Building Preview APK..." -ForegroundColor Cyan
        Write-Host "   This will take approximately 8-10 minutes" -ForegroundColor Yellow
        Write-Host ""
        eas build --platform android --profile preview
    }
    "4" {
        Write-Host ""
        Write-Host "📊 Checking build status..." -ForegroundColor Cyan
        Write-Host ""
        eas build:view
    }
    "5" {
        Write-Host ""
        Write-Host "📋 Listing all builds..." -ForegroundColor Cyan
        Write-Host ""
        eas build:list --platform android
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid option selected" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pro Tips:" -ForegroundColor Yellow
Write-Host "   - Monitor your build at: https://expo.dev" -ForegroundColor Gray
Write-Host "   - Download APK from the build page" -ForegroundColor Gray
Write-Host "   - Or scan the QR code to install directly" -ForegroundColor Gray
Write-Host ""
