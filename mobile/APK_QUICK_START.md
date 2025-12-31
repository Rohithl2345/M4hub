# 📱 M4Hub Mobile - Production APK Quick Start

## 🚀 Ready to Build Your Production APK!

Your M4Hub mobile app is now configured and ready for production builds!

---

## ✅ What's Been Configured

### 1. App Configuration (`app.json`)
- ✅ App name: **M4Hub**
- ✅ Package: `com.rohithl2345.m4hub`
- ✅ Version: 1.0.0
- ✅ Description: "M4Hub - Your Digital Ecosystem"
- ✅ Android permissions configured
- ✅ Splash screen and icons set

### 2. Build Profiles (`eas.json`)
- ✅ **Development** - For debugging
- ✅ **Preview** - Quick testing APK
- ✅ **Production** - Optimized APK for distribution
- ✅ **Production AAB** - For Google Play Store

### 3. API Configuration
- ✅ Production API: `https://m4hub.onrender.com`
- ✅ Development API: Auto-configured for emulator
- ✅ Environment variables ready

---

## 🎯 Quick Start - Build Production APK

### Option 1: Using the Build Script (Easiest)
```powershell
cd d:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile
.\build-apk.ps1
```

Then select option **1** for Production APK.

### Option 2: Direct Command
```powershell
cd d:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile
eas build --platform android --profile production
```

---

## 📋 Step-by-Step Instructions

### Step 1: Install EAS CLI (One-time setup)
```powershell
npm install -g eas-cli
```

### Step 2: Login to Expo
```powershell
eas login
```

If you don't have an account:
```powershell
eas register
```

### Step 3: Build Production APK
```powershell
cd d:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile
eas build --platform android --profile production
```

### Step 4: Wait for Build
- Build time: ~10-15 minutes
- Monitor at: https://expo.dev
- You'll get a download link when complete

### Step 5: Download & Install
- Download the APK from the provided link
- Or scan the QR code with your Android device
- Install and test!

---

## 🎨 Build Profiles Available

### 1. Production APK (Recommended)
```bash
eas build --platform android --profile production
```
- **Use for:** Testing, distribution, beta releases
- **Output:** APK file (~50-70 MB)
- **API:** Production (https://m4hub.onrender.com)
- **Optimized:** Yes
- **Build time:** 10-15 minutes

### 2. Production AAB (For Play Store)
```bash
eas build --platform android --profile production-aab
```
- **Use for:** Google Play Store submission
- **Output:** AAB file
- **API:** Production
- **Optimized:** Yes
- **Build time:** 10-15 minutes

### 3. Preview APK (Quick Testing)
```bash
eas build --platform android --profile preview
```
- **Use for:** Quick testing
- **Output:** APK file
- **Build time:** 8-10 minutes

---

## 📱 What You'll Get

After the build completes, you'll receive:

1. **Download Link** - Direct APK download
2. **QR Code** - Scan to install on device
3. **Build Details** - Version, size, build time
4. **Installation Instructions** - How to install

### APK Details
- **File size:** ~50-70 MB
- **Min Android:** 6.0 (API 23)
- **Target Android:** 14 (API 34)
- **Architecture:** Universal (ARM, ARM64, x86)

---

## 🔧 Troubleshooting

### EAS CLI Not Found
```powershell
npm install -g eas-cli
```

### Login Issues
```powershell
eas logout
eas login
```

### Build Fails
```powershell
eas build:clear-cache
eas build --platform android --profile production
```

---

## 📊 Useful Commands

```powershell
# Check build status
eas build:view

# List all builds
eas build:list

# Download a build
eas build:download [BUILD_ID]

# View build logs
eas build:view [BUILD_ID]

# Cancel a build
eas build:cancel
```

---

## 🎯 Next Steps After Build

### 1. Test the APK
- Install on multiple Android devices
- Test all features
- Verify authentication
- Check API connectivity
- Test offline behavior

### 2. Beta Testing
- Share APK with beta testers
- Collect feedback
- Fix any issues
- Build again if needed

### 3. Publish to Play Store
- Build AAB version
- Create Play Store listing
- Upload AAB
- Submit for review

---

## 📝 Pre-Build Checklist

Before building, ensure:

- [ ] All features tested locally
- [ ] No console errors
- [ ] API endpoints verified
- [ ] Authentication working
- [ ] All assets present
- [ ] Version updated in app.json
- [ ] Code committed to git
- [ ] Dependencies up to date

---

## 🚀 Ready to Build!

Everything is configured and ready. Run this command to start:

```powershell
cd d:\ROHITH_PERSONAL\Personal_Project\M4hub\mobile
eas build --platform android --profile production
```

Or use the interactive script:

```powershell
.\build-apk.ps1
```

---

## 📚 Documentation

- **Full Build Guide:** `docs/APK_BUILD_GUIDE.md`
- **Auth Testing:** `docs/AUTH_TESTING.md`
- **Expo Docs:** https://docs.expo.dev/build/introduction/

---

## 💡 Pro Tips

1. **First build?** It might take a bit longer (~15-20 min)
2. **Save your build ID** for future reference
3. **Test on real devices** not just emulators
4. **Keep your Expo account** credentials safe
5. **Monitor builds** on the Expo dashboard
6. **Version incrementally** for each release

---

## 🎉 Success!

Once your build completes, you'll have a production-ready APK that you can:
- ✅ Install on any Android device
- ✅ Share with beta testers
- ✅ Distribute outside Play Store
- ✅ Test in real-world conditions

**Happy Building!** 🚀

---

**Last Updated:** December 31, 2025  
**App Version:** 1.0.0  
**Status:** ✅ Ready to Build
