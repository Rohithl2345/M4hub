# Deployment Guide - M4hub

This guide provides step-by-step instructions for deploying the M4hub application using free-tier cloud providers.

## 1. Database Setup (Neon.tech)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project named `m4hub`.
3. Copy the **Connection String** (it should look like `postgresql://user:password@hostname/dbname`).
4. **Important**: You will need to extract the Host, Database Name, Username, and Password for the Backend setup.

## 2. Backend Deployment (Render.com)
1. Sign up at [Render.com](https://render.com/).
2. Create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Environment**: `Docker`
   - **Region**: Choose the one closest to you.
5. Add the following **Environment Variables**:
   - `SPRING_DATASOURCE_URL`: **Important**: Neon gives you `postgres://...`. You must change it to start with `jdbc:postgresql://` and remove the user/password parts. 
     - Example: `jdbc:postgresql://ep-cool-frog-123.aws.neon.tech/neondb?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: Your Neon username (e.g., `alex`).
   - `SPRING_DATASOURCE_PASSWORD`: Your Neon password.
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `SERVER_PORT`: `8080`
   - `SMS_ENABLED`: `false` (until you set up Twilio).
6. Click **Deploy Web Service**.

## 3. Web Frontend Deployment (Vercel.com)
1. Sign up at [Vercel.com](https://vercel.com/).
2. Click **Add New Project** and import your GitHub repository.
3. Vercel should automatically detect the `frontend` folder. If not, set the **Root Directory** to `frontend`.
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: The URL of your Render backend (e.g., `https://m4hub-backend.onrender.com`).
5. Click **Deploy**.

## 4. Mobile App (Expo)
For the mobile app, you can continue using Expo Go for development. For production:
1. Update `API_URL` in `mobile/constants/index.ts` to point to your Render backend URL.
2. Run `npx expo build:android` or `npx expo build:ios` to generate standalone binaries (Requires Expo Application Services - EAS).

## Summary Table
| Component | Provider | Role | Cost |
| :--- | :--- | :--- | :--- |
| **Next.js App** | Vercel | Frontend | Free |
| **Spring Boot** | Render | Backend API | Free (Sleeps on inactivity) |
| **PostgreSQL** | Neon | Database | Free |
| **Assets/Images** | Local/S3 | Storage | Free (up to limit) |

---
**Note**: The free tier on Render "sleeps" after 15 minutes. To keep it awake, you can use a free monitoring service like [UptimeRobot](https://uptimerobot.com/) to ping your backend URL every 10 minutes.
