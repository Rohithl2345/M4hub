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

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const token = useAppSelector(selectToken);
    const isLoading = useAppSelector(selectIsLoading);

    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/email-login');
        }
    }, [router, isAuthenticated, isLoading]);

    useEffect(() => {
        if (user?.email) {
            setNewEmail(user.email);
        }
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

    const handleEmailEdit = () => {
        setIsEditingEmail(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditingEmail(false);
        setNewEmail(user?.email || '');
        setError('');
    };

    const handleEmailSave = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put(
                `${env.apiUrl}/api/users/profile/update-email`,
                { email: newEmail },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                dispatch(updateUserEmail(newEmail));
                setSuccess('Email updated successfully!');
                setIsEditingEmail(false);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to update email');
        } finally {
            setLoading(false);
        }
    };

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

                        {/* Editable Email */}
                        <div className={styles.profileItem}>
                            <span className={styles.profileLabel}><EmailIcon fontSize="small" /> Email Address</span>
                            {!isEditingEmail ? (
                                <div className={styles.profileValue}>
                                    <span>{user.email || 'Not set'}</span>
                                    <button onClick={handleEmailEdit} className={`btn-secondary ${styles.editButton}`}>
                                        EDIT
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.editContainer}>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className={styles.input}
                                        placeholder="New email address"
                                        disabled={loading}
                                    />
                                    <div className={styles.actions}>
                                        <button onClick={handleCancel} className={`btn-secondary ${styles.cancelButton}`} disabled={loading}>
                                            Cancel
                                        </button>
                                        <button onClick={handleEmailSave} className={`btn-primary ${styles.saveButton}`} disabled={loading}>
                                            {loading ? '...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}
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
                </div>
            </div>
        </DashboardLayout>
    );
}