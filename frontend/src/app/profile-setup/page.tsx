'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import axios from 'axios';
import logger from '@/utils/logger';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import AuthLayout from '../auth/AuthLayout';
import styles from '../auth/email-login/email-login.module.css';
import { env } from '@/utils/env';

export default function ProfileSetupPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Dayjs | null>(null);
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/auth/email-login');
        }
    }, [router]);

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
        } catch {
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

        const payload = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: username.toLowerCase().trim(),
            dateOfBirth: dateOfBirth?.format('YYYY-MM-DD'),
            gender,
            email: email.trim() || null,
        };

        logger.debug('Sending profile setup request', payload);

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('Please login first');
                router.push('/auth/email-login');
                return;
            }

            const response = await axios.post(
                `${env.apiUrl}/api/users/profile/setup`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success && response.data.data) {
                dispatch(setCredentials({
                    token: token,
                    user: response.data.data,
                }));

                router.push('/dashboard');
            } else {
                logger.warn('Profile setup response not successful', response.data);
                setError(response.data.message || 'Failed to setup profile');
            }
        } catch (err) {
            logger.error('Profile setup failed', err);
            const error = err as { response?: { data?: { message?: string, errors?: Record<string, string> } } };
            const backendMessage = error.response?.data?.message;
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                const detailedError = Object.entries(validationErrors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(', ');
                setError(`Validation failed: ${detailedError}`);
            } else {
                setError(backendMessage || 'Failed to setup profile');
            }
        } finally {
            setIsLoading(false);
        }
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
                    Complete Your Profile
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
                    Tell us a bit about yourself
                </Typography>
            </Box>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Box className={styles.inputGroup}>
                    <label htmlFor="first-name-input" className={styles.fieldLabel}>
                        First Name *
                    </label>
                    <TextField
                        id="first-name-input"
                        fullWidth
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoComplete="off"
                        className={styles.emailField}
                        InputProps={{
                            sx: {
                                backgroundColor: '#f8fafc',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'white',
                                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                    transform: 'translateY(-1px)',
                                },
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

                <Box className={styles.inputGroup}>
                    <label htmlFor="last-name-input" className={styles.fieldLabel}>
                        Last Name *
                    </label>
                    <TextField
                        id="last-name-input"
                        fullWidth
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        autoComplete="off"
                        className={styles.emailField}
                        InputProps={{
                            sx: {
                                backgroundColor: '#f8fafc',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'white',
                                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                    transform: 'translateY(-1px)',
                                },
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

                <Box className={styles.inputGroup}>
                    <label htmlFor="username-input" className={styles.fieldLabel}>
                        Username (Unique ID) *
                    </label>
                    <TextField
                        id="username-input"
                        fullWidth
                        placeholder="e.g. johndoe123"
                        value={username}
                        onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                            setUsername(val);
                            checkUsername(val);
                        }}
                        required
                        autoComplete="off"
                        className={styles.emailField}
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
                                backgroundColor: '#f8fafc',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'white',
                                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                    transform: 'translateY(-1px)',
                                },
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

                <Box className={styles.inputGroup}>
                    <label htmlFor="dob-input" className={styles.fieldLabel}>
                        Date of Birth *
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={dateOfBirth}
                            onChange={(newValue) => setDateOfBirth(newValue)}
                            maxDate={dayjs()}
                            slotProps={{
                                textField: {
                                    id: 'dob-input',
                                    fullWidth: true,
                                    required: true,
                                    placeholder: 'Select your date of birth',
                                    className: styles.emailField,
                                    InputProps: {
                                        sx: {
                                            backgroundColor: '#f8fafc',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                backgroundColor: '#f1f5f9',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: 'white',
                                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                                transform: 'translateY(-1px)',
                                            },
                                            '& input': {
                                                backgroundColor: 'transparent !important',
                                                color: '#1e293b !important',
                                                WebkitBoxShadow: '0 0 0 1000px #f8fafc inset !important',
                                                WebkitTextFillColor: '#1e293b !important',
                                                cursor: 'pointer',
                                            },
                                        }
                                    }
                                },
                                openPickerButton: {
                                    sx: {
                                        color: '#3b82f6',
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        }
                                    }
                                },
                                popper: {
                                    sx: {
                                        '& .MuiPaper-root': {
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            marginTop: '8px',
                                        },
                                        '& .MuiPickersCalendarHeader-root': {
                                            paddingLeft: '16px',
                                            paddingRight: '16px',
                                            marginTop: '8px',
                                        },
                                        '& .MuiPickersCalendarHeader-label': {
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#0f172a',
                                        },
                                        '& .MuiPickersArrowSwitcher-button': {
                                            color: '#64748b',
                                            '&:hover': {
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                color: '#3b82f6',
                                            }
                                        },
                                        '& .MuiDayCalendar-weekDayLabel': {
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#64748b',
                                        },
                                        '& .MuiPickersDay-root': {
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#334155',
                                            '&:hover': {
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#3b82f6 !important',
                                                color: 'white !important',
                                                fontWeight: '600',
                                                '&:hover': {
                                                    backgroundColor: '#2563eb !important',
                                                }
                                            },
                                            '&.MuiPickersDay-today': {
                                                border: '2px solid #3b82f6',
                                                backgroundColor: 'transparent',
                                            }
                                        },
                                        '& .MuiPickersYear-yearButton': {
                                            fontSize: '14px',
                                            '&.Mui-selected': {
                                                backgroundColor: '#3b82f6 !important',
                                                color: 'white !important',
                                                fontWeight: '600',
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Box>

                <FormControl fullWidth>
                    <label className={styles.fieldLabel}>
                        Gender *
                    </label>
                    <ToggleButtonGroup
                        value={gender}
                        exclusive
                        onChange={(e, newGender) => newGender && setGender(newGender)}
                        fullWidth
                        sx={{
                            '& .MuiToggleButton-root': {
                                padding: '12px 16px',
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                fontSize: '15px',
                                fontWeight: '500',
                                textTransform: 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: '#f8fafc',
                                    borderColor: '#cbd5e1',
                                    transform: 'translateY(-1px)',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderColor: '#3b82f6',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                                    transform: 'translateY(-1px)',
                                    '&:hover': {
                                        backgroundColor: '#2563eb',
                                        borderColor: '#2563eb',
                                        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.35)',
                                    }
                                }
                            }
                        }}
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
                    className={styles.emailField}
                    InputProps={{
                        sx: {
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover fieldset': {
                                borderColor: '#3b82f6',
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'white',
                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                transform: 'translateY(-1px)',
                            },
                            '& input': {
                                backgroundColor: 'transparent !important',
                                color: '#1e293b !important',
                                WebkitBoxShadow: '0 0 0 1000px #f8fafc inset !important',
                                WebkitTextFillColor: '#1e293b !important'
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
                    className={styles.continueButton}
                >
                    {isLoading ? 'Setting up...' : 'Complete Profile'}
                </Button>
            </form>
        </AuthLayout>
    );
}
