import { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Track } from '@/services/music.service';

interface MobileAudioPlayerProps {
    track: Track | null;
    onNext?: () => void;
    onPrevious?: () => void;
}

export default function MobileAudioPlayer({ track, onNext, onPrevious }: MobileAudioPlayerProps) {
    const player = useAudioPlayer(track?.audio || '');
    const [isLoading, setIsLoading] = useState(false);

    const loadAndPlayTrack = useCallback(async () => {
        if (!track) return;

        try {
            setIsLoading(true);
            player.replace(track.audio);
            player.play();
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading track:', error);
            setIsLoading(false);
        }
    }, [track, player]);

    useEffect(() => {
        if (track) {
            loadAndPlayTrack();
        }
    }, [track, loadAndPlayTrack]);

    const togglePlayPause = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!track) return null;

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
                            name={player.playing ? "pause-circle" : "play-circle"}
                            size={64}
                            color="#5433ff"
                        />
                    )}
                </TouchableOpacity>                <TouchableOpacity onPress={onNext} disabled={!onNext}>
                    <Ionicons name="play-skip-forward" size={32} color={onNext ? "#5433ff" : "#ccc"} />
                </TouchableOpacity>
            </View>

            <View style={styles.progress}>
                <ThemedText style={styles.time}>
                    {formatTime(player.currentTime || 0)}
                </ThemedText>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: player.duration > 0
                                    ? `${Math.round(((player.currentTime || 0) / player.duration) * 100)}%`
                                    : '0%'
                            }
                        ]}
                    />
                </View>
                <ThemedText style={styles.time}>
                    {formatTime(player.duration || 0)}
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
