# Production Music API Options

## ⚠️ Current Status
- **Mock Data**: Using SoundHelix royalty-free MP3s (10 web tracks, 5 mobile tracks)
- **Not Production Ready**: Mock data is for testing only

## 🎵 Real-Time Music API Options for Production

### 1. **Spotify Web API** (RECOMMENDED)
- **Pros**:
  - 🎯 Most comprehensive music catalog (100M+ tracks)
  - ✅ Free tier available
  - 🔐 OAuth 2.0 authentication
  - 📱 Mobile SDK available
  - 🎨 Album artwork, artist info, playlists
  - 🔊 30-second preview URLs for streaming
  
- **Cons**:
  - ❌ Full track playback requires Spotify Premium users
  - ❌ Cannot stream full songs without Premium subscription
  - 📊 Rate limits: Normal (180 requests/min), Extended (600 requests/min)

- **Best For**: Music discovery, previews, metadata, playlists

- **Setup**:
  1. Create app at https://developer.spotify.com/dashboard
  2. Get Client ID + Client Secret
  3. Implement OAuth flow
  4. Use preview_url field (30s clips)

- **Cost**: FREE for metadata + previews

---

### 2. **Deezer API**
- **Pros**:
  - ✅ Free tier with good limits
  - 🎵 Large catalog (90M+ tracks)
  - 🔊 30-second preview clips
  - 🌍 Available in 180+ countries
  - 📝 No authentication for public data

- **Cons**:
  - ❌ Full streaming requires Deezer subscription
  - 🌐 Less popular than Spotify in some regions

- **Best For**: International markets, simple integration

- **Setup**:
  1. Register at https://developers.deezer.com/
  2. Get application ID
  3. Use REST API endpoints
  4. Access preview field (30s clips)

- **Cost**: FREE for previews + metadata

---

### 3. **Last.fm API**
- **Pros**:
  - ✅ Completely free
  - 📊 Rich metadata (tags, similar artists, charts)
  - 🎤 User scrobbling data
  - 📈 Music trends and statistics

- **Cons**:
  - ❌ NO audio streaming (metadata only)
  - 🔗 Must link to external players

- **Best For**: Music recommendations, metadata, social features

- **Setup**:
  1. Create account at https://www.last.fm/api/account/create
  2. Get API key
  3. Use REST API

- **Cost**: FREE (no streaming)

---

### 4. **Jamendo API** (Currently Implemented)
- **Pros**:
  - ✅ FREE full-length streaming
  - 🎵 500K+ Creative Commons tracks
  - 🔓 No authentication for public content
  - 💰 Royalty-free music

- **Cons**:
  - ❌ Limited to independent/unsigned artists
  - 🎸 Smaller catalog vs Spotify/Deezer
  - ⚠️ API reliability issues (as experienced)

- **Current Issue**: Account creation failing, API keys not working

- **Best For**: Background music, podcasts, indie music apps

---

### 5. **SoundCloud API**
- **Pros**:
  - 🎧 Large catalog (320M+ tracks)
  - 🎤 Independent artists + remixes
  - 🔊 Full streaming possible
  - 🌐 Good mobile support

- **Cons**:
  - ⚠️ New app registration restricted (waitlist)
  - 📊 Rate limits can be strict
  - 🔐 OAuth required

- **Best For**: DJ mixes, remixes, independent music

---

### 6. **YouTube Music API**
- **Pros**:
  - 🎵 Largest catalog (100M+ songs)
  - 🎬 Music videos included
  - 🌍 Available worldwide
  - 🔓 Can embed players

- **Cons**:
  - ❌ Must use embedded player (no direct streaming)
  - 📜 Strict Terms of Service
  - 💰 Quota costs for YouTube Data API

- **Best For**: Music videos, mainstream content

---

## 🏆 Recommended Production Strategy

### **Option A: Spotify Preview API** (Best for Most Apps)
```typescript
// Pros:
✅ 30-second previews of 100M+ songs
✅ Rich metadata (artists, albums, playlists)
✅ Free tier sufficient for most apps
✅ Industry-standard, trusted brand
✅ Great mobile support

// Implementation:
1. User searches for songs
2. Display results with album art
3. Play 30s preview_url clips
4. Link to full song on Spotify (generates revenue via affiliate)
```

**User Experience**: "Preview any song, link to Spotify/Apple Music for full playback"

---

### **Option B: Hybrid Approach** (Best for Production)
```typescript
// Combine multiple APIs:
1. Spotify API → Metadata + 30s previews (mainstream songs)
2. Jamendo API → Full-length streaming (indie/background music)
3. SoundCloud → Remixes, DJ sets, independent artists

// Benefits:
✅ Best of all worlds
✅ Fallback options if one API fails
✅ Richer content variety
✅ Better user experience
```

---

### **Option C: Premium Streaming Service** (Enterprise)
If you need FULL song playback, you'll need:

1. **Spotify Premium Users**: Integrate Spotify SDK, users login with Premium account
2. **Apple Music API**: MusicKit JS/iOS SDK (requires Apple Music subscription)
3. **Amazon Music API**: Similar to Spotify (requires subscription)

**Cost**: None to you, but users must have active subscriptions

---

## 📋 Implementation Checklist

### Phase 1: Replace Mock Data (This Week)
- [ ] Create Spotify Developer account
- [ ] Get Client ID + Client Secret
- [ ] Implement OAuth flow (web + mobile)
- [ ] Update `music.service.ts` to use Spotify API
- [ ] Use `preview_url` field for 30s clips
- [ ] Add "Play Full Song on Spotify" button

### Phase 2: Enhance Features (Next Sprint)
- [ ] Add Deezer as fallback API
- [ ] Implement search with both APIs
- [ ] Cache API responses (reduce rate limits)
- [ ] Add playlists feature
- [ ] Add favorites/likes

### Phase 3: Monetization (Future)
- [ ] Spotify affiliate links
- [ ] Apple Music affiliate links
- [ ] Premium subscription for full playback (requires licensing)

---

## 💰 Cost Comparison

| API | Free Tier | Streaming | Rate Limits | Best For |
|-----|-----------|-----------|-------------|----------|
| Spotify | ✅ YES | 30s previews | 180/min | Production |
| Deezer | ✅ YES | 30s previews | Generous | International |
| Last.fm | ✅ YES | ❌ None | Generous | Metadata |
| Jamendo | ✅ YES | Full songs | Good | Indie music |
| SoundCloud | ⚠️ Waitlist | Full songs | Limited | Remixes |
| YouTube | ⚠️ Quota | Embedded only | Strict | Music videos |

---

## 🚀 Quick Start: Spotify Integration

### 1. Create Spotify App
```bash
# Visit: https://developer.spotify.com/dashboard
# Click "Create App"
# Name: M4hub Music
# Redirect URI: http://localhost:3000/callback (web)
#               exp://localhost:8081 (mobile)
# Copy Client ID + Client Secret
```

### 2. Update Environment Variables
```env
# .env.local (web)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# .env (mobile)
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
```

### 3. Install Dependencies
```bash
# Web
cd frontend
npm install spotify-web-api-js

# Mobile
cd mobile
npx expo install expo-auth-session expo-web-browser
```

### 4. Implement Service
See `docs/backend/SPOTIFY_INTEGRATION.md` (to be created)

---

## ⚠️ Legal Considerations

1. **Terms of Service**: Review each API's ToS carefully
2. **Attribution**: Display "Powered by Spotify/Deezer" logos
3. **Rate Limits**: Implement caching and request throttling
4. **User Privacy**: Handle OAuth tokens securely
5. **Content Rights**: Cannot download/redistribute music files
6. **Commercial Use**: Check if your use case requires commercial license

---

## 🎯 Next Steps

**For Production Launch:**
1. Implement Spotify API (30s previews)
2. Add "Listen on Spotify" deeplinks
3. Test with real users
4. Monitor API usage/costs
5. Add Deezer as backup API

**Timeline:** 2-3 days for Spotify integration

---

## 📚 Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Deezer API Docs](https://developers.deezer.com/api)
- [Last.fm API Docs](https://www.last.fm/api)
- [SoundCloud API](https://developers.soundcloud.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)

---

**Created**: December 10, 2025
**Last Updated**: December 10, 2025
**Status**: Mock data currently in use - needs production API integration
