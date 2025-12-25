/**
 * Jamendo Music Service - FREE Full-Length Streaming
 * NO API KEY REQUIRED for public content
 * 500K+ Creative Commons tracks with full playback
 */

import { Track } from './music.service';

const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

interface JamendoTrack {
    id: string;
    name: string;
    artist_name: string;
    album_name: string;
    album_image: string;
    audio: string;
    audiodownload: string;
    duration: number;
    releasedate: string;
    shareurl: string;
}

/**
 * Convert Jamendo track to our Track interface
 */
function convertJamendoTrack(track: JamendoTrack): Track {
    return {
        id: `jamendo-${track.id}`,
        name: track.name,
        artist_name: track.artist_name,
        album_name: track.album_name,
        album_image: track.album_image,
        image: track.album_image,
        audio: track.audio, // FULL LENGTH AUDIO
        audiodownload: track.audiodownload,
        duration: track.duration,
        releasedate: track.releasedate,
        shareurl: track.shareurl
    };
}

/**
 * Search for tracks on Jamendo
 * NO API KEY REQUIRED - Uses public client ID
 */
export async function searchJamendoTracks(query: string, limit: number = 50): Promise<Track[]> {
    try {
        const url = `${JAMENDO_BASE_URL}/tracks/?client_id=56d30c95&format=json&limit=${limit}&search=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`;

        console.log('Searching Jamendo:', query);
        const response = await fetch(url); if (!response.ok) {
            console.error(`❌ Jamendo search failed: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const tracks = (data.results || []).map(convertJamendoTrack);

        console.log(`Found ${tracks.length} Jamendo tracks (FULL LENGTH)`);
        return tracks;
    } catch (error) {
        console.error('❌ Jamendo search error:', error);
        return [];
    }
}

/**
 * Get popular/trending tracks from Jamendo
 * NO API KEY REQUIRED
 */
export async function getJamendoPopularTracks(limit: number = 50): Promise<Track[]> {
    try {
        // Get popular tracks sorted by popularity
        const url = `${JAMENDO_BASE_URL}/tracks/?client_id=56d30c95&format=json&limit=${limit}&order=popularity_total&include=musicinfo&audioformat=mp32`;

        console.log('Loading Jamendo popular tracks...');
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`❌ Jamendo popular tracks failed: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const tracks = (data.results || []).map(convertJamendoTrack);

        console.log(`Loaded ${tracks.length} Jamendo popular tracks (FULL LENGTH)`);
        return tracks;
    } catch (error) {
        console.error('❌ Jamendo popular tracks error:', error);
        return [];
    }
}

/**
 * Get tracks by genre
 */
export async function getJamendoTracksByGenre(genre: string, limit: number = 50): Promise<Track[]> {
    try {
        const url = `${JAMENDO_BASE_URL}/tracks/?client_id=56d30c95&format=json&limit=${limit}&tags=${encodeURIComponent(genre)}&order=popularity_total&include=musicinfo&audioformat=mp32`;

        console.log(`Loading Jamendo ${genre} tracks...`);
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`❌ Jamendo genre tracks failed: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const tracks = (data.results || []).map(convertJamendoTrack);

        console.log(`Loaded ${tracks.length} ${genre} tracks (FULL LENGTH)`);
        return tracks;
    } catch (error) {
        console.error(`❌ Jamendo ${genre} tracks error:`, error);
        return [];
    }
}

/**
 * Available genres
 */
export const JAMENDO_GENRES = [
    'pop',
    'rock',
    'electronic',
    'jazz',
    'classical',
    'hip-hop',
    'acoustic',
    'ambient',
    'indie',
    'metal'
];
