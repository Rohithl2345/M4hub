# State Management & Production Deployment Guide

## ✅ Errors Fixed
All TypeScript compilation errors have been resolved:
- Fixed `log` and `error` imports to use `config.log` and `config.error`
- Updated `auth.service.ts` - All logging now uses config object
- Updated `storage.service.ts` - All logging now uses config object

---

## 1. State Management Strategy

### Current Implementation: ❌ No Redux Yet

We are **NOT** currently using Redux for state management. Here's what we're using:

### Mobile App (React Native/Expo)
- **AsyncStorage**: For persistent data (auth tokens, user data)
- **React Hooks**: useState, useEffect for local component state
- **React Context**: Not implemented yet

### Web App (Next.js)
- **localStorage**: For persistent data (auth tokens, user data)
- **React Hooks**: useState, useEffect for local component state
- **Server Components**: Next.js App Router (not using state management)

### ⚠️ Recommendation: Add Redux/Zustand for Production

For production-grade state management, you should add one of these:

#### Option 1: Redux Toolkit (Recommended for large apps)
```bash
# Mobile
cd mobile
npm install @reduxjs/toolkit react-redux

# Web
cd frontend
npm install @reduxjs/toolkit react-redux
```

**Benefits:**
- Industry standard
- DevTools support
- Time-travel debugging
- Predictable state updates
- Great for complex apps

#### Option 2: Zustand (Recommended for simpler apps)
```bash
# Mobile
cd mobile
npm install zustand

# Web
cd frontend
npm install zustand
```

**Benefits:**
- Simpler than Redux
- Less boilerplate
- Smaller bundle size
- React hooks-based
- Perfect for M4Hub current size

### 📋 What Needs State Management?

1. **Authentication State**
   - Currently: AsyncStorage/localStorage + local state
   - Should be: Global state with Redux/Zustand
   - Reason: Auth status needed across all screens

2. **User Profile**
   - Currently: AsyncStorage/localStorage
   - Should be: Global state
   - Reason: User data accessed in multiple components

3. **Feature Modules** (Music, Message, Money, News)
   - Will need: Global state management
   - Reason: Complex data, real-time updates

### 🎯 Recommended Implementation Plan

**Phase 1: Add Zustand (Simple & Quick)**
```typescript
// mobile/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: AsyncStorage,
    }
  )
);
```

**Usage:**
```typescript
// In any component
import { useAuthStore } from '@/store/auth.store';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Access auth state anywhere!
}
```

---

## 2. Firebase Token Generation Status

### Current Status: ⚠️ NOT IMPLEMENTED YET

Firebase token generation is **configured but not active**. Here's the current state:

### What We Have:
✅ Firebase service implementation (`FirebaseSmsService.java`)
✅ Configuration in `application-prod.yml`
✅ Phone number validation (E.164 format)
✅ Dev mode OTP working (console logging)

### What We DON'T Have:
❌ Firebase project created
❌ Service account JSON key downloaded
❌ Firebase credentials in project
❌ Firebase Phone Auth enabled
❌ Production OTP sending active

### 🔥 How to Enable Firebase Token Generation

#### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it "M4Hub" or similar
4. Enable Google Analytics (optional)
5. Wait for project creation

#### Step 2: Enable Phone Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Click **Phone** provider
5. Click **Enable**
6. Save

#### Step 3: Get Service Account Key
1. Go to **Project Settings** (gear icon)
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Download JSON file
5. Rename to `firebase-service-account.json`
6. Place at: `backend/src/main/resources/firebase-service-account.json`

#### Step 4: Update Configuration
```yaml
# backend/src/main/resources/application-prod.yml
sms:
  provider: firebase  # Change from 'console' to 'firebase'

firebase:
  credentials-path: classpath:firebase-service-account.json
  project-id: m4hub-12345  # Your actual Firebase project ID
```

#### Step 5: Add to .gitignore
```bash
# Add this line to .gitignore
backend/src/main/resources/firebase-service-account.json
```

#### Step 6: Test Firebase OTP
```bash
# Start backend with prod profile
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Test OTP sending
curl -X POST http://localhost:8080/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210"}'
```

### Firebase vs Current Console Mode

| Feature | Console Mode (Dev) | Firebase Mode (Prod) |
|---------|-------------------|---------------------|
| OTP Delivery | Logs to console | SMS to actual phone |
| Cost | Free | 10,000 free/month |
| Setup Time | 0 minutes | 10 minutes |
| Use Case | Development | Production |
| Real Phone Testing | ❌ No | ✅ Yes |

### 💰 Firebase Pricing
- **Free Tier**: 10,000 phone verifications/month
- **After Free Tier**: ~$0.01 per verification
- **Perfect for**: Startups and MVPs

---

## 3. Production Build & Deployment

### Current Status: ⚠️ NOT READY FOR PRODUCTION

You need to complete these steps before deploying to production:

### Pre-Production Checklist

#### ✅ Completed
- [x] Backend API implemented
- [x] Database schema created
- [x] Mobile UI implemented
- [x] Web UI implemented
- [x] Authentication flow working
- [x] Dev/Prod config separation
- [x] Phone number validation
- [x] Error handling

#### ❌ Pending
- [ ] Firebase setup (for production OTP)
- [ ] Environment variables configured
- [ ] SSL/HTTPS certificates
- [ ] Domain name registered
- [ ] Database backup strategy
- [ ] Monitoring and logging
- [ ] Error tracking (Sentry)
- [ ] Performance testing
- [ ] Security audit
- [ ] CI/CD pipeline

---

## 4. Production Deployment Options

### Option A: AWS (Recommended)

#### Backend (Spring Boot)
**AWS Elastic Beanstalk**
```bash
# Install AWS CLI
# Configure credentials
aws configure

# Deploy backend
cd backend
mvn clean package
eb init -p java-17 m4hub-backend
eb create m4hub-backend-prod
eb deploy
```

**Or AWS EC2**
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance

# Install Java 17
sudo yum install java-17-amazon-corretto

# Run backend
java -jar backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

#### Database
**AWS RDS (PostgreSQL)**
- Managed PostgreSQL
- Automatic backups
- High availability
- Scalable

#### Frontend (Next.js)
**AWS Amplify or Vercel**
```bash
# Using Vercel (easiest)
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

#### Mobile (React Native)
**Expo EAS Build**
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

### Option B: Azure (Alternative)

#### Backend
- Azure App Service (Java 17)
- Azure Database for PostgreSQL

#### Frontend
- Azure Static Web Apps
- Azure CDN

#### Mobile
- Same as Option A (Expo EAS)

---

### Option C: Docker + Any Cloud Provider

#### Build Docker Images
```bash
# Backend
cd backend
docker build -t m4hub-backend:latest .

# Frontend
cd frontend
docker build -t m4hub-frontend:latest .
```

#### Deploy with Docker Compose
```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 5. Production Deployment Steps

### Step 1: Environment Configuration

#### Backend (.env or application-prod.yml)
```yaml
server:
  port: 8080
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}

spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

sms:
  provider: firebase

firebase:
  credentials-path: ${FIREBASE_CREDENTIALS_PATH}
  project-id: ${FIREBASE_PROJECT_ID}

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000
```

#### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.m4hub.com
NEXT_PUBLIC_ENVIRONMENT=production
```

#### Mobile (.env.prod)
```env
API_URL=https://api.m4hub.com
ENVIRONMENT=production
ENABLE_LOGGING=false
```

### Step 2: Build Applications

#### Backend
```bash
cd backend
mvn clean package -DskipTests
# Creates: target/backend-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend
npm run build
# Creates: .next/ folder
```

#### Mobile
```bash
cd mobile
eas build --platform all --profile production
```

### Step 3: Deploy

#### Backend Deployment
```bash
# Using systemd service (Linux)
sudo systemctl start m4hub-backend
sudo systemctl enable m4hub-backend

# Or using Docker
docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-pass \
  m4hub-backend:latest
```

#### Frontend Deployment
```bash
# Using Vercel
vercel --prod

# Or using PM2
npm install -g pm2
pm2 start npm --name "m4hub-frontend" -- start
pm2 save
pm2 startup
```

### Step 4: Mobile App Submission

#### Android (Google Play Store)
```bash
eas build --platform android --profile production
eas submit --platform android
```

#### iOS (Apple App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 6. Production Infrastructure Requirements

### Minimum Requirements
- **Backend**: 2GB RAM, 2 vCPUs
- **Database**: PostgreSQL 15, 20GB storage
- **Frontend**: CDN + Static hosting
- **SSL Certificate**: Let's Encrypt (free) or paid

### Recommended Requirements
- **Backend**: 4GB RAM, 4 vCPUs (for scaling)
- **Database**: 50GB storage, automated backups
- **Load Balancer**: For high availability
- **CDN**: CloudFlare or AWS CloudFront
- **Monitoring**: DataDog, New Relic, or AWS CloudWatch

---

## 7. Cost Estimation (Monthly)

### AWS Deployment
- **EC2 t3.medium**: $30-40/month
- **RDS PostgreSQL**: $50-80/month
- **S3 Storage**: $5-10/month
- **CloudFront CDN**: $10-20/month
- **Domain + SSL**: $15/year
- **Total**: ~$100-150/month

### Vercel + Supabase (Simpler)
- **Vercel Pro**: $20/month (frontend)
- **Supabase Pro**: $25/month (database)
- **Expo EAS**: Free tier (build & hosting)
- **Firebase**: Free tier (10k SMS/month)
- **Total**: ~$45/month

---

## 8. Next Steps Summary

### Immediate Actions (Before Production)
1. ✅ **Fix errors** - DONE!
2. ⏳ **Add state management** - Zustand or Redux
3. ⏳ **Setup Firebase** - For production OTP
4. ⏳ **Configure SSL** - HTTPS certificates
5. ⏳ **Test end-to-end** - All features working
6. ⏳ **Add monitoring** - Error tracking
7. ⏳ **Build Docker images** - Containerization
8. ⏳ **Deploy to staging** - Test environment
9. ⏳ **Security audit** - Penetration testing
10. ⏳ **Deploy to production** - Go live!

### Questions Answered

| Question | Answer |
|----------|--------|
| Are we using Redux? | ❌ Not yet - recommended to add |
| Firebase tokens working? | ❌ Setup required (10 min) |
| Ready for production? | ❌ Need Firebase + SSL + testing |
| When can we deploy? | After completing checklist above |

---

## 🚀 Quick Start: Production Deployment

If you want to deploy **RIGHT NOW** (with console OTP):

```bash
# 1. Build backend
cd backend
mvn clean package -DskipTests

# 2. Deploy to Heroku (easiest)
heroku create m4hub-api
heroku addons:create heroku-postgresql:mini
git push heroku main

# 3. Deploy frontend to Vercel
cd frontend
vercel --prod

# 4. Build mobile apps
cd mobile
eas build --platform all
```

**But this is NOT production-ready** - you still need:
- Firebase for real OTP
- SSL certificates
- Proper monitoring
- State management
- Error tracking

Let me know which part you want to tackle first!
