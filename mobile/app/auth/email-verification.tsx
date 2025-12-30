import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function EmailVerificationScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Auto-cycle themes every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentThemeIndex((prev) => (prev + 1) % authThemes.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleCodeChange = (value: string, index: number) => {
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            showError('Please enter the complete 6-digit code');
            return;
        }

        if (!email || !password) {
            showError('Missing email or password. Please go back and try again.');
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.verifyEmailOtp(email, verificationCode, password);
            if (data.success) {
                showSuccess('Email verified successfully!');
                dispatch(setCredentials({ token: data.token!, user: data.user }));
                setTimeout(() => {
                    router.replace('/profile-setup' as any);
                }, 1000);
            } else {
                showError(data.message || 'Invalid code. Please try again.');
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            showError(error.message || 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        try {
            const data = await authService.sendEmailOtp(email, password);
            if (data.success) {
                setTimer(60);
                showSuccess('A new code has been sent to your email');
            } else {
                showError(data.message || 'Failed to resend code');
            }
        } catch (error: any) {
            showError(error.message || 'Network error');
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
                                        <Ionicons name="mail" size={32} color="#3b82f6" />
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
                                    <ThemedText style={styles.pageTitle}>Verify Your Email</ThemedText>
                                    <ThemedText style={styles.pageSubtitle}>
                                        We've sent a 6-digit code to {email}
                                    </ThemedText>
                                </View>

                                {/* OTP Input */}
                                <View style={styles.otpContainer}>
                                    {code.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                                            value={digit}
                                            onChangeText={(value) => handleCodeChange(value, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                            editable={!isLoading}
                                        />
                                    ))}
                                </View>

                                {/* Timer and Resend */}
                                <View style={styles.resendContainer}>
                                    {timer > 0 ? (
                                        <ThemedText style={styles.timerText}>
                                            Resend code in {timer}s
                                        </ThemedText>
                                    ) : (
                                        <TouchableOpacity onPress={handleResend}>
                                            <ThemedText style={styles.resendText}>
                                                Resend Code
                                            </ThemedText>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Verify Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (code.join('').length !== 6 || isLoading) && styles.submitButtonDisabled
                                    ]}
                                    onPress={handleVerify}
                                    disabled={code.join('').length !== 6 || isLoading}
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
                                                    Verify & Continue
                                                </ThemedText>
                                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
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
        marginBottom: 32,
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 8,
    },
    otpInput: {
        flex: 1,
        height: 56,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
    },
    otpInputFilled: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    resendText: {
        fontSize: 13,
        color: '#3b82f6',
        fontWeight: '700',
    },
    submitButton: {
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
