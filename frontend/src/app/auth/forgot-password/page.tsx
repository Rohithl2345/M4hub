'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    InputAdornment,
    IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from '../email-login/email-login.module.css';
import { env } from '@/utils/env';

import { Suspense } from 'react';

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
        // email must be present (prefilled from query or localStorage)
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
                setSuccess('Password reset successful! You can now log in.');
                setTimeout(() => router.push('/auth/email-login?mode=login'), 1800);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            console.error(err);
            setError('Cannot connect to server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Require email to be provided via query param or localStorage. If not present,
        // don't auto-redirect: show a message so user can choose to go back to login.
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
        } catch (err) {
            console.error(err);
        }

        // No email found — show message instead of redirecting immediately.
        setNoEmailFound(true);
    }, [emailParam]);

    return (
        <Box className={styles.container}>
            <Container maxWidth="sm">
                <Box className={styles.centerWrapper}>
                    <Card className={styles.card}>
                        <Box className={styles.header}>
                            <EmailIcon className={styles.icon} />
                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                Reset Password
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Enter your email and a new password to update your account.
                            </Typography>
                        </Box>

                        {noEmailFound ? (
                            <Box className={styles.choiceWrapper}>
                                <Typography variant="body1" color="text.secondary" textAlign="center">
                                    No account specified for password reset.
                                </Typography>
                                <Button fullWidth variant="contained" className={styles.continueButton} onClick={() => router.push('/auth/email-login?mode=login')}>
                                    Back to Login
                                </Button>
                            </Box>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    Resetting password for <strong>{email}</strong>
                                </Typography>

                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New Password (min 6 characters)"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className={styles.passwordField}
                                    required
                                    autoComplete="new-password"
                                    InputProps={{
                                        sx: {
                                            backgroundColor: 'white !important',
                                            '& input': {
                                                backgroundColor: 'white !important',
                                                color: 'black !important',
                                                WebkitBoxShadow: '0 0 0 1000px white inset !important',
                                                WebkitTextFillColor: 'black !important'
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

                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className={styles.passwordField}
                                    required
                                    autoComplete="new-password"
                                    InputProps={{
                                        sx: {
                                            backgroundColor: 'white !important',
                                            '& input': {
                                                backgroundColor: 'white !important',
                                                color: 'black !important',
                                                WebkitBoxShadow: '0 0 0 1000px white inset !important',
                                                WebkitTextFillColor: 'black !important'
                                            }
                                        }
                                    }}
                                />

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

                                {success && (
                                    <Button fullWidth variant="text" sx={{ marginTop: 8 }} onClick={() => router.push('/auth/email-login?mode=login')}>
                                        Back to Login
                                    </Button>
                                )}
                            </form>
                        )}
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense>
            <ForgotPasswordPageInner />
        </Suspense>
    );
}
