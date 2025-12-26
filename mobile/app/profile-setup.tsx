import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, selectToken } from '@/store/slices/authSlice';
import axios from 'axios';
import { APP_CONFIG } from '@/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/constants/colors';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'Please enter your first and last name');
            return;
        }

        if (usernameStatus !== 'available') {
            Alert.alert('Error', 'Please choose a valid and available username');
            return;
        }

        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            if (!token) {
                Alert.alert('Error', 'Please login first');
                router.replace('/auth/email-login');
                return;
            }

            const response = await axios.post(
                `${APP_CONFIG.API_URL}/api/users/profile/setup`,
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    username: username.toLowerCase().trim(),
                    dateOfBirth: formatDate(dateOfBirth),
                    gender: gender,
                    email: email.trim() || null,
                    phoneNumber: phoneNumber.trim() || null,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success && response.data.data) {
                // Update Redux store with new user data
                dispatch(setCredentials({
                    token: token,
                    user: response.data.data,
                }));

                Alert.alert('Success', 'Profile setup completed!', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to setup profile');
            }
        } catch (error: any) {
            console.error('Profile setup error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to setup profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Complete Your Profile</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Tell us a bit about yourself
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>First Name *</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter first name"
                            placeholderTextColor={COLORS.TEXT_TERTIARY}
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Last Name *</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter last name"
                            placeholderTextColor={COLORS.TEXT_TERTIARY}
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Username (Unique ID) *</ThemedText>
                        <TextInput
                            style={[styles.input, usernameStatus === 'taken' && { borderColor: COLORS.ERROR }]}
                            placeholder="e.g. johndoe123"
                            placeholderTextColor={COLORS.TEXT_TERTIARY}
                            value={username}
                            onChangeText={(val) => {
                                const cleanVal = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                setUsername(cleanVal);
                                checkUsername(cleanVal);
                            }}
                            autoCapitalize="none"
                        />
                        {usernameStatus !== 'idle' && (
                            <ThemedText style={[
                                styles.statusText,
                                { color: usernameStatus === 'available' ? COLORS.SUCCESS : (usernameStatus === 'taken' ? COLORS.ERROR : COLORS.TEXT_SECONDARY) }
                            ]}>
                                {usernameStatus === 'checking' ? 'Checking...' :
                                    usernameStatus === 'available' ? '✓ Username available' :
                                        '✗ Username already taken'}
                            </ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Date of Birth *</ThemedText>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <ThemedText style={styles.dateText}>
                                {formatDate(dateOfBirth)}
                            </ThemedText>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={dateOfBirth}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Gender *</ThemedText>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                                onPress={() => setGender('male')}
                            >
                                <ThemedText style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                                    Male
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                                onPress={() => setGender('female')}
                            >
                                <ThemedText style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                                    Female
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'other' && styles.genderButtonActive]}
                                onPress={() => setGender('other')}
                            >
                                <ThemedText style={[styles.genderText, gender === 'other' && styles.genderTextActive]}>
                                    Other
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Email (Optional)</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email address"
                            placeholderTextColor={COLORS.TEXT_TERTIARY}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Mobile Number (Optional)</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter mobile number"
                            placeholderTextColor={COLORS.TEXT_TERTIARY}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.WHITE} />
                        ) : (
                            <ThemedText style={styles.submitButtonText}>Complete Profile</ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.TEXT_PRIMARY,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.BORDER,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        height: 56,
        color: COLORS.TEXT_PRIMARY,
    },
    dateInput: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.BORDER,
        paddingHorizontal: 16,
        paddingVertical: 14,
        height: 56,
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 16,
        color: COLORS.TEXT_PRIMARY,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.BORDER,
        paddingVertical: 14,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderButtonActive: {
        backgroundColor: COLORS.PRIMARY,
        borderColor: COLORS.PRIMARY,
    },
    genderText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.TEXT_PRIMARY,
    },
    genderTextActive: {
        color: COLORS.WHITE,
    },
    submitButton: {
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: '600',
    },
    statusText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
