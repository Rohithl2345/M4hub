import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';

export default function EmailVerificationScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

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
            Alert.alert('Invalid Code', 'Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.verifyEmailOtp(email, verificationCode, password);

            if (data.success) {
                // Store auth token and user data
                dispatch(setCredentials({
                    token: data.token!,
                    user: data.user
                }));

                Alert.alert('Success', 'Email verified successfully!', [
                    { text: 'OK', onPress: () => router.replace('/profile-setup' as any) }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP. Please try again.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            Alert.alert('Error', error.message || 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setIsLoading(true);
        try {
            const data = await authService.resendEmailOtp(email, password);

            if (data.success) {
                setTimer(60);
                setCode(['', '', '', '', '', '']);
                Alert.alert('Code Resent', 'A new verification code has been sent to your email');
            } else {
                Alert.alert('Error', data.message || 'Failed to resend OTP');
                // If rate limited, don't reset timer
                if (!data.message?.includes('wait')) {
                    setTimer(60);
                }
            }
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            Alert.alert('Error', error.message || 'Network error. Please try again.');
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="shield-checkmark" size={40} color="#5433ff" />
                    </View>
                </View>
                <ThemedText style={styles.title}>Verification</ThemedText>
                <ThemedText style={styles.subtitle}>Enter the code sent to your email</ThemedText>
            </LinearGradient>

            <View style={styles.formContainer}>
                <View style={styles.emailDisplay}>
                    <Ionicons name="mail" size={20} color="#5433ff" />
                    <ThemedText style={styles.emailText}>{email}</ThemedText>
                </View>

                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.codeInput,
                                digit ? styles.codeInputFilled : null,
                                (index === code.findIndex(d => !d)) ? styles.codeInputActive : null
                            ]}
                            value={digit}
                            onChangeText={(value) => handleCodeChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus={index === 0}
                            placeholder="•"
                            placeholderTextColor="#cbd5e1"
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        (code.join('').length !== 6 || isLoading) && styles.verifyButtonDisabled
                    ]}
                    onPress={handleVerify}
                    disabled={code.join('').length !== 6 || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.verifyButtonText}>Verify Account</ThemedText>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    {timer > 0 ? (
                        <View style={styles.timerWrapper}>
                            <Ionicons name="time-outline" size={18} color="#64748b" />
                            <ThemedText style={styles.timerText}>
                                Resend available in {timer}s
                            </ThemedText>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                            <ThemedText style={styles.resendText}>Didn't receive code? Resend</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoBadge}>
                        <Ionicons name="information-circle" size={16} color="#64748b" />
                        <ThemedText style={styles.infoText}>
                            Check your spam folder just in case
                        </ThemedText>
                    </View>
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
        alignItems: 'center',
        paddingTop: 40,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoCircle: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: -40,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 40,
    },
    emailDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 40,
        gap: 8,
    },
    emailText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#5433ff',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 48,
        gap: 8,
    },
    codeInput: {
        flex: 1,
        height: 64,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '800',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        color: '#1e293b',
    },
    codeInputFilled: {
        borderColor: '#5433ff',
        backgroundColor: '#fff',
    },
    codeInputActive: {
        borderColor: '#20bdff',
        backgroundColor: '#fff',
    },
    verifyButton: {
        backgroundColor: '#5433ff',
        borderRadius: 20,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#5433ff",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    verifyButtonDisabled: {
        backgroundColor: '#cbd5e1',
        elevation: 0,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 32,
    },
    timerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timerText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    resendButton: {
        padding: 8,
    },
    resendText: {
        color: '#5433ff',
        fontSize: 15,
        fontWeight: '700',
    },
    infoContainer: {
        marginTop: 'auto',
        marginBottom: 32,
        alignItems: 'center',
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f1f5f9',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
    },
    infoText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
});
