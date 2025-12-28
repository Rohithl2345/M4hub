
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
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from './email-login.module.css';
import { env } from '@/utils/env';



function FloatingBackground({ Icon }: { Icon: any }) {
    const items = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${(i * 13 + 7) % 80 + 10}%`, // Keep within 10-90% to avoid edges
        delay: `-${(i * 1.8) % 20}s`,
        duration: `${10 + (i % 12)}s`,
        size: `${20 + (i % 6) * 10}px`
    }));

    return (
        <Box className={styles.floatingIconsContainer}>
            {items.map((item) => (
                <Icon
                    key={item.id}
                    className={styles.floatingIcon}
                    sx={{
                        left: item.left,
                        fontSize: item.size,
                        animationDelay: item.delay,
                        animationDuration: item.duration,
                    }}
                />
            ))}
        </Box>
    );
}

function EmailLoginPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'signup'; // Default to signup to encourage new users
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: MusicNoteIcon,
            title: 'Music',
            desc: 'Stream unlimited tracks',
            color: '#10b981', // Portal Green
            bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
        },
        {
            icon: ChatBubbleIcon,
            title: 'Messages',
            desc: 'Connect with friends',
            color: '#3b82f6',
            bg: 'linear-gradient(135deg, #172554 0%, #1e40af 100%)'
        },
        {
            icon: AccountBalanceWalletIcon,
            title: 'Money',
            desc: 'Manage finances securely',
            color: '#f59e0b',
            bg: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)'
        },
        {
            icon: NewspaperIcon,
            title: 'News',
            desc: 'Stay updated daily',
            color: '#ef4444',
            bg: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateIdentifier = (id: string) => {
        if (id.includes('@')) {
            return validateEmail(id);
        }
        return id.length >= 3;
    };

    const [touched, setTouched] = useState({ email: false, password: false });

    const errors = {
        email: (() => {
            if (!email) return '';
            if (mode === 'login' && !validateIdentifier(email)) return 'Please enter a valid email or username';
            if (mode === 'signup' && !validateEmail(email)) return 'Please enter a valid email address';
            return '';
        })(),
        password: (() => {
            if (!password) return '';
            if (password.length < 6) return 'Password must be at least 6 characters';
            return '';
        })()
    };

    const handleBlur = (field: 'email' | 'password') => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        setTouched({ email: true, password: true });

        if (errors.email || errors.password) {
            return;
        }
        if (mode === 'signup' && !isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                const response = await fetch(`${env.apiUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    dispatch(setCredentials({ token: data.token, user: data.user }));
                    router.push('/dashboard');
                } else {
                    setError(data.message || 'Invalid credentials');
                }
            } else {
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

    const switchMode = () => {
        const newMode = mode === 'login' ? 'signup' : 'login';
        router.push(`/auth/email-login?mode=${newMode}`);
        setError('');
        setTouched({ email: false, password: false });
    };

    return (
        <Box className={styles.container}>
            {/* Left Side - Vertical Feature List */}
            <Box
                className={styles.brandingSide}
                sx={{ background: `${features[activeFeature].bg} !important` }}
            >
                {/* Floating Icons Background */}
                <FloatingBackground Icon={features[activeFeature].icon} />

                <Box className={styles.logoSection}>
                    <Typography className={styles.logoText}>M4Hub</Typography>
                    <Typography className={styles.tagline}>Your Digital Ecosystem</Typography>
                </Box>

                <Box className={styles.featureList}>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isActive = index === activeFeature;
                        return (
                            <Box
                                key={index}
                                className={`${styles.featureRow} ${isActive ? styles.activeRow : styles.inactiveRow}`}
                                onClick={() => setActiveFeature(index)}
                            >
                                <Box className={styles.iconWrapper} sx={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                                    <Icon className={styles.featureIcon} sx={{ color: 'white' }} />
                                </Box>
                                <Box className={styles.textWrapper}>
                                    <Typography className={styles.featureTitle}>{feature.title}</Typography>
                                    <Box className={styles.descWrapper}>
                                        <Typography className={styles.featureDesc}>{feature.desc}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box className={styles.formSide}>
                <Box className={styles.formContainer}>
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
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
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
                            {mode === 'login'
                                ? 'Sign in to access your account'
                                : 'Join M4Hub and start your journey'}
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Box className={styles.inputGroup}>
                            <label htmlFor="email-input" className={styles.fieldLabel}>
                                {mode === 'login' ? 'Email or Username' : 'Email Address'} *
                            </label>
                            <TextField
                                id="email-input"
                                fullWidth
                                type={mode === 'login' ? 'text' : 'email'}
                                placeholder={mode === 'login' ? "Enter your email or username" : "Enter your email address"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => handleBlur('email')}
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                autoFocus
                                autoComplete="off"
                                className={styles.emailField}
                                required
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

                        <Box className={styles.passwordWrapper}>
                            <label htmlFor="password-input" className={styles.fieldLabel}>
                                Password *
                            </label>
                            <TextField
                                id="password-input"
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => handleBlur('password')}
                                error={touched.password && !!errors.password}
                                helperText={touched.password && errors.password}
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
                                        <Typography variant="caption" color={passwordChecks.lower ? 'success.main' : 'text.disabled'}>
                                            {passwordChecks.lower ? '✓' : '○'} One lowercase letter
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

                        {mode === 'login' && (
                            <Box className={styles.forgotPassword}>
                                <Button
                                    variant="text"
                                    className={styles.forgotPasswordLink}
                                    disabled={!validateEmail(email)}
                                    onClick={() => {
                                        if (!validateEmail(email)) return;
                                        const q = `?email=${encodeURIComponent(email)}`;
                                        router.push(`/auth/forgot-password${q}`);
                                    }}
                                >
                                    Forgot password?
                                </Button>
                            </Box>
                        )}

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
                            {mode === 'login' ? (loading ? 'Signing in...' : 'Sign In') : (loading ? 'Creating Account...' : 'Create Account')}
                        </Button>

                        <Box className={styles.switchModeText}>
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <span className={styles.switchModeLink} onClick={switchMode}>
                                {mode === 'login' ? 'Sign Up' : 'Sign In'}
                            </span>
                        </Box>
                    </form>
                </Box>
            </Box>
        </Box>
    );
}
