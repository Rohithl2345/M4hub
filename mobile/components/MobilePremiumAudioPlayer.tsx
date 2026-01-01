import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, StyleSheet, ActivityIndicator, Dimensions, Image, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '@/services/music.service';
import { useAppTheme } from '@/hooks/use-app-theme';

interface MobilePremiumAudioPlayerProps {
    track: Track;
    playlist: Track[];
    onNext?: () => void;
    onPrevious?: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
}

const { width } = Dimensions.get('window');

// Mini Player Height
const PLAYER_HEIGHT = 65;

export default function MobilePremiumAudioPlayer({
    track,
    playlist,
    onNext,
    onPrevious,
    onPlayStateChange,
}: MobilePremiumAudioPlayerProps) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const slideAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
        }).start();

        return () => {
            if (sound) sound.unloadAsync();
        };
    }, []);

    // Handle Track Change
    useEffect(() => {
        let isMounted = true;
        const initTrack = async () => {
            if (sound) {
                await sound.unloadAsync().catch(() => { });
                if (isMounted) {
                    setSound(null);
                    setIsPlaying(false);
                }
            }
            if (isMounted) loadSound();
        };
        initTrack();
        return () => { isMounted = false; };
    }, [track.id]);

    const loadSound = async () => {
        setIsLoading(true);
        try {
            if (!track.audio) {
                setIsLoading(false);
                return;
            }

            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            console.log("Loading Sound: " + track.audio);
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: track.audio },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            if (status.isLoaded) {
                setSound(newSound);
                setIsPlaying(true);
                setDuration(status.durationMillis || 0);
                onPlayStateChange?.(true);
            }
        } catch (error) {
            console.error('Error loading sound:', error);
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) onNext?.();
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;
        try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                if (status.isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                    onPlayStateChange?.(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                    onPlayStateChange?.(true);
                }
            }
        } catch (error) {
            console.error('Error toggle play:', error);
        }
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                    borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            {/* Progress Bar Line */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%`, backgroundColor: isDark ? '#3b82f6' : '#2563eb' }
                    ]}
                />
            </View>

            <View style={styles.contentRow}>
                {/* Album Art (Mini) */}
                <View style={[styles.artwork, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                    <Ionicons name="musical-notes" size={20} color={isDark ? '#3b82f6' : '#2563eb'} />
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text
                        style={[styles.trackTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}
                        numberOfLines={1}
                    >
                        {track.name}
                    </Text>
                    <Text
                        style={[styles.artistName, { color: isDark ? '#94a3b8' : '#64748b' }]}
                        numberOfLines={1}
                    >
                        {track.artist_name}
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity onPress={onPrevious} disabled={!onPrevious} style={styles.iconBtn}>
                        <Ionicons name="play-skip-back" size={24} color={isDark ? "#cbd5e1" : "#475569"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={togglePlayPause}
                        style={[styles.playBtn, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={isDark ? '#94a3b8' : '#64748b'} />
                        ) : (
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={20}
                                color={isDark ? '#f1f5f9' : '#1e293b'}
                                style={{ marginLeft: isPlaying ? 0 : 2 }}
                            />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onNext} disabled={!onNext} style={styles.iconBtn}>
                        <Ionicons name="play-skip-forward" size={24} color={isDark ? "#cbd5e1" : "#475569"} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 64, // Positioned exactly above the tab bar (height 64)
        left: 0,
        right: 0,
        height: PLAYER_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        // Elevation for Android
        elevation: 8,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
    },
    progressBarContainer: {
        width: '100%',
        height: 2,
        backgroundColor: 'transparent',
    },
    progressBarFill: {
        height: '100%',
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    artwork: {
        width: 40,
        height: 40,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 16,
    },
    trackTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    artistName: {
        fontSize: 11,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 6,
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
