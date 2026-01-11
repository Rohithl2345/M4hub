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
import AuthLayout from '../AuthLayout';
import styles from '../email-login/email-login.module.css';
import { env } from '@/utils/env';
import { useToast } from '@/components/ToastProvider';

function ForgotPasswordPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showSuccess, showError } = useToast();
    const emailParam = searchParams.get('email');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Get the email from URL params - this is required
    const email = emailParam?.trim() || '';

    const hasUppercase = (pw: string) => /[A-Z]/.test(pw);
    const hasLowercase = (pw: string) => /[a-z]/.test(pw);
    const hasNumber = (pw: string) => /[0-9]/.test(pw);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            showError('No email/username provided. Redirecting to login...');
            setTimeout(() => router.push('/auth/email-login?mode=login'), 1500);
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
                showSuccess('Password reset successful! Redirecting to login...');
                setSuccess('Success! Redirecting...');
                setTimeout(() => router.push('/auth/email-login?mode=login'), 1800);
            } else {
                const errMsg = data.message || 'Failed to reset password';
                setError(errMsg);
                showError(errMsg);
            }
        } catch {
            const errMsg = 'Cannot connect to server. Please ensure the backend is running.';
            setError(errMsg);
            showError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Redirect to login if no email is provided
    useEffect(() => {
        if (!emailParam) {
            showError('Please enter your email/username on the login page first');
            const timer = setTimeout(() => {
                router.push('/auth/email-login?mode=login');
            }, 2000);
            return () => clearTimeout(timer);
        }
        // Clear password fields on mount
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    }, [emailParam, router, showError]);

    // Button disabled logic - check all conditions
    const isPasswordValid = newPassword.length >= 8 && hasUppercase(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const isButtonDisabled = !email || !isPasswordValid || !passwordsMatch || loading || !!success;

    // Show loading state if no email (will redirect)
    if (!email) {
        return (
            <AuthLayout>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
                        No email provided
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Redirecting to login page...
                    </Typography>
                </Box>
            </AuthLayout>
        );
    }

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

            {/* Display the email/username from login page (read-only) */}
            <Box sx={{
                mb: 3,
                textAlign: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                p: 2,
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
                <Typography variant="caption" sx={{
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '10px',
                    display: 'block',
                    mb: 0.5
                }}>
                    Resetting password for
                </Typography>
                <Typography sx={{
                    color: '#1e40af',
                    fontWeight: 700,
                    fontSize: '16px',
                    wordBreak: 'break-all'
                }}>
                    {email}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Box className={styles.inputGroup}>
                    <label className={styles.fieldLabel}>New Password *</label>
                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters + Uppercase"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={styles.passwordField}
                        autoComplete="new-password"
                        autoFocus
                        error={newPassword.length > 0 && !isPasswordValid}
                        helperText={newPassword.length > 0 && !isPasswordValid ? "Min 8 chars with uppercase required" : ""}
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
                    <label className={styles.fieldLabel}>Confirm Password *</label>
                    <TextField
                        fullWidth
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={styles.passwordField}
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

                {/* Password Requirements Checklist */}
                {newPassword.length > 0 && (
                    <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'rgba(226, 232, 240, 0.3)', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 1, display: 'block' }}>
                            Password Requirements:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: newPassword.length >= 8 ? '#22c55e' : '#ef4444' }}>
                                {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                            </Typography>
                            <Typography variant="caption" sx={{ color: hasUppercase(newPassword) ? '#22c55e' : '#ef4444' }}>
                                {hasUppercase(newPassword) ? '✓' : '○'} One uppercase letter
                            </Typography>
                            <Typography variant="caption" sx={{ color: hasLowercase(newPassword) ? '#22c55e' : '#64748b' }}>
                                {hasLowercase(newPassword) ? '✓' : '○'} One lowercase letter (recommended)
                            </Typography>
                            <Typography variant="caption" sx={{ color: hasNumber(newPassword) ? '#22c55e' : '#64748b' }}>
                                {hasNumber(newPassword) ? '✓' : '○'} One number (recommended)
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Error/Success shown via toast notification - removed inline Alerts to avoid duplicate */}

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


