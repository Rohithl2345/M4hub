import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator, Linking, Alert } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MobileAudioPlayer from '@/components/MobileAudioPlayer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { musicStyles as styles } from '../_styles/music.styles';
import { musicService, Track } from '@/services/music.service';
import { Sidebar } from '@/components/Sidebar';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function MusicScreen() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const theme = useAppTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    useFocusEffect(
        useCallback(() => {
            // Clear error when screen comes into focus
            return () => {
                setSearchError(null);
            };
        }, [])
    );

    const loadPopularTracks = async () => {
        setLoading(true);
        setError(null);
        try {
            const popularTracks = await musicService.getPopularTracks(20);
            setTracks(popularTracks);
        } catch (error) {
            console.error("Error loading music:", error);
            setError("Failed to load music. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPopularTracks();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchError('Please enter a song or artist name');
            return;
        }
        setSearchError(null);
        setLoading(true);
        setError(null);
        try {
            const results = await musicService.searchTracks(searchQuery, 20);
            setTracks(results);
        } catch (error) {
            console.error("Error searching tracks:", error);
            setError("Search failed. Please try again.");
        } finally {
            setLoading(false);
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
                    headerTitle: '', // Removed headerTitle as headerLeft now contains branding
                    headerLeft: () => (
                        <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ padding: 8 }}>
                                <Ionicons name="arrow-back" size={24} color="#0f172a" />
                            </TouchableOpacity>
                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="musical-notes" size={18} color="white" />
                            </View>
                            <ThemedText style={{ fontWeight: '900', color: '#0f172a', fontSize: 16, letterSpacing: -0.5 }}>Music</ThemedText>
                        </View>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ marginRight: 16 }}>
                            <Ionicons name="menu" size={28} color="#0f172a" />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                    headerTitleStyle: {
                        fontWeight: '800',
                        color: '#0f172a',
                        fontSize: 18,
                    },
                    headerShadowVisible: false,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Professional Header (Emerald Sync) */}
                <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 }}>
                    <LinearGradient
                        colors={['#059669', '#10b981']}
                        style={{ padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}
                    >
                        <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="musical-notes" size={30} color="white" />
                        </View>
                        <View>
                            <ThemedText style={{ fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>Music Studio</ThemedText>
                            <ThemedText style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Stream and discover 600K+ tracks</ThemedText>
                        </View>
                    </LinearGradient>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBox, searchError ? { borderColor: '#ef4444', borderWidth: 1 } : {}]}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for songs, artists..."
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                if (text.trim()) setSearchError(null);
                            }}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); loadPopularTracks(); setSearchError(null); }}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {searchError && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 8, borderRadius: 8, marginTop: 8 }}>
                            <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                            <ThemedText style={{ color: '#b91c1c', fontSize: 12, fontWeight: '500' }}>
                                {searchError}
                            </ThemedText>
                        </View>
                    )}
                    <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <ThemedText style={styles.searchButtonText}>Search</ThemedText>
                    </TouchableOpacity>
                </View>

                {error ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50, padding: 20 }}>
                        <Ionicons name="cloud-offline-outline" size={64} color="#ef4444" />
                        <ThemedText style={{ fontSize: 18, marginTop: 16, color: '#ef4444' }}>{error}</ThemedText>
                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                paddingVertical: 10,
                                paddingHorizontal: 24,
                                backgroundColor: '#667eea',
                                borderRadius: 20
                            }}
                            onPress={searchQuery ? handleSearch : loadPopularTracks}
                        >
                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Try Again</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Ionicons name="play-circle-outline" size={32} color="#667eea" />
                                <ThemedText style={styles.statValue}>{tracks.length}</ThemedText>
                                <ThemedText style={styles.statLabel}>Tracks</ThemedText>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="list" size={32} color="#667eea" />
                                <ThemedText style={styles.statValue}>Free</ThemedText>
                                <ThemedText style={styles.statLabel}>Music</ThemedText>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="library" size={32} color="#667eea" />
                                <ThemedText style={styles.statValue}>600K+</ThemedText>
                                <ThemedText style={styles.statLabel}>Library</ThemedText>
                            </View>
                        </View>

                        {/* Tracks */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>
                                {searchQuery ? 'Search Results' : 'Popular Tracks'}
                            </ThemedText>
                            {loading ? (
                                <View style={{ marginTop: 16 }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <View key={i} style={[styles.trackCard, { paddingVertical: 12 }]}>
                                            <Skeleton width={48} height={48} borderRadius={12} style={{ marginRight: 16 }} />
                                            <View style={{ flex: 1 }}>
                                                <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                                                <Skeleton width="40%" height={12} />
                                            </View>
                                            <Skeleton width={44} height={44} borderRadius={22} />
                                        </View>
                                    ))}
                                </View>
                            ) : tracks.length === 0 ? (
                                <ThemedText style={styles.noResults}>No tracks found</ThemedText>
                            ) : (
                                tracks.map((track, index) => (
                                    <TouchableOpacity
                                        key={track.id}
                                        style={[
                                            styles.trackCard,
                                            currentTrackIndex === index && styles.trackCardActive
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
                                            <ThemedText style={styles.trackDuration}>
                                                {musicService.formatDuration(track.duration)}
                                            </ThemedText>
                                            {track.spotifyUrl && (
                                                <TouchableOpacity
                                                    onPress={() => musicService.openInSpotify(track.spotifyUrl!)}
                                                    style={styles.spotifyButton}
                                                >
                                                    <Ionicons name="open-outline" size={20} color="#1DB954" />
                                                </TouchableOpacity>
                                            )}
                                            <Ionicons
                                                name={currentTrackIndex === index && currentTrack ? "pause-circle" : "play-circle"}
                                                size={44}
                                                color="#667eea"
                                                style={styles.playButton}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Audio Player */}
            {currentTrack && (
                <MobileAudioPlayer
                    track={currentTrack}
                    onNext={currentTrackIndex < tracks.length - 1 ? handleNext : undefined}
                    onPrevious={currentTrackIndex > 0 ? handlePrevious : undefined}
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </ThemedView>
    );
}
