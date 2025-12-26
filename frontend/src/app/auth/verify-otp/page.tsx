'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtpMutation, useSendOtpMutation } from '@/store/slices/apiSlice';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import logger from '@/utils/logger';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Link
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import styles from './verify-otp.module.css';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneNumber = searchParams.get('phone');
    const dispatch = useAppDispatch();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
    const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        logger.debug('Initiating OTP verification');

        try {
            const result = await verifyOtp({
                phoneNumber: phoneNumber || '',
                otpCode: otpCode,
            }).unwrap();

            logger.info('OTP verification successful');

            if (result.success && result.token && result.user) {
                logger.debug('Saving credentials');

                // Save to localStorage first
                if (typeof window !== 'undefined') {
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                }

                dispatch(setCredentials({
                    token: result.token,
                    user: result.user,
                }));

                const needsProfileSetup = !result.user.firstName || !result.user.lastName;

                logger.debug('Navigating to next page', { needsProfileSetup });

                if (needsProfileSetup) {
                    router.push('/profile-setup');
                } else {
                    router.push('/dashboard');
                }
            } else {
                logger.error('OTP verification failed', { message: result.message });
                setError(result.message || 'Invalid OTP');
            }
        } catch (err: unknown) {
            logger.error('Failed to verify OTP', { error: err });
            const error = err as { data?: { message?: string }; status?: number };
            setError(error?.data?.message || 'Failed to verify OTP. Please try again.');
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setError('');

        try {
            const result = await sendOtp({ phoneNumber: phoneNumber || '' }).unwrap();

            if (result.success) {
                setTimer(30);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setError(result.message || 'Failed to resend OTP');
            }
        } catch (err: unknown) {
            setError('Failed to resend OTP. Please try again.');
            logger.error('Failed to resend OTP', { error: err });
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
                                Verify OTP
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Enter the 6-digit code sent to
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" className={styles.phoneNumber}>
                                {phoneNumber}
                            </Typography>
                        </Box>

                        <form onSubmit={handleVerify} className={styles.form}>
                            <Box className={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextField
                                        key={index}
                                        inputRef={(ref) => { inputRefs.current[index] = ref; }}
                                        type="tel"
                                        inputMode="numeric"
                                        inputProps={{
                                            maxLength: 1,
                                            pattern: '[0-9]*',
                                            style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }
                                        }}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
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
                                disabled={otp.join('').length !== 6 || isVerifying}
                                className={styles.verifyButton}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                            </Button>

                            <Box className={styles.resendContainer}>
                                {timer > 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Resend code in {timer}s
                                    </Typography>
                                ) : (
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className={styles.resendLink}
                                    >
                                        {isResending ? 'Resending...' : 'Resend Code'}
                                    </Link>
                                )}
                            </Box>

                            <Box className={styles.changePhoneContainer}>
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => router.push('/auth/phone-login')}
                                    className={styles.changePhoneLink}
                                >
                                    ← Change Phone Number
                                </Link>
                            </Box>
                        </form>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
