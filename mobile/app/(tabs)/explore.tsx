import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, TextInput, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout, setCredentials, selectToken } from '@/store/slices/authSlice';
import { COLORS } from '@/constants/colors';
import axios from 'axios';
import { APP_CONFIG } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector(selectToken);
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await axios.put(
        `${APP_CONFIG.API_URL}/api/users/profile/update-email`,
        { email: email.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data) {
        dispatch(setCredentials({
          token: token!,
          user: response.data.data,
        }));
        setIsEditingEmail(false);
        Alert.alert('Success', 'Email updated successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update email');
      }
    } catch (error: any) {
      console.error('Update email error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update email');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/auth/email-login');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user?.firstName?.charAt(0) || 'U'}
            </ThemedText>
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </ThemedText>
            <ThemedText style={styles.userPhone}>{user?.phoneNumber}</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>First Name</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.firstName || 'Not set'}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Last Name</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.lastName || 'Not set'}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
              <ThemedText style={styles.infoValue}>{user?.phoneNumber}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Date of Birth</ThemedText>
              <ThemedText style={styles.infoValue}>{formatDate(user?.dateOfBirth)}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Gender</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.emailContainer}>
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                {!isEditingEmail && (
                  <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                    <ThemedText style={styles.editButton}>Edit</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {isEditingEmail ? (
                <View style={styles.emailEditContainer}>
                  <TextInput
                    style={styles.emailInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.emailActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEmail(user?.email || '');
                        setIsEditingEmail(false);
                      }}
                    >
                      <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                      onPress={handleUpdateEmail}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator color={COLORS.WHITE} size="small" />
                      ) : (
                        <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <ThemedText style={styles.infoValue}>{user?.email || 'Not set'}</ThemedText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <ThemedText style={styles.menuText}>Settings</ThemedText>
              <ThemedText style={styles.menuArrow}>→</ThemedText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <ThemedText style={styles.menuText}>Privacy Policy</ThemedText>
              <ThemedText style={styles.menuArrow}>→</ThemedText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <ThemedText style={styles.menuText}>Terms of Service</ThemedText>
              <ThemedText style={styles.menuArrow}>→</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userPhone: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  section: {
    marginBottom: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  emailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    fontSize: 14,
    color: '#396afc',
    fontWeight: '600',
  },
  emailEditContainer: {
    gap: 12,
  },
  emailInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  emailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#396afc',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
