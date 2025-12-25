# M4Hub - All-in-One Platform

A comprehensive multi-platform application integrating **Music**, **Messages**, **Money**, and **News** services.

## ✨ Features

### 🎵 Music
- 200+ demo tracks with full playback
- Browse by genre, artist, album
- Real-time search functionality
- Full-length MP3 streaming

### 💬 Messages (Coming Soon)
- Instagram-like chat interface
- Real-time messaging with WebSocket
- Username-based chat system
- Group conversations
- Media sharing

### 💰 Money (Coming Soon)
- GPay-like payment interface
- Digital wallet system
- Send/receive money by username
- Transaction history
- Multiple payment methods

### 📰 News (In Development)
- Real-time news from NewsAPI
- 7+ categories (Tech, Business, Sports, etc.)
- Search and filter functionality
- Bookmark articles

## 🚀 Quick Start

### Prerequisites
- **Backend**: Java 17+, Maven 3.8+, PostgreSQL 15+
- **Frontend**: Node.js 18+, npm/yarn
- **Mobile**: Node.js 18+, Expo CLI

### Development Setup

```bash
# Start all services (Backend + Frontend + Database)
.\start-dev.ps1

# Stop all services
.\stop-dev.ps1
```

## 📁 Project Structure

```
M4hub/
├── backend/          # Spring Boot REST API
├── frontend/         # Next.js web application  
├── mobile/           # React Native (Expo) mobile app
├── infra/            # Docker Compose configurations
└── docs/             # Documentation
    ├── mobile/       # Mobile app documentation
    ├── backend/      # Backend documentation
    └── web/          # Web app documentation (coming soon)
```

## 📚 Documentation

### 🎯 Getting Started
- **[Implementation Plan](docs/IMPLEMENTATION_PLAN.md)** - Complete development roadmap
- **[Tomorrow's Checklist](docs/TOMORROW_CHECKLIST.md)** - Next day's action items
- [Development Guide](docs/README_DEV.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)

### 🎵 Music System
- [Music Quick Start](MUSIC_QUICK_START.md)
- [Database Music System](docs/DATABASE_MUSIC_SYSTEM.md) (Future)

### Production
- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md)
- [Production Readiness Audit](docs/PRODUCTION_READINESS_AUDIT.md)

### Platform-Specific
- **Mobile**: See [docs/mobile/](docs/mobile/)
  - [Setup Guide](docs/mobile/SETUP_GUIDE.md)
  - [Icon Setup](docs/mobile/ICON_SETUP.md)
  - [Checklist](docs/mobile/CHECKLIST.md)

- **Backend**: See [docs/backend/](docs/backend/)
  - [Backend Testing](docs/backend/BACKEND_TESTING.md)
  - [Firebase Setup](docs/backend/FIREBASE_SETUP.md)
  - [SMS Integration](docs/backend/SMS_INTEGRATION.md)
  - [Free SMS Options](docs/backend/FREE_SMS_OPTIONS.md)

- **Frontend**: See [docs/web/](docs/web/)
  - [Setup Guide](docs/web/SETUP_GUIDE.md)
  - [Styling Guide](docs/web/STYLING_GUIDE.md)

### Infrastructure
- [Docker Setup Guide](infra/SETUP_GUIDE.md)

## 🎨 Theme & Styling

The project uses a centralized theme system with orange (#FF6B35) as the primary color.

- **Mobile**: `mobile/styles/theme.ts` and `mobile/styles/commonStyles.ts`
- **Web**: `frontend/src/styles/theme.ts` and `frontend/src/styles/commonStyles.ts`

## 🔧 Technology Stack

### Backend
- Spring Boot 3.2.1
- Java 17
- PostgreSQL 15
- Maven

### Frontend (Web)
- Next.js 16.0.7
- React 19
- Material-UI (MUI)
- Redux Toolkit
- TypeScript

### Mobile
- React Native
- Expo ~54.0.27
- Redux Toolkit
- TypeScript

## 📞 Support

For detailed setup instructions, refer to the platform-specific documentation in the `docs/` directory.
