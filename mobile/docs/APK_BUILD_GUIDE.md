# 📱 M4Hub Mobile - Production APK Build Guide

## Overview
This guide will help you build a production-ready APK for the M4Hub mobile application using Expo Application Services (EAS).

---

## 🎯 Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo Account
```bash
eas login
```

If you don't have an Expo account:
```bash
eas register
```

### 3. Configure Your Project
```bash
cd mobile
eas build:configure
```

---

## 🏗️ Build Options

### Option 1: Production APK (Recommended for Testing)
**Best for:** Direct installation on Android devices, testing, distribution outside Play Store

```bash
cd mobile
eas build --platform android --profile production
```

**What it does:**
- Builds an optimized APK file
- Uses production API URL (https://m4hub.onrender.com)
- Minifies and optimizes code
- Ready for direct installation

**Build time:** ~10-15 minutes  
**Output:** `.apk` file (~50-80 MB)

---

### Option 2: Production AAB (For Google Play Store)
**Best for:** Publishing to Google Play Store

```bash
cd mobile
eas build --platform android --profile production-aab
```

**What it does:**
- Builds an Android App Bundle (.aab)
- Optimized for Play Store distribution
- Smaller download size for users
- Required for Play Store submission

**Build time:** ~10-15 minutes  
**Output:** `.aab` file

---

### Option 3: Preview APK (For Quick Testing)
**Best for:** Quick testing with development features

```bash
cd mobile
eas build --platform android --profile preview
```

**Build time:** ~8-10 minutes  
**Output:** `.apk` file

---

## 📋 Step-by-Step Build Process

### Step 1: Prepare Your Environment
```bash
# Navigate to mobile directory
cd d:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile

# Ensure all dependencies are installed
npm install

# Login to EAS
eas login
```

### Step 2: Start the Build
```bash
# For production APK
eas build --platform android --profile production
```

### Step 3: Monitor Build Progress
- EAS will provide a build URL
- You can monitor progress at: https://expo.dev/accounts/[your-account]/projects/m4hub/builds
- Build logs are available in real-time

### Step 4: Download the APK
Once the build completes:
1. EAS will provide a download link
2. Download the APK to your computer
3. Or scan the QR code to download directly to your Android device

---

## 📦 Build Profiles Explained

### Development Profile
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "gradleCommand": ":app:assembleDebug"
  }
}
```
- For development and debugging
- Includes dev tools
- Larger file size

### Preview Profile
```json
{
  "android": {
    "buildType": "apk"
  },
  "distribution": "internal"
}
```
- Quick testing builds
- Optimized but not fully production-ready
- Good for QA testing

### Production Profile
```json
{
  "android": {
    "buildType": "apk"
  },
  "env": {
    "EXPO_PUBLIC_API_URL": "https://m4hub.onrender.com"
  }
}
```
- Fully optimized
- Production API URL
- Minified code
- Ready for distribution

### Production AAB Profile
```json
{
  "android": {
    "buildType": "app-bundle"
  },
  "env": {
    "EXPO_PUBLIC_API_URL": "https://m4hub.onrender.com"
  }
}
```
- For Google Play Store
- Optimized bundle format
- Smaller user downloads

---

## 🚀 Quick Start Commands

### Build Production APK (Most Common)
```bash
cd mobile
eas build --platform android --profile production
```

### Build and Auto-Submit to Internal Testing
```bash
cd mobile
eas build --platform android --profile production --auto-submit
```

### Build for Both Android and iOS
```bash
cd mobile
eas build --platform all --profile production
```

### Check Build Status
```bash
eas build:list
```

### View Latest Build
```bash
eas build:view
```

---

## 📲 Installing the APK

### Method 1: Direct Download
1. Download APK from EAS build page
2. Transfer to Android device
3. Enable "Install from Unknown Sources" in Settings
4. Tap the APK file to install

### Method 2: QR Code
1. EAS provides a QR code after build
2. Scan with Android device
3. Download and install directly

### Method 3: ADB Install
```bash
adb install path/to/m4hub.apk
```

---

## 🔧 Configuration Details

### App Information
- **App Name:** M4Hub
- **Package Name:** com.rohithl2345.m4hub
- **Version:** 1.0.0
- **Version Code:** 1

### API Configuration
- **Production API:** https://m4hub.onrender.com
- **Development API:** http://10.0.2.2:8080 (Android Emulator)

### Permissions
- INTERNET
- ACCESS_NETWORK_STATE
- VIBRATE

---

## 🎨 App Assets

Ensure these assets exist before building:
- ✅ `./assets/images/icon.png` (1024x1024)
- ✅ `./assets/images/splash-icon.png` (1284x2778)
- ✅ `./assets/images/android-icon-foreground.png`
- ✅ `./assets/images/android-icon-background.png`
- ✅ `./assets/images/android-icon-monochrome.png`
- ✅ `./assets/images/favicon.png`

---

## 🔐 Code Signing (Optional)

For production builds, you may want to use your own keystore:

### Generate Keystore
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore m4hub.keystore -alias m4hub -keyalg RSA -keysize 2048 -validity 10000
```

### Configure in eas.json
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "credentialsSource": "local"
      }
    }
  }
}
```

---

## 📊 Build Optimization

### Reduce APK Size
1. **Enable Proguard** (already configured)
2. **Remove unused resources**
3. **Optimize images**
4. **Use AAB format** for Play Store

### Current APK Size Estimate
- **Development:** ~80-100 MB
- **Production APK:** ~50-70 MB
- **Production AAB:** ~40-60 MB (user downloads ~30-40 MB)

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear EAS cache
eas build:clear-cache

# Try again
eas build --platform android --profile production
```

### Login Issues
```bash
# Logout and login again
eas logout
eas login
```

### Gradle Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
eas build --platform android --profile production --clear-cache
```

### Network Issues
- Ensure stable internet connection
- EAS builds are done on cloud servers
- Check Expo status: https://status.expo.dev

---

## 📈 Build Analytics

### View Build History
```bash
eas build:list --platform android
```

### View Specific Build
```bash
eas build:view [BUILD_ID]
```

### Download Previous Build
```bash
eas build:download [BUILD_ID]
```

---

## 🚀 Publishing to Google Play Store

### Step 1: Build AAB
```bash
eas build --platform android --profile production-aab
```

### Step 2: Create Play Store Listing
1. Go to Google Play Console
2. Create new app
3. Fill in app details

### Step 3: Upload AAB
1. Navigate to Production → Releases
2. Create new release
3. Upload the .aab file
4. Complete release notes
5. Submit for review

### Step 4: Auto-Submit (Optional)
```bash
# Configure Google Play credentials
eas submit --platform android

# Or build and submit in one command
eas build --platform android --profile production-aab --auto-submit
```

---

## 📝 Build Checklist

Before building for production:

- [ ] Update version in `app.json`
- [ ] Update version code in `app.json`
- [ ] Test all features locally
- [ ] Verify API endpoints
- [ ] Check all assets are present
- [ ] Review app permissions
- [ ] Test authentication flow
- [ ] Verify production API URL
- [ ] Check app icon and splash screen
- [ ] Review app description
- [ ] Test on physical device
- [ ] Run linting: `npm run lint`
- [ ] Commit all changes to git

---

## 🎯 Recommended Build Strategy

### For Development Testing
```bash
eas build --platform android --profile preview
```

### For Production Testing
```bash
eas build --platform android --profile production
```

### For Play Store Release
```bash
eas build --platform android --profile production-aab
```

---

## 💡 Pro Tips

1. **Use Preview Builds** for quick testing
2. **Use Production APK** for beta testing
3. **Use Production AAB** for Play Store
4. **Monitor builds** on Expo dashboard
5. **Save build IDs** for reference
6. **Test on multiple devices** before release
7. **Keep keystores secure** (if using custom signing)
8. **Version incrementally** (1.0.0 → 1.0.1 → 1.1.0)

---

## 📞 Support

### Expo Documentation
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/

### Common Commands Reference
```bash
# Login
eas login

# Build APK
eas build --platform android --profile production

# Build AAB
eas build --platform android --profile production-aab

# List builds
eas build:list

# View build
eas build:view

# Download build
eas build:download

# Submit to Play Store
eas submit --platform android

# Clear cache
eas build:clear-cache
```

---

## 🎉 Ready to Build!

You're all set! Run this command to start building your production APK:

```bash
cd d:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile
eas build --platform android --profile production
```

The build will take approximately **10-15 minutes**. Once complete, you'll receive a download link for your production-ready APK!

---

**Last Updated:** December 31, 2025  
**App Version:** 1.0.0  
**Status:** ✅ Ready for Production Build
