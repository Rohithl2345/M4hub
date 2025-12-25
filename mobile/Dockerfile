# Mobile Dockerfile for Expo (Development Server)
# This runs the Expo dev server in a container
# Note: For production, you'd build APK/IPA separately

FROM node:18-alpine

WORKDIR /app

# Install Expo CLI globally
RUN npm install -g expo-cli @expo/ngrok

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose Expo dev server ports
EXPOSE 19000 19001 19002 8081

# Set environment variables
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start Expo dev server
CMD ["npx", "expo", "start", "--lan"]
