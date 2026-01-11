'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';

interface ToastContextType {
    showToast: (message: string, severity?: AlertColor) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Slide down from top for visibility
function TransitionDown(props: SlideProps) {
    return <Slide {...props} direction="down" />;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');

    const showToast = useCallback((msg: string, sev: AlertColor = 'info') => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    const showSuccess = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
    const showError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    // Professional color schemes for each severity
    const getAlertStyles = (sev: AlertColor) => {
        const styles = {
            success: {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
            },
            error: {
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
            },
            warning: {
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)',
            },
            info: {
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
            }
        };
        return styles[sev];
    };

    const alertStyle = getAlertStyles(severity);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                TransitionComponent={TransitionDown}
                sx={{
                    // Top center with good spacing from top
                    mt: 3,
                    zIndex: 9999,
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    icon={false}
                    sx={{
                        // Professional sizing
                        minWidth: '320px',
                        maxWidth: '480px',
                        width: 'auto',

                        // Premium visual design
                        background: alertStyle.background,
                        boxShadow: alertStyle.boxShadow,
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',

                        // Typography
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.2px',
                        lineHeight: 1.5,

                        // Padding for comfortable reading
                        padding: '14px 20px',
                        paddingRight: '48px', // Space for close button

                        // Text styling
                        color: 'white',

                        // Subtle glass effect
                        backdropFilter: 'blur(10px)',

                        // Animation
                        animation: 'toastPulse 0.3s ease-out',
                        '@keyframes toastPulse': {
                            '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                            '100%': { transform: 'scale(1)', opacity: 1 }
                        },

                        // Close button styling
                        '& .MuiAlert-action': {
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: 0,
                            margin: 0,

                            '& .MuiIconButton-root': {
                                color: 'rgba(255, 255, 255, 0.9)',
                                padding: '6px',
                                transition: 'all 0.2s ease',

                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'scale(1.1)',
                                }
                            }
                        },

                        // Message container
                        '& .MuiAlert-message': {
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }
                    }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

