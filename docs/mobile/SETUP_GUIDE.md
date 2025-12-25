# React Native + Expo Setup Guide for M4hub Mobile 🚀

## Project Overview

This is a fully configured React Native mobile app using Expo, designed for the M4hub platform. It supports iOS, Android, and Web platforms out of the box.

## Prerequisites

Before you start, ensure you have:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (for version control)
   - Already set up in your workspace

3. **Mobile Development Tools** (optional, but recommended):
   - **Android**: Android Studio + Android SDK
   - **iOS**: Xcode (macOS only)
   - Or use **Expo Go app** on your physical device for quick testing

## Installation Steps

### 1. Install Dependencies

```bash
cd mobile
npm install
```

This will install all required packages including:
- React Native framework
- Expo SDK
- Navigation libraries
- TypeScript support
- ESLint for code quality

### 2. Start Development Server

```bash
npm start
```

You'll see options to:
- Press `i` - Open iOS Simulator (requires macOS)
- Press `a` - Open Android Emulator
- Press `w` - Open Web browser
- Press `j` - Open debugger
- Press `r` - Reload app

## Running on Different Platforms

### Web Browser
```bash
npm run web
```
Opens your app at `http://localhost:8081`

### Android Emulator
```bash
npm run android
```
Requires Android Studio and an emulator instance running

### iOS Simulator
```bash
npm run ios
```
Requires macOS and Xcode installed

### Physical Device (Using Expo Go)
1. Install "Expo Go" app from App Store or Google Play
2. Run `npm start`
3. Scan the QR code with your phone

## Project Structure

```
mobile/
├── app/                    # Main app code with file-based routing
│   ├── (tabs)/            # Tab-based navigation
│   ├── _layout.tsx        # App layout and routing configuration
│   └── modal.tsx          # Modal screen example
├── components/            # Reusable components
├── constants/             # App constants
├── hooks/                 # Custom React hooks
├── assets/               # Images, icons, fonts
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Common Commands

```bash
# Start development server
npm start

# Lint code (check for issues)
npm run lint

# Reset to blank project (backup first!)
npm run reset-project

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Development Workflow

1. **Edit Files**: Modify files in `app/` directory
2. **Auto-reload**: Changes appear instantly in running app
3. **Check Console**: View logs and errors in terminal
4. **Debug**: Use Expo DevTools debugger (press `j`)

## Backend Integration

To connect with the M4hub backend API:

1. Create an `.env` file (add to .gitignore):
   ```
   EXPO_PUBLIC_API_URL=http://your-backend-url:8080
   ```

2. Use in your code:
   ```typescript
   const API_URL = process.env.EXPO_PUBLIC_API_URL;
   
   fetch(`${API_URL}/api/items`)
     .then(res => res.json())
     .then(data => console.log(data));
   ```

## Troubleshooting

### Issue: "Command not found: npm"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: Port 8081 already in use
**Solution**: Kill the process or use a different port:
```bash
npm start -- --port 8082
```

### Issue: Module not found errors
**Solution**: Clear cache and reinstall:
```bash
rm -r node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Solution**: Ensure you're using TypeScript 5.9+:
```bash
npm install --save-dev typescript@latest
```

## Code Quality

The project uses **ESLint** with Expo's recommended config:

```bash
# Check for linting issues
npm run lint

# Many issues can auto-fix
npx eslint . --fix
```

## Building for Production

### Using EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas init

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both platforms
eas build
```

### Using Local Builds

```bash
# For iOS (requires macOS)
npx expo run:ios --release

# For Android
npx expo run:android --release
```

## Publishing

To publish your app:

```bash
eas publish
```

This creates an update that existing users can download without reinstalling.

## Environment Setup

### Using TypeScript

The project is fully configured with TypeScript. All files should use `.ts` or `.tsx` extensions:

- `.ts` - TypeScript files (no JSX)
- `.tsx` - TypeScript files with React components (JSX)

### Environment Variables

Create a `.env` file in the mobile root:

```
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_APP_NAME=M4hub Mobile
```

Note: Only variables prefixed with `EXPO_PUBLIC_` are accessible in the app.

## Next Steps

1. ✅ Install dependencies
2. ✅ Start development server (`npm start`)
3. ✅ Test on a platform (web, Android, or iOS)
4. ✅ Modify files in `app/` directory
5. ✅ Connect to M4hub backend API
6. ✅ Build for production when ready

## Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Expo Router**: https://docs.expo.dev/router
- **React Navigation**: https://reactnavigation.org

## Support

For issues or questions:
1. Check Expo documentation
2. Review React Native community forums
3. Check GitHub issues in Expo repository

---

**Happy coding! 🎉**
