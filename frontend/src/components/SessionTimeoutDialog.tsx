'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { keyframes } from '@mui/system';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
  }
`;

interface SessionTimeoutDialogProps {
    open: boolean;
    remainingTime: number; // in seconds
    onExtendSession: () => void;
    onLogout: () => void;
    warningThreshold?: number; // seconds before timeout to show warning
}

export default function SessionTimeoutDialog({
    open,
    remainingTime,
    onExtendSession,
    onLogout,
    warningThreshold = 120 // default 2 minutes
}: SessionTimeoutDialogProps) {
    const [countdown, setCountdown] = useState(remainingTime);
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setCountdown(remainingTime);
        }
    }

    const progress = (countdown / warningThreshold) * 100;

    useEffect(() => {
        if (!open) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open, onLogout]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getUrgencyColor = () => {
        if (countdown <= 30) return '#ef4444'; // red
        if (countdown <= 60) return '#f59e0b'; // orange
        return '#6366f1'; // indigo
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 6,
                    overflow: 'visible',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 6,
                        padding: '2px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: 0.5,
                    }
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
                {/* Animated Background Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        animation: `${pulseAnimation} 3s ease-in-out infinite`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                        animation: `${pulseAnimation} 4s ease-in-out infinite`,
                    }}
                />

                {/* Main Content */}
                <Box sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3,
                            animation: `${floatAnimation} 3s ease-in-out infinite`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid rgba(255, 255, 255, 0.3)',
                                animation: `${glowAnimation} 2s ease-in-out infinite`,
                            }}
                        >
                            <AccessTimeIcon sx={{ fontSize: 50, color: '#fff' }} />
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            color: '#fff',
                            fontWeight: 900,
                            mb: 1,
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        Session Expiring Soon
                    </Typography>

                    <Typography
                        variant="body1"
                        align="center"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            mb: 4,
                            fontSize: '1rem',
                        }}
                    >
                        Your session will expire due to inactivity. Would you like to continue?
                    </Typography>

                    {/* Countdown Timer */}
                    <Box
                        sx={{
                            mb: 3,
                            p: 3,
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        <Typography
                            variant="caption"
                            align="center"
                            display="block"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                mb: 1,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                            }}
                        >
                            Time Remaining
                        </Typography>
                        <Typography
                            variant="h2"
                            align="center"
                            sx={{
                                color: '#fff',
                                fontWeight: 900,
                                fontFamily: 'monospace',
                                mb: 2,
                                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                            }}
                        >
                            {formatTime(countdown)}
                        </Typography>

                        {/* Progress Bar */}
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, ${getUrgencyColor()} 0%, ${getUrgencyColor()}dd 100%)`,
                                    transition: 'background 0.3s ease',
                                },
                            }}
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={onExtendSession}
                            startIcon={<RefreshIcon />}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                background: '#fff',
                                color: '#667eea',
                                fontWeight: 800,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: '#f8f9fa',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.3)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        >
                            Continue Session
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            onClick={onLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#fff',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        >
                            Logout Now
                        </Button>
                    </Box>

                    {/* Security Note */}
                    <Typography
                        variant="caption"
                        align="center"
                        display="block"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            mt: 3,
                            fontSize: '0.75rem',
                        }}
                    >
                        🔒 This is a security measure to protect your account
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
