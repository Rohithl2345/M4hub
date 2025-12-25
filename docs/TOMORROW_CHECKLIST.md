# M4Hub - Tomorrow's Action Checklist ✅

**Date**: December 12, 2025

---

## 🌅 Morning Setup (9:00 AM - 10:00 AM)

### API Keys & Accounts Setup
- [ ] **NewsAPI.org**
  - Register at: https://newsapi.org/register
  - Get API key
  - Add to `backend/src/main/resources/application.yml`
  ```yaml
  news:
    api:
      key: YOUR_NEWS_API_KEY
  ```

- [ ] **SendGrid** (Email OTP)
  - Sign up at: https://signup.sendgrid.com/
  - Verify email
  - Get API key from Settings > API Keys
  - Add to application.yml
  ```yaml
  sendgrid:
    api:
      key: YOUR_SENDGRID_KEY
    from:
      email: noreply@m4hub.com
  ```

- [ ] **Razorpay Test Account** (for future payment testing)
  - Register at: https://razorpay.com/
  - Get test API keys
  - Save for later use

---

## 🔧 Phase 1: Backend - Email & Username (10:00 AM - 12:00 PM)

### Task 1.1: Add Username to User Model
**File**: `backend/src/main/java/com/m4hub/model/User.java`

- [ ] Add username field:
```java
@Column(unique = true, nullable = false, length = 20)
private String username;

@Pattern(regexp = "^[a-zA-Z0-9_]{3,20}$")
private String usernamePattern;
```

- [ ] Run database migration:
```sql
ALTER TABLE users ADD COLUMN username VARCHAR(20) UNIQUE;
CREATE INDEX idx_users_username ON users(LOWER(username));
```

### Task 1.2: Create Username Validation Endpoint
**File**: `backend/src/main/java/com/m4hub/controller/UserController.java`

- [ ] Create new endpoint:
```java
@GetMapping("/check-username")
public ResponseEntity<Boolean> checkUsernameAvailable(
    @RequestParam String username
) {
    boolean available = userService.isUsernameAvailable(username);
    return ResponseEntity.ok(available);
}
```

### Task 1.3: Email Service Setup
**File**: `backend/src/main/java/com/m4hub/service/EmailService.java` (create new)

- [ ] Create EmailService class
- [ ] Implement sendOtp(email, otp) method
- [ ] Create email template for OTP
- [ ] Test email sending

### Task 1.4: Registration with Email OTP
**File**: `backend/src/main/java/com/m4hub/controller/AuthController.java`

- [ ] Add `/api/auth/register-email` endpoint
- [ ] Implement email OTP sending
- [ ] Add `/api/auth/verify-email-otp` endpoint
- [ ] Update profile completion to require username

---

## 📱 Phase 2: Mobile - Profile & Registration (12:00 PM - 2:00 PM)

### Task 2.1: Update Profile Setup Screen
**File**: `mobile/app/profile-setup.tsx`

- [ ] Add username input field (first field, required)
- [ ] Add real-time username availability check
- [ ] Add username validation (3-20 chars, alphanumeric + underscore)
- [ ] Show "✓ Available" or "✗ Taken" indicator
- [ ] Make username mandatory before submit

**UI Changes**:
```tsx
const [username, setUsername] = useState('');
const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
const [checkingUsername, setCheckingUsername] = useState(false);

// Add debounced username check
useEffect(() => {
    const timer = setTimeout(() => {
        if (username.length >= 3) {
            checkUsernameAvailability(username);
        }
    }, 500);
    return () => clearTimeout(timer);
}, [username]);
```

### Task 2.2: Create Email Registration Screen
**File**: `mobile/app/auth/register-email.tsx` (create new)

- [ ] Email input field
- [ ] Password input field (with visibility toggle)
- [ ] Confirm password field
- [ ] Password strength indicator
- [ ] Terms & conditions checkbox
- [ ] Register button
- [ ] Navigate to email OTP verification

### Task 2.3: Email OTP Verification Screen
**File**: `mobile/app/auth/verify-email-otp.tsx` (create new)

- [ ] 6-digit OTP input
- [ ] Resend OTP button (60s countdown)
- [ ] Verify button
- [ ] Navigate to profile setup after verification

---

## 📰 Phase 3: News API Integration (2:00 PM - 4:00 PM)

### Task 3.1: Backend News Service
**File**: `backend/src/main/java/com/m4hub/service/NewsService.java` (create new)

- [ ] Create NewsService class
- [ ] Implement getTopHeadlines(category, country)
- [ ] Implement searchNews(query)
- [ ] Add Redis caching (15 min TTL)
- [ ] Error handling for API failures

**File**: `backend/src/main/java/com/m4hub/model/NewsArticle.java` (create new)

- [ ] Create NewsArticle DTO
- [ ] Fields: id, title, description, author, source, imageUrl, publishedAt, url

**File**: `backend/src/main/java/com/m4hub/controller/NewsController.java` (create new)

- [ ] GET `/api/news/headlines?category=general&country=us`
- [ ] GET `/api/news/search?query=technology`

### Task 3.2: Mobile News Service
**File**: `mobile/services/news.service.ts` (create new)

- [ ] Create NewsService class
- [ ] Implement getTopHeadlines()
- [ ] Implement searchNews()
- [ ] Add TypeScript interfaces

### Task 3.3: Update News Screen
**File**: `mobile/app/news.tsx` (update)

- [ ] Replace mock data with API calls
- [ ] Add category tabs (horizontal scroll)
- [ ] Add pull-to-refresh
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add search bar

**Categories to implement**:
```tsx
const categories = [
    { id: 'general', name: 'General', icon: '🌍' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'technology', name: 'Tech', icon: '💻' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'science', name: 'Science', icon: '🔬' }
];
```

---

## 🧪 Phase 4: Testing (4:00 PM - 5:30 PM)

### End-to-End Testing Flow

#### Test 1: Email Registration Flow
- [ ] Open mobile app
- [ ] Navigate to "Register with Email"
- [ ] Enter email: test@example.com
- [ ] Enter password (8+ chars, strong)
- [ ] Submit registration
- [ ] Verify OTP email received
- [ ] Enter OTP in app
- [ ] Navigate to profile setup

#### Test 2: Username Setup
- [ ] Type username: "testuser123"
- [ ] Verify real-time availability check
- [ ] Try taken username → Show error
- [ ] Enter unique username → Show "✓ Available"
- [ ] Fill other profile fields
- [ ] Submit profile
- [ ] Verify username saved in database

#### Test 3: News Integration
- [ ] Open News tab
- [ ] Verify articles load from API
- [ ] Switch categories → Verify new articles load
- [ ] Pull to refresh → Verify refresh works
- [ ] Search for "technology" → Verify search results
- [ ] Click article → Open in browser/webview

#### Test 4: Phone OTP Flow (existing)
- [ ] Test phone number login
- [ ] Verify OTP SMS received
- [ ] Enter OTP → Navigate to profile
- [ ] Verify username is required

---

## 🐛 Known Issues to Fix

### Backend
- [ ] Fix timezone issue (already resolved with UTC)
- [ ] Add rate limiting to OTP endpoints (3 requests per 5 min)
- [ ] Add username pattern validation in database
- [ ] Add email uniqueness constraint

### Mobile
- [ ] Fix multiple lockfiles warning (choose npm or yarn)
- [ ] Add proper error messages for network failures
- [ ] Add loading spinners for async operations
- [ ] Add form validation feedback

---

## 🗂️ Files to Create Tomorrow

### Backend Files (7 files)
```
backend/src/main/java/com/m4hub/
├── service/
│   ├── EmailService.java ✨ NEW
│   └── NewsService.java ✨ NEW
├── controller/
│   ├── NewsController.java ✨ NEW
│   └── UserController.java (update)
├── model/
│   └── NewsArticle.java ✨ NEW
├── dto/
│   └── RegisterEmailRequest.java ✨ NEW
└── config/
    └── RedisConfig.java ✨ NEW
```

### Mobile Files (4 files)
```
mobile/
├── app/
│   └── auth/
│       ├── register-email.tsx ✨ NEW
│       └── verify-email-otp.tsx ✨ NEW
└── services/
    └── news.service.ts ✨ NEW
```

### Updated Files (3 files)
```
✏️ backend/src/main/java/com/m4hub/model/User.java
✏️ mobile/app/profile-setup.tsx
✏️ mobile/app/news.tsx
```

---

## 📊 Success Metrics

### By End of Day Tomorrow
- [x] User can register with email/password
- [x] Email OTP sent and verified
- [x] Username is mandatory and validated
- [x] Username availability check works in real-time
- [x] News tab shows real articles from API
- [x] Category filtering works
- [x] Search functionality works
- [x] All changes committed to Git

### Quality Checklist
- [ ] All endpoints tested with Postman/curl
- [ ] Mobile app tested on device/simulator
- [ ] No console errors
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Code properly formatted
- [ ] Git commits with clear messages

---

## 🚀 Quick Commands Reference

### Backend
```bash
# Navigate to backend
cd backend

# Build and run
mvn clean package -DskipTests
java "-Duser.timezone=UTC" -jar target\backend-0.0.1-SNAPSHOT.jar

# Test endpoints
curl http://localhost:8080/api/news/headlines?category=technology
curl http://localhost:8080/api/auth/check-username?username=testuser
```

### Mobile
```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start development
npm start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Clear cache
npx expo start -c
```

### Database
```sql
-- Check username uniqueness
SELECT username, COUNT(*) FROM users GROUP BY username HAVING COUNT(*) > 1;

-- View user profiles
SELECT id, username, phone_number, email, first_name, last_name FROM users;

-- Test data cleanup
DELETE FROM users WHERE username LIKE 'test%';
```

---

## 💡 Tips for Tomorrow

### Development Flow
1. **Start with backend first** - APIs ready for mobile consumption
2. **Test each endpoint** - Use Postman before integrating
3. **Small commits** - Commit after each working feature
4. **Test on real device** - Better than simulator for OTP/SMS

### Common Pitfalls
- ❌ Don't forget to add dependencies to pom.xml/package.json
- ❌ Don't hardcode API keys (use environment variables)
- ❌ Don't skip validation (username, email format)
- ❌ Don't forget error handling
- ❌ Don't commit sensitive keys to Git

### Time Management
- **10:00-12:00**: Backend core features ⏰
- **12:00-14:00**: Mobile UI/integration ⏰
- **14:00-16:00**: News API integration ⏰
- **16:00-17:30**: Testing & bug fixes ⏰
- **17:30-18:00**: Documentation & Git commits ⏰

---

## 📞 Help & Resources

### Documentation
- SendGrid Node.js: https://github.com/sendgrid/sendgrid-nodejs
- NewsAPI: https://newsapi.org/docs/get-started
- React Native: https://reactnative.dev/docs/getting-started
- Spring Boot: https://spring.io/guides

### Debugging
- **Backend logs**: Check console output for errors
- **Mobile logs**: Use `npx expo start` console or React Native Debugger
- **Network**: Use Chrome DevTools Network tab
- **Database**: Use DBeaver or psql to inspect data

---

## 🎯 Tomorrow Evening Goal

**By 6:00 PM tomorrow, you should be able to**:

1. ✅ Register a new user with email/password
2. ✅ Receive OTP email and verify it
3. ✅ Set up profile with unique username
4. ✅ Username validation working (real-time check)
5. ✅ Browse real news articles in News tab
6. ✅ Switch categories to see different news
7. ✅ Search for news topics
8. ✅ All features working on mobile device

**Screenshot checklist**:
- [ ] Email OTP received in inbox
- [ ] Username availability check (green ✓)
- [ ] Profile setup with username
- [ ] News tab with real articles
- [ ] Different category views

---

**Ready to code? Let's build! 🚀**

**Start time**: 9:00 AM  
**First task**: Get NewsAPI key (5 minutes)  
**First code**: Add username to User.java (30 minutes)

Good luck! 💪
