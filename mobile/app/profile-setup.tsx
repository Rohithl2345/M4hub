import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
            <LinearGradient
                colors={['#5433ff', '#20bdff', '#a5fecb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={50} color="#5433ff" />
                    </View>
                    <ThemedText style={styles.title}>Your Profile</ThemedText>
                    <ThemedText style={styles.subtitle}>Set up your digital identity</ThemedText>
                </View>
            </LinearGradient>

            <View style={styles.formContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <ThemedText style={styles.label}>First Name</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. John"
                                    placeholderTextColor="#94a3b8"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <ThemedText style={styles.label}>Last Name</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Doe"
                                    placeholderTextColor="#94a3b8"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Username</ThemedText>
                            <View style={[
                                styles.usernameWrapper,
                                usernameStatus === 'available' ? styles.borderSuccess :
                                    usernameStatus === 'taken' ? styles.borderError : null
                            ]}>
                                <ThemedText style={styles.atSymbol}>@</ThemedText>
                                <TextInput
                                    style={styles.usernameInput}
                                    placeholder="choose_username"
                                    placeholderTextColor="#94a3b8"
                                    value={username}
                                    onChangeText={(val) => {
                                        const cleanVal = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                        setUsername(cleanVal);
                                        checkUsername(cleanVal);
                                    }}
                                    autoCapitalize="none"
                                />
                                {usernameStatus !== 'idle' && (
                                    <View style={styles.statusIcon}>
                                        {usernameStatus === 'checking' ? <ActivityIndicator size="small" color="#5433ff" /> :
                                            usernameStatus === 'available' ? <Ionicons name="checkmark-circle" size={20} color="#10b981" /> :
                                                <Ionicons name="close-circle" size={20} color="#ef4444" />}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Details</ThemedText>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Birthday</ThemedText>
                            <TouchableOpacity
                                style={styles.dateSelector}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#5433ff" style={styles.inputIcon} />
                                <ThemedText style={styles.dateText}>
                                    {dateOfBirth.toLocaleDateString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric'
                                    })}
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
                            <ThemedText style={styles.label}>Gender</ThemedText>
                            <View style={styles.genderGrid}>
                                {(['male', 'female', 'other'] as const).map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[
                                            styles.genderCard,
                                            gender === g && styles.genderCardActive
                                        ]}
                                        onPress={() => setGender(g)}
                                    >
                                        <Ionicons
                                            name={g === 'male' ? 'male' : g === 'female' ? 'female' : 'person-outline'}
                                            size={20}
                                            color={gender === g ? 'white' : '#64748b'}
                                        />
                                        <ThemedText style={[
                                            styles.genderLabel,
                                            gender === g && styles.genderLabelActive
                                        ]}>
                                            {g.charAt(0).toUpperCase() + g.slice(1)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Contact (Optional)</ThemedText>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Public Email</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter public email"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Phone Number</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="+1 (555) 000-0000"
                                placeholderTextColor="#94a3b8"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <ThemedText style={styles.submitButtonText}>Launch My Portal</ThemedText>
                                <Ionicons name="rocket" size={20} color="white" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
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
        height: '35%',
        justifyContent: 'center',
        paddingTop: 40,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
        marginTop: -40,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    scrollContent: {
        padding: 28,
        paddingTop: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 56,
    },
    usernameWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 56,
        paddingHorizontal: 18,
    },
    atSymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: '#94a3b8',
        marginRight: 4,
    },
    statusIcon: {
        marginLeft: 8,
    },
    usernameInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
    },
    borderSuccess: {
        borderColor: '#10b981',
    },
    borderError: {
        borderColor: '#ef4444',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 56,
        paddingHorizontal: 18,
    },
    inputIcon: {
        marginRight: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
    },
    genderGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    genderCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        height: 56,
    },
    genderCardActive: {
        backgroundColor: '#5433ff',
        borderColor: '#5433ff',
    },
    genderLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    genderLabelActive: {
        color: 'white',
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#5433ff',
        borderRadius: 20,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#5433ff",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginTop: 12,
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
});
