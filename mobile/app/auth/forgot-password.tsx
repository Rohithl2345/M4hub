import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { email: emailParam } = useLocalSearchParams<{ email: string }>();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

    // Auto-cycle themes every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentThemeIndex((prev) => (prev + 1) % authThemes.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
        setNewPassword('');
        setConfirmPassword('');
    }, [emailParam]);

    const passwordStrength = (() => {
        if (newPassword.length < 8) return 0;
        let strength = 1;
        if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
        if (/[0-9]/.test(newPassword)) strength++;
        if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;
        return strength;
    })();

    // Check if form is valid
    const isFormValid = (() => {
        if (!email || !newPassword || !confirmPassword) return false;
        if (newPassword !== confirmPassword) return false;
        if (newPassword.length < 8) return false;
        return true;
    })();

    const handleReset = async () => {
        if (!email || !newPassword || !confirmPassword) {
            showError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.resetPassword(email, newPassword, confirmPassword);
            if (data.success) {
                showSuccess('Password reset successfully!');
                setTimeout(() => {
                    router.replace('/auth/email-login' as any);
                }, 2000);
            } else {
                showError(data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            showError(error.message || 'Network error');
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
                                        <Ionicons name="key" size={32} color="#3b82f6" />
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
                                    <ThemedText style={styles.pageTitle}>Reset Password</ThemedText>
                                    <ThemedText style={styles.pageSubtitle}>
                                        Create a new password for your account
                                    </ThemedText>
                                </View>

                                {/* Form Fields */}
                                <View style={styles.formSection}>
                                    {/* Email Display (Read-only) - Matching Web App */}
                                    <View style={styles.emailInfoBox}>
                                        <ThemedText style={styles.emailInfoLabel}>
                                            Resetting password for
                                        </ThemedText>
                                        <ThemedText style={styles.emailText}>
                                            {email || 'User'}
                                        </ThemedText>
                                    </View>

                                    {/* New Password Input */}
                                    <View style={styles.inputWrapper}>
                                        <ThemedText style={styles.label}>NEW PASSWORD</ThemedText>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter new password"
                                                placeholderTextColor="#94a3b8"
                                                value={newPassword}
                                                onChangeText={setNewPassword}
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
                                    </View>

                                    {/* Password Strength Indicator */}
                                    {newPassword.length > 0 && (
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

                                    {/* Confirm Password Input */}
                                    <View style={styles.inputWrapper}>
                                        <ThemedText style={styles.label}>CONFIRM PASSWORD</ThemedText>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Confirm new password"
                                                placeholderTextColor="#94a3b8"
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry={!showConfirmPassword}
                                                editable={!isLoading}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={styles.eyeIcon}
                                            >
                                                <Ionicons
                                                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                                    size={20}
                                                    color="#64748b"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Reset Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.submitButton,
                                            (!isFormValid || isLoading) && styles.submitButtonDisabled
                                        ]}
                                        onPress={handleReset}
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
                                                <ActivityIndicator color="#fff" size="small" />
                                            ) : (
                                                <>
                                                    <ThemedText style={styles.submitText}>
                                                        Reset Password
                                                    </ThemedText>
                                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Back to Login */}
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        style={styles.backButton}
                                    >
                                        <Ionicons name="arrow-back" size={16} color="#64748b" />
                                        <ThemedText style={styles.backText}>Back to Login</ThemedText>
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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
    },
    backText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    emailInfoBox: {
        marginBottom: 24,
        backgroundColor: 'rgba(226, 232, 240, 0.4)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(203, 213, 225, 0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    emailInfoLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emailText: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '700',
    },
});
