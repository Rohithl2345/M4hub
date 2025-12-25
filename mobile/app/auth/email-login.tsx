import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { APP_CONFIG, API_ENDPOINTS } from '@/constants';

export default function EmailLoginScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateIdentifier = (id: string) => {
        if (id.includes('@')) {
            return validateEmail(id);
        }
        return id.length >= 3;
    };

    const handleContinue = async () => {
        if (mode === 'login') {
            if (!validateIdentifier(email)) {
                Alert.alert('Invalid ID', 'Please enter a valid email address or username');
                return;
            }
        } else {
            if (!validateEmail(email)) {
                Alert.alert('Invalid Email', 'Please enter a valid email address');
                return;
            }
        }
        if (password.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            if (mode === 'login') {
                // Direct Login
                const response = await fetch(`${APP_CONFIG.API_URL}${API_ENDPOINTS.AUTH.LOGIN_EMAIL}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    dispatch(setCredentials({ token: data.token, user: data.user }));
                    router.replace('/(tabs)');
                } else {
                    Alert.alert('Login Failed', data.message || 'Invalid credentials');
                }
            } else {
                // Send OTP for Signup
                const response = await fetch(`${APP_CONFIG.API_URL}${API_ENDPOINTS.AUTH.SEND_EMAIL_OTP}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    router.push({
                        pathname: '/auth/email-verification',
                        params: { email, password }
                    });
                } else {
                    Alert.alert('Signup Error', data.message || 'Failed to send OTP. Please try again.');
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            Alert.alert('Error', 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ThemedText style={styles.backText}>← Back</ThemedText>
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>
                    {mode === 'login' ? 'Login' : 'Email Sign Up'}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    {mode === 'login'
                        ? 'Enter your username or email'
                        : 'Enter your email and password to receive an OTP'}
                </ThemedText>
            </View>

            <View style={styles.form}>
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
                        onPress={() => setMode('login')}
                    >
                        <ThemedText style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Login</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
                        onPress={() => setMode('signup')}
                    >
                        <ThemedText style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Sign Up</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>{mode === 'login' ? 'Username or Email' : 'Email Address'}</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={mode === 'login' ? "Username or Email" : "your@email.com"}
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={(text) => setEmail(text.trim())}
                        keyboardType={mode === 'login' ? "default" : "email-address"}
                        autoCapitalize="none"
                        autoComplete={mode === 'login' ? "username" : "email"}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Password</ThemedText>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                        >
                            <ThemedText style={styles.eyeIcon}>
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {mode === 'login' && (
                    <TouchableOpacity style={styles.forgotPassword}>
                        <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={!validateEmail(email) || password.length < 6 || isLoading}
                >
                    <LinearGradient
                        colors={(!validateEmail(email) || password.length < 6 || isLoading) ? ['#ccc', '#ccc'] : ['#5433ff', '#20bdff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.continueButton}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ThemedText style={styles.continueButtonText}>
                                {mode === 'login' ? 'Login' : 'Send OTP'}
                            </ThemedText>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                    <ThemedText style={styles.infoText}>
                        {mode === 'login'
                            ? 'Securely access your account'
                            : "We'll send a verification code to your email"}
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        marginTop: 60,
        marginBottom: 40,
    },
    backButton: {
        marginBottom: 20,
    },
    backText: {
        fontSize: 16,
        color: '#007AFF',
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        opacity: 0.7,
        fontSize: 16,
        marginTop: 8,
    },
    form: {
        flex: 1,
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    modeButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    modeTextActive: {
        color: '#5433ff',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        height: 56,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        height: 56,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    eyeButton: {
        padding: 16,
    },
    eyeIcon: {
        fontSize: 20,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
    },
    continueButton: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    infoText: {
        textAlign: 'center',
        opacity: 0.6,
        fontSize: 14,
    },
});
