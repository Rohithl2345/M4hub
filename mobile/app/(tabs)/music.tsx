import { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MobileAudioPlayer from '@/components/MobileAudioPlayer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { musicStyles as styles } from '../_styles/music.styles';
import { musicService, Track } from '@/services/music.service';

export default function MusicScreen() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

    const loadPopularTracks = async () => {
        setLoading(true);
        const popularTracks = await musicService.getPopularTracks(20);
        setTracks(popularTracks);
        setLoading(false);
    };

    useEffect(() => {
        loadPopularTracks();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadPopularTracks();
            return;
        }
        setLoading(true);
        const results = await musicService.searchTracks(searchQuery, 20);
        setTracks(results);
        setLoading(false);
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
                    colors={['#4c669f', '#3b5998', '#192f6a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Ionicons name="musical-notes" size={64} color="white" />
                    <ThemedText style={styles.headerTitle}>Music Streaming</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Discover and enjoy your favorite tracks</ThemedText>
                </LinearGradient>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for songs, artists..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); loadPopularTracks(); }}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <ThemedText style={styles.searchButtonText}>Search</ThemedText>
                    </TouchableOpacity>
                </View>

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
                        <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 32 }} />
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
                                            <Ionicons name="logo-spotify" size={20} color="#1DB954" />
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
