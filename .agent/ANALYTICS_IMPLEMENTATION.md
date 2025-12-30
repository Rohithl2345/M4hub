# M4Hub Analytics Flow - Complete Implementation Guide

## Overview
This document outlines the complete analytics implementation across Backend (Spring Boot), Web (Next.js), and Mobile (React Native/Expo) with support for Daily, Weekly, Monthly, and Yearly timeframes.

---

## 🎯 Architecture Overview

### Data Flow
```
User Activity → Frontend/Mobile Tracking → Backend API → Database
                                                ↓
                                         Analytics Service
                                                ↓
                                    Aggregated Analytics ← Frontend/Mobile Display
```

---

## 📊 Backend Implementation (Spring Boot)

### 1. **AnalyticsController** (`/api/analytics`)

#### Endpoints:
- **POST `/log`** - Log tab usage
  - Request: `{ tabName: string, durationSeconds: number }`
  - Response: `{ success: boolean }`

- **GET `/usage?timeframe={daily|weekly|monthly|yearly}`** - Get basic usage stats (Web)
  - Returns: `TabUsageStats[]`

- **GET `/hub?timeframe={daily|weekly|monthly|yearly}`** - Get comprehensive analytics (Mobile)
  - Returns: `HubAnalyticsDto`

### 2. **AnalyticsService**

#### Key Methods:

**`getHubAnalytics(User user, String timeframe)`**
- Calculates comprehensive analytics for mobile dashboard
- Returns:
  - `tabAnalytics` - Usage breakdown by feature
  - `weeklyActivity` - Time-series activity data
  - `engagementMetrics` - User engagement statistics

**`calculateTabAnalytics(User user, Instant since)`** ✅ **NOW USED**
- Aggregates usage by tab/feature
- Calculates percentages, sessions, and total time
- Returns color-coded analytics for each hub

**`calculateActivityTrend(User user, String timeframe)`**
- Generates time-series data based on timeframe:
  - **Daily/Weekly**: Last 7 days (daily breakdown)
  - **Monthly**: Last 4 weeks (weekly breakdown)
  - **Yearly**: Last 12 months (monthly breakdown)

**`calculateEngagementMetrics(User user, Instant currentPeriod, Instant previousPeriod, int days)`**
- Daily active time with period-over-period comparison
- Features used tracking
- Engagement score (0-100%) based on:
  - Feature variety (40%)
  - Consistency (30%)
  - Total engagement time (30%)

### 3. **Timeframe Logic**

```java
switch (timeframe) {
    case "daily":
        since = Instant.now().minus(1, ChronoUnit.DAYS);
        previousSince = Instant.now().minus(2, ChronoUnit.DAYS);
        daysInPeriod = 1;
        break;
    case "weekly":
        since = Instant.now().minus(7, ChronoUnit.DAYS);
        previousSince = Instant.now().minus(14, ChronoUnit.DAYS);
        daysInPeriod = 7;
        break;
    case "monthly":
        since = Instant.now().minus(30, ChronoUnit.DAYS);
        previousSince = Instant.now().minus(60, ChronoUnit.DAYS);
        daysInPeriod = 30;
        break;
    case "yearly":
        since = Instant.now().minus(365, ChronoUnit.DAYS);
        previousSince = Instant.now().minus(730, ChronoUnit.DAYS);
        daysInPeriod = 365;
        break;
}
```

### 4. **Data Models**

**HubAnalyticsDto**
```java
{
    tabAnalytics: TabAnalytics[],
    weeklyActivity: Integer[],
    engagementMetrics: EngagementMetrics
}
```

**TabAnalytics**
```java
{
    name: String,
    percentage: int,
    color: String,
    icon: String,
    sessions: int,
    totalSeconds: long
}
```

**EngagementMetrics**
```java
{
    dailyActiveTime: String,      // e.g., "2.5h" or "45m"
    featuresUsed: String,          // e.g., "5/12"
    engagementScore: String,       // e.g., "75%"
    dailyChange: String,           // e.g., "+15%"
    featuresChange: String,        // e.g., "+2"
    scoreChange: String            // e.g., "+5%"
}
```

---

## 🌐 Web Implementation (Next.js)

### 1. **AnalyticsDashboard Component**

**Location**: `frontend/src/components/AnalyticsDashboard.tsx`

**Features**:
- ✅ Timeframe selector: Daily, Weekly, Monthly, Yearly
- ✅ Chart type selector: Bar, Pie, Line, Area
- ✅ Real-time data refresh
- ✅ Responsive design with Recharts
- ✅ Empty state handling

**Usage**:
```tsx
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

<AnalyticsDashboard />
```

### 2. **Analytics Service**

**Location**: `frontend/src/services/analytics.service.ts`

**Methods**:
```typescript
// Log tab usage
await analyticsService.logUsage(tabName, durationSeconds);

// Get usage statistics
const stats = await analyticsService.getUsage(timeframe);
// Returns: TabUsageStats[]
```

### 3. **Chart Visualizations**

- **Bar Chart**: Vertical bars showing time per hub
- **Donut Chart**: Percentage distribution with color coding
- **Line Graph**: Trend analysis over time
- **Area Chart**: Filled area showing engagement patterns

### 4. **Timeframe Filters**

```tsx
<ToggleButtonGroup value={timeframe} onChange={setTimeframe}>
    <ToggleButton value="daily">Daily</ToggleButton>
    <ToggleButton value="weekly">Weekly</ToggleButton>
    <ToggleButton value="monthly">Monthly</ToggleButton>
    <ToggleButton value="yearly">Yearly</ToggleButton>
</ToggleButtonGroup>
```

---

## 📱 Mobile Implementation (React Native/Expo)

### 1. **Dashboard Screen**

**Location**: `mobile/app/(tabs)/index.tsx`

**Features**:
- ✅ Premium hero section with real-time stats
- ✅ Timeframe selector: Daily, Weekly, Monthly
- ✅ Chart type selector: Vertical (Bar), Circular (Pie), Trend (Line)
- ✅ Null-safe analytics rendering ✅ **FIXED**
- ✅ Pull-to-refresh support

**Key Fixes Applied**:
```tsx
// Line 272: Active Time Display - Now null-safe
{analyticsData && analyticsData.tabAnalytics 
  ? Math.round(analyticsData.tabAnalytics.reduce(...)) 
  : 0}m

// Line 332: Analytics Guard - Now checks for null
!analyticsData || !analyticsData.tabAnalytics || analyticsData.tabAnalytics.length === 0
```

### 2. **Analytics Service**

**Location**: `mobile/services/analytics.service.ts`

**Methods**:
```typescript
// Get hub analytics
const analytics = await analyticsService.getHubAnalytics(token, timeframe);
// Returns: HubAnalytics | null

// Track tab usage
await analyticsService.trackTabUsage(token, tabName, durationSeconds);
```

### 3. **Chart Library**

Uses `react-native-chart-kit` for native performance:
- BarChart
- PieChart
- LineChart

### 4. **Responsive Design**

```tsx
const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    barPercentage: 0.7,
};
```

---

## 🔧 Implementation Status

### ✅ Completed Features

#### Backend
- [x] Analytics controller with all endpoints
- [x] AnalyticsService with comprehensive calculations
- [x] `calculateTabAnalytics` method now properly invoked
- [x] Timeframe support: daily, weekly, monthly, yearly
- [x] Engagement metrics calculation
- [x] Activity trend analysis

#### Web
- [x] AnalyticsDashboard component
- [x] Timeframe filters (4 options)
- [x] Chart type selection (4 types)
- [x] Real-time data refresh
- [x] Empty state handling
- [x] Responsive design

#### Mobile
- [x] Dashboard analytics integration
- [x] Timeframe filters (3 options)
- [x] Chart type selection (3 types)
- [x] Null-safety fixes for tabAnalytics
- [x] Pull-to-refresh
- [x] Premium UI with gradients

---

## 🐛 Recent Fixes

### Issue 1: `calculateTabAnalytics` Never Used
**Problem**: Method was defined but never called, causing `tabAnalytics` to be null

**Solution**: Added call in `getHubAnalytics`:
```java
analytics.setTabAnalytics(calculateTabAnalytics(user, since));
```

### Issue 2: Mobile Crash - "Cannot read property 'reduce' of null"
**Problem**: Frontend tried to reduce null array when backend returned `tabAnalytics: null`

**Solution**: Added null checks:
```tsx
// Before
analyticsData ? analyticsData.tabAnalytics.reduce(...) : 0

// After
analyticsData && analyticsData.tabAnalytics ? analyticsData.tabAnalytics.reduce(...) : 0
```

---

## 🚀 Usage Guide

### For Users

1. **View Analytics**:
   - Web: Navigate to Dashboard → Analytics section
   - Mobile: Open Dashboard tab → Scroll to Analytics

2. **Change Timeframe**:
   - Click/tap the timeframe buttons (Daily/Weekly/Monthly/Yearly)
   - Data automatically refreshes

3. **Change Chart Type**:
   - Select from dropdown (Web) or buttons (Mobile)
   - Choose visualization that best suits your needs

4. **Refresh Data**:
   - Web: Click refresh icon
   - Mobile: Pull down to refresh

### For Developers

1. **Track Usage**:
```typescript
// Web
await analyticsService.logUsage('music', 120); // 120 seconds

// Mobile
await analyticsService.trackTabUsage(token, 'music', 120);
```

2. **Fetch Analytics**:
```typescript
// Web
const stats = await analyticsService.getUsage('weekly');

// Mobile
const analytics = await analyticsService.getHubAnalytics(token, 'weekly');
```

---

## 📈 Metrics Explained

### Tab Analytics
- **Name**: Feature/Hub name (Music, Messages, Money, News)
- **Percentage**: Share of total usage time
- **Sessions**: Number of times accessed
- **Total Seconds**: Cumulative time spent

### Engagement Metrics
- **Daily Active Time**: Average time per day in the period
- **Features Used**: Number of hubs used / Total available
- **Engagement Score**: Composite score (0-100%) based on variety, consistency, and time
- **Changes**: Period-over-period comparison (e.g., +15%)

### Activity Trend
- **Daily**: Last 7 days
- **Weekly**: Last 7 days
- **Monthly**: Last 4 weeks
- **Yearly**: Last 12 months

---

## 🔄 Next Steps (Optional Enhancements)

1. **Advanced Filters**:
   - Date range picker
   - Specific hub filtering
   - Export to CSV/PDF

2. **Real-time Updates**:
   - WebSocket integration
   - Live activity tracking

3. **Comparative Analytics**:
   - Compare with other users (anonymized)
   - Team/organization analytics

4. **Predictive Insights**:
   - Usage pattern predictions
   - Recommendations based on behavior

---

## 🎨 Design Consistency

Both web and mobile implementations follow M4Hub's design system:
- **Colors**: Purple (#7c3aed), Blue (#3b82f6), Green (#10b981), Orange (#f59e0b)
- **Gradients**: Smooth transitions with glassmorphism
- **Typography**: Bold headers, clean body text
- **Spacing**: Consistent padding and margins
- **Animations**: Subtle hover effects and transitions

---

## 📝 API Reference

### POST /api/analytics/log
```json
Request:
{
  "tabName": "music",
  "durationSeconds": 120
}

Response:
{
  "success": true
}
```

### GET /api/analytics/usage?timeframe=weekly
```json
Response:
[
  {
    "tabName": "music",
    "totalDuration": 3600
  },
  ...
]
```

### GET /api/analytics/hub?timeframe=weekly
```json
Response:
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "tabAnalytics": [...],
    "weeklyActivity": [0, 120, 300, ...],
    "engagementMetrics": {...}
  }
}
```

---

## ✅ Verification Checklist

- [x] Backend endpoints responding correctly
- [x] Web dashboard displaying analytics
- [x] Mobile dashboard displaying analytics
- [x] All timeframes working (daily, weekly, monthly, yearly)
- [x] All chart types rendering properly
- [x] Null safety implemented
- [x] Error handling in place
- [x] Loading states implemented
- [x] Empty states designed
- [x] Responsive on all screen sizes

---

**Last Updated**: December 30, 2025
**Status**: ✅ **COMPLETE AND PRODUCTION READY**
