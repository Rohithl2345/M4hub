'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ReplayIcon from '@mui/icons-material/Replay';

// Game Constants
const GRID_SIZE = 20;
const CELL_SZE = 20;
const SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Point>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Point>({ x: 0, y: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const generateFood = useCallback((): Point => {
        return {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    }, []);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood());
        setDirection({ x: 1, y: 0 }); // Start moving right automatically
        setGameOver(false);
        setScore(0);
        setIsPlaying(true);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isPlaying) return;

        switch (e.key) {
            case 'ArrowUp':
                if (direction.y !== 1) setDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (direction.y !== -1) setDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (direction.x !== 1) setDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (direction.x !== -1) setDirection({ x: 1, y: 0 });
                break;
        }
    }, [direction, isPlaying]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const moveSnake = setInterval(() => {
            setSnake((prevSnake) => {
                const newHead = {
                    x: prevSnake[0].x + direction.x,
                    y: prevSnake[0].y + direction.y,
                };

                // Check collisions
                if (
                    newHead.x < 0 ||
                    newHead.x >= GRID_SIZE ||
                    newHead.y < 0 ||
                    newHead.y >= GRID_SIZE ||
                    prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
                ) {
                    setGameOver(true);
                    setIsPlaying(false);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Check food
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore((s) => s + 1);
                    setFood(generateFood());
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, SPEED);

        return () => clearInterval(moveSnake);
    }, [isPlaying, gameOver, direction, food, generateFood]);

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f8fafc' } }}>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>
                Server Unreachable - Play While You Wait!
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ mb: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700} color="#6366f1">Score: {score}</Typography>
                    {gameOver && <Typography variant="h6" fontWeight={800} color="#ef4444">GAME OVER</Typography>}
                </Box>

                <Box
                    sx={{
                        width: GRID_SIZE * CELL_SZE,
                        height: GRID_SIZE * CELL_SZE,
                        bgcolor: '#1e293b',
                        position: 'relative',
                        border: '4px solid #334155',
                        borderRadius: 2,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Food */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: food.x * CELL_SZE,
                            top: food.y * CELL_SZE,
                            width: CELL_SZE - 2,
                            height: CELL_SZE - 2,
                            bgcolor: '#ef4444',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px #ef4444'
                        }}
                    />
                    {/* Snake */}
                    {snake.map((segment, i) => (
                        <Box
                            key={`${segment.x}-${segment.y}-${i}`}
                            sx={{
                                position: 'absolute',
                                left: segment.x * CELL_SZE,
                                top: segment.y * CELL_SZE,
                                width: CELL_SZE - 2,
                                height: CELL_SZE - 2,
                                bgcolor: i === 0 ? '#10b981' : '#34d399',
                                borderRadius: i === 0 ? '4px' : '2px',
                                zIndex: 1
                            }}
                        />
                    ))}

                    {!isPlaying && !gameOver && (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.7)' }}>
                            <Button
                                variant="contained"
                                onClick={resetGame}
                                startIcon={<ReplayIcon />}
                                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4, py: 1.5, borderRadius: 50, fontWeight: 700 }}
                            >
                                Start Game
                            </Button>
                        </Box>
                    )}

                    {gameOver && (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', bgcolor: 'rgba(0,0,0,0.8)' }}>
                            <Typography variant="h5" color="white" fontWeight={800} sx={{ mb: 2 }}>Game Over</Typography>
                            <Button
                                variant="contained"
                                onClick={resetGame}
                                startIcon={<ReplayIcon />}
                                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 4, py: 1.5, borderRadius: 50, fontWeight: 700 }}
                            >
                                Play Again
                            </Button>
                        </Box>
                    )}
                </Box>
                <Typography variant="caption" sx={{ mt: 2, color: '#64748b' }}>Use Arrow Keys to Move</Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button onClick={onClose} sx={{ color: '#64748b' }}>Close & Retry Connection</Button>
            </DialogActions>
        </Dialog>
    );
}
