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
import { Sidebar } from '@/components/Sidebar';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector(selectToken);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

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

  const handleUpdatePhone = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number cannot be empty');
      return;
    }

    if (phone.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await axios.put(
        `${APP_CONFIG.API_URL}/api/users/profile/update-phone`,
        { phoneNumber: phone.trim() },
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
        setIsEditingPhone(false);
        Alert.alert('Success', 'Phone number updated successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update phone number');
      }
    } catch (error: any) {
      console.error('Update phone error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update phone number');
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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person" size={18} color="white" />
              </View>
              <ThemedText style={{ fontWeight: '900', color: '#0f172a', fontSize: 18, letterSpacing: -0.5 }}>Account</ThemedText>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ marginLeft: 16 }}>
              <Ionicons name="menu" size={28} color="#0f172a" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleAlign: 'left',
          headerShadowVisible: false,
        }}
      />
      {/* Professional Profile Header (Purple Sync) */}
      <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 }}>
        <LinearGradient
          colors={['#4c1d95', '#6366f1']}
          style={{ padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 20 }}
        >
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <ThemedText style={{ fontSize: 28, fontWeight: '800', color: 'white' }}>
              {(user?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={{ fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>
              {user?.firstName} {user?.lastName || user?.username}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
              {user?.email || 'M4Hub Premium Member'}
            </ThemedText>
          </View>
        </LinearGradient>
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
            {/* Email Section */}
            <View style={styles.infoRow}>
              <View style={styles.fieldHeader}>
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                {!isEditingEmail && (
                  <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                    <ThemedText style={styles.editButton}>Edit</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {isEditingEmail ? (
                <View style={styles.fieldEditContainer}>
                  <TextInput
                    style={styles.fieldInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.fieldActions}>
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

            <View style={styles.divider} />

            {/* Phone Number Section */}
            <View style={styles.infoRow}>
              <View style={styles.fieldHeader}>
                <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
                {!isEditingPhone && (
                  <TouchableOpacity onPress={() => setIsEditingPhone(true)}>
                    <ThemedText style={styles.editButton}>Edit</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {isEditingPhone ? (
                <View style={styles.fieldEditContainer}>
                  <TextInput
                    style={styles.fieldInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    keyboardType="phone-pad"
                  />
                  <View style={styles.fieldActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setPhone(user?.phoneNumber || '');
                        setIsEditingPhone(false);
                      }}
                    >
                      <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                      onPress={handleUpdatePhone}
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
                <ThemedText style={styles.infoValue}>{user?.phoneNumber || 'Not set'}</ThemedText>
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

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
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
  fieldHeader: {
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
  fieldEditContainer: {
    gap: 12,
  },
  fieldInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 12,
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
