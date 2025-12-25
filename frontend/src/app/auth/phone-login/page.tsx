'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSendOtpMutation } from '@/store/slices/apiSlice';
import logger from '@/utils/logger';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    Container
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import styles from './phone-login.module.css';

export default function PhoneLoginPage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [error, setError] = useState('');
    const [sendOtp, { isLoading }] = useSendOtpMutation();

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        const fullPhoneNumber = `${countryCode}${phoneNumber}`;
        logger.debug('Initiating OTP request');

        try {
            logger.debug('Calling sendOtp API');
            const result = await sendOtp({ phoneNumber: fullPhoneNumber }).unwrap();
            logger.info('OTP sent successfully');

            if (result.success) {
                logger.debug('Redirecting to OTP verification');
                router.push(`/auth/verify-otp?phone=${encodeURIComponent(fullPhoneNumber)}`);
            } else {
                logger.error('OTP send failed', { message: result.message });
                setError(result.message || 'Failed to send OTP');
            }
        } catch (err: unknown) {
            // Define possible RTK Query error shape
            type RTKQueryError = {
                data?: { message?: string };
                message?: string;
                status?: string;
            };
            let errorMessage = 'Failed to send OTP. Please try again.';
            let errorStatus: string | undefined = undefined;
            if (typeof err === 'object' && err !== null) {
                const e = err as Partial<RTKQueryError>;
                if (e.data && typeof e.data === 'object' && e.data !== null && 'message' in e.data) {
                    errorMessage = e.data.message || errorMessage;
                } else if (typeof e.message === 'string') {
                    errorMessage = e.message || errorMessage;
                }
                if (typeof e.status === 'string') {
                    errorStatus = e.status;
                }
            }
            logger.error('Failed to send OTP', { error: errorMessage });

            // Check if it's a network error
            if (errorStatus === 'FETCH_ERROR' || !errorStatus) {
                setError('Cannot connect to server. Please ensure the backend is running.');
            } else {
                setError(errorMessage);
            }
        }
    };

    return (
        <Box className={styles.container}>
            <Container maxWidth="sm">
                <Box className={styles.centerWrapper}>
                    <Card className={styles.card}>
                        <Box className={styles.header}>
                            <PhoneIcon className={styles.icon} />
                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                Phone Login
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Enter your phone number to receive an OTP
                            </Typography>
                        </Box>

                        <form onSubmit={handleContinue} className={styles.form}>
                            <Box className={styles.phoneInputContainer}>
                                <TextField
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    inputProps={{ maxLength: 4 }}
                                    className={styles.countryCodeField}
                                />
                                <TextField
                                    fullWidth
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    inputProps={{ maxLength: 10 }}
                                    autoFocus
                                    className={styles.phoneField}
                                />
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
                                disabled={phoneNumber.length < 10 || isLoading}
                                className={styles.continueButton}
                            >
                                {isLoading ? 'Sending...' : 'Continue'}
                            </Button>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                                className={styles.infoText}
                            >
                                We&apos;ll send you a 6-digit verification code
                            </Typography>
                        </form>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}
