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
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user?.firstName?.charAt(0) || 'U'}
            </ThemedText>
          </View>
          <ThemedText style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </ThemedText>
          <ThemedText style={styles.userPhone}>{user?.phoneNumber}</ThemedText>
        </View>
      </View>

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
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  userPhone: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    padding: 16,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  emailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  emailEditContainer: {
    gap: 12,
  },
  emailInput: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  emailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.BORDER,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.WHITE,
  },
  menuCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.TEXT_TERTIARY,
  },
  logoutButton: {
    backgroundColor: '#5433ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  logoutText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
