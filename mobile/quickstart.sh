#!/bin/bash
# Quick start script for M4hub Mobile development

echo "🚀 M4hub Mobile - Quick Start Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")" || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Select how to run the app:"
echo "1) Start development server (npm start)"
echo "2) Run on Web (npm run web)"
echo "3) Run on Android (npm run android)"
echo "4) Run on iOS (npm run ios)"
echo "5) Check code quality (npm run lint)"
echo "6) Reset to blank project (npm run reset-project)"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "Starting Expo development server..."
        npm start
        ;;
    2)
        echo "Opening app in web browser..."
        npm run web
        ;;
    3)
        echo "Opening app in Android emulator..."
        npm run android
        ;;
    4)
        echo "Opening app in iOS simulator..."
        npm run ios
        ;;
    5)
        echo "Running ESLint..."
        npm run lint
        ;;
    6)
        echo "Resetting project to blank state..."
        npm run reset-project
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
