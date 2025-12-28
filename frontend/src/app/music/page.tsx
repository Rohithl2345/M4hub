'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import AudioPlayer from '@/components/AudioPlayer';

import styles from './music.module.css';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import QueueMusicIcon from '@mui/icons-material/QueueMusic'; // For favorites
import { Track, musicService } from '@/services/music.service';

type FilterType = 'all' | 'favorites' | 'wishlist';

export default function MusicPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [filter, setFilter] = useState<FilterType>('all');

    const [searchError, setSearchError] = useState<string | null>(null);

    // Clear error on mount/unmount to prevent persistence across navigation
    useEffect(() => {
        setSearchError(null);
        return () => setSearchError(null);
    }, []);

    const loadTracks = async () => {
        setLoading(true);
        let results: Track[] = [];

        if (filter === 'all') {
            results = await musicService.getPopularTracks(500);
        } else if (filter === 'favorites') {
            results = await musicService.getFavorites();
        } else if (filter === 'wishlist') {
            results = await musicService.getWishlist();
        }

        setTracks(results);
        setLoading(false);
    };

    useEffect(() => {
        loadTracks();
        setSearchError(null); // Clear error when filter changes
    }, [filter]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchError('Please enter a song or artist name');
            return;
        }
        setSearchError(null);
        setLoading(true);
        const results = await musicService.searchTracks(searchQuery, 100);
        setTracks(results);
        setLoading(false);
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        setSearchError(null);
        loadTracks();
    };

    const playTrack = (track: Track, index: number) => {
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
    };

    const toggleFavorite = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();
        const success = await musicService.toggleFavorite(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t
            ));
        }
    };

    const toggleWishlist = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();
        const success = await musicService.toggleWishlist(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isInWishlist: !t.isInWishlist } : t
            ));
        }
    };

    const handleNext = () => {
        if (currentTrackIndex < tracks.length - 1) {
            const nextIndex = currentTrackIndex + 1;
            playTrack(tracks[nextIndex], nextIndex);
        }
    };

    const handlePrevious = () => {
        if (currentTrackIndex > 0) {
            const prevIndex = currentTrackIndex - 1;
            playTrack(tracks[prevIndex], prevIndex);
        }
    };

    // ... (rest of component code until render)

    return (
        <DashboardLayout title="Music">
            <div className={styles.container}>
                <div className={styles.header}>
                    <MusicNoteIcon className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Music Streaming</h1>
                        <p className={styles.subtitle}>Discover and enjoy your favorite tracks</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchContainer}>
                        <SearchIcon className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search among 500+ songs..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.trim()) setSearchError(null);
                            }}
                            className={`${styles.searchInput} ${searchError ? styles.inputError : ''}`}
                        />
                        {searchQuery && (
                            <button type="button" onClick={handleResetSearch} className={styles.resetButton}>
                                <CloseIcon fontSize="small" />
                            </button>
                        )}
                    </div>
                </form>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Songs
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'favorites' ? styles.tabActive : ''}`}
                        onClick={() => setFilter('favorites')}
                    >
                        Favorites
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'wishlist' ? styles.tabActive : ''}`}
                        onClick={() => setFilter('wishlist')}
                    >
                        Wishlist
                    </button>
                </div>

                <div className={styles.section}>
                    {loading ? (
                        <div className={styles.loading}>Loading songs...</div>
                    ) : tracks.length === 0 ? (
                        <div className={styles.noResults}>
                            {filter === 'favorites' ? (
                                <QueueMusicIcon className={styles.emptyStateIcon} />
                            ) : filter === 'wishlist' ? (
                                <LibraryMusicIcon className={styles.emptyStateIcon} />
                            ) : (
                                <SearchOffIcon className={styles.emptyStateIcon} />
                            )}

                            <h3>
                                {filter === 'favorites' ? 'No Favorites Yet' :
                                    filter === 'wishlist' ? 'Your Wishlist is Empty' :
                                        searchQuery ? 'No Songs Found' : 'No Songs Available'}
                            </h3>
                            <p>
                                {filter === 'favorites' ? 'Mark songs as favorite to see them here.' :
                                    filter === 'wishlist' ? 'Save songs for later to build your collection.' :
                                        searchQuery ? `We couldn't find any matches for "${searchQuery}".` : 'Explore our library to start listening.'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={handleResetSearch}
                                    style={{
                                        marginTop: '24px',
                                        padding: '12px 32px',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.tracksList}>
                            {tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className={`${styles.trackCard} ${currentTrack?.id === track.id ? styles.trackCardActive : ''}`}
                                    onClick={() => playTrack(track, index)}
                                >
                                    <div className={styles.trackIcon}>
                                        {track.album_image ? (
                                            <Image src={track.album_image} alt={track.name} width={56} height={56} className={styles.trackImage} unoptimized />
                                        ) : (
                                            <MusicNoteIcon style={{ fontSize: '28px' }} />
                                        )}
                                    </div>
                                    <div className={styles.trackInfo}>
                                        <h4>{track.name}</h4>
                                        <p>{track.artist_name}</p>
                                    </div>
                                    <div className={styles.trackDuration}>
                                        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                                    </div>
                                    <div className={styles.trackActions}>
                                        <button
                                            className={styles.playButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playTrack(track, index);
                                            }}
                                        >
                                            <PlayCircleOutlineIcon />
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${track.isFavorite ? styles.favoriteButtonActive : ''}`}
                                            onClick={(e) => toggleFavorite(e, track)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            {track.isFavorite ? <FavoriteIcon sx={{ color: '#ef4444' }} /> : <FavoriteBorderIcon sx={{ color: '#94a3b8' }} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {currentTrack && (
                <AudioPlayer
                    track={currentTrack}
                    playlist={tracks}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                />
            )}
        </DashboardLayout>
    );
}
