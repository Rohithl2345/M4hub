import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity, TextInput, Text, FlatList, RefreshControl } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubHeaderBackground } from '@/components/HubHeaderBackground';
import { musicService, Track } from '@/services/music.service';
import { useAppDispatch } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { useAppTheme } from '@/hooks/use-app-theme';
import MobilePremiumAudioPlayer from '../../components/MobilePremiumAudioPlayer';

type FilterType = 'all' | 'favorites' | 'wishlist';
type CategoryType = 'songs' | 'trending' | 'albums' | 'artists' | 'languages';

export default function MusicScreen() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [filter, setFilter] = useState<FilterType>('all');
    const [category, setCategory] = useState<CategoryType>('songs');
    const [isPlaying, setIsPlaying] = useState(false);
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    const loadTracksData = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        try {
            let results: Track[] = [];

            // 1. Fetch based on filter and category
            if (filter === 'all') {
                if (category === 'trending') {
                    results = await musicService.getTrendingTracks();
                } else {
                    results = await musicService.getPopularTracks(100);
                }
            } else if (filter === 'favorites') {
                results = await musicService.getFavorites();
            } else if (filter === 'wishlist') {
                results = await musicService.getWishlist();
            }

            // 2. Apply search logic
            if (searchQuery.trim().length >= 3) {
                if (filter === 'all') {
                    // Global search
                    const searchResults = await musicService.searchTracks(searchQuery, 100);
                    setTracks(searchResults);
                } else {
                    // Local filtering within favorites/wishlist
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
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, category, searchQuery]);

    useEffect(() => {
        loadTracksData();
    }, [filter, category, searchQuery]);

    useFocusEffect(
        useCallback(() => {
            // Re-fetch on focus to ensure data is fresh
            loadTracksData();
        }, [loadTracksData])
    );

    const handleSearch = () => {
        loadTracksData(true);
    };

    const playTrack = (track: Track, index: number) => {
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const toggleFavorite = async (track: Track) => {
        const success = await musicService.toggleFavorite(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t
            ));
            if (filter === 'favorites' && track.isFavorite) {
                setTracks(prev => prev.filter(t => t.id !== track.id));
            }
        }
    };

    const toggleWishlist = async (track: Track) => {
        const success = await musicService.toggleWishlist(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isInWishlist: !t.isInWishlist } : t
            ));
            if (filter === 'wishlist' && track.isInWishlist) {
                setTracks(prev => prev.filter(t => t.id !== track.id));
            }
        }
    };

    const handleNext = () => {
        if (currentTrackIndex < tracks.length - 1) {
            playTrack(tracks[currentTrackIndex + 1], currentTrackIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentTrackIndex > 0) {
            playTrack(tracks[currentTrackIndex - 1], currentTrackIndex - 1);
        }
    };

    const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
        <TouchableOpacity
            onPress={() => playTrack(item, index)}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: currentTrack?.id === item.id
                    ? (isDark ? '#1e3a2e' : '#f0fdf4')
                    : (isDark ? '#1e293b' : '#ffffff'),
                padding: 12,
                marginHorizontal: 16,
                marginVertical: 4,
                borderRadius: 12,
                borderWidth: currentTrack?.id === item.id ? 1 : 0,
                borderColor: '#10b981',
            }}
        >
            {/* Green Gradient Icon */}
            <LinearGradient
                colors={['#10b981', '#059669']}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                }}
            >
                <Ionicons name="musical-note" size={24} color="white" />
            </LinearGradient>

            {/* Track Info */}
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: isDark ? '#f8fafc' : '#1e293b',
                        marginBottom: 4,
                    }}
                >
                    {item.name}
                </Text>
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: 13,
                        color: isDark ? '#94a3b8' : '#64748b',
                    }}
                >
                    {item.artist_name}
                </Text>
            </View>

            {/* Duration */}
            <Text
                style={{
                    fontSize: 12,
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginRight: 8,
                    minWidth: 40,
                    textAlign: 'right',
                }}
            >
                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
            </Text>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                    <Ionicons
                        name={item.isFavorite ? 'heart' : 'heart-outline'}
                        size={22}
                        color={item.isFavorite ? '#ef4444' : '#94a3b8'}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleWishlist(item)}>
                    <Ionicons
                        name={item.isInWishlist ? 'bookmark' : 'bookmark-outline'}
                        size={22}
                        color={item.isInWishlist ? '#f59e0b' : '#94a3b8'}
                    />
                </TouchableOpacity>
                <Ionicons
                    name={currentTrack?.id === item.id && isPlaying ? 'pause-circle' : 'play-circle'}
                    size={36}
                    color="#10b981"
                />
            </View>
        </TouchableOpacity>
    );

    const categories: { key: CategoryType; icon: string; label: string }[] = [
        { key: 'songs', icon: 'musical-notes', label: 'Songs' },
        { key: 'trending', icon: 'trending-up', label: 'Trending' },
        { key: 'albums', icon: 'albums', label: 'Albums' },
        { key: 'artists', icon: 'person', label: 'Artists' },
        { key: 'languages', icon: 'language', label: 'Languages' },
    ];

    const filters: { key: FilterType; icon: string; label: string }[] = [
        { key: 'all', icon: 'library', label: 'All Songs' },
        { key: 'favorites', icon: 'heart', label: 'Favorites' },
        { key: 'wishlist', icon: 'bookmark', label: 'Wishlist' },
    ];

    return (
        <ThemedView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: () => (
                        <View style={{ gap: 2 }}>
                            <Text style={{ fontWeight: '900', fontSize: 16, letterSpacing: -0.5, color: '#ffffff' }}>
                                Music Studio
                            </Text>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                                600K+ tracks available
                            </Text>
                        </View>
                    ),
                    headerBackground: () => (
                        <HubHeaderBackground colors={['#064e3b', '#065f46']} icon="musical-notes" />
                    ),
                    headerTintColor: '#ffffff',
                    headerTitleAlign: 'left',
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => dispatch(setSidebarOpen(true))}
                            style={{ marginLeft: 16, marginRight: 8 }}
                        >
                            <View style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Ionicons name="menu" size={22} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => loadTracksData(true)} style={{ marginRight: 16 }}>
                            <View style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Ionicons name="refresh" size={18} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={{ flex: 1 }}>
                {/* Header Controls Container */}
                <View style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', zIndex: 10 }}>
                    {/* Search Bar */}
                    <View style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                            padding: 10,
                            borderRadius: 12,
                            gap: 8,
                        }}>
                            <Ionicons name="search" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontSize: 14,
                                    color: isDark ? '#f8fafc' : '#1e293b',
                                    padding: 0,
                                }}
                                placeholder="Search songs, artists..."
                                placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); loadTracksData(); }}>
                                    <Ionicons name="close-circle" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Categories - Horizontal Scroll */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
                        style={{ maxHeight: 60 }}
                    >
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.key}
                                onPress={() => setCategory(cat.key)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: category === cat.key
                                        ? '#10b981'
                                        : (isDark ? '#1e293b' : '#f1f5f9'),
                                    borderWidth: 1,
                                    borderColor: category === cat.key ? '#10b981' : (isDark ? '#334155' : '#e2e8f0'),
                                }}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={16}
                                    color={category === cat.key ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')}
                                />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    color: category === cat.key ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                }}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Filters - Horizontal Scroll */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
                        style={{ maxHeight: 50 }}
                    >
                        {filters.map((f) => (
                            <TouchableOpacity
                                key={f.key}
                                onPress={() => setFilter(f.key)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: filter === f.key
                                        ? '#10b981'
                                        : (isDark ? '#1e293b' : '#ffffff'),
                                    borderWidth: 1,
                                    borderColor: filter === f.key ? '#10b981' : (isDark ? '#334155' : '#e2e8f0'),
                                }}
                            >
                                <Ionicons
                                    name={f.icon as any}
                                    size={14}
                                    color={filter === f.key ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')}
                                />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    color: filter === f.key ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                }}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tracks List */}
                <FlatList
                    data={tracks}
                    renderItem={renderTrackItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        paddingBottom: currentTrack ? 140 : 20,
                        paddingTop: 8
                    }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTracksData(); }} />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                            <Ionicons name="musical-notes-outline" size={64} color="#cbd5e1" />
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: isDark ? '#94a3b8' : '#64748b',
                                marginTop: 16,
                            }}>
                                {filter === 'favorites' ? 'No Favorites Yet' :
                                    filter === 'wishlist' ? 'Your Wishlist is Empty' :
                                        'No Songs Found'}
                            </Text>
                        </View>
                    }
                />
            </View>

            {/* Premium Audio Player */}
            {currentTrack && (
                <MobilePremiumAudioPlayer
                    track={currentTrack}
                    playlist={tracks}
                    onNext={currentTrackIndex < tracks.length - 1 ? handleNext : undefined}
                    onPrevious={currentTrackIndex > 0 ? handlePrevious : undefined}
                    onPlayStateChange={setIsPlaying}
                />
            )}
        </ThemedView>
    );
}
