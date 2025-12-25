'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import axios from 'axios';
import logger from '@/utils/logger';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    ToggleButton,
    ToggleButtonGroup,
    FormControl
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import styles from './profile-setup.module.css';

import { env } from '@/utils/env';

export default function ProfileSetupPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const checkUsername = async (value: string) => {
        if (value.length < 3) {
            setUsernameStatus('idle');
            return;
        }
        setUsernameStatus('checking');
        try {
            const response = await axios.get(`${env.apiUrl}/api/users/check-username?username=${value}`);
            if (response.data.success && response.data.data) {
                setUsernameStatus('available');
            } else {
                setUsernameStatus('taken');
            }
        } catch (err) {
            setUsernameStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim()) {
            setError('Please enter your first and last name');
            return;
        }

        if (usernameStatus !== 'available') {
            setError('Please choose a valid and available username');
            return;
        }

        if (!dateOfBirth) {
            setError('Please select your date of birth');
            return;
        }

        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('Please login first');
                router.push('/auth/email-login');
                return;
            }

            const response = await axios.post(
                `${env.apiUrl}/api/users/profile/setup`,
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    username: username.toLowerCase().trim(),
                    dateOfBirth,
                    gender,
                    email: email.trim() || null,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success && response.data.data) {
                // Update Redux store with new user data
                dispatch(setCredentials({
                    token: token,
                    user: response.data.data,
                }));

                router.push('/dashboard');
            } else {
                setError(response.data.message || 'Failed to setup profile');
            }
        } catch (err) {
            logger.error('Profile setup failed', { error: err });
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to setup profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box className={styles.container}>
            <Container maxWidth="sm">
                <Box className={styles.centerWrapper}>
                    <Card className={styles.card}>
                        <Box className={styles.header}>
                            <PersonIcon className={styles.icon} />
                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                Complete Your Profile
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Tell us a bit about yourself
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <TextField
                                fullWidth
                                label="First Name *"
                                placeholder="Enter first name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                autoComplete="off"
                                className={styles.textField}
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

                            <TextField
                                fullWidth
                                label="Last Name *"
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                autoComplete="off"
                                className={styles.textField}
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

                            <TextField
                                fullWidth
                                label="Username (Unique ID) *"
                                placeholder="e.g. johndoe123"
                                value={username}
                                onChange={(e) => {
                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                    setUsername(val);
                                    checkUsername(val);
                                }}
                                required
                                autoComplete="off"
                                className={styles.textField}
                                helperText={
                                    usernameStatus === 'checking' ? 'Checking...' :
                                        usernameStatus === 'available' ? '✓ Username available' :
                                            usernameStatus === 'taken' ? '✗ Username already taken' :
                                                'Username will be used to find you'
                                }
                                error={usernameStatus === 'taken'}
                                FormHelperTextProps={{
                                    sx: { color: usernameStatus === 'available' ? 'green' : undefined }
                                }}
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

                            <TextField
                                fullWidth
                                type="date"
                                label="Date of Birth *"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                required
                                autoComplete="off"
                                className={styles.textField}
                                InputProps={{
                                    sx: {
                                        backgroundColor: 'white !important',
                                        '& input': {
                                            backgroundColor: 'white !important',
                                            color: 'black !important',
                                            WebkitBoxShadow: '0 0 0 1000px white inset !important',
                                            WebkitTextFillColor: 'black !important'
                                        },
                                        '& input::-webkit-calendar-picker-indicator': {
                                            filter: 'invert(0)',
                                            cursor: 'pointer',
                                            opacity: 1
                                        }
                                    }
                                }}
                            />

                            <FormControl fullWidth className={styles.formControl}>
                                <Typography variant="body2" fontWeight="bold" className={styles.genderLabel}>
                                    Gender *
                                </Typography>
                                <ToggleButtonGroup
                                    value={gender}
                                    exclusive
                                    onChange={(e, newGender) => newGender && setGender(newGender)}
                                    fullWidth
                                    className={styles.genderGroup}
                                >
                                    <ToggleButton value="male">Male</ToggleButton>
                                    <ToggleButton value="female">Female</ToggleButton>
                                    <ToggleButton value="other">Other</ToggleButton>
                                </ToggleButtonGroup>
                            </FormControl>

                            <TextField
                                fullWidth
                                type="email"
                                label="Email (Optional)"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                                className={styles.textField}
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

                            {error && (
                                <Alert severity="error" className={styles.alert}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? 'Setting up...' : 'Complete Profile'}
                            </Button>
                        </form>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}
