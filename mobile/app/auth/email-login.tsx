import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, Href } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';

export default function EmailLoginScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        return authService.validateEmail(email);
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
            if (mode === 'login' && !validateIdentifier(email)) return 'Invalid email or username';
            if (mode === 'signup' && !validateEmail(email)) return 'Invalid email address';
            return '';
        })(),
        password: (() => {
            if (!password) return '';
            if (password.length < 6) return 'Password must be at least 6 characters';
            if (mode === 'signup') {
                const passValidation = authService.validatePassword(password);
                if (!passValidation.valid) return 'Weak password (see requirements)';
            }
            return '';
        })()
    };

    const handleContinue = async () => {
        // Mark all as touched
        setTouched({ email: true, password: true });

        if (errors.email || errors.password) {
            return;
        }

        if (mode === 'signup') {
            const passValidation = authService.validatePassword(password);
            if (!passValidation.valid) {
                Alert.alert('Weak Password', passValidation.message);
                return;
            }
        }

        setIsLoading(true);
        try {
            if (mode === 'login') {
                // Use AuthService.login
                const data = await authService.login(email, password);
                if (data.success) {
                    dispatch(setCredentials({ token: data.token!, user: data.user }));
                    router.replace('/(tabs)');
                } else {
                    Alert.alert('Login Failed', data.message || 'Invalid credentials');
                }
            } else {
                // Use AuthService.sendEmailOtp
                const data = await authService.sendEmailOtp(email, password);
                if (data.success) {
                    router.push({
                        pathname: '/auth/email-verification' as any,
                        params: { email, password } // Pass password so it can be verified with OTP
                    });
                } else {
                    Alert.alert('Signup Error', data.message || 'Failed to send OTP. Please try again.');
                }
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            Alert.alert('Error', error.message || 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#5433ff', '#20bdff', '#a5fecb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="cube" size={40} color="#5433ff" />
                        </View>
                    </View>
                    <ThemedText style={styles.welcomeTitle}>M4Hub Portal</ThemedText>
                    <ThemedText style={styles.welcomeSubtitle}>
                        Your unified digital gateway
                    </ThemedText>
                </View>
            </LinearGradient>

            <View style={styles.formContainer}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'login' && styles.activeTab]}
                        onPress={() => setMode('login')}
                    >
                        <ThemedText style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                            Login
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'signup' && styles.activeTab]}
                        onPress={() => setMode('signup')}
                    >
                        <ThemedText style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                            Sign Up
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>
                        {mode === 'login' ? 'Username or Email' : 'Email Address'}
                    </ThemedText>
                    <TextInput
                        style={[styles.input, touched.email && !!errors.email && styles.inputError]}
                        placeholder={mode === 'login' ? "Enter your username or email" : "Enter your email"}
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                        autoCapitalize="none"
                        keyboardType={mode === 'login' ? "default" : "email-address"}
                    />
                    {touched.email && !!errors.email && (
                        <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
                    )}
                </View>

                <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Password</ThemedText>
                    <View style={[styles.passwordContainer, touched.password && !!errors.password && styles.inputError]}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {touched.password && !!errors.password && (
                        <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
                    )}
                </View>

                {mode === 'login' && (
                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => router.push('/auth/forgot-password' as any)}
                    >
                        <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (isLoading) && styles.submitButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>
                            {mode === 'login' ? 'Continue' : 'Create My Account'}
                        </ThemedText>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        Secure Cloud Authentication
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: '40%',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    logoCircle: {
        width: 88,
        height: 88,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: 'white',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 28,
        marginTop: -40,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        padding: 6,
        marginBottom: 32,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 16,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    activeTabText: {
        color: '#5433ff',
    },
    inputWrapper: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 60,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 60,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1e293b',
    },
    eyeButton: {
        padding: 18,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        color: '#5433ff',
        fontWeight: '700',
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#5433ff',
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: "#5433ff",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#cbd5e1',
        elevation: 0,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 32,
        alignItems: 'center',
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});
