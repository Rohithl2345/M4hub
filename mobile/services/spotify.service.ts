// Spotify API Service for Mobile
// Get your Spotify Client ID from: https://developer.spotify.com/dashboard

import * as WebBrowser from 'expo-web-browser';

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

WebBrowser.maybeCompleteAuthSession();

interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string }[];
    };
    preview_url: string | null;
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
}

interface Track {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: string;
    image: string;
    audio: string;
    spotifyUrl?: string;
}

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Get Client Credentials access token (no user auth required)
async function getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    if (!SPOTIFY_CLIENT_ID) {
        throw new Error('Spotify Client ID not configured');
    }

    try {
        const response = await fetch(SPOTIFY_AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}`,
        });

        if (!response.ok) {
            throw new Error(`Spotify auth failed: ${response.status}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 min for safety

        return accessToken!;
    } catch (error) {
        console.error('Spotify authentication error:', error);
        throw error;
    }
}

// Convert Spotify track to our Track interface
function convertSpotifyTrack(track: SpotifyTrack): Track {
    const minutes = Math.floor(track.duration_ms / 60000);
    const seconds = Math.floor((track.duration_ms % 60000) / 1000);

    return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        image: track.album.images[0]?.url || '',
        audio: track.preview_url || '', // 30-second preview
        spotifyUrl: track.external_urls.spotify,
    };
}

// Search for tracks on Spotify
export async function searchSpotifyTracks(query: string, limit: number = 20): Promise<Track[]> {
    if (!query.trim()) {
        return [];
    }

    try {
        const token = await getAccessToken();

        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        const tracks = data.tracks?.items || [];

        return tracks
            .filter((track: SpotifyTrack) => track.preview_url) // Only include tracks with previews
            .map(convertSpotifyTrack);
    } catch (error) {
        console.error('Spotify search error:', error);
        throw error;
    }
}

// Get popular tracks (using a predefined playlist or search)
export async function getPopularSpotifyTracks(limit: number = 20): Promise<Track[]> {
    try {
        const token = await getAccessToken();

        // Get tracks from Spotify's "Today's Top Hits" playlist
        const playlistId = '37i9dQZF1DXcBWIGoYBM5M'; // Today's Top Hits

        const response = await fetch(
            `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        const tracks = data.items
            .map((item: any) => item.track)
            .filter((track: SpotifyTrack) => track && track.preview_url);

        return tracks.map(convertSpotifyTrack);
    } catch (error) {
        console.error('Spotify popular tracks error:', error);
        throw error;
    }
}

// Open track in Spotify app or browser
export async function openInSpotify(spotifyUrl: string): Promise<void> {
    try {
        await WebBrowser.openBrowserAsync(spotifyUrl, {
            dismissButtonStyle: 'close',
            controlsColor: '#1DB954', // Spotify green
        });
    } catch (error) {
        console.error('Error opening Spotify:', error);
    }
}

// Check if Spotify is configured
export function isSpotifyConfigured(): boolean {
    return !!SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_ID !== '';
}
