import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { Track } from '@/services/music.service';

interface MobilePremiumAudioPlayerProps {
    track: Track;
    playlist: Track[];
    onNext?: () => void;
    onPrevious?: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
}

type RepeatMode = 'off' | 'all' | 'one';

export default function MobilePremiumAudioPlayer({
    track,
    playlist,
    onNext,
    onPrevious,
    onPlayStateChange,
}: MobilePremiumAudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [isShuffle, setIsShuffle] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        loadSound();
        return () => {
            if (sound) {
                sound.unloadAsync().catch(err => console.error('Error unloading sound:', err));
            }
        };
    }, [track.id]); // Only reload when track ID changes

    const loadSound = async () => {
        setIsLoading(true);
        try {
            // Unload previous sound if exists
            if (sound) {
                await sound.unloadAsync().catch(err => console.error('Error unloading previous sound:', err));
                setSound(null);
            }

            if (!track.audio) {
                setIsLoading(false);
                return;
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.audio },
                { shouldPlay: true, volume },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setIsPlaying(true);
            onPlayStateChange?.(true);
        } catch (error) {
            console.error('Error loading sound:', error);
            setIsPlaying(false);
            onPlayStateChange?.(false);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                handleTrackEnd();
            }
        }
    };

    const handleTrackEnd = async () => {
        if (repeatMode === 'one' && sound) {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    await sound.replayAsync();
                }
            } catch (error) {
                console.error('Error replaying track:', error);
            }
        } else if (repeatMode === 'all' && onNext) {
            onNext();
        } else if (onNext) {
            onNext();
        }
    };

    const togglePlayPause = async () => {
        if (!sound || isLoading) return;

        try {
            const status = await sound.getStatusAsync();
            if (!status.isLoaded) return;

            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
                onPlayStateChange?.(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
                onPlayStateChange?.(true);
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    const handleSeek = async (value: number) => {
        if (!sound) return;

        try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                await sound.setPositionAsync(value);
            }
        } catch (error) {
            console.error('Error seeking:', error);
        }
    };

    const handleVolumeChange = async (value: number) => {
        setVolume(value);
        setIsMuted(value === 0);

        if (!sound) return;

        try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                await sound.setVolumeAsync(value);
            }
        } catch (error) {
            console.error('Error changing volume:', error);
        }
    };

    const toggleMute = async () => {
        if (!sound) return;

        try {
            const status = await sound.getStatusAsync();
            if (!status.isLoaded) return;

            if (isMuted) {
                await sound.setVolumeAsync(volume);
                setIsMuted(false);
            } else {
                await sound.setVolumeAsync(0);
                setIsMuted(true);
            }
        } catch (error) {
            console.error('Error toggling mute:', error);
        }
    };

    const toggleRepeat = () => {
        setRepeatMode((prev) => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <LinearGradient colors={['#059669', '#10b981']} style={styles.gradient}>
                {/* Track Info */}
                <View style={styles.trackInfo}>
                    <View style={styles.albumArt}>
                        <Ionicons name="musical-note" size={22} color="#8b5cf6" />
                    </View>
                    <View style={styles.trackDetails}>
                        <Text style={styles.trackName} numberOfLines={1}>
                            {track.name}
                        </Text>
                        <Text style={styles.artistName} numberOfLines={1}>
                            {track.artist_name}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <Text style={styles.time}>{formatTime(position)}</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration}
                            value={position}
                            onSlidingComplete={handleSeek}
                            minimumTrackTintColor="transparent"
                            maximumTrackTintColor="transparent"
                            thumbTintColor="#ffffff"
                            disabled={isLoading}
                        />
                    </View>
                    <Text style={styles.time}>{formatTime(duration)}</Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={() => setIsShuffle(!isShuffle)}
                        style={[styles.secondaryButton, isShuffle && styles.activeButton]}
                    >
                        <Ionicons name="shuffle" size={16} color={isShuffle ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onPrevious} disabled={!onPrevious} style={styles.controlButton}>
                        <Ionicons name="play-skip-back" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlayPause} style={styles.playButton} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#10b981" />
                        ) : (
                            <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#10b981" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onNext} disabled={!onNext} style={styles.controlButton}>
                        <Ionicons name="play-skip-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleRepeat}
                        style={[styles.secondaryButton, repeatMode !== 'off' && styles.activeButton]}
                    >
                        <Ionicons
                            name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
                            size={16}
                            color={repeatMode !== 'off' ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Volume Control */}
                <View style={styles.volumeSection}>
                    <TouchableOpacity onPress={toggleMute} style={styles.volumeButton}>
                        <Ionicons
                            name={isMuted || volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
                            size={18}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
                    <Slider
                        style={styles.volumeSlider}
                        minimumValue={0}
                        maximumValue={1}
                        value={isMuted ? 0 : volume}
                        onValueChange={handleVolumeChange}
                        minimumTrackTintColor="#ffffff"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor="#ffffff"
                    />
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    gradient: {
        paddingTop: 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    trackInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    albumArt: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackDetails: {
        flex: 1,
    },
    trackName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 2,
    },
    artistName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    time: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        minWidth: 32,
        textAlign: 'center',
    },
    progressBarContainer: {
        flex: 1,
        height: 20,
        justifyContent: 'center',
        position: 'relative',
    },
    progressBarBg: {
        position: 'absolute',
        width: '100%',
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
    slider: {
        width: '100%',
        height: 20,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        gap: 12,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    controlButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    volumeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    volumeButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    volumeSlider: {
        flex: 1,
        height: 20,
    },
});
