# Analytics Testing & Verification Guide

## 🧪 Quick Testing Checklist

### Prerequisites
- [ ] Backend server running on port 8080
- [ ] Web frontend running on port 3000
- [ ] Mobile app running via Expo
- [ ] User authenticated in all platforms

---

## 1️⃣ Backend Testing

### Test Analytics Logging
```bash
# Log some test data
curl -X POST http://localhost:8080/api/analytics/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tabName": "music",
    "durationSeconds": 300
  }'

# Expected Response:
# {"success": true}
```

### Test Usage Endpoint (Web)
```bash
# Get weekly usage
curl -X GET "http://localhost:8080/api/analytics/usage?timeframe=weekly" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# [{"tabName":"music","totalDuration":300}, ...]
```

### Test Hub Analytics (Mobile)
```bash
# Get hub analytics
curl -X GET "http://localhost:8080/api/analytics/hub?timeframe=weekly" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "message": "Analytics retrieved successfully",
#   "data": {
#     "tabAnalytics": [...],
#     "weeklyActivity": [...],
#     "engagementMetrics": {...}
#   }
# }
```

### Test All Timeframes
```bash
# Daily
curl -X GET "http://localhost:8080/api/analytics/hub?timeframe=daily" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Weekly
curl -X GET "http://localhost:8080/api/analytics/hub?timeframe=weekly" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Monthly
curl -X GET "http://localhost:8080/api/analytics/hub?timeframe=monthly" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Yearly
curl -X GET "http://localhost:8080/api/analytics/hub?timeframe=yearly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2️⃣ Web Testing

### Manual Testing Steps

1. **Navigate to Dashboard**
   - [ ] Open http://localhost:3000/dashboard
   - [ ] Scroll to Analytics section
   - [ ] Verify "Hub Analytics" card is visible

2. **Test Timeframe Filters**
   - [ ] Click "Daily" - verify data updates
   - [ ] Click "Weekly" - verify data updates
   - [ ] Click "Monthly" - verify data updates
   - [ ] Click "Yearly" - verify data updates

3. **Test Chart Types**
   - [ ] Select "Bar Chart" - verify bars display
   - [ ] Select "Donut Chart" - verify pie chart displays
   - [ ] Select "Line Graph" - verify line chart displays
   - [ ] Select "Area Chart" - verify area chart displays

4. **Test Refresh**
   - [ ] Click refresh icon
   - [ ] Verify loading indicator appears
   - [ ] Verify data reloads

5. **Test Empty State**
   - [ ] Use a new account with no activity
   - [ ] Verify "No Hub Activity" message displays
   - [ ] Verify empty state design is professional

6. **Test Metrics Display**
   - [ ] Verify "Most Active Hub" shows correct hub
   - [ ] Verify "Total Engagement" shows correct minutes
   - [ ] Verify numbers update when timeframe changes

### Browser Console Testing
```javascript
// Open browser console (F12)

// Check if analytics service is working
const stats = await fetch('/api/analytics/usage?timeframe=weekly', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
}).then(r => r.json());
console.log('Analytics:', stats);
```

---

## 3️⃣ Mobile Testing

### Manual Testing Steps

1. **Open Dashboard Tab**
   - [ ] Launch app
   - [ ] Navigate to Dashboard tab
   - [ ] Scroll to Analytics section

2. **Test Hero Stats**
   - [ ] Verify "Active Time" displays (e.g., "5m")
   - [ ] Verify "Hub Status" shows "LIVE"
   - [ ] Verify stats update on refresh

3. **Test Timeframe Filters**
   - [ ] Tap "Daily" - verify data updates
   - [ ] Tap "Weekly" - verify data updates
   - [ ] Tap "Monthly" - verify data updates

4. **Test Chart Types**
   - [ ] Tap "Vertical" - verify bar chart displays
   - [ ] Tap "Circular" - verify pie chart displays
   - [ ] Tap "Trend" - verify line chart displays

5. **Test Pull-to-Refresh**
   - [ ] Pull down on dashboard
   - [ ] Verify refresh indicator appears
   - [ ] Verify data reloads

6. **Test Empty State**
   - [ ] Use a new account with no activity
   - [ ] Verify "No activity recorded yet" message
   - [ ] Verify icon and styling are correct

7. **Test Footer Metrics**
   - [ ] Verify "Most Active Hub" displays
   - [ ] Verify "Total Engagement" displays
   - [ ] Verify metrics are accurate

### React Native Debugger
```javascript
// In app console

// Check analytics data
import { analyticsService } from '@/services/analytics.service';
import storageService from '@/services/storage.service';

const token = await storageService.getAuthToken();
const analytics = await analyticsService.getHubAnalytics(token, 'weekly');
console.log('Hub Analytics:', analytics);
```

---

## 4️⃣ Integration Testing

### Scenario 1: New User Journey
1. Create new account
2. Verify empty state shows on all platforms
3. Navigate to Music hub for 2 minutes
4. Return to dashboard
5. Verify analytics show Music usage
6. Check both web and mobile

### Scenario 2: Multi-Hub Usage
1. Use Music for 5 minutes
2. Use Messages for 3 minutes
3. Use Money for 2 minutes
4. Return to dashboard
5. Verify all three hubs show in analytics
6. Verify percentages are correct
7. Verify "Most Active Hub" is Music

### Scenario 3: Timeframe Comparison
1. Log activity over multiple days
2. Compare Daily vs Weekly vs Monthly
3. Verify data aggregation is correct
4. Verify charts display appropriate labels

### Scenario 4: Chart Rendering
1. Test each chart type with various data sizes:
   - 1 hub used
   - 2-3 hubs used
   - All hubs used
2. Verify charts render correctly
3. Verify tooltips work
4. Verify legends display

---

## 5️⃣ Error Handling Testing

### Test Null Safety (Mobile)
```javascript
// Simulate null response
// This should NOT crash the app anymore

// Test 1: Null tabAnalytics
const mockData = {
  tabAnalytics: null,
  weeklyActivity: [0, 0, 0],
  engagementMetrics: {...}
};

// Test 2: Empty tabAnalytics
const mockData2 = {
  tabAnalytics: [],
  weeklyActivity: [0, 0, 0],
  engagementMetrics: {...}
};
```

### Test Network Errors
1. Disconnect from internet
2. Try to load analytics
3. Verify error handling is graceful
4. Verify retry mechanism works

### Test Invalid Tokens
1. Use expired token
2. Verify redirect to login
3. Verify error message is clear

---

## 6️⃣ Performance Testing

### Load Testing
```bash
# Use Apache Bench or similar tool
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/analytics/hub?timeframe=weekly
```

### Expected Performance
- [ ] API response < 500ms
- [ ] Chart rendering < 100ms
- [ ] Page load < 2s
- [ ] No memory leaks

---

## 7️⃣ Data Accuracy Testing

### Verify Calculations

1. **Tab Analytics Percentages**
   ```
   Music: 300s (50%)
   Messages: 180s (30%)
   Money: 120s (20%)
   Total: 600s (100%)
   ```

2. **Engagement Score**
   - Variety: 3/12 hubs = 25% → 10/40 points
   - Consistency: 5/7 days = 71% → 21/30 points
   - Time: 1h/day average = 30/30 points
   - **Total: 61%**

3. **Activity Trend**
   - Daily: Last 7 days should show correct daily totals
   - Weekly: Should aggregate correctly
   - Monthly: Should show 4 weeks
   - Yearly: Should show 12 months

---

## 8️⃣ Visual Regression Testing

### Web
- [ ] Check all chart types render correctly
- [ ] Verify colors match design system
- [ ] Check responsive behavior (mobile/tablet/desktop)
- [ ] Verify dark mode (if implemented)

### Mobile
- [ ] Check on iOS simulator
- [ ] Check on Android emulator
- [ ] Verify different screen sizes
- [ ] Check landscape orientation

---

## 🐛 Known Issues & Fixes

### Issue 1: tabAnalytics null crash ✅ FIXED
**Status**: Fixed in mobile app
**Fix**: Added null checks before reduce operations

### Issue 2: calculateTabAnalytics not called ✅ FIXED
**Status**: Fixed in backend
**Fix**: Added call in getHubAnalytics method

---

## ✅ Sign-off Checklist

Before marking as complete:

### Backend
- [ ] All endpoints return correct data
- [ ] All timeframes work correctly
- [ ] Error handling is robust
- [ ] Logging is in place

### Web
- [ ] All charts render correctly
- [ ] All filters work
- [ ] Empty states display properly
- [ ] Performance is acceptable

### Mobile
- [ ] All charts render correctly
- [ ] All filters work
- [ ] Null safety implemented
- [ ] Pull-to-refresh works

### Integration
- [ ] Data consistency across platforms
- [ ] Real-time updates work
- [ ] Authentication flow works
- [ ] Error handling is consistent

---

## 📊 Test Data Generator

Use this to populate test data:

```javascript
// Run in browser console on web app
async function generateTestData() {
  const hubs = ['music', 'messages', 'money', 'news'];
  const token = localStorage.getItem('authToken');
  
  for (let day = 0; day < 7; day++) {
    for (const hub of hubs) {
      const duration = Math.floor(Math.random() * 600) + 60; // 1-10 minutes
      await fetch('/api/analytics/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tabName: hub,
          durationSeconds: duration
        })
      });
      console.log(`Logged ${duration}s for ${hub}`);
      await new Promise(r => setTimeout(r, 100)); // Small delay
    }
  }
  console.log('Test data generated!');
}

generateTestData();
```

---

**Last Updated**: December 30, 2025
**Status**: Ready for Testing
