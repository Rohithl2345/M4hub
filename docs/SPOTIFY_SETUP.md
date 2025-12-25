# 🎵 Spotify Integration Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Create Spotify Developer Account
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one - it's FREE)
3. Click **"Create App"**

### Step 2: Configure Your App
Fill in the form:
- **App Name**: `M4hub Music` (or any name you like)
- **App Description**: `Music streaming for M4hub platform`
- **Redirect URIs**: If it's a required field, enter:
  ```
  https://localhost:3000/callback
  ```
  - Use `https://` (not `http://`) to avoid the security error
  - Or use: `https://example.com/callback` (never actually called)
  - We use Client Credentials flow, so redirects aren't actually used
- **Which API/SDKs are you planning to use?**: Select **Web API**
- Accept Terms of Service
- Click **Save**

### Step 3: Get Your Client ID
1. Click on your newly created app
2. Click **Settings** button
3. Copy your **Client ID** (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 4: Add to Your Project

#### Web (Frontend)
1. Open `frontend/.env.local` (create if doesn't exist)
2. Add:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
```

#### Mobile
1. Open `mobile/.env`
2. Replace `YOUR_SPOTIFY_CLIENT_ID_HERE` with your actual Client ID:
```env
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 5: Restart Your Apps
```bash
# Web
cd frontend
npm run dev

# Mobile
cd mobile
npx expo start --clear
```

---

## ✅ What You Get

### 🎧 Real Music Catalog
- **100M+ songs** from Spotify
- All major artists and albums
- Up-to-date catalog (new releases, trending tracks)
- Professional metadata (album art, artist info, genres)

### 🆓 30-Second Previews
- Free streaming of 30-second clips
- No subscription required
- Perfect for music discovery
- Legal and licensed

### 🔗 Deep Links to Spotify
- "Open in Spotify" button on each track
- Opens Spotify app if installed
- Falls back to web player
- Users can listen to full songs (if they have Spotify)

### 📊 Smart Fallback
```
User searches → Try Spotify first
↓ (if Spotify fails)
Try Jamendo API
↓ (if that fails)
Use mock data
```

---

## 🎯 How It Works

### Search Flow
1. User types "rock" and hits search
2. App sends request to Spotify API
3. Gets 20 results with preview URLs
4. Displays tracks with album art
5. User clicks play → 30-second preview plays
6. User clicks Spotify icon → Opens full song in Spotify app

### Popular Tracks
- Loads Spotify's "Today's Top Hits" playlist
- Updates automatically with trending songs
- Shows current popular music

---

## 🔐 Rate Limits (Free Tier)

- **180 requests per minute** (normal)
- **600 requests per minute** (extended quota)
- Enough for **1000s of users**

### Calculations:
```
180 requests/min = 3 requests/sec
= 10,800 requests/hour
= 259,200 requests/day

With 1000 concurrent users:
Each user can make 180 API calls = enough for normal usage
```

You're covered! ✅

---

## 🧪 Testing

### Test Search
```
"rock" → Rock songs
"taylor swift" → Taylor Swift tracks
"jazz" → Jazz music
"hip hop" → Hip-hop tracks
"electronic" → Electronic music
```

### Test Features
1. **Search**: Type query, hit enter → Should show Spotify results
2. **Preview**: Click play → 30-second clip plays
3. **Spotify Link**: Click Spotify icon → Opens in Spotify app/web
4. **Popular**: Load page → Shows "Today's Top Hits"

### Check Console
```javascript
// Web: Open browser console (F12)
// Mobile: Check Metro bundler terminal

// You should see:
"🎵 Fetching from Spotify..."
"🔍 Searching Spotify for: rock"
```

---

## ❌ Troubleshooting

### Issue: "Spotify auth failed: 400"
**Solution**: Check your Client ID is correct in `.env` files

### Issue: "CORS error" (Web only)
**Solution**: Spotify API should work from localhost. If not:
1. Check redirect URI in Spotify Dashboard
2. Make sure you added `http://localhost:3000/callback`

### Issue: No preview URL for some tracks
**Solution**: Some tracks don't have previews. App filters them out automatically.

### Issue: "Rate limit exceeded"
**Solution**: 
- You hit 180 requests/min limit
- Wait 1 minute
- Implement caching (see Advanced section below)

---

## 🚀 Advanced: Production Optimization

### 1. Response Caching
Cache Spotify responses for 1 hour:
```typescript
// Add to spotify.service.ts
const cache = new Map();

async function getCachedData(key: string, fetchFn: () => Promise<any>) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < 3600000) { // 1 hour
      return data;
    }
  }
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Request Throttling
Limit API calls:
```typescript
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms between requests

async function throttledRequest(url: string) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
  return fetch(url);
}
```

### 3. Backend Proxy (Optional)
For production, proxy Spotify requests through your backend:
- Hide Client Secret securely
- Implement server-side caching
- Monitor API usage
- Handle rate limiting globally

---

## 📊 Stats Card Update

The stats now show:
- **Tracks**: Number of search results
- **Music**: "Spotify" (when configured) or "Free"
- **Library**: "100M+" (Spotify's catalog size)

---

## 💰 Cost

**FREE forever** for:
- 30-second previews
- Search
- Metadata (artist, album, images)
- Unlimited API calls (within rate limits)

**Paid** only if you want:
- Full song playback → Requires Spotify Premium SDK (different integration)
- Commercial use with >10M monthly users → Contact Spotify

---

## 📚 Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify Dashboard](https://developer.spotify.com/dashboard)
- [API Reference](https://developer.spotify.com/documentation/web-api/reference)
- [Rate Limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)

---

## 🎉 Next Steps

1. ✅ Get Spotify Client ID (5 minutes)
2. ✅ Add to `.env` files
3. ✅ Restart apps
4. ✅ Test search and playback
5. 🚀 Deploy to production

---

**Created**: December 10, 2025
**Last Updated**: December 10, 2025
**Status**: Production-ready integration complete
