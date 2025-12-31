'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AudioPlayer.module.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import { Track } from '@/services/music.service';

interface AudioPlayerProps {
    track: Track | null;
    onNext?: () => void;
    onPrevious?: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({ track, onNext, onPrevious, onPlayStateChange }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (audioRef.current && track) {
            console.log('AudioPlayer: Loading track', {
                name: track.name,
                audio: track.audio
            });

            // Only load and play if the track audio actually changed
            audioRef.current.load();

            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('Playback started successfully for:', track.name);
                        })
                        .catch(error => {
                            if (error.name === 'AbortError') {
                                console.warn('Play request interrupted by a new load request (Safe)');
                            } else {
                                console.error('Playback error:', error);
                            }
                        });
                }
            }
        }
    }, [track, isPlaying]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                console.log('Paused');
                setIsPlaying(false);
                onPlayStateChange?.(false);
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('Started playing');
                            setIsPlaying(true);
                            onPlayStateChange?.(true);
                        })
                        .catch(err => {
                            console.error('Play error:', err);
                        });
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
        setIsMuted(vol === 0);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume;
                setIsMuted(false);
            } else {
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEnded = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
        if (onNext) {
            onNext();
        }
    };

    if (!track) return null;

    const handleAudioError = (e: any) => {
        const error = e.currentTarget.error;
        let message = 'An unknown error occurred';

        switch (error?.code) {
            case 1: message = 'Playback aborted'; break;
            case 2: message = 'Network error'; break;
            case 3: message = 'Audio decoding failed'; break;
            case 4: message = 'Source not supported or not found'; break;
        }

        console.error('Audio Element Error:', { code: error?.code, message, url: track.audio });
        setIsPlaying(false);
    };

    const hasAudio = track.audio && track.audio.trim() !== '';

    return (
        <div className={styles.player}>
            {hasAudio ? (
                <audio
                    ref={audioRef}
                    src={track.audio}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    onError={handleAudioError}
                />
            ) : null}

            <div className={styles.trackInfo}>
                {track.image && (
                    <img src={track.image} alt={track.name} className={styles.albumArt} />
                )}
                <div className={styles.trackDetails}>
                    <div className={styles.trackName}>{track.name}</div>
                    <div className={styles.artistName}>{track.artist_name}</div>
                    {hasAudio ? (
                        <div style={{ color: '#4CAF50', fontSize: '0.8em', marginTop: '4px' }}>
                            🎵 Streamed via M4Hub • Full length audio
                        </div>
                    ) : (
                        <div style={{ color: '#ffa726', fontSize: '0.85em', marginTop: '4px' }}>
                            ⚠️ Preview not available
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.controls}>
                <button onClick={onPrevious} className={styles.controlButton} disabled={!onPrevious}>
                    <SkipPreviousIcon />
                </button>
                <button
                    onClick={togglePlay}
                    className={styles.playButton}
                    disabled={!hasAudio}
                    title={!hasAudio ? 'Preview not available' : ''}
                >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
                <button onClick={onNext} className={styles.controlButton} disabled={!onNext}>
                    <SkipNextIcon />
                </button>
            </div>

            <div className={styles.progressSection}>
                <span className={styles.time}>{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className={styles.progressBar}
                />
                <span className={styles.time}>{formatTime(duration)}</span>
            </div>

            <div className={styles.volumeSection}>
                <button onClick={toggleMute} className={styles.volumeButton}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeBar}
                />
            </div>
        </div>
    );
}
