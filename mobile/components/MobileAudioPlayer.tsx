import { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Track } from '@/services/music.service';

interface MobileAudioPlayerProps {
    track: Track | null;
    onNext?: () => void;
    onPrevious?: () => void;
}

export default function MobileAudioPlayer({ track, onNext, onPrevious }: MobileAudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    useEffect(() => {
        if (track) {
            loadSound();
        }
        return () => {
            if (sound) {
                sound.unloadAsync().catch(err => console.error('Error unloading sound:', err));
            }
        };
    }, [track?.id]);

    const loadSound = async () => {
        if (!track) return;

        try {
            setIsLoading(true);

            // Unload previous sound
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            // Load and play new sound
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.audio },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setIsPlaying(true);
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

            if (status.didJustFinish && onNext) {
                onNext();
            }
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
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!track) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.trackInfo}>
                <ThemedText style={styles.trackName} numberOfLines={1}>
                    {track.name}
                </ThemedText>
                <ThemedText style={styles.artistName} numberOfLines={1}>
                    {track.artist_name}
                </ThemedText>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={onPrevious} disabled={!onPrevious}>
                    <Ionicons name="play-skip-back" size={32} color={onPrevious ? "#5433ff" : "#ccc"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayPause} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#5433ff" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause-circle" : "play-circle"}
                            size={64}
                            color="#5433ff"
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onNext} disabled={!onNext}>
                    <Ionicons name="play-skip-forward" size={32} color={onNext ? "#5433ff" : "#ccc"} />
                </TouchableOpacity>
            </View>

            <View style={styles.progress}>
                <ThemedText style={styles.time}>
                    {formatTime(position)}
                </ThemedText>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress}%` }
                        ]}
                    />
                </View>
                <ThemedText style={styles.time}>
                    {formatTime(duration)}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    trackInfo: {
        marginBottom: 16,
        alignItems: 'center',
    },
    trackName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    artistName: {
        fontSize: 14,
        color: '#666',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
        marginBottom: 16,
    },
    progress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#5433ff',
    },
    time: {
        fontSize: 12,
        color: '#666',
        minWidth: 40,
    },
});
