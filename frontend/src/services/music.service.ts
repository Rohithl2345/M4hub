import { env } from '@/utils/env';
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
}

class MusicService {
    private baseUrl = BACKEND_API_BASE;

    private mapSongToTrack(song: any): Track {
        return {
            id: song.id.toString(),
            name: song.title,
            artist_name: song.artist,
            album_name: song.album || 'Unknown Album',
            duration: song.duration,
            audio: song.audioUrl,
            audiodownload: song.audioUrl,
            image: song.imageUrl || '',
            album_image: song.imageUrl || '',
            genre: song.genre,
            isFavorite: song.isFavorite || false,
            isInWishlist: song.isInWishlist || false
        };
    }

    private getHeaders() {
        const token = sessionStorage.getItem('authToken');
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
            const response = await fetch(`${this.baseUrl}/songs`);
            const songs = await response.json();
            return songs.map(this.mapSongToTrack).slice(0, limit);
        } catch (error) {
            console.error('Error fetching songs from backend:', error);
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

            const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
            const songs = await response.json();
            return songs.map(this.mapSongToTrack).slice(0, limit);
        } catch (error) {
            console.error('Error searching tracks from backend:', error);
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
            console.error('Error toggling favorite:', error);
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
            console.error('Error fetching favorites:', error);
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
            console.error('Error toggling wishlist:', error);
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
            console.error('Error fetching wishlist:', error);
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
