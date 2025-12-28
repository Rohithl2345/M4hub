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
    IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateIdentifier = (id: string) => {
        return id.length >= 3; // Basic check for email or username
    };

    const hasUppercase = (pw: string) => /[A-Z]/.test(pw);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateIdentifier(email)) {
            setError('Please enter a valid email or username');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!hasUppercase(newPassword)) {
            setError('Password must contain at least one uppercase letter');
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
        setEmail(emailParam || '');
        // Clear password fields when changing/entering the reset context
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    }, [emailParam]);

    const isButtonDisabled = !email || newPassword.length < 8 || !hasUppercase(newPassword) || newPassword !== confirmPassword || loading || !!success;

    return (
        <AuthLayout>
            <Box className={styles.formHeader}>
                <Typography
                    variant="h4"
                    className={styles.formTitle}
                    sx={{
                        fontSize: '32px !important',
                        fontWeight: '800 !important',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important',
                        WebkitBackgroundClip: 'text !important',
                        WebkitTextFillColor: 'transparent !important',
                        backgroundClip: 'text !important',
                        mb: 1
                    }}
                >
                    Reset Password
                </Typography>
                <Typography className={styles.formSubtitle}>
                    Secure your account with a new password
                </Typography>
            </Box>

            <Box sx={{
                mb: 3,
                textAlign: 'center',
                backgroundColor: 'rgba(226, 232, 240, 0.4)',
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid rgba(203, 213, 225, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
            }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
                    Resetting password for
                </Typography>
                <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '14px' }}>
                    {email || 'User'}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Box className={styles.inputGroup}>
                    <label className={styles.fieldLabel}>New Password</label>
                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters + Uppercase"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={styles.passwordField}
                        required
                        autoComplete="new-password"
                        InputProps={{
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
                    <label className={styles.fieldLabel}>Confirm Password</label>
                    <TextField
                        fullWidth
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={styles.passwordField}
                        required
                        autoComplete="new-password"
                        error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                        helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? "Passwords don't match" : ""}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
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
                    disabled={isButtonDisabled}
                    className={styles.continueButton}
                    sx={{ mt: 2 }}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </Button>

                <Box className={styles.switchModeText}>
                    Remembered your password?{' '}
                    <span
                        className={styles.switchModeLink}
                        onClick={() => router.push('/auth/email-login?mode=login')}
                    >
                        Sign In
                    </span>
                </Box>
            </form>
        </AuthLayout>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Loading...</Typography>
            </Box>
        }>
            <ForgotPasswordPageInner />
        </Suspense>
    );
}
