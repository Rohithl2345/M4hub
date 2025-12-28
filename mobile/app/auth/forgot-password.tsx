import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (!email || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const passValidation = authService.validatePassword(newPassword);
        if (!passValidation.valid) {
            Alert.alert('Weak Password', passValidation.message);
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.forgotPassword(email, newPassword, confirmPassword);
            if (data.success) {
                Alert.alert('Success', 'Password reset successfully!', [
                    { text: 'Login Now', onPress: () => router.replace('/auth/email-login') }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#5433ff', '#20bdff', '#a5fecb']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="key" size={40} color="#5433ff" />
                    </View>
                </View>
                <ThemedText style={styles.title}>Reset Password</ThemedText>
                <ThemedText style={styles.subtitle}>Enter your details to secure your account</ThemedText>
            </LinearGradient>

            <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Email Address</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your registered email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>New Password</ThemedText>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter new password"
                            placeholderTextColor="#999"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Confirm Password</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="Repeat new password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleReset}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="white" /> : <ThemedText style={styles.submitButtonText}>Update Password</ThemedText>}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { height: '35%', justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
    backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    logoContainer: { marginBottom: 16 },
    logoCircle: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    formContainer: { flex: 1, paddingHorizontal: 24, marginTop: -30, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 32 },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1e293b' },
    eyeButton: { padding: 14 },
    submitButton: { backgroundColor: '#5433ff', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 12, shadowColor: "#5433ff", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    submitButtonDisabled: { backgroundColor: '#cbd5e1', elevation: 0 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
