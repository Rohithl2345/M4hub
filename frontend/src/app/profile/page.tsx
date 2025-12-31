'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated, selectUser, selectToken, selectIsLoading, updateUserEmail, updateUserPhone } from '@/store/slices/authSlice';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { env } from '@/utils/env';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WcIcon from '@mui/icons-material/Wc';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import DangerousIcon from '@mui/icons-material/Dangerous';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { logout } from '@/store/slices/authSlice';
import {
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const token = useAppSelector(selectToken);
    const isLoading = useAppSelector(selectIsLoading);

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPausing, setIsPausing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pauseDays, setPauseDays] = useState(30);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/email-login');
        }
    }, [router, isAuthenticated, isLoading]);

    useEffect(() => {
        if (user?.phoneNumber) {
            setNewPhone(user.phoneNumber);
        }
    }, [user]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return null;
    }

    const handlePhoneEdit = () => {
        setIsEditingPhone(true);
        setError('');
        setSuccess('');
    };

    const handlePhoneCancel = () => {
        setIsEditingPhone(false);
        setNewPhone(user?.phoneNumber || '');
        setError('');
    };

    const handlePhoneSave = async () => {
        if (!newPhone || newPhone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put(
                `${env.apiUrl}/api/users/profile/update-phone`,
                { phoneNumber: newPhone },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                dispatch(updateUserPhone(newPhone)); // Update Redux state
                setSuccess('Phone number updated successfully!');
                setIsEditingPhone(false);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to update phone number');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleteDialogOpen(false);
        setIsDeleting(true);
        setError('');

        try {
            const response = await axios.delete(`${env.apiUrl}/api/users/account`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { type: 'delete' }
            });

            if (response.data.success) {
                dispatch(logout());
                router.push('/auth/email-login?mode=signup');
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to delete account');
            setIsDeleting(false);
        }
    };

    const handlePauseAccount = async () => {
        setIsPauseDialogOpen(false);
        setIsPausing(true);
        setError('');

        try {
            const response = await axios.delete(`${env.apiUrl}/api/users/account`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { type: 'pause', days: pauseDays }
            });

            if (response.data.success) {
                dispatch(logout());
                router.push('/auth/email-login?mode=login');
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to pause account');
            setIsPausing(false);
        }
    };

    return (
        <DashboardLayout title="Profile">
            <div className={styles.container}>
                {success && <div className={styles.successMessage}>{success}</div>}
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.profileCard}>
                    <div className={styles.headerGradient}>
                        <div className={styles.avatarLarge}>
                            {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className={styles.cardTitle}>User Profile</h2>
                            <p className={styles.cardSubtitle}>Manage your personal information and settings</p>
                        </div>
                    </div>

                    <div className={styles.profileBody}>
                        {/* Static Username (Per User Request) */}
                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><FingerprintIcon fontSize="small" /> Username</span>
                            <span className={styles.profileValue}>{user.username}</span>
                        </div>

                        {/* Static Email */}
                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><EmailIcon fontSize="small" /> Email Address</span>
                            <div className={styles.profileValue}>
                                <span>{user.email || 'Not set'}</span>
                            </div>
                        </div>

                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><PersonIcon fontSize="small" /> Full Name</span>
                            <span className={styles.profileValue}>{user.firstName} {user.lastName}</span>
                        </div>

                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><PhoneIcon fontSize="small" /> Phone Number</span>
                            {!isEditingPhone ? (
                                <div className={styles.profileValue}>
                                    <span>{user.phoneNumber || 'Not set'}</span>
                                    <button onClick={handlePhoneEdit} className={`btn-secondary ${styles.editButton}`}>
                                        EDIT
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.editContainer}>
                                    <input
                                        type="tel"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        className={styles.input}
                                        placeholder="New phone number"
                                        disabled={loading}
                                    />
                                    <div className={styles.actions}>
                                        <button onClick={handlePhoneCancel} className={`btn-secondary ${styles.cancelButton}`} disabled={loading}>
                                            Cancel
                                        </button>
                                        <button onClick={handlePhoneSave} className={`btn-primary ${styles.saveButton}`} disabled={loading}>
                                            {loading ? '...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><CalendarMonthIcon fontSize="small" /> Date of Birth</span>
                            <div className={styles.profileValue}>
                                {user.dateOfBirth ? (
                                    <input
                                        type="date"
                                        value={user.dateOfBirth}
                                        readOnly
                                        className={styles.dateInput}
                                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
                                    />
                                ) : 'Not set'}
                            </div>
                        </div>

                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><WcIcon fontSize="small" /> Gender</span>
                            <span className={styles.profileValue}>{user.gender ? user.gender.toUpperCase() : 'Not set'}</span>
                        </div>
                    </div>

                    {/* Danger Zone Accordion */}
                    <div className={styles.dangerZoneSection}>
                        <Accordion
                            sx={{
                                backgroundColor: '#fffafa',
                                border: '1px solid #fee2e2',
                                borderRadius: '24px !important',
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                                overflow: 'hidden'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#991b1b' }} />}
                                sx={{
                                    padding: '16px 32px',
                                    '&.Mui-expanded': { minHeight: 'auto' }
                                }}
                            >
                                <div className={styles.dangerHeader}>
                                    <div className={styles.dangerTitle}>
                                        <DangerousIcon sx={{ color: '#991b1b' }} />
                                        Danger Zone
                                    </div>
                                    <Typography variant="caption" sx={{ color: '#b91c1c', opacity: 0.7, fontWeight: 500 }}>
                                        Sensitive account actions. Proceed with caution.
                                    </Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails sx={{ padding: '0 32px 32px' }}>
                                <Divider sx={{ mb: 3, borderColor: '#fee2e2' }} />
                                <div className={styles.dangerActions}>
                                    {/* Pause Account Option */}
                                    <div className={styles.actionBox}>
                                        <div className={styles.actionHeader}>
                                            <PauseCircleIcon sx={{ color: '#4f46e5' }} />
                                            <div>
                                                <div className={styles.actionTitle}>Pause Account</div>
                                                <p className={styles.actionDesc}>Temporarily deactivate your profile</p>
                                            </div>
                                        </div>
                                        <div className={styles.pauseWrapper}>
                                            <div className={styles.pauseOptionsGrid}>
                                                {[30, 60, 90].map(days => (
                                                    <button
                                                        key={days}
                                                        type="button"
                                                        className={`${styles.dayBtn} ${pauseDays === days ? styles.dayBtnActive : ''}`}
                                                        onClick={() => setPauseDays(days)}
                                                    >
                                                        {days} Days
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setIsPauseDialogOpen(true)}
                                                className={styles.confirmActionBtn}
                                                disabled={isPausing || isDeleting}
                                            >
                                                {isPausing ? 'Processing...' : 'Deactivate Account'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete Account Option */}
                                    <div className={styles.actionBox}>
                                        <div className={styles.actionHeader}>
                                            <DangerousIcon sx={{ color: '#ef4444' }} />
                                            <div>
                                                <div className={styles.actionTitle}>Permanent Deletion</div>
                                                <p className={styles.actionDesc}>Erase all your data forever</p>
                                            </div>
                                        </div>
                                        <div className={styles.warningText}>
                                            <WarningAmberIcon sx={{ fontSize: '18px', mt: '2px' }} />
                                            <p>
                                                This action is <strong>permanent</strong>. All your profile information, music preferences, and history will be cleared from our ecosystem forever.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            className={styles.deleteFinalBtn}
                                            disabled={isDeleting || isPausing}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete My Account'}
                                        </button>
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </div>

                {/* Pause Confirmation Dialog */}
                <Dialog
                    open={isPauseDialogOpen}
                    onClose={() => setIsPauseDialogOpen(false)}
                    PaperProps={{
                        sx: { borderRadius: '24px', padding: '16px', maxWidth: '450px' }
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            backgroundColor: '#eef2ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <PauseCircleIcon sx={{ fontSize: '32px', color: '#4f46e5' }} />
                        </div>
                        <DialogTitle sx={{ fontWeight: 800, fontSize: '24px', color: '#1e293b', p: 0 }}>
                            Pause Account?
                        </DialogTitle>
                    </div>
                    <DialogContent>
                        <DialogContentText sx={{ textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
                            You are about to deactivate your account for <strong>{pauseDays} days</strong>. You will be logged out immediately and cannot access the hub until this period ends.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px 24px', gap: '12px' }}>
                        <Button
                            onClick={() => setIsPauseDialogOpen(false)}
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                py: 1.5,
                                borderColor: '#e2e8f0',
                                color: '#64748b'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePauseAccount}
                            variant="contained"
                            sx={{
                                flex: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                py: 1.5,
                                backgroundColor: '#4f46e5',
                                '&:hover': { backgroundColor: '#4338ca' }
                            }}
                        >
                            Confirm Pause
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    PaperProps={{
                        sx: { borderRadius: '24px', padding: '16px', maxWidth: '450px' }
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            backgroundColor: '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <WarningIcon sx={{ fontSize: '32px', color: '#ef4444' }} />
                        </div>
                        <DialogTitle sx={{ fontWeight: 800, fontSize: '24px', color: '#991b1b', p: 0 }}>
                            Permanent Deletion?
                        </DialogTitle>
                    </div>
                    <DialogContent>
                        <DialogContentText sx={{ textAlign: 'center', color: '#64748b', fontSize: '15px' }}>
                            Are you absolutely sure? This action is <strong>irreversible</strong>. You will lose all your data, playlists, and settings forever.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px 24px', gap: '12px' }}>
                        <Button
                            onClick={() => setIsDeleteDialogOpen(false)}
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                py: 1.5,
                                borderColor: '#e2e8f0',
                                color: '#64748b'
                            }}
                        >
                            Keep Account
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            variant="contained"
                            sx={{
                                flex: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                py: 1.5,
                                backgroundColor: '#ef4444',
                                '&:hover': { backgroundColor: '#dc2626' }
                            }}
                        >
                            Delete Forever
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}