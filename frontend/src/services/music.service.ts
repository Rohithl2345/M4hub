import { env } from '@/utils/env';
import fetchWithAuth from '@/utils/fetchWithAuth';
const API_URL = env.apiUrl;
const BACKEND_API_BASE = `${API_URL}/api/music`;

export interface Track {
    id: string;
    name: string;
    artist_name: string;
    album_name: string;
    duration: number;
    audio: string;
    audiodownload: string;
    image: string;
    album_image: string;
    genre?: string;
    isFavorite?: boolean;
    isInWishlist?: boolean;
    shareurl?: string;
    releasedate?: string;
    lyrics?: string;
    playCount?: number;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    tracks: Track[];
    isPublic: boolean;
}

class MusicService {
    private baseUrl = BACKEND_API_BASE;

    private logError(message: string, error?: any) {
        // eslint-disable-next-line no-console
        console.error(`[MusicService] ${message}`, error || '');
    }

    private logWarn(message: string) {
        // eslint-disable-next-line no-console
        console.warn(`[MusicService] ${message}`);
    }

    private mapSongToTrack(song: any): Track {
        if (!song) return {} as Track;
        let audioUrl = song.audioUrl || song.audio_url;
        let imageUrl = song.imageUrl || song.image_url || '';

        // Ensure URLs are absolute
        if (audioUrl && !audioUrl.startsWith('http')) {
            audioUrl = `${API_URL}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
        }

        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }

        return {
            id: (song.id || '').toString(),
            name: song.title || song.name || 'Unknown Track',
            artist_name: song.artist || song.artist_name || 'Unknown Artist',
            album_name: song.album || song.album_name || 'Unknown Album',
            duration: song.duration || 0,
            audio: audioUrl || '',
            audiodownload: audioUrl || '',
            image: imageUrl || '',
            album_image: imageUrl || '',
            genre: song.genre,
            isFavorite: song.isFavorite || false,
            isInWishlist: song.isInWishlist || false
        };
    }

    private mapPlaylist(pl: any): Playlist {
        return {
            ...pl,
            id: pl.id.toString(),
            tracks: (pl.tracks || []).map((t: any) => this.mapSongToTrack(t))
        };
    }

    private getHeaders(): Record<string, string> {
        if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    private async handleResponse(response: Response): Promise<Response> {
        if (response.status === 401) {
            // localStorage.removeItem('authToken'); // Don't wipe here, let the app handle auth state
            throw new Error('Unauthorized: Please log in again.');
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Something went wrong');
        }
        return response;
    }

    /**
     * Get all songs from backend
     */
    async getPopularTracks(limit: number = 20): Promise<Track[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/songs`);

            if (!response.ok) {
                this.logError(`API error: ${response.status} ${response.statusText}`);
                return [];
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) {
                this.logWarn('Empty response from music API');
                return [];
            }

            const songs = JSON.parse(text);
            if (!Array.isArray(songs)) {
                this.logError('Invalid response format from music API');
                return [];
            }

            return songs.map(this.mapSongToTrack).slice(0, limit);
        } catch (error) {
            this.logError('Error fetching songs from backend', error);
            return [];
        }
    }

    /**
     * Search tracks by query via backend
     */
    async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
        try {
            if (!query.trim()) {
                return this.getPopularTracks(limit);
            }

            const response = await fetchWithAuth(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                this.logError(`Search API error: ${response.status}`);
                return [];
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) {
                return [];
            }

            const songs = JSON.parse(text);
            return Array.isArray(songs) ? songs.map(this.mapSongToTrack).slice(0, limit) : [];
        } catch (error) {
            this.logError('Error searching tracks from backend', error);
            return [];
        }
    }

    /**
     * Toggle Favorite
     */
    async toggleFavorite(songId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/favorites/toggle`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ songId: parseInt(songId) })
            });
            const data = await (await this.handleResponse(response)).json();
            return data.success;
        } catch (error) {
            this.logError('Error toggling favorite', error);
            return false;
        }
    }

    /**
     * Get User Favorites
     */
    async getFavorites(): Promise<Track[]> {
        try {
            const response = await fetch(`${this.baseUrl}/favorites`, {
                headers: this.getHeaders()
            });
            const songs = await (await this.handleResponse(response)).json();
            return songs.map((s: any) => ({ ...this.mapSongToTrack(s), isFavorite: true }));
        } catch (error) {
            this.logError('Error fetching favorites', error);
            return [];
        }
    }

    /**
     * Toggle Wishlist
     */
    async toggleWishlist(songId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/wishlist/toggle`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ songId: parseInt(songId) })
            });
            const data = await (await this.handleResponse(response)).json();
            return data.success;
        } catch (error) {
            this.logError('Error toggling wishlist', error);
            return false;
        }
    }

    /**
     * Get User Wishlist
     */
    async getWishlist(): Promise<Track[]> {
        try {
            const response = await fetch(`${this.baseUrl}/wishlist`, {
                headers: this.getHeaders()
            });
            const songs = await (await this.handleResponse(response)).json();
            return songs.map((s: any) => ({ ...this.mapSongToTrack(s), isInWishlist: true }));
        } catch (error) {
            this.logError('Error fetching wishlist', error);
            return [];
        }
    }

    /**
     * Get Trending Tracks
     */
    async getTrendingTracks(): Promise<Track[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/trending`);
            if (!response.ok) return [];
            const songs = await response.json();
            return songs.map((s: any) => this.mapSongToTrack(s));
        } catch (error) {
            this.logError('Error fetching trending tracks', error);
            return [];
        }
    }

    /**
     * Track Play
     */
    async trackPlay(songId: string): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/${songId}/play`, {
                method: 'POST',
                headers: this.getHeaders()
            });
        } catch (error) {
            this.logError('Error tracking play', error);
        }
    }

    /**
     * Get Lyrics
     */
    async getLyrics(songId: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/${songId}/lyrics`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.lyrics;
        } catch (error) {
            this.logError('Error getting lyrics', error);
            return 'Lyrics not available.';
        }
    }

    /**
     * Playlist Management
     */
    async getMyPlaylists(): Promise<Playlist[]> {
        try {
            const response = await fetch(`${this.baseUrl}/playlists`, {
                headers: this.getHeaders()
            });
            const data = await (await this.handleResponse(response)).json();
            return (data || []).map((pl: any) => this.mapPlaylist(pl));
        } catch (error) {
            this.logError('Error fetching playlists', error);
            return [];
        }
    }

    async createPlaylist(name: string, description: string = ''): Promise<Playlist | null> {
        try {
            const response = await fetch(`${this.baseUrl}/playlists`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name, description })
            });
            const data = await (await this.handleResponse(response)).json();
            return this.mapPlaylist(data);
        } catch (error) {
            this.logError('Error creating playlist', error);
            return null;
        }
    }

    async addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist | null> {
        try {
            const response = await fetch(`${this.baseUrl}/playlists/${playlistId}/add/${songId}`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await (await this.handleResponse(response)).json();
            return this.mapPlaylist(data);
        } catch (error) {
            this.logError('Error adding song to playlist', error);
            return null;
        }
    }

    async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | null> {
        try {
            const response = await fetch(`${this.baseUrl}/playlists/${playlistId}/remove/${songId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await (await this.handleResponse(response)).json();
        } catch (error) {
            this.logError('Error removing song from playlist', error);
            return null;
        }
    }

    async deletePlaylist(playlistId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/playlists/${playlistId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await (await this.handleResponse(response)).json();
            return data.success;
        } catch (error) {
            this.logError('Error deleting playlist', error);
            return false;
        }
    }

    /**
     * Get Albums
     */
    async getAlbums(): Promise<string[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/albums`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            this.logError('Error fetching albums', error);
            return [];
        }
    }

    /**
     * Get Artists
     */
    async getArtists(): Promise<string[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/artists`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            this.logError('Error fetching artists', error);
            return [];
        }
    }

    /**
     * Get Languages
     */
    async getLanguages(): Promise<string[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/languages`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            this.logError('Error fetching languages', error);
            return [];
        }
    }

    async getTracksByLanguage(language: string): Promise<Track[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/language/${encodeURIComponent(language)}`);
            if (!response.ok) return [];
            const songs = await response.json();
            return songs.map((s: any) => this.mapSongToTrack(s));
        } catch (error) {
            this.logError(`Error fetching tracks for language ${language}`, error);
            return [];
        }
    }

    async getTracksByArtist(artist: string): Promise<Track[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/artist/${encodeURIComponent(artist)}`);
            if (!response.ok) return [];
            const songs = await response.json();
            return songs.map((s: any) => this.mapSongToTrack(s));
        } catch (error) {
            this.logError(`Error fetching tracks for artist ${artist}`, error);
            return [];
        }
    }

    async getTracksByAlbum(album: string): Promise<Track[]> {
        try {
            const response = await fetchWithAuth(`${this.baseUrl}/album/${encodeURIComponent(album)}`);
            if (!response.ok) return [];
            const songs = await response.json();
            return songs.map((s: any) => this.mapSongToTrack(s));
        } catch (error) {
            this.logError(`Error fetching tracks for album ${album}`, error);
            return [];
        }
    }

    /**
     * Format duration from seconds to MM:SS
     */
    formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

export const musicService = new MusicService();

// Export convenience functions for backward compatibility
export const searchTracks = (query: string, limit: number = 20): Promise<Track[]> => {
    return musicService.searchTracks(query, limit);
};

export const getPopularTracks = (limit: number = 20): Promise<Track[]> => {
    return musicService.getPopularTracks(limit);
};
