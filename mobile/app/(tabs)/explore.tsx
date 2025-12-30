import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, TextInput, ActivityIndicator, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout, setCredentials, selectToken } from '@/store/slices/authSlice';
import { COLORS } from '@/constants/colors';
import axios from 'axios';
import { APP_CONFIG } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { Stack, useRouter } from 'expo-router';
import { HubHeaderBackground } from '@/components/HubHeaderBackground';
import { LogoutModal } from '@/components/LogoutModal';

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ... (Update Email/Phone handlers remain same, omitted for brevity in instruction but will persist in file if not touched) 

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // Tiny delay to allow modal to close smoothly
    setTimeout(() => {
      dispatch(logout());
      router.replace('/auth/email-login?mode=login');
    }, 200);
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



  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ gap: 2 }}>
              <Text style={{ fontWeight: '900', fontSize: 16, letterSpacing: -0.5, color: '#ffffff' }}>User Profile</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Manage your account settings</Text>
            </View>
          ),
          headerBackground: () => (
            <HubHeaderBackground
              colors={['#4c1d95', '#2e1065']}
              icon="person"
            />
          ),
          headerTintColor: '#ffffff',
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => dispatch(setSidebarOpen(true))}
              style={{ marginLeft: 16, marginRight: 8 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="menu" size={22} color="#ffffff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="normal"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, isDark && { color: '#94a3b8' }]}>PERSONAL INFORMATION</ThemedText>
          <View style={[styles.infoCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                <Ionicons name="person-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
                <ThemedText style={[styles.infoValue, isDark && { color: '#f8fafc' }]}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (user?.name || 'Not set')}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, isDark && { backgroundColor: '#334155' }]} />

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                <Ionicons name="at-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Username</ThemedText>
                <ThemedText style={[styles.infoValue, isDark && { color: '#f8fafc' }]}>@{user?.username || 'user892'}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, isDark && { backgroundColor: '#334155' }]} />

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                <Ionicons name="transgender-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Gender</ThemedText>
                <ThemedText style={[styles.infoValue, isDark && { color: '#f8fafc' }]}>{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, isDark && { backgroundColor: '#334155' }]} />

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                <Ionicons name="calendar-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Date of Birth</ThemedText>
                <ThemedText style={[styles.infoValue, isDark && { color: '#f8fafc' }]}>{formatDate(user?.dateOfBirth)}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, isDark && { color: '#94a3b8' }]}>ACCOUNT SETTINGS</ThemedText>
          <View style={[styles.infoCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                <Ionicons name="mail-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.infoText}>
                <View style={styles.fieldHeader}>
                  <ThemedText style={styles.infoLabel}>Email Address</ThemedText>
                </View>
                <ThemedText style={[styles.infoValue, isDark && { color: '#f8fafc' }]}>{user?.email || 'Not set'}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, isDark && { backgroundColor: '#334155' }]} />

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                <Ionicons name="call-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.infoText}>
                <View style={styles.fieldHeader}>
                  <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
                  {!isEditingPhone && (
                    <TouchableOpacity onPress={() => setIsEditingPhone(true)}>
                      <Text style={styles.editButton}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isEditingPhone ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={[styles.input, isDark && { backgroundColor: '#0f172a', color: '#f8fafc', borderColor: '#334155' }]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="New number"
                      placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                      keyboardType="phone-pad"
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity style={[styles.cancelAction, isDark && { backgroundColor: '#334155' }]} onPress={() => setIsEditingPhone(false)}>
                        <Text style={[styles.cancelText, isDark && { color: '#94a3b8' }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.saveAction, { backgroundColor: '#7c3aed' }]} onPress={handleUpdatePhone} disabled={isUpdating}>
                        <Text style={styles.saveText}>{isUpdating ? '...' : 'Save'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <ThemedText style={[styles.infoValue, isDark && { color: '#f8fafc' }]}>{user?.phoneNumber || 'Not set'}</ThemedText>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, isDark && { color: '#94a3b8' }]}>SYSTEM SETTINGS</ThemedText>
          <View style={[styles.infoCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#10b981" />
                </View>
                <View>
                  <ThemedText style={styles.menuText}>Account Status</ThemedText>
                  <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '800' }}>ACTIVE & SECURE</Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, isDark && { backgroundColor: '#334155' }]} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: isDark ? '#0f172a' : '#fdf4ff' }]}>
                  <Ionicons name="ribbon" size={18} color="#a855f7" />
                </View>
                <View>
                  <ThemedText style={styles.menuText}>Membership</ThemedText>
                  <Text style={{ fontSize: 11, color: '#a855f7', fontWeight: '800' }}>PREMIUM HUB ACCESS</Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, isDark && { backgroundColor: '#334155' }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: isDark ? '#450a0a' : '#fef2f2' }]}>
                  <Ionicons name="log-out" size={18} color="#ef4444" />
                </View>
                <ThemedText style={[styles.menuText, { color: '#ef4444' }]}>Logout</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? '#64748b' : '#cbd5e1'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        isDark={isDark}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.6)',
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoText: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
    marginLeft: 60,
  },
  infoLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editContainer: {
    marginTop: 12,
    gap: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelAction: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveAction: {
    flex: 1,
    backgroundColor: '#7c3aed',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
});
