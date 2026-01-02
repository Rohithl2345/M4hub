'use client';

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
    IconButton,
    LinearProgress,
    Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import AuthLayout from '../AuthLayout';
import styles from './email-login.module.css';
import { env } from '@/utils/env';
import {
    validateEmail,
    validateIdentifier,
    validatePassword,
    getPasswordStrengthColor,
    getPasswordStrengthLabel
} from '@/utils/authValidation';
import ErrorHandler, { AuthErrors } from '@/utils/errorHandler';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useToast } from '@/components/ToastProvider';

function EmailLoginPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'signup'; // Default to signup to encourage new users
    const dispatch = useAppDispatch();
    const { isOnline, isSlowConnection } = useNetworkStatus();
    const { showSuccess, showError } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptCount, setAttemptCount] = useState(0);
    const [isRateLimited, setIsRateLimited] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: [] as string[],
        isValid: false
    });

    useEffect(() => {
        if (mode === 'signup' && password) {
            const strength = validatePassword(password);
            setPasswordStrength(strength);
        }
    }, [password, mode]);

    useEffect(() => {
        setEmail('');
        setPassword('');
        setError('');
        setTouched({ email: false, password: false });
        setAttemptCount(0);
        setIsRateLimited(false);
    }, [mode]);

    const [touched, setTouched] = useState({ email: false, password: false });

    const errors = {
        email: (() => {
            if (!email && touched.email) return 'Email is required';
            if (email) {
                if (mode === 'login') {
                    const result = validateIdentifier(email);
                    return result.isValid ? '' : result.error || '';
                } else {
                    const result = validateEmail(email);
                    return result.isValid ? '' : result.error || '';
                }
            }
            return '';
        })(),
        password: (() => {
            if (!password && touched.password) return 'Password is required';
            if (password && password.length < 6) return 'Password must be at least 6 characters';
            if (mode === 'signup' && password && !passwordStrength.isValid) {
                return 'Password does not meet security requirements';
            }
            return '';
        })()
    };

    const handleBlur = (field: 'email' | 'password') => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check network status first
        if (!isOnline) {
            setError('No internet connection. Please check your network and try again.');
            return;
        }

        // Set all fields as touched for validation feedback
        setTouched({ email: true, password: true });

        // Validate all fields
        if (errors.email || errors.password) {
            setError('Please fix the errors before continuing.');
            return;
        }

        // Check password strength for signup
        if (mode === 'signup' && !passwordStrength.isValid) {
            setError('Please choose a stronger password that meets all requirements.');
            return;
        }

        // Check if rate limited
        if (isRateLimited) {
            setError('Too many attempts. Please wait a moment before trying again.');
            return;
        }

        // Check attempt count (client-side rate limiting)
        if (attemptCount >= 5) {
            setIsRateLimited(true);
            setError('Too many failed attempts. Please wait 5 minutes before trying again.');
            setTimeout(() => {
                setIsRateLimited(false);
                setAttemptCount(0);
            }, 300000); // 5 minutes
            return;
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const response = await fetch(`${env.apiUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    signal: AbortSignal.timeout(60000) // 60 second timeout for cold starts
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Success - reset attempt counter
                    setAttemptCount(0);
                    showSuccess('Welcome back! Login successful.');
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    dispatch(setCredentials({ token: data.token, user: data.user }));
                    router.push('/dashboard');
                } else {
                    // Only increment counter for authentication failures (401 - wrong credentials)
                    // Don't increment for server errors, validation errors, etc.
                    if (response.status === 401) {
                        setAttemptCount(prev => prev + 1);
                    }

                    // Check for specific error types
                    if (response.status === 429) {
                        setIsRateLimited(true);
                        const msg = 'Too many login attempts. Please wait a few minutes and try again.';
                        setError(msg);
                        showError(msg);
                    } else if (response.status === 403) {
                        setError(AuthErrors.EMAIL_NOT_VERIFIED);
                        showError(AuthErrors.EMAIL_NOT_VERIFIED);
                    } else if (response.status === 401) {
                        // Wrong credentials - this is an authentication failure
                        const msg = data.message || AuthErrors.INVALID_CREDENTIALS;
                        setError(msg);
                        showError(msg);
                    } else if (response.status === 400) {
                        // Validation error
                        const msg = data.message || 'Please check your email and password.';
                        setError(msg);
                        showError(msg);
                    } else {
                        // Other errors (500, etc.)
                        const msg = data.message || 'Server error. Please try again later.';
                        setError(msg);
                        showError(msg);
                    }
                }
            } else {
                const response = await fetch(`${env.apiUrl}/api/auth/send-email-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    signal: AbortSignal.timeout(60000) // 60 second timeout for cold starts
                });

                const data = await response.json();

                if (data.success) {
                    showSuccess('Verification code sent to ' + email);
                    sessionStorage.setItem('pendingEmail', email);
                    sessionStorage.setItem('pendingPassword', password);
                    router.push('/auth/verify-email');
                } else {
                    const errorMessage = data.message || 'Failed to send verification code. Please try again.';
                    setError(errorMessage);
                    showError(errorMessage);

                    if (data.message?.toLowerCase().includes('already exists')) {
                        setError(AuthErrors.EMAIL_EXISTS);
                    }
                }
            }
        } catch (err: any) {
            console.error('Authentication error:', err);

            // Use ErrorHandler to classify error
            const appError = ErrorHandler.handleError(err);
            ErrorHandler.logError(appError, 'Login');

            // Network/Server errors - DO NOT increment attempt counter
            // These are not authentication failures (wrong password)
            // Show user-friendly message based on error type
            if (err.name === 'AbortError' || err.message?.includes('timeout')) {
                const msg = 'Request timed out. The server is taking too long to respond. Please try again.';
                setError(msg);
                showError(msg);
            } else if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
                const msg = 'Cannot connect to server. Please check if the backend is running or try again later.';
                setError(msg);
                showError(msg);
            } else if (!isOnline) {
                const msg = 'No internet connection. Please check your network and try again.';
                setError(msg);
                showError(msg);
            } else {
                const msg = 'Connection problem. Please check your internet and try again.';
                setError(msg);
                showError(msg);
            }

            // NOTE: We DO NOT increment attemptCount here!
            // Network/server errors are not the user's fault
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        const newMode = mode === 'login' ? 'signup' : 'login';
        router.push(`/auth/email-login?mode=${newMode}`);
        setEmail('');
        setPassword('');
        setError('');
        setTouched({ email: false, password: false });
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
                            {/* Password Strength Bar */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                        Password Strength:
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight="bold"
                                        sx={{ color: getPasswordStrengthColor(passwordStrength.score) }}
                                    >
                                        {getPasswordStrengthLabel(passwordStrength.score)}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(passwordStrength.score / 4) * 100}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                                            borderRadius: 3
                                        }
                                    }}
                                />
                            </Box>

                            {/* Requirements Checklist */}
                            {passwordStrength.feedback.length > 0 && (
                                <>
                                    <Typography variant="caption" fontWeight="bold" display="block" mb={1} color="text.secondary">
                                        Password Requirements:
                                    </Typography>
                                    {passwordStrength.feedback.map((feedback, idx) => (
                                        <Box key={idx} className={styles.checkItem}>
                                            <Typography variant="caption" color="error.main">
                                                ○ {feedback}
                                            </Typography>
                                        </Box>
                                    ))}
                                </>
                            )}

                            {/* Success Message */}
                            {passwordStrength.isValid && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <Typography variant="caption" color="success.main" fontWeight="bold">
                                        ✓ Password meets all requirements
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {mode === 'login' && (
                    <Box className={styles.forgotPassword}>
                        <Button
                            variant="text"
                            className={styles.forgotPasswordLink}
                            disabled={!email || validateIdentifier(email).isValid === false}
                            onClick={() => {
                                const q = email && validateEmail(email).isValid ? `?email=${encodeURIComponent(email)}` : '';
                                router.push(`/auth/forgot-password${q}`);
                            }}
                        >
                            Forgot password?
                        </Button>
                    </Box>
                )}

                {/* Network Status Indicator */}
                {(!isOnline || isSlowConnection) && (
                    <Alert
                        severity={!isOnline ? "error" : "warning"}
                        icon={!isOnline ? <WifiOffIcon /> : <SignalWifiStatusbarConnectedNoInternet4Icon />}
                        className={styles.alert}
                        sx={{ mb: 2 }}
                    >
                        {!isOnline
                            ? 'No internet connection. Please check your network.'
                            : 'Slow connection detected. This may take longer than usual.'}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" className={styles.alert}>
                        {error}
                    </Alert>
                )}

                {/* Submit Button with Enhanced Validation */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={
                        !isOnline ||
                        loading ||
                        isRateLimited ||
                        !email ||
                        !password ||
                        !!errors.email ||
                        !!errors.password ||
                        (mode === 'signup' && !passwordStrength.isValid) ||
                        (mode === 'login' && password.length < 6)
                    }
                    className={styles.continueButton}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {loading && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <LinearProgress
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '100%',
                                    opacity: 0.3
                                }}
                            />
                        </Box>
                    )}
                    {mode === 'login' ? (loading ? 'Signing in...' : 'Sign In') : (loading ? 'Creating Account...' : 'Create Account')}
                </Button>

                {/* Connection Status Badge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                    {isOnline ? (
                        <Chip
                            icon={<WifiIcon />}
                            label={isSlowConnection ? "Slow Connection" : "Connected"}
                            size="small"
                            color={isSlowConnection ? "warning" : "success"}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                    ) : (
                        <Chip
                            icon={<WifiOffIcon />}
                            label="Offline"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                    )}
                    {attemptCount > 0 && attemptCount < 5 && (
                        <Chip
                            label={`Attempt ${attemptCount}/5`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                    )}
                </Box>

                <Box className={styles.switchModeText}>
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <span className={styles.switchModeLink} onClick={switchMode}>
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </span>
                </Box>
            </form>
        </AuthLayout>
    );
}

export default function EmailLoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748b' }}>Loading...</div>
            </div>
        }>
            <EmailLoginPageInner />
        </Suspense>
    );
}
