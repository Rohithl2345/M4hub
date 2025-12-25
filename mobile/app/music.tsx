import { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MobileAudioPlayer from '@/components/MobileAudioPlayer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { musicStyles as styles } from './_styles/music.styles';
import { musicService, Track } from '@/services/music.service';

export default function MusicScreen() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [filter, setFilter] = useState<'all' | 'favorites' | 'wishlist'>('all');

    const loadTracksData = async () => {
        setLoading(true);
        let results: Track[] = [];
        try {
            if (filter === 'all') {
                results = await musicService.getPopularTracks(500);
            } else if (filter === 'favorites') {
                results = await musicService.getFavorites();
            } else if (filter === 'wishlist') {
                results = await musicService.getWishlist();
            }
            setTracks(results);
        } catch (error) {
            console.error('Error loading tracks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTracksData();
    }, [filter]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadTracksData();
            return;
        }
        setLoading(true);
        const results = await musicService.searchTracks(searchQuery, 100);
        setTracks(results);
        setLoading(false);
    };

    const toggleFavorite = async (track: Track) => {
        const success = await musicService.toggleFavorite(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t
            ));
        }
    };

    const toggleWishlist = async (track: Track) => {
        const success = await musicService.toggleWishlist(track.id);
        if (success) {
            setTracks(prev => prev.map(t =>
                t.id === track.id ? { ...t, isInWishlist: !t.isInWishlist } : t
            ));
        }
    };

    const playTrack = (track: Track, index: number) => {
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
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
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Music',
                    headerShown: true,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Ionicons name="musical-notes" size={64} color="white" />
                    <ThemedText style={styles.headerTitle}>Music Streaming</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Discover and enjoy 500+ tracks</ThemedText>
                </LinearGradient>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search among 500+ songs..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); loadTracksData(); }}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <ThemedText style={styles.searchButtonText}>Search</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity onPress={() => setFilter('all')}>
                        <LinearGradient
                            colors={filter === 'all' ? ['#5433ff', '#20bdff'] : ['#f0f0f0', '#f0f0f0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.tab}
                        >
                            <ThemedText style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>All Songs</ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setFilter('favorites')}>
                        <LinearGradient
                            colors={filter === 'favorites' ? ['#5433ff', '#20bdff'] : ['#f0f0f0', '#f0f0f0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.tab}
                        >
                            <ThemedText style={[styles.tabText, filter === 'favorites' && styles.tabTextActive]}>Favorites</ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setFilter('wishlist')}>
                        <LinearGradient
                            colors={filter === 'wishlist' ? ['#5433ff', '#20bdff'] : ['#f0f0f0', '#f0f0f0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.tab}
                        >
                            <ThemedText style={[styles.tabText, filter === 'wishlist' && styles.tabTextActive]}>Wishlist</ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Tracks */}
                <View style={styles.section}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 32 }} />
                    ) : tracks.length === 0 ? (
                        <ThemedText style={styles.noResults}>
                            {filter === 'favorites' ? 'No favorites yet' :
                                filter === 'wishlist' ? 'Wishlist is empty' : 'No tracks found'}
                        </ThemedText>
                    ) : (
                        tracks.map((track, index) => (
                            <TouchableOpacity
                                key={track.id}
                                style={[
                                    styles.trackCard,
                                    currentTrack?.id === track.id && styles.trackCardActive
                                ]}
                                onPress={() => playTrack(track, index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.trackIconContainer}>
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.trackIcon}
                                    >
                                        <Ionicons name="musical-note" size={24} color="white" />
                                    </LinearGradient>
                                </View>
                                <View style={styles.trackInfo}>
                                    <ThemedText style={styles.trackTitle} numberOfLines={1}>
                                        {track.name}
                                    </ThemedText>
                                    <ThemedText style={styles.trackArtist} numberOfLines={1}>
                                        {track.artist_name}
                                    </ThemedText>
                                </View>
                                <View style={styles.trackActions}>
                                    <TouchableOpacity onPress={() => toggleFavorite(track)}>
                                        <Ionicons
                                            name={track.isFavorite ? "heart" : "heart-outline"}
                                            size={24}
                                            color="#FF2D55"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleWishlist(track)}>
                                        <Ionicons
                                            name={track.isInWishlist ? "bookmark" : "bookmark-outline"}
                                            size={24}
                                            color="#FF9500"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Audio Player */}
            {currentTrack && (
                <MobileAudioPlayer
                    track={currentTrack}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                />
            )}
        </ThemedView>
    );
}
