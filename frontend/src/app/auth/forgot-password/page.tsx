'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AuthLayout from '../AuthLayout';
import styles from '../email-login/email-login.module.css';
import { env } from '@/utils/env';

function ForgotPasswordPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [noEmailFound, setNoEmailFound] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(email)) {
            setError('Invalid email. Please go back to login and retry.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword, confirmPassword })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setSuccess('Password reset successful! Redirecting to login...');
                setTimeout(() => router.push('/auth/email-login?mode=login'), 1800);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch {
            setError('Cannot connect to server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
            return;
        }

        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user && user.email) {
                    setEmail(user.email);
                    return;
                }
            }
        } catch {
            // Ignore error
        }

        setNoEmailFound(true);
    }, [emailParam]);

    return (
        <AuthLayout>
            <Box className={styles.formHeader}>
                <Typography
                    variant="h1"
                    className={styles.formTitle}
                    sx={{
                        fontSize: '36px !important',
                        fontWeight: '800 !important',
                        color: '#0f172a !important',
                        marginBottom: '12px !important',
                        letterSpacing: '-1px !important',
                        lineHeight: '1.1 !important',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important',
                        WebkitBackgroundClip: 'text !important',
                        WebkitTextFillColor: 'transparent !important',
                        backgroundClip: 'text !important',
                    }}
                >
                    Reset Password
                </Typography>
                <Typography
                    variant="body1"
                    className={styles.formSubtitle}
                    sx={{
                        fontSize: '16px !important',
                        color: '#64748b !important',
                        fontWeight: '500 !important',
                        letterSpacing: '0.3px !important',
                        lineHeight: '1.5 !important',
                    }}
                >
                    Enter your new password to update your account
                </Typography>
            </Box>

            {noEmailFound ? (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                        No account specified for password reset.
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        className={styles.continueButton}
                        onClick={() => router.push('/auth/email-login?mode=login')}
                    >
                        Back to Login
                    </Button>
                </Box>
            ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Resetting password for <strong>{email}</strong>
                    </Typography>

                    <Box className={styles.inputGroup}>
                        <label htmlFor="new-password-input" className={styles.fieldLabel}>
                            New Password *
                        </label>
                        <TextField
                            id="new-password-input"
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password (min 6 characters)"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className={styles.passwordField}
                            required
                            autoComplete="new-password"
                            InputProps={{
                                sx: {
                                    backgroundColor: '#f8fafc',
                                    '& input': {
                                        backgroundColor: 'transparent !important',
                                        color: '#1e293b !important',
                                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset !important',
                                        WebkitTextFillColor: '#1e293b !important'
                                    }
                                },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box className={styles.inputGroup}>
                        <label htmlFor="confirm-password-input" className={styles.fieldLabel}>
                            Confirm Password *
                        </label>
                        <TextField
                            id="confirm-password-input"
                            fullWidth
                            type="password"
                            placeholder="Re-enter your new password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={styles.passwordField}
                            required
                            autoComplete="new-password"
                            InputProps={{
                                sx: {
                                    backgroundColor: '#f8fafc',
                                    '& input': {
                                        backgroundColor: 'transparent !important',
                                        color: '#1e293b !important',
                                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset !important',
                                        WebkitTextFillColor: '#1e293b !important'
                                    }
                                }
                            }}
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" className={styles.alert}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" className={styles.alert}>
                            {success}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={!validateEmail(email) || newPassword.length < 6 || loading || !!success}
                        className={styles.continueButton}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>

                    <Box className={styles.switchModeText}>
                        Remember your password?{' '}
                        <span className={styles.switchModeLink} onClick={() => router.push('/auth/email-login?mode=login')}>
                            Sign In
                        </span>
                    </Box>
                </form>
            )}
        </AuthLayout>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense>
            <ForgotPasswordPageInner />
        </Suspense>
    );
}
