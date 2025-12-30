'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';

const PremiumAudioPlayer = dynamic(() => import('@/components/PremiumAudioPlayer'), {
    ssr: false,
    loading: () => <div className={styles.playerLoading}>Initialising Premium Player...</div>
});

import styles from './music.module.css';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AlbumIcon from '@mui/icons-material/Album';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import { Track, musicService } from '@/services/music.service';

type FilterType = 'all' | 'favorites' | 'wishlist';
type CategoryType = 'songs' | 'trending' | 'albums' | 'artists' | 'languages';

export default function MusicPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [cachedTracks, setCachedTracks] = useState<Record<FilterType, Track[]>>({
        all: [],
        favorites: [],
        wishlist: []
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [filter, setFilter] = useState<FilterType>('all');
    const [category, setCategory] = useState<CategoryType>('songs');
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Load tracks with caching and searching support
    const loadTracksData = async (forceRefresh = false) => {
        setLoading(true);
        try {
            let results: Track[] = [];

            // 1. Fetch data based on filter or category if not cached
            // For now, only 'songs' and 'trending' return Track[] directly
            if (!forceRefresh && cachedTracks[filter].length > 0 && category === 'songs') {
                results = cachedTracks[filter];
            } else {
                if (filter === 'all') {
                    if (category === 'trending') {
                        results = await musicService.getTrendingTracks();
                    } else {
                        results = await musicService.getPopularTracks(500);
                    }
                } else if (filter === 'favorites') {
                    results = await musicService.getFavorites();
                } else if (filter === 'wishlist') {
                    results = await musicService.getWishlist();
                }

                // Cache 'songs' category only for simplicity
                if (category === 'songs') {
                    setCachedTracks(prev => ({
                        ...prev,
                        [filter]: results
                    }));
                }
            }

            // 2. Apply search query filtering if present
            if (searchQuery.trim().length >= 3) {
                // If we are in 'all' tab, we can use global search for better results
                if (filter === 'all') {
                    const searchResults = await musicService.searchTracks(searchQuery, 100);
                    setTracks(searchResults);
                } else {
                    // Filter within favorites/wishlist client-side
                    const query = searchQuery.toLowerCase().trim();
                    const filtered = results.filter(track =>
                        track.name.toLowerCase().includes(query) ||
                        track.artist_name.toLowerCase().includes(query) ||
                        (track.album_name && track.album_name.toLowerCase().includes(query))
                    );
                    setTracks(filtered);
                }
            } else {
                setTracks(results);
            }
        } catch (error) {
            console.error('Error loading tracks:', error);
            setTracks([]);
        } finally {
            setLoading(false);
        }
    };

    // Effect for handling filter OR search OR category changes
    useEffect(() => {
        loadTracksData();
    }, [filter, searchQuery, category]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The useEffect will handle the search since searchQuery state is updated
        if (searchQuery.trim().length > 0 && searchQuery.trim().length < 3) {
            setSearchError('Please enter at least 3 characters');
        } else {
            setSearchError(null);
            loadTracksData(true); // Force refresh context on submit
        }
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        setSearchError(null);
    };

    const playTrack = (track: Track, index: number) => {
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const toggleFavorite = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();
        const success = await musicService.toggleFavorite(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t
            ));

            setCachedTracks(prev => ({
                ...prev,
                all: prev.all.map(t => t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t)
            }));

            if (filter === 'favorites' && track.isFavorite) {
                setTracks(prev => prev.filter(t => t.id !== track.id));
                setCachedTracks(prev => ({
                    ...prev,
                    favorites: prev.favorites.filter(t => t.id !== track.id)
                }));
            }
        }
    };

    const toggleWishlist = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();
        const success = await musicService.toggleWishlist(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isInWishlist: !t.isInWishlist } : t
            ));

            setCachedTracks(prev => ({
                ...prev,
                all: prev.all.map(t => t.id === track.id ? { ...t, isInWishlist: !t.isInWishlist } : t)
            }));

            if (filter === 'wishlist' && track.isInWishlist) {
                setTracks(prev => prev.filter(t => t.id !== track.id));
                setCachedTracks(prev => ({
                    ...prev,
                    wishlist: prev.wishlist.filter(t => t.id !== track.id)
                }));
            }
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

    return (
        <DashboardLayout title="Music">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <MusicNoteIcon className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Music Studio</h1>
                        <p className={styles.subtitle}>600K+ tracks • Discover and enjoy your favorites</p>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchContainer}>
                        <SearchIcon className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search songs, artists, albums..."
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

                {/* Categories */}
                <div className={styles.categories}>
                    <button
                        className={`${styles.categoryBtn} ${category === 'songs' ? styles.categoryActive : ''}`}
                        onClick={() => setCategory('songs')}
                    >
                        <LibraryMusicIcon fontSize="small" />
                        <span>Songs</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'trending' ? styles.categoryActive : ''}`}
                        onClick={() => setCategory('trending')}
                    >
                        <TrendingUpIcon fontSize="small" />
                        <span>Trending</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'albums' ? styles.categoryActive : ''}`}
                        onClick={() => setCategory('albums')}
                    >
                        <AlbumIcon fontSize="small" />
                        <span>Albums</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'artists' ? styles.categoryActive : ''}`}
                        onClick={() => setCategory('artists')}
                    >
                        <PersonIcon fontSize="small" />
                        <span>Artists</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'languages' ? styles.categoryActive : ''}`}
                        onClick={() => setCategory('languages')}
                    >
                        <LanguageIcon fontSize="small" />
                        <span>Languages</span>
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <LibraryMusicIcon fontSize="small" />
                        All Songs
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'favorites' ? styles.tabActive : ''}`}
                        onClick={() => setFilter('favorites')}
                    >
                        <FavoriteIcon fontSize="small" />
                        Favorites
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'wishlist' ? styles.tabActive : ''}`}
                        onClick={() => setFilter('wishlist')}
                    >
                        <BookmarkIcon fontSize="small" />
                        Wishlist
                    </button>
                </div>

                {/* Tracks List */}
                <div className={styles.section}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading songs...</p>
                        </div>
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
                                <button onClick={handleResetSearch} className={styles.clearSearchButton}>
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
                                    {/* Album Icon - Green Gradient with Music Note (matching mobile) */}
                                    <div className={styles.trackIconContainer}>
                                        <div className={styles.trackIcon}>
                                            <MusicNoteIcon style={{ fontSize: '24px', color: 'white' }} />
                                        </div>
                                    </div>

                                    <div className={styles.trackInfo}>
                                        <h4>{track.name}</h4>
                                        <p>{track.artist_name}</p>
                                        {track.album_name && track.album_name !== 'Unknown Album' && (
                                            <span className={styles.albumName}>{track.album_name}</span>
                                        )}
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
                                            title="Play"
                                        >
                                            {currentTrack?.id === track.id && isPlaying ? (
                                                <PauseCircleOutlineIcon />
                                            ) : (
                                                <PlayCircleOutlineIcon />
                                            )}
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${track.isFavorite ? styles.favoriteActive : ''}`}
                                            onClick={(e) => toggleFavorite(e, track)}
                                            title={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            {track.isFavorite ? (
                                                <FavoriteIcon sx={{ color: '#ef4444' }} />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ color: '#94a3b8' }} />
                                            )}
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${track.isInWishlist ? styles.wishlistActive : ''}`}
                                            onClick={(e) => toggleWishlist(e, track)}
                                            title={track.isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                        >
                                            {track.isInWishlist ? (
                                                <BookmarkIcon sx={{ color: '#f59e0b' }} />
                                            ) : (
                                                <BookmarkBorderIcon sx={{ color: '#94a3b8' }} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {currentTrack && (
                <PremiumAudioPlayer
                    track={currentTrack}
                    playlist={tracks}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onPlayStateChange={setIsPlaying}
                />
            )}
        </DashboardLayout>
    );
}
