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
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector(selectToken);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isDangerZoneExpanded, setIsDangerZoneExpanded] = useState(false);
  const [pauseDays, setPauseDays] = useState<number>(30);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  // Phone number update handler
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

  const confirmDeleteAccount = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      const response = await axios.delete(`${APP_CONFIG.API_URL}/api/users/account`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: { type: 'delete' }
      });
      if (response.data.success) {
        Alert.alert('Success', 'Your account has been permanently deleted.');
        dispatch(logout());
        router.replace('/auth/email-login?mode=signup');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmPauseAccount = async () => {
    setShowPauseModal(false);
    setIsPausing(true);
    try {
      const response = await axios.delete(`${APP_CONFIG.API_URL}/api/users/account`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: { type: 'pause', days: pauseDays }
      });
      if (response.data.success) {
        Alert.alert('Success', `Account paused for ${pauseDays} days.`);
        dispatch(logout());
        router.replace('/auth/email-login?mode=login');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to pause account');
    } finally {
      setIsPausing(false);
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
              colors={['#312e81', '#1e40af']}
              icon="person"
            />
          ),
          headerTintColor: '#ffffff',
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('Menu button pressed in profile');
                dispatch(setSidebarOpen(true));
              }}
              style={{ marginLeft: 16, marginRight: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
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
        {/* Simplified Profile Header - Matching Web App */}
        <View style={{ marginBottom: 24 }}>
          <LinearGradient
            colors={['#312e81', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 20 }}
          >
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' }}>
              <ThemedText style={{ fontSize: 28, fontWeight: '900', color: 'white' }}>
                {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>
                User Profile
              </ThemedText>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                Manage your personal information and settings
              </Text>
            </View>
          </LinearGradient>
        </View>
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

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.dangerHeaderBanner,
              { borderColor: '#fee2e2', backgroundColor: isDark ? '#1a0d0d' : '#fef2f2' },
              isDangerZoneExpanded && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
            ]}
            onPress={() => setIsDangerZoneExpanded(!isDangerZoneExpanded)}
          >
            <View style={styles.dangerHeaderLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="warning" size={20} color="#ef4444" />
              </View>
              <View>
                <ThemedText style={{ color: '#ef4444', fontWeight: '800', fontSize: 16 }}>Danger Zone</ThemedText>
                <Text style={{ fontSize: 11, color: '#ef4444', opacity: 0.7 }}>Sensitive account actions</Text>
              </View>
            </View>
            <Ionicons
              name={isDangerZoneExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#ef4444"
            />
          </TouchableOpacity>

          {isDangerZoneExpanded && (
            <View style={[
              styles.dangerContent,
              { borderColor: '#fee2e2', backgroundColor: isDark ? '#1a0d0d' : '#fef2f2' }
            ]}>
              {/* Pause Account Options */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                  <Ionicons name="pause-circle-outline" size={18} color={isDark ? '#cbd5e1' : '#475569'} />
                  <ThemedText style={{ fontSize: 14, fontWeight: '700' }}>Temporarily Pause Account</ThemedText>
                </View>

                <View style={styles.pauseOptionsGrid}>
                  {[30, 60, 90].map(days => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.pauseOption,
                        pauseDays === days && styles.pauseOptionActive,
                        isDark && { backgroundColor: '#0f172a', borderColor: '#334155' },
                        pauseDays === days && { borderColor: '#7c3aed' }
                      ]}
                      onPress={() => setPauseDays(days)}
                    >
                      <Text style={[
                        styles.pauseOptionText,
                        pauseDays === days && styles.pauseOptionTextActive,
                        isDark && { color: '#94a3b8' },
                        pauseDays === days && { color: '#7c3aed' }
                      ]}>{days} Days</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: isDark ? '#1e293b' : '#334155' }]}
                  onPress={() => setShowPauseModal(true)}
                  disabled={isPausing || isDeleting}
                >
                  <Text style={styles.actionBtnText}>{isPausing ? 'Processing...' : 'Deactivate Temporarily'}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, { backgroundColor: 'rgba(239, 68, 68, 0.1)', marginLeft: 0, marginBottom: 20 }]} />

              {/* Permanent Delete */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <ThemedText style={{ fontSize: 14, fontWeight: '700', color: '#ef4444' }}>Permanent Deletion</ThemedText>
                </View>
                <Text style={{ fontSize: 12, color: '#ef4444', opacity: 0.8, marginBottom: 16 }}>
                  All your data, music preferences, and history will be cleared permanently.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                  onPress={() => setShowDeleteModal(true)}
                  disabled={isDeleting || isPausing}
                >
                  <Text style={styles.actionBtnText}>{isDeleting ? 'Deleting Account...' : 'Delete My Account'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        isDark={isDark}
      />
      <ConfirmationModal
        visible={showPauseModal}
        title="Pause Account?"
        message={`You are about to deactivate your account for ${pauseDays} days. You will be logged out and cannot login until this period ends.`}
        confirmLabel="Pause Now"
        confirmColor={['#7c3aed', '#6d28d9']}
        icon="pause-circle"
        onCancel={() => setShowPauseModal(false)}
        onConfirm={confirmPauseAccount}
        isDark={isDark}
      />
      <ConfirmationModal
        visible={showDeleteModal}
        title="Permanent Deletion?"
        message="Are you absolutely sure? This action is irreversible. All your data, playlists, and settings will be lost forever."
        confirmLabel="Delete Forever"
        confirmColor={['#ef4444', '#dc2626']}
        icon="warning"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
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
    paddingBottom: 140,
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
  dangerHeaderBanner: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dangerContent: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pauseOptionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pauseOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseOptionActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  pauseOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  pauseOptionTextActive: {
    color: '#7c3aed',
  },
  actionBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
