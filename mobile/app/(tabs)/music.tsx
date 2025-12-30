import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator, Linking, Alert, Text, StyleSheet } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MobileAudioPlayer from '@/components/MobileAudioPlayer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubHeaderBackground } from '@/components/HubHeaderBackground';
import { Skeleton } from '@/components/ui/Skeleton';
import { musicStyles as styles } from '../_styles/music.styles';
import { musicService, Track } from '@/services/music.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function MusicScreen() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    const loadPopularTracks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const popularTracks = await musicService.getPopularTracks(20);
            setTracks(popularTracks);
        } catch (error: any) {
            console.error("Error loading music:", error);
            setError("Failed to load music. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadPopularTracks();

            return () => {
                setSearchError(null);
            };
        }, [loadPopularTracks])
    );

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
                    headerShown: true,
                    headerTitle: () => (
                        <View style={{ gap: 2 }}>
                            <Text style={{ fontWeight: '900', fontSize: 16, letterSpacing: -0.5, color: '#ffffff' }}>Music Studio</Text>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>600K+ tracks available</Text>
                        </View>
                    ),
                    headerBackground: () => (
                        <HubHeaderBackground
                            colors={['#064e3b', '#065f46']}
                            icon="musical-notes"
                        />
                    ),
                    headerTintColor: '#ffffff',
                    headerTitleAlign: 'left',
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => dispatch(setSidebarOpen(true))}
                            style={{ marginLeft: 16, marginRight: 8 }}
                        >
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="menu" size={22} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={loadPopularTracks} style={{ marginRight: 16 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="refresh" size={18} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Search Bar - More Compact */}
                <View style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', padding: 12, borderRadius: 12, gap: 10 }}>
                        <Ionicons name="search" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                        <TextInput
                            style={{ flex: 1, fontSize: 14, color: isDark ? '#f8fafc' : '#1e293b', padding: 0 }}
                            placeholder="Search songs or artists..."
                            placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
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
                                backgroundColor: '#10b981',
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
                            <View style={[styles.statCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
                                <Ionicons name="play-circle-outline" size={32} color="#10b981" />
                                <ThemedText style={[styles.statValue, isDark && { color: '#f8fafc' }]}>{tracks.length}</ThemedText>
                                <ThemedText style={styles.statLabel}>Tracks</ThemedText>
                            </View>
                            <View style={[styles.statCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
                                <Ionicons name="list" size={32} color="#10b981" />
                                <ThemedText style={[styles.statValue, isDark && { color: '#f8fafc' }]}>Free</ThemedText>
                                <ThemedText style={styles.statLabel}>Music</ThemedText>
                            </View>
                            <View style={[styles.statCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
                                <Ionicons name="library" size={32} color="#10b981" />
                                <ThemedText style={[styles.statValue, isDark && { color: '#f8fafc' }]}>600K+</ThemedText>
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
                                            isDark && { backgroundColor: '#1e293b', borderColor: '#334155' },
                                            currentTrackIndex === index && styles.trackCardActive
                                        ]}
                                        onPress={() => playTrack(track, index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.trackIconContainer}>
                                            <LinearGradient
                                                colors={['#10b981', '#059669']}
                                                style={styles.trackIcon}
                                            >
                                                <Ionicons name="musical-note" size={24} color="white" />
                                            </LinearGradient>
                                        </View>
                                        <View style={styles.trackInfo}>
                                            <ThemedText style={[styles.trackTitle, isDark && { color: '#f8fafc' }]} numberOfLines={1}>
                                                {track.name}
                                            </ThemedText>
                                            <ThemedText style={[styles.trackArtist, isDark && { color: '#94a3b8' }]} numberOfLines={1}>
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
                                                color="#10b981"
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
        </ThemedView>
    );
}
