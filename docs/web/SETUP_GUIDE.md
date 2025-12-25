# Web App Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (port 8080)
- PostgreSQL database

## Installation

### 1. Navigate to Frontend Directory

```powershell
cd frontend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Environment Configuration

Create environment files:

**`.env.dev`** (Development):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**`.env.prod`** (Production):
```env
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

## Running the Application

### Development Mode

```powershell
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```powershell
# Build
npm run build

# Start production server
npm start
```

## Quick Start Script

Use the root-level script to start the entire stack:

```powershell
# From project root
.\start-dev.ps1
```

This starts:
- PostgreSQL database (Docker)
- Backend API (port 8080)
- Frontend web app (port 3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── profile/      # Profile page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   └── layout/       # Layout components
│   ├── store/            # Redux store
│   │   └── slices/       # Redux slices
│   └── styles/           # Styling
│       ├── theme.ts      # Theme tokens
│       └── commonStyles.ts
├── public/               # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features

### Authentication
- Phone/OTP login
- Email/Password login
- JWT token management
- Protected routes

### Dashboard
- User profile display
- Feature cards (Music, Messages, Money, News)
- Orange gradient sidebar
- Responsive layout

### Profile Management
- View profile details
- Edit email address
- Profile picture upload (coming soon)
- Logout functionality

## Technology Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **React**: 19.x
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Styling**: CSS Modules + MUI sx prop
- **HTTP Client**: Fetch API
- **TypeScript**: 5.x

## Development Workflow

### 1. Start Backend First

```powershell
# From project root
cd backend
mvn spring-boot:run
```

### 2. Start Frontend

```powershell
cd frontend
npm run dev
```

### 3. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/swagger-ui.html

## Common Issues

### Port Already in Use

```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### API Connection Issues

Check:
1. Backend is running on port 8080
2. `.env.dev` has correct API URL
3. CORS is enabled in backend
4. Network/firewall not blocking requests

### Build Errors

```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force .next
npm install
npm run build
```

## Styling System

The web app uses a centralized theme system. See [STYLING_GUIDE.md](./STYLING_GUIDE.md) for details.

### Quick Reference

```tsx
import { theme } from '@/styles/theme';
import { commonStyles } from '@/styles/commonStyles';

// Using theme
<Box sx={{ backgroundColor: theme.colors.primary }}>

// Using common styles
<div style={commonStyles.card}>
```

## Redux Store

### Store Structure

```typescript
store/
├── store.ts              # Store configuration
├── hooks.ts              # Typed hooks
└── slices/
    └── authSlice.ts      # Authentication state
```

### Usage

```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, logout } from '@/store/slices/authSlice';

const user = useAppSelector(state => state.auth.user);
const dispatch = useAppDispatch();
```

## API Integration

### Base Configuration

Located in `src/app/auth/` pages.

### Making API Calls

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Docker

```bash
docker build -t m4hub-frontend .
docker run -p 3000:3000 m4hub-frontend
```

### Manual Deployment

```powershell
npm run build
# Upload .next/ and package.json to server
npm start
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MUI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- Project Documentation: See [docs/](../../)
