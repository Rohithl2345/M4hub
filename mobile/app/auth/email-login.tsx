import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { AuthBackground, authThemes } from '@/components/AuthBackground';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export default function EmailLoginScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast, showError, showSuccess, hideToast } = useToast();
    const [mode, setMode] = useState<'login' | 'signup'>('signup'); // Default to signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

    // Auto-cycle themes every 10 seconds (matching web app)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentThemeIndex((prev) => (prev + 1) % authThemes.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setEmail('');
        setPassword('');
        setTouched({ email: false, password: false });
    }, [mode]);

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
            if (!email && touched.email) return 'Email is required';
            if (email && mode === 'login' && !validateIdentifier(email)) return 'Invalid email or username';
            if (email && mode === 'signup' && !validateEmail(email)) return 'Invalid email address';
            return '';
        })(),
        password: (() => {
            if (!password && touched.password) return 'Password is required';
            if (password && password.length < 8) return 'Password must be at least 8 characters';
            return '';
        })(),
    };

    const passwordStrength = (() => {
        if (password.length < 8) return 0;
        let strength = 1;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    })();

    // Check if form is valid and ready to submit
    const isFormValid = (() => {
        // Must have both fields filled
        if (!email || !password) return false;
        // Must have no validation errors
        if (errors.email || errors.password) return false;
        // For signup, password must be strong enough (at least 8 chars)
        if (mode === 'signup' && password.length < 8) return false;
        return true;
    })();

    const handleContinue = async () => {
        setTouched({ email: true, password: true });

        // Check for empty fields first
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Then check for validation errors
        if (errors.email || errors.password) {
            showError('Please fix the errors before continuing');
            return;
        }

        setIsLoading(true);
        try {
            if (mode === 'login') {
                const data = await authService.login(email, password);
                if (data.success) {
                    showSuccess('Welcome back!');
                    dispatch(setCredentials({ token: data.token!, user: data.user }));
                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 1000);
                } else {
                    showError(data.message || 'Invalid credentials');
                }
            } else {
                const data = await authService.sendEmailOtp(email, password);
                if (data.success) {
                    showSuccess('Verification code sent!');
                    setTimeout(() => {
                        router.push({
                            pathname: '/auth/email-verification' as any,
                            params: { email, password }
                        });
                    }, 1000);
                } else {
                    showError(data.message || 'Failed to send OTP. Please try again.');
                }
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            showError(error.message || 'Network error. Please check your connection.');
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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
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
                                        <Ionicons name="cube" size={32} color="#3b82f6" />
                                    </LinearGradient>
                                </View>
                                <ThemedText style={styles.brandName}>M4HUB</ThemedText>
                                <ThemedText style={styles.brandTagline}>Your Digital Ecosystem</ThemedText>
                            </View>
                        </View>

                        {/* Main Card */}
                        <View style={styles.cardContainer}>
                            <View style={styles.card}>
                                {/* Title Section - Matching Web App */}
                                <View style={styles.titleSection}>
                                    <ThemedText style={styles.pageTitle}>
                                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                    </ThemedText>
                                    <ThemedText style={styles.pageSubtitle}>
                                        {mode === 'login'
                                            ? 'Sign in to access your account'
                                            : 'Join M4Hub and start your journey'}
                                    </ThemedText>
                                </View>

                                {/* Tab Switcher */}
                                <View style={styles.tabContainer}>
                                    <TouchableOpacity
                                        style={[styles.tab, mode === 'signup' && styles.activeTab]}
                                        onPress={() => setMode('signup')}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                                            Sign Up
                                        </ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.tab, mode === 'login' && styles.activeTab]}
                                        onPress={() => setMode('login')}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                                            Sign In
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>

                                {/* Form Fields */}
                                <View style={styles.formSection}>
                                    {/* Email/Username Input */}
                                    <View style={styles.inputWrapper}>
                                        <ThemedText style={styles.label}>
                                            {mode === 'login' ? 'Email or Username' : 'Email Address'}
                                        </ThemedText>
                                        <View style={[
                                            styles.inputContainer,
                                            touched.email && !!errors.email && styles.inputError
                                        ]}>
                                            <Ionicons
                                                name={mode === 'login' ? 'person-outline' : 'mail-outline'}
                                                size={20}
                                                color="#64748b"
                                                style={styles.inputIcon}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder={mode === 'login' ? 'Enter your email or username' : 'Enter your email'}
                                                placeholderTextColor="#94a3b8"
                                                value={email}
                                                onChangeText={setEmail}
                                                onBlur={() => setTouched({ ...touched, email: true })}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                editable={!isLoading}
                                            />
                                        </View>
                                        {touched.email && errors.email ? (
                                            <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
                                        ) : null}
                                    </View>

                                    {/* Password Input */}
                                    <View style={styles.inputWrapper}>
                                        <ThemedText style={styles.label}>Password</ThemedText>
                                        <View style={[
                                            styles.inputContainer,
                                            touched.password && !!errors.password && styles.inputError
                                        ]}>
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={20}
                                                color="#64748b"
                                                style={styles.inputIcon}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter your password"
                                                placeholderTextColor="#94a3b8"
                                                value={password}
                                                onChangeText={setPassword}
                                                onBlur={() => setTouched({ ...touched, password: true })}
                                                secureTextEntry={!showPassword}
                                                editable={!isLoading}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowPassword(!showPassword)}
                                                style={styles.eyeIcon}
                                            >
                                                <Ionicons
                                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                                    size={20}
                                                    color="#64748b"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {touched.password && errors.password ? (
                                            <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
                                        ) : null}
                                    </View>

                                    {/* Password Strength Indicator (Signup only) */}
                                    {mode === 'signup' && password.length > 0 && (
                                        <View style={styles.strengthContainer}>
                                            <View style={styles.strengthBars}>
                                                {[...Array(4)].map((_, i) => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.strengthBar,
                                                            i < passwordStrength && styles.strengthBarActive,
                                                            passwordStrength === 1 && styles.strengthWeak,
                                                            passwordStrength === 2 && styles.strengthFair,
                                                            passwordStrength === 3 && styles.strengthGood,
                                                            passwordStrength === 4 && styles.strengthStrong,
                                                        ]}
                                                    />
                                                ))}
                                            </View>
                                            <ThemedText style={styles.strengthText}>
                                                {passwordStrength === 0 && ''}
                                                {passwordStrength === 1 && 'Weak'}
                                                {passwordStrength === 2 && 'Fair'}
                                                {passwordStrength === 3 && 'Good'}
                                                {passwordStrength === 4 && 'Strong'}
                                            </ThemedText>
                                        </View>
                                    )}

                                    {/* Forgot Password (Login only) */}
                                    {mode === 'login' && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (email) {
                                                    router.push(`/auth/forgot-password?email=${encodeURIComponent(email)}` as any);
                                                }
                                            }}
                                            style={[
                                                styles.forgotPassword,
                                                !email && styles.forgotPasswordDisabled
                                            ]}
                                            disabled={!email}
                                        >
                                            <ThemedText style={[
                                                styles.forgotPasswordText,
                                                !email && styles.forgotPasswordTextDisabled
                                            ]}>
                                                Forgot password?
                                            </ThemedText>
                                        </TouchableOpacity>
                                    )}

                                    {/* Submit Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.submitButton,
                                            (!isFormValid || isLoading) && styles.submitButtonDisabled
                                        ]}
                                        onPress={handleContinue}
                                        disabled={!isFormValid || isLoading}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#3b82f6', '#2563eb']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.submitGradient}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="#fff" size="small" />
                                            ) : (
                                                <>
                                                    <ThemedText style={styles.submitText}>
                                                        {mode === 'login' ? 'Sign In' : 'Create Account'}
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
            </KeyboardAvoidingView>
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
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 6,
        letterSpacing: -0.5,
        lineHeight: 38,
    },
    pageSubtitle: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
        letterSpacing: 0.2,
        lineHeight: 22,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        padding: 3,
        marginBottom: 28,
    },
    tab: {
        flex: 1,
        paddingVertical: 11,
        alignItems: 'center',
        borderRadius: 7,
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    activeTabText: {
        color: '#0f172a',
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
    eyeIcon: {
        padding: 6,
    },
    errorText: {
        fontSize: 11,
        color: '#ef4444',
        fontWeight: '600',
        marginTop: 3,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: -6,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: 3,
        flex: 1,
    },
    strengthBar: {
        flex: 1,
        height: 3,
        backgroundColor: '#e2e8f0',
        borderRadius: 1.5,
    },
    strengthBarActive: {
        backgroundColor: '#10b981',
    },
    strengthWeak: {
        backgroundColor: '#ef4444',
    },
    strengthFair: {
        backgroundColor: '#f59e0b',
    },
    strengthGood: {
        backgroundColor: '#3b82f6',
    },
    strengthStrong: {
        backgroundColor: '#10b981',
    },
    strengthText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -6,
    },
    forgotPasswordText: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '700',
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
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f0fdf4',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    securityText: {
        fontSize: 10,
        color: '#166534',
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordDisabled: {
        opacity: 0.4,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '600',
    },
    forgotPasswordTextDisabled: {
        color: '#94a3b8',
    },
});
