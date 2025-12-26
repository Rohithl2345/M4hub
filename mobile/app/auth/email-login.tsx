import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
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
            const passValidation = authService.validatePassword(password);
            if (!passValidation.valid) {
                Alert.alert('Weak Password', passValidation.message);
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
                        pathname: '/auth/email-verification',
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
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradientHeader}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="cube" size={40} color="#4c669f" />
                    </View>
                </View>
                <ThemedText style={styles.welcomeTitle}>Welcome to M4Hub</ThemedText>
                <ThemedText style={styles.welcomeSubtitle}>
                    Your ultimate platform for everything
                </ThemedText>
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
                        style={styles.input}
                        placeholder={mode === 'login' ? "Enter your username or email" : "Enter your email"}
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType={mode === 'login' ? "default" : "email-address"}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Password</ThemedText>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
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
                </View>

                {mode === 'login' && (
                    <TouchableOpacity style={styles.forgotPassword}>
                        <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!email || !password) && styles.submitButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={isLoading || !email || !password}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>
                            {mode === 'login' ? 'Login' : 'Create Account'}
                        </ThemedText>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        By continuing, you agree to our Terms & Privacy Policy
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
    gradientHeader: {
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    logoCircle: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: -30,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 6,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#4c669f',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: 'white',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e1e4e8',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1e4e8',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    eyeButton: {
        padding: 14,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#4c669f',
        fontWeight: '600',
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#4c669f',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: "#4c669f",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDisabled: {
        backgroundColor: '#a0aec0',
        elevation: 0,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 30,
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
    },
});
