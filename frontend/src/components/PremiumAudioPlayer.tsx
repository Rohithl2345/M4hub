'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './PremiumAudioPlayer.module.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import AlbumIcon from '@mui/icons-material/Album';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { Track } from '@/services/music.service';

interface PremiumAudioPlayerProps {
    track: Track | null;
    playlist: Track[];
    onNext?: () => void;
    onPrevious?: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
}

type RepeatMode = 'off' | 'all' | 'one';

export default function PremiumAudioPlayer({ track, playlist, onNext, onPrevious, onPlayStateChange }: PremiumAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [isShuffle, setIsShuffle] = useState(false);
    const [showQueue, setShowQueue] = useState(false);

    useEffect(() => {
        if (audioRef.current && track) {
            audioRef.current.load();
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error('Playback error:', error);
                        }
                    });
                }
            }
        }
    }, [track]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
                onPlayStateChange?.(false);
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            onPlayStateChange?.(true);
                        })
                        .catch(err => console.error('Play error:', err));
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

    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
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

        if (repeatMode === 'one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
                onPlayStateChange?.(true);
            }
        } else if (repeatMode === 'all' && onNext) {
            onNext();
        } else if (onNext) {
            onNext();
        }
    };

    if (!track) return null;

    const hasAudio = track.audio && track.audio.trim() !== '';
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeOffIcon />;
        if (volume < 0.5) return <VolumeMuteIcon />;
        return <VolumeUpIcon />;
    };

    return (
        <div className={styles.playerContainer}>
            {hasAudio && (
                <audio
                    ref={audioRef}
                    src={track.audio}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                />
            )}

            <div className={styles.player}>
                {/* Track Info Section */}
                <div className={styles.trackInfo}>
                    <div className={styles.albumArt}>
                        <AlbumIcon style={{ fontSize: '40px', color: '#8b5cf6' }} />
                    </div>
                    <div className={styles.trackDetails}>
                        <div className={styles.trackName}>{track.name}</div>
                        <div className={styles.artistName}>{track.artist_name}</div>
                    </div>
                </div>

                {/* Main Controls */}
                <div className={styles.mainControls}>
                    <div className={styles.controlButtons}>
                        <button
                            onClick={() => setIsShuffle(!isShuffle)}
                            className={`${styles.secondaryButton} ${isShuffle ? styles.active : ''}`}
                            title="Shuffle"
                        >
                            <ShuffleIcon fontSize="small" />
                        </button>

                        <button
                            onClick={onPrevious}
                            className={styles.controlButton}
                            disabled={!onPrevious}
                            title="Previous"
                        >
                            <SkipPreviousIcon />
                        </button>

                        <button
                            onClick={togglePlay}
                            className={styles.playButton}
                            disabled={!hasAudio}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </button>

                        <button
                            onClick={onNext}
                            className={styles.controlButton}
                            disabled={!onNext}
                            title="Next"
                        >
                            <SkipNextIcon />
                        </button>

                        <button
                            onClick={toggleRepeat}
                            className={`${styles.secondaryButton} ${repeatMode !== 'off' ? styles.active : ''}`}
                            title={`Repeat: ${repeatMode}`}
                        >
                            {repeatMode === 'one' ? <RepeatOneIcon fontSize="small" /> : <RepeatIcon fontSize="small" />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressSection}>
                        <span className={styles.time}>{formatTime(currentTime)}</span>
                        <div className={styles.progressBarContainer}>
                            <div className={styles.progressBarBg}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className={styles.progressBar}
                            />
                        </div>
                        <span className={styles.time}>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Queue Controls */}
                <div className={styles.rightControls}>
                    <div className={styles.volumeSection}>
                        <button onClick={toggleMute} className={styles.volumeButton}>
                            {getVolumeIcon()}
                        </button>
                        <div className={styles.volumeBarContainer}>
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

                    <button
                        onClick={() => setShowQueue(!showQueue)}
                        className={`${styles.queueButton} ${showQueue ? styles.active : ''}`}
                        title="Queue"
                    >
                        <QueueMusicIcon />
                    </button>
                </div>
            </div>

            {/* Queue Display */}
            {showQueue && (
                <div className={styles.queuePanel}>
                    <div className={styles.queueHeader}>
                        <MusicNoteIcon fontSize="small" />
                        <span>Queue ({playlist.length} songs)</span>
                    </div>
                    <div className={styles.queueList}>
                        {playlist.slice(0, 10).map((t, idx) => (
                            <div
                                key={t.id}
                                className={`${styles.queueItem} ${t.id === track.id ? styles.queueItemActive : ''}`}
                            >
                                <span className={styles.queueIndex}>{idx + 1}</span>
                                <div className={styles.queueTrackInfo}>
                                    <div className={styles.queueTrackName}>{t.name}</div>
                                    <div className={styles.queueArtistName}>{t.artist_name}</div>
                                </div>
                                <span className={styles.queueDuration}>
                                    {Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, '0')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
