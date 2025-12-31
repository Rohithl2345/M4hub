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

### 🎯 Core Documentation
- **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** - Comprehensive ecosystem overview, architecture, and guides.
- **[Folder Structure](docs/FOLDER_STRUCTURE.md)** - Project layout details.
- [Development Guide](docs/README_DEV.md)
### 🎵 Music System
- [Database Music System](docs/DATABASE_MUSIC_SYSTEM.md) (Future)

### 🚀 Infrastructure
- [Docker Setup Guide](infra/SETUP_GUIDE.md)
- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)

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
