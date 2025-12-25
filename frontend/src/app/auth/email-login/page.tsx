
'use client';

export default function EmailLoginPage() {
    return (
        <Suspense>
            <EmailLoginPageInner />
        </Suspense>
    );
}

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    InputAdornment,
    IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from './email-login.module.css';
import { env } from '@/utils/env';


function EmailLoginPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode'); // 'login' or 'signup' or null => show choice
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    useEffect(() => {
        setPasswordChecks({
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [password]);

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    useEffect(() => {
        // Keep session if it exists, only clear on explicit logout
    }, []);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateIdentifier = (id: string) => {
        // If it looks like an email, use email regex
        if (id.includes('@')) {
            return validateEmail(id);
        }
        // Otherwise it must be a valid username (at least 3 chars)
        return id.length >= 3;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'login') {
            if (!validateIdentifier(email)) {
                setError('Please enter a valid email address or username');
                return;
            }
        } else {
            if (!validateEmail(email)) {
                setError('Please enter a valid email address');
                return;
            }
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                // Direct email/password login
                const response = await fetch(`${env.apiUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    // store token and user
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    dispatch(setCredentials({ token: data.token, user: data.user }));
                    router.push('/dashboard');
                } else {
                    setError(data.message || 'Invalid credentials');
                }
            } else {
                // Signup -> send OTP
                const response = await fetch(`${env.apiUrl}/api/auth/send-email-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (data.success) {
                    sessionStorage.setItem('pendingEmail', email);
                    sessionStorage.setItem('pendingPassword', password);
                    router.push('/auth/verify-email');
                } else {
                    setError(data.message || 'Failed to send OTP');
                }
            }
        } catch {
            setError(`Cannot connect to server at ${env.apiUrl}. Please check your connection.`);
        } finally {
            setLoading(false);
        }
    };

    const isChoosing = !mode;

    return (
        <Box className={styles.container}>
            <Container maxWidth="sm">
                <Box className={styles.centerWrapper}>
                    <Card className={styles.card}>
                        <Box className={styles.header}>
                            <EmailIcon className={styles.icon} />
                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                {isChoosing ? 'Welcome' : (mode === 'login' ? 'Login' : 'Email Sign Up')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {isChoosing
                                    ? 'Create an account or log in to continue.'
                                    : (mode === 'login'
                                        ? 'Enter your username or email'
                                        : 'Enter your email and password to receive an OTP')}
                            </Typography>
                        </Box>
                        {isChoosing ? (
                            <Box className={styles.choiceWrapper}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    className={styles.continueButton}
                                    onClick={() => router.push('/auth/email-login?mode=signup')}
                                >
                                    Create Account
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    className={styles.choiceLoginButton}
                                    onClick={() => router.push('/auth/email-login?mode=login')}
                                >
                                    I already have an account
                                </Button>
                            </Box>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <TextField
                                    fullWidth
                                    type={mode === 'login' ? 'text' : 'email'}
                                    placeholder={mode === 'login' ? "Username or Email" : "your@email.com"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    autoComplete="off"
                                    className={styles.emailField}
                                    required
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

                                <Box className={styles.passwordWrapper}>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                                    {password.length > 0 && mode === 'signup' && (
                                        <Box className={styles.passwordValidationSide}>
                                            <Typography variant="caption" fontWeight="bold" display="block" mb={1} color="text.secondary">
                                                Password Requirements:
                                            </Typography>
                                            <Box className={styles.checkItem}>
                                                <Typography variant="caption" color={passwordChecks.length ? 'success.main' : 'text.disabled'}>
                                                    {passwordChecks.length ? '✓' : '○'} At least 8 characters
                                                </Typography>
                                            </Box>
                                            <Box className={styles.checkItem}>
                                                <Typography variant="caption" color={passwordChecks.upper ? 'success.main' : 'text.disabled'}>
                                                    {passwordChecks.upper ? '✓' : '○'} One uppercase letter
                                                </Typography>
                                            </Box>
                                            <Box className={styles.checkItem}>
                                                <Typography variant="caption" color={passwordChecks.number ? 'success.main' : 'text.disabled'}>
                                                    {passwordChecks.number ? '✓' : '○'} One number
                                                </Typography>
                                            </Box>
                                            <Box className={styles.checkItem}>
                                                <Typography variant="caption" color={passwordChecks.special ? 'success.main' : 'text.disabled'}>
                                                    {passwordChecks.special ? '✓' : '○'} One special character
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
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
                                    disabled={!validateIdentifier(email) || (mode === 'signup' && (!validateEmail(email) || !isPasswordValid)) || (mode === 'login' && password.length < 6) || loading}
                                    className={styles.continueButton}
                                >
                                    {mode === 'login' ? (loading ? 'Logging in...' : 'Login') : (loading ? 'Sending OTP...' : 'Send OTP')}
                                </Button>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    textAlign="center"
                                    className={styles.infoText}
                                >
                                    {mode === 'login'
                                        ? "Enter your credentials to access your account"
                                        : "We\\'ll send a 6-digit verification code to your email"}
                                </Typography>

                                {(mode === 'login' || mode === 'signup') && (
                                    <Box textAlign="center" mt={2}>
                                        {mode === 'login' && (
                                            <Button
                                                variant="text"
                                                color="primary"
                                                disabled={!validateEmail(email)}
                                                onClick={() => {
                                                    if (!validateEmail(email)) return;
                                                    const q = `?email=${encodeURIComponent(email)}`;
                                                    router.push(`/auth/forgot-password${q}`);
                                                }}
                                            >
                                                Forgot password?
                                            </Button>
                                        )}
                                        {mode === 'login' && (
                                            <Button
                                                variant="text"
                                                color="secondary"
                                                sx={{ ml: 2 }}
                                                onClick={() => router.push('/auth/email-login?mode=signup')}
                                            >
                                                Sign Up
                                            </Button>
                                        )}
                                        {mode === 'signup' && (
                                            <Button
                                                variant="text"
                                                color="secondary"
                                                sx={{ ml: 2 }}
                                                onClick={() => router.push('/auth/email-login?mode=login')}
                                            >
                                                Login
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </form>
                        )}
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}
