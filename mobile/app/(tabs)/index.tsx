import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { analyticsService, HubAnalytics } from '@/services/analytics.service';
import storageService from '@/services/storage.service';
import BarChart from 'react-native-chart-kit/dist/BarChart';
import LineChart from 'react-native-chart-kit/dist/line-chart';
import PieChart from 'react-native-chart-kit/dist/PieChart';
import { Sidebar } from '@/components/Sidebar';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/theme';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';

function MagicParticle({ index }: { index: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const posX = ((index * 13 + 7) % 100) / 100 * width;
  const size = 2 + (index % 4) * 2;
  const duration = 15000 + (index % 12) * 2000;

  useEffect(() => {
    const delay = (index * 1200) % 20000;
    opacity.value = withDelay(delay, withTiming(0.4, { duration: 1000 }));
    translateY.value = height;
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Reanimated.View
      style={[
        {
          position: 'absolute',
          left: posX,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#fff',
        },
        animatedStyle,
      ]}
    />
  );
}
// Magic Background removed from page, now restricted to Sidebar only.

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState({ day: '', month: '' });
  const [analyticsData, setAnalyticsData] = useState<HubAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const magicEnabled = useAppSelector((state) => state.ui.magicEnabled);

  useEffect(() => {
    updateGreeting();
    updateDate();
    loadAnalytics();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const updateDate = () => {
    const now = new Date();
    setCurrentDate({
      day: now.getDate().toString(),
      month: now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    });
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const token = await storageService.getAuthToken();
      if (token) {
        const data = await analyticsService.getHubAnalytics(token);
        if (data) {
          setAnalyticsData(data);
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateGreeting();
    updateDate();
    await loadAnalytics();
    setRefreshing(false);
  };

  const features = [
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Stream your favorite tracks',
      icon: 'musical-notes',
      gradient: ['#10b981', '#059669'],
      color: '#10b981',
      route: '/music',
    },
    {
      id: 'messages',
      title: 'Chat',
      subtitle: 'Stay connected with friends',
      icon: 'chatbubbles',
      gradient: ['#3b82f6', '#2563eb'],
      color: '#3b82f6',
      route: '/messages',
    },
    {
      id: 'money',
      title: 'Money',
      subtitle: 'Manage your finances',
      icon: 'wallet',
      gradient: ['#f59e0b', '#d97706'],
      color: '#f59e0b',
      route: '/money',
    },
    {
      id: 'news',
      title: 'News',
      subtitle: 'Stay informed with updates',
      icon: 'newspaper',
      gradient: ['#ef4444', '#dc2626'],
      color: '#ef4444',
      route: '/news',
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#1e293b' : '#ffffff',
    backgroundGradientTo: isDark ? '#1e293b' : '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(129, 140, 248, ${opacity})` : `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(203, 213, 225, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6366f1',
    },
    barPercentage: 0.6,
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {/* Header Stack config */}
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <View style={{ marginLeft: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="apps" size={18} color="white" />
                </View>
                <ThemedText style={{ fontWeight: '900', color: '#0f172a', fontSize: 16, letterSpacing: -0.5 }}>M4Hub</ThemedText>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ marginRight: 16 }}>
                <Ionicons name="menu" size={28} color="#0f172a" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTitleStyle: {
              fontWeight: '800',
              color: '#0f172a',
              fontSize: 18,
            },
            headerShadowVisible: false,
          }}
        />

        {/* Professional Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfoMain}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                style={styles.avatarGradient}
              >
                <ThemedText style={styles.avatarText}>
                  {(user?.name || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                </ThemedText>
              </LinearGradient>
              <View style={styles.onlineBadge} />
            </View>
            <View>
              <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
              <ThemedText style={styles.profileNameText}>{user?.name || user?.username || 'User'}</ThemedText>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <ThemedText style={styles.statusText}>Active Now</ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.dateControl} onPress={onRefresh}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <ThemedText style={styles.dateControlText}>{currentDate.day} {currentDate.month}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>Usage</ThemedText>
            <ThemedText style={styles.statValue}>
              {analyticsData ? Math.round(analyticsData.tabAnalytics.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 60) : 0}m
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>Hubs</ThemedText>
            <ThemedText style={styles.statValue}>{features.length}</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>Score</ThemedText>
            <ThemedText style={styles.statValue}>{analyticsData?.engagementMetrics.engagementScore || 0}%</ThemedText>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => router.push(feature.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.featureCardInner}>
                <View style={[styles.featureIconBox, { backgroundColor: feature.color + '15' }]}>
                  <Ionicons name={feature.icon as any} size={26} color={feature.color} />
                </View>
                <View>
                  <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                  <ThemedText style={styles.featureSubtitle}>{feature.subtitle}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analytics Hub Card (Web-style) */}
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <View>
              <ThemedText style={styles.analyticsTitle}>
                <Ionicons name="analytics" size={20} color="#6366f1" /> Hub Analytics
              </ThemedText>
              <ThemedText style={styles.analyticsSubtitle}>Time spent across M4Hub platforms</ThemedText>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.chartRefreshBtn}>
              <Ionicons name="refresh" size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {loadingAnalytics ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <ThemedText style={styles.loadingText}>Loading activity data...</ThemedText>
            </View>
          ) : !analyticsData || analyticsData.tabAnalytics.length === 0 ? (
            <View style={styles.comingSoon}>
              <Ionicons name="time-outline" size={48} color="#94a3b8" />
              <ThemedText style={styles.comingSoonText}>
                No activity recorded yet
              </ThemedText>
            </View>
          ) : (
            <View style={styles.chartsContainer}>
              {/* Chart Selector Dropdown/Chips */}
              <View style={styles.chartSelector}>
                <TouchableOpacity
                  style={[styles.selectorBtn, selectedChartType === 'bar' && styles.selectorBtnActive]}
                  onPress={() => setSelectedChartType('bar')}
                >
                  <ThemedText style={[styles.selectorText, selectedChartType === 'bar' && styles.selectorTextActive]}>Vertical</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectorBtn, selectedChartType === 'pie' && styles.selectorBtnActive]}
                  onPress={() => setSelectedChartType('pie')}
                >
                  <ThemedText style={[styles.selectorText, selectedChartType === 'pie' && styles.selectorTextActive]}>Circular</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectorBtn, selectedChartType === 'line' && styles.selectorBtnActive]}
                  onPress={() => setSelectedChartType('line')}
                >
                  <ThemedText style={[styles.selectorText, selectedChartType === 'line' && styles.selectorTextActive]}>Weekly</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.chartWrapper}>
                {selectedChartType === 'bar' && (
                  <>
                    <ThemedText style={styles.chartTitle}>Time Spent (Seconds)</ThemedText>
                    <BarChart
                      data={{
                        labels: analyticsData.tabAnalytics.map(t => t.name),
                        datasets: [{
                          data: analyticsData.tabAnalytics.map(t => t.totalSeconds)
                        }]
                      }}
                      width={width - 72}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      chartConfig={chartConfig}
                      style={styles.chart}
                      verticalLabelRotation={30}
                    />
                  </>
                )}

                {selectedChartType === 'pie' && (
                  <>
                    <ThemedText style={styles.chartTitle}>Usage Distribution</ThemedText>
                    <PieChart
                      data={analyticsData.tabAnalytics.map(t => ({
                        name: t.name,
                        population: t.totalSeconds,
                        color: t.color || '#6366f1',
                        legendFontColor: isDark ? '#cbd5e1' : '#64748b',
                        legendFontSize: 12
                      }))}
                      width={width - 72}
                      height={200}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                  </>
                )}

                {selectedChartType === 'line' && (
                  <>
                    <ThemedText style={styles.chartTitle}>Weekly Activity</ThemedText>
                    <LineChart
                      data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                          data: analyticsData.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]
                        }]
                      }}
                      width={width - 72}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                      }}
                      bezier
                      style={styles.chart}
                    />
                  </>
                )}
              </View>

              {/* Web-consistent Analytics Footer */}
              <View style={styles.analyticsFooter}>
                <View style={styles.footerItem}>
                  <ThemedText style={styles.footerLabel}>MOST ACTIVE HUB</ThemedText>
                  <ThemedText style={styles.footerValue}>
                    {analyticsData.tabAnalytics.length > 0
                      ? [...analyticsData.tabAnalytics].sort((a, b) => b.totalSeconds - a.totalSeconds)[0].name
                      : '--'}
                  </ThemedText>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerItem}>
                  <ThemedText style={styles.footerLabel}>TOTAL ENGAGEMENT</ThemedText>
                  <ThemedText style={styles.footerValue}>
                    {Math.round(analyticsData.tabAnalytics.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 60)} Minutes
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>
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
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 180,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  profileInfoMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  profileNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateControlText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  statsSummary: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#f1f5f9',
    alignSelf: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  featureCardInner: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  featureIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 18,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartRefreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyticsSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  analyticsFooter: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6366f1',
  },
  footerDivider: {
    width: 2,
    height: '60%',
    backgroundColor: '#e2e8f0',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 12,
  },
  chartsContainer: {
    width: '100%',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  chartSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectorBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  selectorTextActive: {
    color: '#6366f1',
  },
  chartWrapper: {
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
});
