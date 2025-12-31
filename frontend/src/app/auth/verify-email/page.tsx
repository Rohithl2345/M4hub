'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import logger from '@/utils/logger';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Link as MuiLink
} from '@mui/material';
import AuthLayout from '../AuthLayout';
import styles from '../email-login/email-login.module.css';
import { env } from '@/utils/env';
import { useToast } from '@/components/ToastProvider';

function VerifyEmailContent() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showSuccess, showError } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('pendingEmail');
        const storedPassword = sessionStorage.getItem('pendingPassword');

        if (!storedEmail || !storedPassword) {
            router.replace('/auth/email-login?mode=signup');
            return;
        }

        setEmail(storedEmail);
        setPassword(storedPassword);
    }, [router]);

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
            const response = await fetch(`${env.apiUrl}/api/auth/verify-email-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otpCode, registrationSource: 'web' }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                setError(errorData.message || `Server error (${response.status})`);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            const data = await response.json();

            if (data.success) {
                showSuccess('Email verified successfully!');
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                dispatch(setCredentials({ token: data.token, user: data.user }));

                const needsProfileSetup = !data.user?.firstName || !data.user?.lastName;
                if (needsProfileSetup) {
                    router.push('/profile-setup');
                } else {
                    router.push('/dashboard');
                }
            } else {
                const msg = data.message || 'Invalid OTP code';
                setError(msg);
                showError(msg);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch {
            const msg = 'Cannot connect to server. Please ensure backend is running.';
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${env.apiUrl}/api/auth/resend-email-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('A new code has been sent to ' + email);
                setTimer(60);
                setCanResend(false);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setError('');
            } else {
                const msg = data.message || 'Failed to resend OTP';
                setError(msg);
                showError(msg);
                if (!data.message?.includes('wait')) {
                    setTimer(60);
                    setCanResend(false);
                }
            }
        } catch {
            const msg = 'Network error. Please try again.';
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

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
                    Verify Email
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
                    Enter the 6-digit code sent to
                </Typography>
                <Typography variant="body1" fontWeight="600" color="primary" sx={{ mt: 0.5 }}>
                    {email}
                </Typography>
            </Box>

            <form onSubmit={handleVerify} className={styles.form}>
                <Box className={styles.inputGroup}>
                    <label className={styles.fieldLabel} style={{ textAlign: 'center' }}>
                        Verification Code *
                    </label>
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 2 }}>
                        {code.map((digit, index) => (
                            <TextField
                                key={index}
                                inputRef={(ref) => { inputRefs.current[index] = ref; }}
                                type="text"
                                inputProps={{
                                    maxLength: 1,
                                    style: { textAlign: 'center', fontSize: '20px', fontWeight: '600', padding: '14px 0' }
                                }}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                autoFocus={index === 0}
                                sx={{
                                    width: '50px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: digit ? '#f0f9ff' : '#f8fafc',
                                        '& fieldset': {
                                            borderColor: digit ? '#3b82f6' : '#e2e8f0',
                                            borderWidth: digit ? '2px' : '1.5px'
                                        }
                                    }
                                }}
                            />
                        ))}
                    </Box>
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
                    className={styles.continueButton}
                >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    {canResend ? (
                        <MuiLink
                            component="button"
                            type="button"
                            onClick={handleResend}
                            disabled={loading}
                            sx={{ color: '#3b82f6', fontWeight: 500, cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            {loading ? 'Resending...' : 'Resend Code'}
                        </MuiLink>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Resend code in {timer}s
                        </Typography>
                    )}
                </Box>

                <Box className={styles.switchModeText}>
                    <span className={styles.switchModeLink} onClick={() => router.back()}>
                        ← Back to Sign Up
                    </span>
                </Box>
            </form>
        </AuthLayout>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b' }}>Loading...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
