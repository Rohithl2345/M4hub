import { Linking } from 'react-native';
import { APP_CONFIG, API_ENDPOINTS } from '../constants';
import { storageService } from './storage.service';

export interface Track {
    id: string;
    name: string;
    artist_name: string;
    album_name: string;
    duration: number;
    image: string;
    album_image?: string;
    audio: string;
    audiodownload: string;
    genre?: string;
    isFavorite?: boolean;
    isInWishlist?: boolean;
    spotifyUrl?: string;
}

class MusicService {
    private baseUrl = APP_CONFIG.API_URL;

    private mapSongToTrack = (song: any): Track => {
        let audioUrl = song.audioUrl;
        // Fix for Android Emulator accessing localhost
        if (audioUrl && audioUrl.includes('http://localhost:8080')) {
            audioUrl = audioUrl.replace('http://localhost:8080', this.baseUrl);
        }

        return {
            id: song.id.toString(),
            name: song.title,
            artist_name: song.artist,
            album_name: song.album || 'Unknown Album',
            duration: song.duration,
            audio: audioUrl,
            audiodownload: audioUrl,
            image: song.imageUrl || '',
            album_image: song.imageUrl || '',
            genre: song.genre,
            isFavorite: song.isFavorite || false,
            isInWishlist: song.isInWishlist || false,
            spotifyUrl: song.spotifyUrl
        };
    }

    /**
     * Open track in Spotify app or web
     */
    async openInSpotify(url: string) {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                console.error("Don't know how to open URI: " + url);
            }
        } catch (error) {
            console.error('Error opening Spotify:', error);
        }
    }

    private async getHeaders() {
        const token = await storageService.getAuthToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    /**
     * Get popular/trending tracks from backend
     */
    async getPopularTracks(limit: number = 20): Promise<Track[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.SONGS}`, {
                headers
            });

            if (!response.ok) {
                console.warn('Failed to fetch popular tracks:', response.status);
                return [];
            }

            const text = await response.text();
            if (!text) return [];

            const songs = JSON.parse(text);
            return songs.map(this.mapSongToTrack).slice(0, limit);
        } catch (error) {
            console.error('Error fetching popular tracks from backend:', error);
            return [];
        }
    }

    /**
     * Search tracks via backend
     */
    async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
        try {
            if (!query.trim()) {
                return this.getPopularTracks(limit);
            }

            const headers = await this.getHeaders();
            const response = await fetch(
                `${this.baseUrl}${API_ENDPOINTS.MUSIC.SEARCH}?q=${encodeURIComponent(query)}`,
                { headers }
            );

            if (!response.ok) {
                console.warn('Failed to search tracks:', response.status);
                return [];
            }

            const text = await response.text();
            if (!text) return [];

            const songs = JSON.parse(text);
            return songs.map(this.mapSongToTrack).slice(0, limit);
        } catch (error) {
            console.error('Error searching tracks via backend:', error);
            return [];
        }
    }

    /**
     * Toggle Favorite
     */
    async toggleFavorite(songId: string): Promise<boolean> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.FAVORITES_TOGGLE}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ songId: parseInt(songId) })
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    }

    /**
     * Get User Favorites
     */
    async getFavorites(): Promise<Track[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.FAVORITES}`, {
                headers
            });
            const songs = await response.json();
            return songs.map((s: any) => ({ ...this.mapSongToTrack(s), isFavorite: true }));
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    }

    /**
     * Toggle Wishlist
     */
    async toggleWishlist(songId: string): Promise<boolean> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.WISHLIST_TOGGLE}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ songId: parseInt(songId) })
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            return false;
        }
    }

    /**
     * Get User Wishlist
     */
    async getWishlist(): Promise<Track[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.WISHLIST}`, {
                headers
            });
            const songs = await response.json();
            return songs.map((s: any) => ({ ...this.mapSongToTrack(s), isInWishlist: true }));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            return [];
        }
    }

    /**
     * Get Trending Tracks
     */
    async getTrendingTracks(): Promise<Track[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.TRENDING}`, {
                headers
            });
            if (!response.ok) return [];
            const songs = await response.json();
            return songs.map((s: any) => this.mapSongToTrack(s));
        } catch (error) {
            console.error('Error fetching trending tracks:', error);
            return [];
        }
    }

    /**
     * Get Albums
     */
    async getAlbums(): Promise<string[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.ALBUMS}`, {
                headers
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching albums:', error);
            return [];
        }
    }

    /**
     * Get Artists
     */
    async getArtists(): Promise<string[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.MUSIC.ARTISTS}`, {
                headers
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching artists:', error);
            return [];
        }
    }

    formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

export const musicService = new MusicService();
