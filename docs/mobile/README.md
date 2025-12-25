# M4hub Mobile App 📱

This is a [React Native](https://reactnative.dev) + [Expo](https://expo.dev) project for the M4hub mobile application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or use npx)

### Installation

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npm start
   ```

## 📱 Available Commands

- `npm start` - Start Expo development server
- `npm run android` - Open app in Android emulator
- `npm run ios` - Open app in iOS simulator
- `npm run web` - Open app in web browser
- `npm run lint` - Run ESLint for code quality checks
- `npm run reset-project` - Reset to blank project template

## 🏗️ Project Structure

- **app/** - File-based routing with Expo Router
- **components/** - Reusable React Native components
- **constants/** - App constants and configuration
- **hooks/** - Custom React hooks
- **assets/** - Images, icons, and other static assets
- **scripts/** - Utility scripts

## 🔧 Tech Stack

- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo 54.x** - Development platform for React Native
- **Expo Router 6.x** - File-based routing
- **React 19.1.0** - UI library
- **React Navigation 7.x** - Navigation library
- **TypeScript 5.9** - Type-safe JavaScript
- **React Native Web** - Web support

## 📚 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Navigation Docs](https://reactnavigation.org/)

## 🚀 Deployment

For production builds and publishing:

```bash
expo publish
```

For EAS Build (Expo's cloud build service):

```bash
npm install -g eas-cli
eas build
```

## 🤝 Integration with Backend

This mobile app is designed to work with the M4hub backend (Spring Boot API). Update the API endpoints in your environment configuration files as needed.

## 📝 Notes

- The app uses Expo's managed workflow for simplified development
- New Architecture is enabled for improved performance
- Supports iOS, Android, and Web platforms

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
