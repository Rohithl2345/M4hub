# M4Hub Ecosystem: Comprehensive Technical Guide
**Version:** 1.2.0 (Consolidated)
**Last Updated:** December 31, 2025

---

## 1. Executive Summary & Philosophy
M4Hub is a **Unified Digital Living Space** integrating Music, Messages, Money, and News. It creates a "Digital Twin" of user preferences across Web and Mobile, adhering to a **"Premium Simplicity"** philosophy: heavy technical lifting at the backend to provide a fluid, high-performance experience at the frontend.

---

## 2. Advanced Technology Stack

### **2.1 Mobile Application (Expo SDK 54)**
*   **Routing**: `expo-router` for file-based, stable navigation.
*   **Animations**: `react-native-reanimated` for 60FPS worklet-based UI physics.
*   **Visuals**: `expo-linear-gradient` and `react-native-svg` for premium high-fidelity graphics.
*   **Storage**: `AsyncStorage` for local token persistence.

### **2.2 Web Portal (Next.js 14+)**
*   **Architecture**: App Router with Scoped CSS Modules.
*   **UI Components**: Scoped CSS combined with Material-UI v7.
*   **Data Visualization**: `recharts` for interactive financial and usage dashboards.
*   **State Management**: Redux Toolkit for global "Source of Truth".

### **2.3 Backend API (Spring Boot 3.2)**
*   **Security**: JJWT for stateless auth, Spring Security with BCrypt for hashing.
*   **Resilience**: Google Guava for Token-Bucket rate limiting.
*   **Stability**: `@Transactional` services for reliable data operations.
*   **Boilerplate**: Lombok for clean, readable code.

---

## 3. Core Systems Implementation

### **3.1 Authentication & Security**
*   **Hashing**: BCrypt (strength 12) with automatic salting.
*   **Tokens**: Dual JWT system (Access: 7 days, Refresh: 30 days).
*   **Rate Limiting**: 5 login attempts / 15 mins; 3 OTP requests / 15 mins.
*   **Soft Deletion**: Users are flagged `is_deleted = true` for a grace window before physical deletion.
*   **Validation**: Matching regex rules on both Frontend (TypeScript) and Backend (Java).

### **3.2 Error Handling & Validation Logic**
*   **Classification**: Centralized `ErrorHandler` classifies errors (NETWORK_ERROR, AUTH_ERROR, RATE_LIMIT, etc.).
*   **Network Monitoring**: Real-time online/offline/slow connection detection.
*   **Attempt Counter**: Smart increments (only for 401 Unauthorized) to avoid penalizing users for server/network issues.
*   **Password Strength**: Scoring (0-4) with real-time visual feedback and requirement lists.

### **3.3 Design System (M4Hub Portal)**
*   **Primary Palette**: Indigo (#6366f1) for Dashboard, Emerald (#10b981) for Music, Blue (#3b82f6) for Messages, Amber (#f59e0b) for Money, Red (#ef4444) for News.
*   **Typography**: 'Inter' font family with specific weights (Regular 400 to Bold 700).
*   **Components**: Standardized layouts for Sidebar (280px), Cards (16px radius), and Buttons (10px radius).

---

## 4. Production Readiness Improvements
*   **Logging**: Custom `logger.ts` redact sensitive data (OTP, phone, emails) automatically.
*   **CORS**: Restricted `AllowedOrigins` configured per environment (Local vs. Production).
*   **Environment Variables**: Strict validation logic on startup; prevents app launch if keys are missing.
*   **Error Boundaries**: React Error Boundaries capture UI crashes and present "Try Again" recovery options.

---

## 5. Recent Implementation History (Dec 2025)
*   **Auth Upgrade**: Migrated from UUID to JWT; implemented Refresh Token rotation.
*   **Analytics System**: Real-time tracking of Web vs Mobile signups and feature usage.
*   **Spotify Removal**: Fully decoupled legacy Spotify dependencies, migrating to internal Music Hub system.
*   **Login Hardening**: Added attempt counters, rate limiting, and network status awareness to all login flows.
*   **SSR Stability**: Fixed "navigator is not defined" issues in Next.js environment for reliable server-side rendering.

---

## 6. Project Resource Summary
*   **Frontend**: Next.js 16+ | ~480MB dev size | Professional Scoped CSS
*   **Mobile**: Expo ~54 | ~650MB dev size | Reanimated & SVG focus
*   **Backend**: Spring Boot 3.2 | ~120MB dev size | PostgreSQL 15 | JJWT

---
**This Technical Guide serves as the primary reference for the M4Hub Ecosystem.**
