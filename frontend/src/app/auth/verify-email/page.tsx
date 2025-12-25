'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import logger from '@/utils/logger';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Link as MuiLink
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import styles from './verify-email.module.css';

import { env } from '@/utils/env';

function VerifyEmailContent() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const password = searchParams.get('password') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^\d+$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setCode(newCode);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = code.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        logger.debug('Initiating email OTP verification');

        try {
            logger.debug('Calling verify-email-otp API');
            const response = await fetch(`${env.apiUrl}/api/auth/verify-email-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otpCode }),
            });

            // Check if response is OK before parsing
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                logger.error('HTTP error', { status: response.status, message: errorData.message });
                setError(errorData.message || `Server error (${response.status})`);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            const data = await response.json();

            if (data.success) {
                logger.info('Email OTP verification successful');

                // Store token and user data in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch to Redux
                dispatch(setCredentials({ token: data.token, user: data.user }));

                logger.debug('Navigating to profile setup or dashboard');

                const needsProfileSetup = !data.user?.firstName || !data.user?.lastName;
                if (needsProfileSetup) {
                    router.push('/profile-setup');
                } else {
                    router.push('/dashboard');
                }
            } else {
                logger.error('Email OTP verification failed', { message: data.message });
                setError(data.message || 'Invalid OTP code');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            logger.error('Failed to verify email OTP', { error: err });
            setError('Cannot connect to server. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');
        logger.debug('Resending email OTP');

        try {
            const response = await fetch(`${env.apiUrl}/api/auth/resend-email-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                logger.info('OTP resent successfully');
                setTimer(60);
                setCanResend(false);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                // Show success message briefly
                setError('');
            } else {
                logger.error('Failed to resend OTP', { message: data.message });
                setError(data.message || 'Failed to resend OTP');
                // If rate limited, don't reset timer
                if (!data.message?.includes('wait')) {
                    setTimer(60);
                    setCanResend(false);
                }
            }
        } catch (err) {
            logger.error('Resend OTP error', { error: err });
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className={styles.container}>
            <Container maxWidth="sm">
                <Box className={styles.centerWrapper}>
                    <Card className={styles.card}>
                        <Box className={styles.header}>
                            <LockIcon className={styles.icon} />
                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                Verify Email
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Enter the 6-digit code sent to
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" className={styles.emailText}>
                                {email}
                            </Typography>
                        </Box>

                        <form onSubmit={handleVerify} className={styles.form}>
                            <Box className={styles.otpContainer}>
                                {code.map((digit, index) => (
                                    <TextField
                                        key={index}
                                        inputRef={(ref) => { inputRefs.current[index] = ref; }}
                                        type="text"
                                        inputProps={{
                                            maxLength: 1,
                                            style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }
                                        }}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        autoFocus={index === 0}
                                        className={digit ? styles.otpInputFilled : styles.otpInput}
                                    />
                                ))}
                            </Box>

                            {error && (
                                <Alert severity="error" className={styles.alert}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={code.join('').length !== 6 || loading}
                                className={styles.verifyButton}
                            >
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </Button>

                            <Box className={styles.resendContainer}>
                                {canResend ? (
                                    <MuiLink
                                        component="button"
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className={styles.resendLink}
                                    >
                                        {loading ? 'Resending...' : 'Resend Code'}
                                    </MuiLink>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Resend code in {timer}s
                                    </Typography>
                                )}
                            </Box>

                            <Box className={styles.backButtonContainer}>
                                <MuiLink
                                    component="button"
                                    type="button"
                                    onClick={() => router.back()}
                                    className={styles.backLink}
                                >
                                    ← Back to Login
                                </MuiLink>
                            </Box>
                        </form>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
