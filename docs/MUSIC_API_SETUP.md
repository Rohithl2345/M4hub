# Music API Setup Guide

## 🎵 Current Status

The music feature is currently using **mock data** because a valid Jamendo API key is not configured.

## 🆓 Get Your FREE Jamendo API Key

1. **Sign up for a free account:**
   - Visit: https://devportal.jamendo.com/signup
   - Fill in your details (it's completely free!)
   - Verify your email

2. **Get your API key:**
   - Log in to: https://devportal.jamendo.com/
   - Navigate to "My Applications"
   - Create a new application or use the default one
   - Copy your **Client ID** (API key)

3. **Configure your API key:**

   **For Web App:**
   - Open: `frontend/src/services/music.service.ts`
   - Replace the `CLIENT_ID` value on line 6:
     ```typescript
     const CLIENT_ID = 'YOUR_API_KEY_HERE';
     ```

   **For Mobile App:**
   - Open: `mobile/services/music.service.ts`
   - Replace the `JAMENDO_CLIENT_ID` value on line 2:
     ```typescript
     const JAMENDO_CLIENT_ID = 'YOUR_API_KEY_HERE';
     ```

4. **Restart your apps:**
   - Web: The app will hot-reload automatically
   - Mobile: Restart the Metro bundler if needed

## 🧪 Testing the Music Feature

### Mock Data (Current Setup)
You can test the functionality right now with mock data:

**Available mock tracks:**
1. Summer Vibes - DJ Melody
2. Electric Dreams - Synth Wave
3. Acoustic Journey - Guitar Master
4. Jazz in the Night - Smooth Jazz Trio
5. Rock Anthem - Power Chord
6. Piano Nocturne - Classical Keys
7. Electronic Pulse - Beat Factory
8. Indie Folk Tale - Wandering Souls
9. Hip Hop Beats - MC Rhythm
10. Ambient Space - Cosmic Sounds

**Search functionality:**
- Try searching for: "jazz", "rock", "electric", "piano"
- The search filters the mock tracks by name, artist, or album

### Web App Testing
1. Navigate to: `http://localhost:3000/music`
2. You should see 10 mock tracks listed
3. Click any track to play it
4. Use the search bar to filter tracks
5. Click the X button to reset search

### Mobile App Testing
1. Open Expo Go and navigate to the Music tab
2. You should see 5 mock tracks listed
3. Tap any track to play it
4. Use the search bar to filter tracks
5. Tap the X icon to reset search

## ✅ Features Working with Mock Data

- ✅ Track listing display
- ✅ Search and filter functionality
- ✅ Audio playback (using SoundHelix demo tracks)
- ✅ Play/pause/next/previous controls
- ✅ Progress tracking
- ✅ Reset search button
- ✅ Responsive UI on both platforms

## 🚀 With Real API Key

Once you configure a valid Jamendo API key, you'll get:
- **600,000+ free music tracks**
- Real album artwork
- Multiple genres (rock, jazz, electronic, classical, etc.)
- Better search results
- More variety

## 🔍 Search Keywords (with real API)

Popular search terms that work well:
- **Genres:** rock, jazz, electronic, classical, ambient, hip hop, folk, blues
- **Instruments:** piano, guitar, drums, violin, saxophone
- **Moods:** chill, energetic, relaxing, upbeat, sad, happy
- **Styles:** acoustic, indie, dance, lounge, world

## 🎯 API Benefits

- ✅ **100% Free** - No subscription required
- ✅ **Legal** - All tracks are Creative Commons licensed
- ✅ **No attribution required** for personal use
- ✅ **High quality** audio files
- ✅ **Direct streaming** URLs

## 🆘 Troubleshooting

### No tracks showing?
1. Check browser console (F12) for errors
2. Verify the API key is correct
3. Make sure you saved the file after updating the key
4. Refresh the page

### Search not working?
- With mock data: Search is case-insensitive and filters by name/artist/album
- With real API: Search requires at least 3 characters for best results

### Audio not playing?
- Check that your browser allows audio playback
- Try a different browser
- Verify the audio URLs are accessible

## 📝 Notes

- Mock data uses SoundHelix demo tracks (royalty-free)
- The mock data is intentionally limited to show the concept
- Real API provides much better experience with real music tracks
- No authentication is required - just the API key!
