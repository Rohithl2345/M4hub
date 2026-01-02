import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, selectToken, selectUser } from '@/store/slices/authSlice';
import { AuthBackground, authThemes } from '@/components/AuthBackground';
import axios from 'axios';
import { APP_CONFIG } from '@/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const user = useAppSelector(selectUser);
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [isLoading, setIsLoading] = useState(false);
    const [isServerWakingUp, setIsServerWakingUp] = useState(false);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

    // Auto-cycle themes every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentThemeIndex((prev) => (prev + 1) % authThemes.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Handle "Server Waking Up" feedback for slow initial requests (Render cold starts)
    useEffect(() => {
        let wakingTimer: any;
        if (isLoading) {
            wakingTimer = setTimeout(() => {
                setIsServerWakingUp(true);
            }, 3000); // Show message after 3 seconds
        } else {
            setIsServerWakingUp(false);
        }
        return () => clearTimeout(wakingTimer);
    }, [isLoading]);

    // Pre-fill email from user data
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const checkUsername = async (value: string) => {
        if (value.length < 3) {
            setUsernameStatus('idle');
            return;
        }
        setUsernameStatus('checking');
        try {
            const response = await axios.get(`${APP_CONFIG.API_URL}/api/users/check-username?username=${value.toLowerCase().trim()}`);
            if (response.data.success && response.data.data) {
                setUsernameStatus('available');
            } else {
                setUsernameStatus('taken');
            }
        } catch (err) {
            setUsernameStatus('idle');
        }
    };

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Check if form is valid
    const isFormValid = (() => {
        if (!firstName || !lastName || !username) return false;
        if (usernameStatus !== 'available') return false;
        return true;
    })();

    const handleSubmit = async () => {
        if (!firstName || !lastName || !username) {
            showError('Please fill in all required fields');
            return;
        }

        if (usernameStatus !== 'available') {
            showError('Please choose an available username');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.toLowerCase().trim(),
                email: email.trim() || null,
                dateOfBirth: formatDate(dateOfBirth),
                gender,
            };

            const response = await axios.post(
                `${APP_CONFIG.API_URL}/api/users/profile/setup`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                showSuccess('Profile updated successfully!');
                dispatch(setCredentials({ token: token!, user: response.data.data }));
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 1000);
            } else {
                showError(response.data.message || 'Failed to update profile');
            }
        } catch (error: any) {
            showError(error.response?.data?.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <View style={styles.container}>
                {/* Dynamic Background with Floating Icons */}
                <AuthBackground currentThemeIndex={currentThemeIndex} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                >
                    {/* Professional Header */}
                    <View style={styles.headerSection}>
                        <View style={styles.brandContainer}>
                            <View style={styles.logoCircle}>
                                <LinearGradient
                                    colors={['#ffffff', '#f0f9ff'] as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.logoGradient}
                                >
                                    <Ionicons name="person" size={32} color="#3b82f6" />
                                </LinearGradient>
                            </View>
                            <ThemedText style={styles.brandName}>M4HUB</ThemedText>
                            <ThemedText style={styles.brandTagline}>Your Digital Ecosystem</ThemedText>
                        </View>
                    </View>

                    {/* Main Card */}
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            {/* Title Section */}
                            <View style={styles.titleSection}>
                                <ThemedText style={styles.pageTitle}>Complete Your Profile</ThemedText>
                                <ThemedText style={styles.pageSubtitle}>
                                    Tell us a bit about yourself
                                </ThemedText>
                            </View>

                            {/* Form Fields */}
                            <View style={styles.formSection}>
                                {/* First Name */}
                                <View style={styles.inputWrapper}>
                                    <ThemedText style={styles.label}>FIRST NAME</ThemedText>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your first name"
                                            placeholderTextColor="#94a3b8"
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>

                                {/* Last Name */}
                                <View style={styles.inputWrapper}>
                                    <ThemedText style={styles.label}>LAST NAME</ThemedText>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your last name"
                                            placeholderTextColor="#94a3b8"
                                            value={lastName}
                                            onChangeText={setLastName}
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>

                                {/* Username */}
                                <View style={styles.inputWrapper}>
                                    <ThemedText style={styles.label}>USERNAME</ThemedText>
                                    <View style={[
                                        styles.inputContainer,
                                        usernameStatus === 'available' && styles.inputSuccess,
                                        usernameStatus === 'taken' && styles.inputError,
                                    ]}>
                                        <Ionicons name="at" size={20} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Choose a username"
                                            placeholderTextColor="#94a3b8"
                                            value={username}
                                            onChangeText={(text) => {
                                                setUsername(text);
                                                checkUsername(text);
                                            }}
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                        />
                                        {usernameStatus === 'checking' && (
                                            <ActivityIndicator size="small" color="#64748b" />
                                        )}
                                        {usernameStatus === 'available' && (
                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        )}
                                        {usernameStatus === 'taken' && (
                                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                                        )}
                                    </View>
                                    {usernameStatus === 'taken' && (
                                        <ThemedText style={styles.errorText}>Username is already taken</ThemedText>
                                    )}
                                </View>

                                {/* Email Address (Read Only) */}
                                <View style={styles.inputWrapper}>
                                    <ThemedText style={styles.label}>EMAIL ADDRESS</ThemedText>
                                    <View style={[styles.inputContainer, { backgroundColor: '#f1f5f9', opacity: 0.8 }]}>
                                        <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: '#64748b' }]}
                                            value={email}
                                            editable={false}
                                        />
                                        <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                                    </View>
                                </View>



                                {/* Date of Birth */}
                                <View style={styles.inputWrapper}>
                                    <ThemedText style={styles.label}>DATE OF BIRTH</ThemedText>
                                    <TouchableOpacity
                                        style={styles.inputContainer}
                                        onPress={() => setShowDatePicker(true)}
                                        disabled={isLoading}
                                    >
                                        <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                        <ThemedText style={styles.dateText}>
                                            {formatDate(dateOfBirth)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dateOfBirth}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setDateOfBirth(selectedDate);
                                            }
                                        }}
                                        maximumDate={new Date()}
                                    />
                                )}

                                {/* Gender */}
                                <View style={styles.inputWrapper}>
                                    <ThemedText style={styles.label}>GENDER</ThemedText>
                                    <View style={styles.genderContainer}>
                                        {(['male', 'female', 'other'] as const).map((g) => (
                                            <TouchableOpacity
                                                key={g}
                                                style={[
                                                    styles.genderButton,
                                                    gender === g && styles.genderButtonActive,
                                                ]}
                                                onPress={() => setGender(g)}
                                                disabled={isLoading}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.genderText,
                                                        gender === g && styles.genderTextActive,
                                                    ]}
                                                >
                                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (!isFormValid || isLoading) && styles.submitButtonDisabled
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={!isFormValid || isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#3b82f6', '#2563eb'] as any}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.submitGradient}
                                    >
                                        {isLoading ? (
                                            <View style={{ alignItems: 'center' }}>
                                                <ActivityIndicator color="#fff" size="small" />
                                                {isServerWakingUp && (
                                                    <ThemedText style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 4, fontWeight: '600', textAlign: 'center' }}>
                                                        Saving profile...{"\n"}(May take 30-50s)
                                                    </ThemedText>
                                                )}
                                            </View>
                                        ) : (
                                            <>
                                                <ThemedText style={styles.submitText}>
                                                    Complete Setup
                                                </ThemedText>
                                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Spacer */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    brandContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    logoGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2.5,
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    brandTagline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
        letterSpacing: 0.8,
        textShadowColor: 'rgba(0,0,0,0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    cardContainer: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    titleSection: {
        marginBottom: 28,
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 6,
        letterSpacing: -0.5,
        lineHeight: 38,
        textAlign: 'center',
    },
    pageSubtitle: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
        letterSpacing: 0.2,
        lineHeight: 22,
        textAlign: 'center',
    },
    formSection: {
        gap: 18,
    },
    inputWrapper: {
        gap: 7,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    inputSuccess: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '500',
    },
    dateText: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 11,
        color: '#ef4444',
        fontWeight: '600',
        marginTop: 3,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        alignItems: 'center',
    },
    genderButtonActive: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    genderTextActive: {
        color: '#3b82f6',
    },
    submitButton: {
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
        backgroundColor: '#3b82f6',
    },
    submitText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.4,
    },
});
