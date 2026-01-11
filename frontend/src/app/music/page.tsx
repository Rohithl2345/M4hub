'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import dynamic from 'next/dynamic';

const PremiumAudioPlayer = dynamic(() => import('@/components/PremiumAudioPlayer'), {
    ssr: false,
    loading: () => <div className={styles.playerLoading}>Initialising Premium Player...</div>
});

import styles from './music.module.css';
import playerStyles from '@/components/PremiumAudioPlayer.module.css';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Track, musicService, Playlist } from '@/services/music.service';
import { useToast } from '@/components/ToastProvider';

type FilterType = 'all' | 'favorites' | 'wishlist' | 'playlists';
type CategoryType = 'songs' | 'trending' | 'albums' | 'artists' | 'languages';

export default function MusicPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [cachedTracks, setCachedTracks] = useState<Record<FilterType, Track[]>>({
        all: [],
        favorites: [],
        wishlist: [],
        playlists: []
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [categoriesData, setCategoriesData] = useState<string[]>([]);
    const [subLoading, setSubLoading] = useState(false);
    const [playlistToAddTo, setPlaylistToAddTo] = useState<Track | null>(null);
    const [category, setCategory] = useState<CategoryType>('songs');
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const { showSuccess, showError } = useToast();

    // Load tracks with caching and searching support
    const loadTracksData = async (forceRefresh = false) => {
        setLoading(true);
        try {
            let results: Track[] = [];

            // Reset subcategory if switching top-level category
            if (category !== 'songs' && category !== 'trending' && !selectedSubCategory) {
                setSubLoading(true);
                let data: string[] = [];
                if (category === 'albums') data = await musicService.getAlbums();
                else if (category === 'artists') data = await musicService.getArtists();
                else if (category === 'languages') data = await musicService.getLanguages();
                setCategoriesData(data);
                setSubLoading(false);
                setLoading(false);
                return;
            }

            // 1. Fetch data based on filter or category if not cached
            if (selectedSubCategory) {
                if (category === 'albums') results = await musicService.getTracksByAlbum(selectedSubCategory);
                else if (category === 'artists') results = await musicService.getTracksByArtist(selectedSubCategory);
                else if (category === 'languages') results = await musicService.getTracksByLanguage(selectedSubCategory);
            } else if (!forceRefresh && cachedTracks[filter].length > 0 && category === 'songs' && filter !== 'playlists') {
                results = cachedTracks[filter];
            } else {
                if (filter === 'all') {
                    if (category === 'trending') {
                        results = await musicService.getTrendingTracks();
                    } else {
                        results = await musicService.getPopularTracks(50);
                    }
                } else if (filter === 'favorites') {
                    results = await musicService.getFavorites();
                } else if (filter === 'wishlist') {
                    results = await musicService.getWishlist();
                } else if (filter === 'playlists') {
                    const pls = await musicService.getMyPlaylists();
                    setPlaylists(pls);
                    if (selectedPlaylistId) {
                        const pl = pls.find(p => p.id === selectedPlaylistId);
                        results = pl ? (pl.tracks || []) : [];
                    } else {
                        results = [];
                    }
                }

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

    const handleCategoryClick = (cat: CategoryType) => {
        setCategory(cat);
        setSelectedSubCategory(null);
        if (cat !== 'songs') {
            setFilter('all');
        }
    };

    const handleSubCategoryClick = (subCat: string) => {
        setSelectedSubCategory(subCat);
        setFilter('all');
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        if (!playlistToAddTo) return;
        const pl = await musicService.addSongToPlaylist(playlistId, playlistToAddTo.id);
        if (pl) {
            setPlaylistToAddTo(null);
            showSuccess(`Added to ${pl.name}`);
            // Refresh playlists if we are in playlist filter
            if (filter === 'playlists') {
                loadTracksData(true);
            }
        }
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

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        const pl = await musicService.createPlaylist(newPlaylistName);
        if (pl) {
            setPlaylists(prev => [pl, ...prev]);
            setNewPlaylistName('');
            setIsCreatingPlaylist(false);
            showSuccess(`Created playlist "${pl.name}"`);

            if (playlistToAddTo) {
                await musicService.addSongToPlaylist(pl.id, playlistToAddTo.id);
                showSuccess(`Added song to "${pl.name}"`);
                setPlaylistToAddTo(null);
            }
        } else {
            showError("Failed to create playlist. Name might be taken.");
        }
    };

    const handleDeletePlaylist = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const success = await musicService.deletePlaylist(id);
        if (success) {
            setPlaylists(prev => prev.filter(p => p.id !== id));
            if (selectedPlaylistId === id) setSelectedPlaylistId(null);
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
                        onClick={() => handleCategoryClick('songs')}
                    >
                        <LibraryMusicIcon fontSize="small" />
                        <span>Songs</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'trending' ? styles.categoryActive : ''}`}
                        onClick={() => handleCategoryClick('trending')}
                    >
                        <TrendingUpIcon fontSize="small" />
                        <span>Trending</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'albums' ? styles.categoryActive : ''}`}
                        onClick={() => handleCategoryClick('albums')}
                    >
                        <AlbumIcon fontSize="small" />
                        <span>Albums</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'artists' ? styles.categoryActive : ''}`}
                        onClick={() => handleCategoryClick('artists')}
                    >
                        <PersonIcon fontSize="small" />
                        <span>Artists</span>
                    </button>
                    <button
                        className={`${styles.categoryBtn} ${category === 'languages' ? styles.categoryActive : ''}`}
                        onClick={() => handleCategoryClick('languages')}
                    >
                        <LanguageIcon fontSize="small" />
                        <span>Languages</span>
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
                        onClick={() => { setFilter('all'); setSelectedPlaylistId(null); setSelectedSubCategory(null); }}
                    >
                        <LibraryMusicIcon fontSize="small" />
                        All Songs
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'favorites' ? styles.tabActive : ''}`}
                        onClick={() => { setFilter('favorites'); setSelectedPlaylistId(null); setSelectedSubCategory(null); }}
                    >
                        <FavoriteIcon fontSize="small" />
                        Favorites
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'wishlist' ? styles.tabActive : ''}`}
                        onClick={() => { setFilter('wishlist'); setSelectedPlaylistId(null); setSelectedSubCategory(null); }}
                    >
                        <BookmarkIcon fontSize="small" />
                        Wishlist
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'playlists' ? styles.tabActive : ''}`}
                        onClick={() => { setFilter('playlists'); setSelectedPlaylistId(null); setSelectedSubCategory(null); setCategory('songs'); }}
                    >
                        <QueueMusicIcon fontSize="small" />
                        My Playlists
                    </button>
                </div>

                {/* Tracks List */}
                <div className={styles.section}>
                    {loading || subLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading {category !== 'songs' && !selectedSubCategory ? category : 'songs'}...</p>
                        </div>
                    ) : (category !== 'songs' && category !== 'trending' && !selectedSubCategory) ? (
                        <div className={styles.subCatGrid}>
                            {categoriesData.length === 0 ? (
                                <div className={styles.noResults}>
                                    <AlbumIcon className={styles.emptyStateIcon} />
                                    <h3>No {category} found</h3>
                                    <p>Try refreshing or checking back later.</p>
                                </div>
                            ) : categoriesData.map(item => (
                                <div key={item} className={styles.subCatCard} onClick={() => handleSubCategoryClick(item)}>
                                    <div className={styles.subCatIcon}>
                                        {category === 'albums' ? <AlbumIcon /> :
                                            category === 'artists' ? <PersonIcon /> : <LanguageIcon />}
                                    </div>
                                    <h4>{item}</h4>
                                </div>
                            ))}
                        </div>
                    ) : filter === 'playlists' && !selectedPlaylistId ? (
                        <div className={styles.playlistsGrid}>
                            <div className={styles.createPlaylistCard} onClick={() => setIsCreatingPlaylist(true)}>
                                <div className={styles.plusIcon}>+</div>
                                <span>Create Playlist</span>
                            </div>
                            {playlists.map(pl => (
                                <div key={pl.id} className={styles.playlistCard} onClick={() => {
                                    setSelectedPlaylistId(pl.id);
                                    setTracks(pl.tracks || []);
                                }}>
                                    <div className={styles.playlistArt}>
                                        <QueueMusicIcon style={{ fontSize: '40px', color: '#10b981' }} />
                                    </div>
                                    <div className={styles.playlistMeta}>
                                        <h4>{pl.name}</h4>
                                        <p>{pl.tracks?.length || 0} tracks</p>
                                    </div>
                                    <button className={styles.deletePlBtn} onClick={(e) => handleDeletePlaylist(e, pl.id)}>
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className={styles.noResults}>
                            {filter === 'favorites' ? (
                                <FavoriteIcon className={styles.emptyStateIcon} />
                            ) : filter === 'wishlist' ? (
                                <BookmarkIcon className={styles.emptyStateIcon} />
                            ) : filter === 'playlists' ? (
                                <QueueMusicIcon className={styles.emptyStateIcon} />
                            ) : (
                                <SearchOffIcon className={styles.emptyStateIcon} />
                            )}

                            <h3>
                                {filter === 'favorites' ? 'No Favorites Yet' :
                                    filter === 'wishlist' ? 'Your Wishlist is Empty' :
                                        filter === 'playlists' ? 'Playlist is Empty' :
                                            searchQuery ? 'No Songs Found' : 'No Songs Available'}
                            </h3>
                            <p>
                                {filter === 'favorites' ? 'Mark songs as favorite to see them here.' :
                                    filter === 'wishlist' ? 'Save songs for later to build your collection.' :
                                        filter === 'playlists' ? 'Add some tunes to this playlist!' :
                                            searchQuery ? `We couldn't find any matches for "${searchQuery}".` : 'Explore our library to start listening.'}
                            </p>
                            {(selectedPlaylistId || selectedSubCategory) && (
                                <button onClick={() => { setSelectedPlaylistId(null); setSelectedSubCategory(null); }} className={styles.clearSearchButton}>
                                    Back to {selectedPlaylistId ? 'Playlists' : category}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            {(selectedPlaylistId || selectedSubCategory) && (
                                <div className={styles.listHeader}>
                                    <button className={styles.backBtn} onClick={() => { setSelectedPlaylistId(null); setSelectedSubCategory(null); }}>
                                        <ArrowBackIcon />
                                    </button>
                                    <h3>{selectedPlaylistId ? playlists.find(p => p.id === selectedPlaylistId)?.name : selectedSubCategory}</h3>
                                </div>
                            )}
                            <div className={styles.tracksList}>
                                {tracks.map((track, index) => (
                                    <div
                                        key={track.id}
                                        className={`${styles.trackCard} ${currentTrack?.id === track.id ? styles.trackCardActive : ''}`}
                                        onClick={() => playTrack(track, index)}
                                    >
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
                                            <button
                                                className={styles.actionButton}
                                                onClick={(e) => { e.stopPropagation(); setPlaylistToAddTo(track); }}
                                                title="Add to Playlist"
                                            >
                                                <QueueMusicIcon sx={{ color: '#10b981' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isCreatingPlaylist && (
                    <div className={styles.modalOverlay} onClick={() => setIsCreatingPlaylist(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <h3>Create New Playlist</h3>
                            <input
                                type="text"
                                placeholder="Playlist Name"
                                value={newPlaylistName}
                                onChange={e => setNewPlaylistName(e.target.value)}
                                autoFocus
                            />
                            <div className={styles.modalActions}>
                                <button onClick={() => setIsCreatingPlaylist(false)}>Cancel</button>
                                <button onClick={handleCreatePlaylist} className={styles.primary}>Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {playlistToAddTo && (
                    <div className={playerStyles.drawerOverlay} onClick={() => setPlaylistToAddTo(null)}>
                        <div className={playerStyles.drawer} onClick={e => e.stopPropagation()}>
                            <div className={playerStyles.modalHeader}>
                                <h3>Add to Playlist</h3>
                                <button onClick={() => setPlaylistToAddTo(null)}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className={playerStyles.playlistList}>
                                <button
                                    className={playerStyles.createPlaylistBtn}
                                    onClick={() => setIsCreatingPlaylist(true)}
                                >
                                    <div className={playerStyles.createIcon}>+</div>
                                    <span>Create New Playlist</span>
                                </button>
                                {playlists.length === 0 ? (
                                    <p className={playerStyles.noPlaylists}>You haven't created any playlists yet.</p>
                                ) : (
                                    playlists.map(pl => (
                                        <button
                                            key={pl.id}
                                            className={playerStyles.playlistItem}
                                            onClick={() => handleAddToPlaylist(pl.id)}
                                        >
                                            <div className={playerStyles.playlistIcon}>
                                                <QueueMusicIcon />
                                            </div>
                                            <div className={playerStyles.playlistInfo}>
                                                <span className={playerStyles.playlistName}>{pl.name}</span>
                                                <span className={playerStyles.playlistTracks}>{pl.tracks?.length || 0} songs</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {currentTrack && (
                <PremiumAudioPlayer
                    track={currentTrack}
                    playlist={tracks}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onPlayStateChange={setIsPlaying}
                    onAddToPlaylist={(track) => setPlaylistToAddTo(track)}
                />
            )}
        </DashboardLayout>
    );
}
