import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { APP_CONFIG, API_ENDPOINTS } from '@/constants';

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
            const response = await fetch(`${APP_CONFIG.API_URL}${API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    otpCode: verificationCode
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store auth token and user data
                dispatch(setCredentials({
                    token: data.token,
                    user: data.user
                }));

                Alert.alert('Success', 'Email verified successfully!', [
                    { text: 'OK', onPress: () => router.replace('/profile-setup') }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP. Please try again.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            Alert.alert('Error', 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${APP_CONFIG.API_URL}${API_ENDPOINTS.AUTH.RESEND_EMAIL_OTP}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
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
        } catch (error) {
            console.error('Resend OTP error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
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
                <ThemedText type="title" style={styles.title}>Verify Email</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Enter the 6-digit code sent to
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.email}>
                    {email}
                </ThemedText>
            </View>

            <View style={styles.form}>
                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[styles.codeInput, digit && styles.codeInputFilled]}
                            value={digit}
                            onChangeText={(value) => handleCodeChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={code.join('').length !== 6 || isLoading}
                >
                    <LinearGradient
                        colors={(code.join('').length !== 6 || isLoading) ? ['#ccc', '#ccc'] : ['#5433ff', '#20bdff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.verifyButton}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ThemedText style={styles.verifyButtonText}>Verify & Continue</ThemedText>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    {timer > 0 ? (
                        <ThemedText style={styles.timerText}>
                            Resend code in {timer}s
                        </ThemedText>
                    ) : (
                        <TouchableOpacity onPress={handleResend}>
                            <ThemedText style={styles.resendText}>Resend Code</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <ThemedText style={styles.infoText}>
                        Check your spam folder if you don&apos;t see the email
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
    email: {
        fontSize: 16,
        marginTop: 4,
        color: '#007AFF',
    },
    form: {
        flex: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 8,
    },
    codeInput: {
        flex: 1,
        height: 56,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    codeInputFilled: {
        borderColor: '#007AFF',
        backgroundColor: '#E6F4FE',
    },
    verifyButton: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    timerText: {
        opacity: 0.6,
        fontSize: 14,
    },
    resendText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 20,
    },
    infoText: {
        textAlign: 'center',
        opacity: 0.6,
        fontSize: 13,
    },
});
