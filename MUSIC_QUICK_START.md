# 🚀 Quick Start: Database Music System

## 📋 Prerequisites
- ✅ Java 17+
- ✅ Maven 3.8+
- ✅ Docker Desktop (for PostgreSQL)
- ✅ Node.js 18+ (for frontend)

## 🎯 Step-by-Step Setup

### Step 1: Start PostgreSQL Database (1 minute)

```powershell
# Navigate to infra folder
cd infra

# Start PostgreSQL using Docker Compose
docker-compose -f docker-compose.dev.yml up -d postgres

# Verify database is running
docker ps | findstr postgres
```

**Expected Output:**
```
CONTAINER ID   IMAGE         STATUS         PORTS
abc123...      postgres:15   Up 10 seconds  0.0.0.0:5433->5432/tcp
```

### Step 2: Build Backend (2 minutes)

```powershell
# Navigate to backend folder
cd ..\backend

# Clean build (skip tests for faster build)
mvn clean package -DskipTests
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45 s
```

### Step 3: Seed Database with 2000+ Songs (10-15 minutes)

```powershell
# Start backend with automatic seeding
mvn spring-boot:run -Dspring-boot.run.arguments="--seed-songs=true --song-count=2000"
```

**What happens:**
1. ✅ Backend starts on port 8080
2. ✅ Connects to PostgreSQL
3. ✅ Creates `songs` table with indexes
4. ✅ Fetches songs from Jamendo API
5. ✅ Saves to database (logs progress every 100 songs)

**Expected Output:**
```
🎵 Starting database seeding with 2000 songs...
Current songs in database: 0
Fetching 2000 more songs to reach target of 2000...

Fetching songs for genre: pop
Progress: 100 songs saved...
Progress: 200 songs saved...
...
Saved 133 songs for genre: pop

Fetching songs for genre: rock
Progress: 300 songs saved...
...

✅ Database seeding complete! Added 1987 songs.
📊 Total songs in database: 1987

Started M4hubBackendApplication in 145.3 seconds
```

**⏱️ Duration:** 10-15 minutes (depends on Jamendo API speed)

**Note:** Keep this terminal running! Backend must stay up for frontend to work.

### Step 4: Verify Database (1 minute)

Open a new PowerShell terminal:

```powershell
# Connect to PostgreSQL
docker exec -it postgres-m4hub psql -U m4hub -d m4hub_db

# Check total songs
SELECT COUNT(*) FROM songs;

# Check genres distribution
SELECT genre, COUNT(*) as count 
FROM songs 
GROUP BY genre 
ORDER BY count DESC;

# Check languages
SELECT language, COUNT(*) as count 
FROM songs 
GROUP BY language 
ORDER BY count DESC;

# Sample songs
SELECT id, name, artist_name, genre, language 
FROM songs 
LIMIT 10;

# Exit PostgreSQL
\q
```

**Expected Output:**
```
 count  
--------
  1987

      genre      | count 
-----------------+-------
 pop             |   133
 rock            |   127
 electronic      |   125
 ...

    language    | count
----------------+-------
 english        |  1456
 spanish        |   234
 french         |   156
 ...
```

### Step 5: Test API Endpoints (2 minutes)

In a new PowerShell terminal:

```powershell
# Test popular songs
curl "http://localhost:8080/api/songs/popular?page=0&size=10"

# Test search
curl "http://localhost:8080/api/songs/search?q=love&page=0&size=5"

# Test genre filter
curl "http://localhost:8080/api/songs/genre/rock?page=0&size=5"

# Get all genres
curl "http://localhost:8080/api/songs/genres"

# Get all languages
curl "http://localhost:8080/api/songs/languages"

# Get statistics
curl "http://localhost:8080/api/songs/stats"
```

**Expected Response (popular songs):**
```json
{
  "songs": [
    {
      "id": 1,
      "name": "Song Title",
      "artist_name": "Artist Name",
      "album_name": "Album Name",
      "album_image": "https://usercontent.jamendo.com/...",
      "audio": "https://mp3d.jamendo.com/download/track/...",
      "shareurl": "https://www.jamendo.com/track/...",
      "duration": 240,
      "releasedate": "2024-01-15",
      "genre": "pop",
      "language": "english",
      "popularity": 75
    },
    ...
  ],
  "currentPage": 0,
  "totalPages": 40,
  "totalSongs": 1987,
  "hasNext": true,
  "hasPrevious": false
}
```

### Step 6: Update Frontend (5 minutes)

In a new PowerShell terminal:

```powershell
# Navigate to frontend
cd ..\frontend

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 7: Update Music Service

**File:** `frontend/src/services/spotify.service.ts`

Rename to `music.service.ts` and replace content:

```typescript
// frontend/src/services/music.service.ts

const API_BASE = 'http://localhost:8080/api/songs';

export interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  shareurl: string;
  duration: number;
  releasedate: string;
  genre: string;
  language: string;
  popularity: number;
}

export interface SearchResult {
  songs: Track[];
  currentPage: number;
  totalPages: number;
  totalSongs: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export async function searchTracks(
  query: string = '', 
  genre?: string,
  language?: string,
  page: number = 0,
  size: number = 50
): Promise<SearchResult> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    size: size.toString()
  });
  
  if (genre) params.append('genre', genre);
  if (language) params.append('language', language);
  
  const response = await fetch(`${API_BASE}/search?${params}`);
  return response.json();
}

export async function getPopularTracks(page: number = 0, size: number = 50): Promise<SearchResult> {
  const response = await fetch(`${API_BASE}/popular?page=${page}&size=${size}`);
  return response.json();
}

export async function getLatestTracks(page: number = 0, size: number = 50): Promise<SearchResult> {
  const response = await fetch(`${API_BASE}/latest?page=${page}&size=${size}`);
  return response.json();
}

export async function getGenres(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/genres`);
  return response.json();
}

export async function getLanguages(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/languages`);
  return response.json();
}

export async function getStats() {
  const response = await fetch(`${API_BASE}/stats`);
  return response.json();
}
```

### Step 8: Update Music Page

**File:** `frontend/src/app/music/page.tsx`

Update imports:

```typescript
// OLD
import { searchTracks, getPopularTracks } from '@/services/spotify.service';

// NEW
import { searchTracks, getPopularTracks } from '@/services/music.service';
```

Update the component to use the backend API properly (response structure changed).

### Step 9: Test Full Flow (2 minutes)

1. Open browser: `http://localhost:3000/music`
2. ✅ Should see 50 real songs with album covers
3. ✅ Click any song → Should play full MP3 (not 30s preview!)
4. ✅ Search for "love" → Should filter songs
5. ✅ Click next page → Should load more songs

## 🎉 Success Indicators

- ✅ PostgreSQL running on port 5433
- ✅ Backend running on port 8080
- ✅ Frontend running on port 3000
- ✅ Database has 1900+ songs
- ✅ API returns real songs with full MP3 URLs
- ✅ Music plays without "Preview not available" errors
- ✅ Search works instantly (< 100ms)
- ✅ Pagination works

## 🔧 Troubleshooting

### Issue 1: PostgreSQL Not Starting

```powershell
# Check Docker Desktop is running
docker version

# Check if port 5433 is already in use
netstat -ano | findstr :5433

# If port is busy, stop conflicting service or change port in application.yml
```

### Issue 2: Backend Fails to Connect to Database

**Error:** `Connection refused`

**Fix:**
1. Ensure PostgreSQL is running: `docker ps`
2. Check connection details in `backend/src/main/resources/application.yml`:
   - Host: `localhost`
   - Port: `5433`
   - Database: `m4hub_db`
   - Username: `m4hub`
   - Password: `m4hub_pass`

### Issue 3: Jamendo API Not Responding

**Error:** `RestClientException` or timeout

**Fix:**
1. Test API directly:
   ```powershell
   curl "https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=json&limit=10"
   ```
2. If API is down, try again later or use admin endpoint:
   ```powershell
   curl -X POST "http://localhost:8080/api/admin/songs/fetch?count=2000"
   ```

### Issue 4: No Songs Fetched

**Check logs:**
```
Error fetching songs for genre: pop
```

**Fix:**
1. Check internet connection
2. Verify Jamendo API is accessible
3. Try reducing count: `--song-count=500`

### Issue 5: Frontend Shows "Preview not available"

**This means:** Frontend is still using mock data!

**Fix:**
1. Ensure `music.service.ts` is calling `http://localhost:8080/api/songs/*`
2. Check browser console for CORS errors
3. Verify backend is running
4. Check `SongController.java` has `@CrossOrigin` annotation

### Issue 6: CORS Error in Browser

**Error:** `Access-Control-Allow-Origin`

**Fix:**
Add to `SongController.java`:
```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
```

## ⚡ Performance Tips

### Faster Seeding (Optional)

Reduce logging to speed up seeding:

**File:** `backend/src/main/resources/application.yml`

```yaml
logging:
  level:
    com.m4hub: INFO  # Change to WARN for less logging
```

### Re-seeding

If you want to add more songs later:

```powershell
# Backend is already running
curl -X POST "http://localhost:8080/api/admin/songs/fetch?count=3000"

# This will fetch 3000 MORE songs (total will be ~5000)
```

### Skip Seeding on Restart

Once database is seeded, restart backend normally:

```powershell
# WITHOUT --seed-songs flag
mvn spring-boot:run

# OR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 📊 Expected Database Size

| Songs | Database Size | Query Time |
|-------|---------------|------------|
| 2,000 | ~8 MB | < 50ms |
| 5,000 | ~20 MB | < 80ms |
| 10,000 | ~40 MB | < 120ms |
| 50,000 | ~200 MB | < 300ms |

## 🎵 What You Get

- ✅ **2000+ songs** across 15 genres
- ✅ **Multi-language** support (English, Spanish, French, etc.)
- ✅ **Full MP3 playback** (not 30s previews!)
- ✅ **Fast search** (< 100ms)
- ✅ **Genre filtering** (pop, rock, electronic, jazz, etc.)
- ✅ **Language filtering**
- ✅ **Pagination** (50 songs per page)
- ✅ **Popular songs** (sorted by popularity)
- ✅ **Latest songs** (sorted by date added)
- ✅ **Album covers**
- ✅ **Share URLs** (link to Jamendo)
- ✅ **No API limits**
- ✅ **100% free**
- ✅ **Legal** (Creative Commons)

## 📚 Next Steps

1. ✅ **Test full flow** with real data
2. ⏳ **Add genre/language filter UI** to music page
3. ⏳ **Add pagination UI** (Previous/Next buttons)
4. ⏳ **Add "Now Playing" bar** at bottom of app
5. ⏳ **Add favorites feature** (save to user profile)
6. ⏳ **Add playlists feature**
7. ⏳ **Add shuffle & repeat**
8. ⏳ **Integrate with mobile app**

## 📖 Full Documentation

See `docs/DATABASE_MUSIC_SYSTEM.md` for:
- Architecture details
- API documentation
- Frontend integration guide
- Performance optimization
- Scalability analysis
- Legal & licensing info

## 🤝 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Check `docs/DATABASE_MUSIC_SYSTEM.md`
3. Check backend logs for errors
4. Check browser console for frontend errors
5. Verify all services are running (PostgreSQL, Backend, Frontend)

---

**Time to Production Music:** ~20 minutes total! 🎉
