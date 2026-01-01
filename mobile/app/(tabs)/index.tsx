import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl, ActivityIndicator, Modal, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubHeaderBackground } from '@/components/HubHeaderBackground';
import { analyticsService, HubAnalytics } from '@/services/analytics.service';
import storageService from '@/services/storage.service';
import BarChart from 'react-native-chart-kit/dist/BarChart';
import LineChart from 'react-native-chart-kit/dist/line-chart';
import PieChart from 'react-native-chart-kit/dist/PieChart';
import { setSidebarOpen } from '@/store/slices/uiSlice';
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

const MagicParticle = React.memo(({ index }: { index: number }) => {
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
});
// Magic Background removed from page, now restricted to Sidebar only.

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState({ day: '', month: '' });
  const [analyticsData, setAnalyticsData] = useState<HubAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const magicEnabled = useAppSelector((state) => state.ui.magicEnabled);

  useEffect(() => {
    updateGreeting();
    updateDate();
    loadAnalytics();
  }, [timeframe]);

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
        const data = await analyticsService.getHubAnalytics(token, timeframe);
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

  const features = useMemo(() => [
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
  ], []);

  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(139, 92, 246, ${opacity})` : `rgba(124, 58, 237, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#7c3aed',
    },
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    fillShadowGradient: isDark ? '#818cf8' : '#6366f1',
    fillShadowGradientOpacity: 1, // Solid bars like web
    propsForBackgroundLines: {
      strokeDasharray: '', // Solid grid lines or none
      stroke: isDark ? '#334155' : '#f1f5f9',
      strokeWidth: 1,
    },
  }), [isDark]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="normal"
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
      >
        {/* Header Stack config */}
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: () => (
              <View style={{ gap: 2 }}>
                <Text style={{ fontWeight: '900', fontSize: 16, letterSpacing: -0.5, color: '#ffffff' }}>M4Hub Dashboard</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Everything in one place</Text>
              </View>
            ),
            headerBackground: () => (
              <HubHeaderBackground
                colors={['#4c1d95', '#2e1065']}
                icon="grid"
              />
            ),
            headerTintColor: '#ffffff',
            headerTitleAlign: 'left',
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  console.log('Menu button pressed in dashboard');
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

        {/* Premium Compact Hero Section */}
        <View style={{ paddingTop: 6 }}>
          <LinearGradient
            colors={['#4c1d95', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ padding: 20, borderRadius: 24, shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
                <ThemedText style={{ fontSize: 24, fontWeight: '900', color: 'white' }}>
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{greeting}</Text>
                <ThemedText style={{ fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>
                  {user?.name || user?.username || 'User'}
                </ThemedText>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: 'white', lineHeight: 18 }}>{currentDate.day}</Text>
                <Text style={{ fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{currentDate.month}</Text>
              </View>
            </View>

            {/* Integrated Stats Bar */}
            <View style={{ flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20, padding: 14, gap: 12 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Time</Text>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '900' }}>
                  {analyticsData && analyticsData.tabAnalytics ? Math.round(analyticsData.tabAnalytics.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 60) : 0}m
                </Text>
              </View>
              <View style={{ width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Hub Status</Text>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '900' }}>LIVE</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Feature Grid - Modern & Dense */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#f8fafc' : '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Service Modules</ThemedText>
            <TouchableOpacity onPress={() => dispatch(setSidebarOpen(true))}>
              <ThemedText style={{ fontSize: 12, fontWeight: '700', color: '#7c3aed' }}>Directory</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, isDark && styles.darkCard]}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIconBox, { backgroundColor: feature.color, borderLeftWidth: 3, borderLeftColor: 'rgba(255,255,255,0.3)' }]}>
                  <Ionicons name={feature.icon as any} size={22} color="#ffffff" />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <ThemedText style={[styles.featureTitle, isDark && { color: '#f8fafc' }]}>{feature.title}</ThemedText>
                  <ThemedText style={[styles.featureSubtitle, isDark && { color: '#94a3b8' }]} numberOfLines={1}>{feature.subtitle}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#cbd5e1'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analytics Hub Card (Web-style) */}
        <View style={[styles.analyticsCard, isDark && styles.darkCard, { marginTop: 24 }]}>
          <View style={styles.analyticsHeader}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="analytics" size={20} color="#7c3aed" />
                <ThemedText style={[styles.analyticsTitle, isDark && { color: '#f8fafc' }]}>Hub Analytics</ThemedText>
              </View>
              <ThemedText style={[styles.analyticsSubtitle, isDark && { color: '#94a3b8' }]}>Time spent across M4Hub platforms</ThemedText>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.chartRefreshBtn}>
              <Ionicons name="refresh" size={16} color="#7c3aed" />
            </TouchableOpacity>
          </View>

          {loadingAnalytics ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <ThemedText style={styles.loadingText}>Loading activity data...</ThemedText>
            </View>
          ) : !analyticsData || !analyticsData.tabAnalytics || analyticsData.tabAnalytics.length === 0 ? (
            <View style={styles.comingSoon}>
              <Ionicons name="time-outline" size={48} color="#94a3b8" />
              <ThemedText style={styles.comingSoonText}>
                No activity recorded yet
              </ThemedText>
            </View>
          ) : (
            <View style={styles.chartsContainer}>
              {/* Timeframe Selector - iOS Segmented Control Style */}
              <View style={{
                flexDirection: 'row',
                backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                borderRadius: 12,
                padding: 4,
                marginBottom: 16
              }}>
                {(['daily', 'weekly', 'monthly'] as const).map((t) => {
                  const isActive = timeframe === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isActive ? (isDark ? '#334155' : 'white') : 'transparent',
                        borderRadius: 8,
                        shadowColor: isActive ? '#000' : 'transparent',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isActive ? 0.1 : 0,
                        shadowRadius: 2,
                        elevation: isActive ? 1 : 0,
                      }}
                      onPress={() => setTimeframe(t)}
                    >
                      <Text style={{
                        fontSize: 12,
                        fontWeight: isActive ? '700' : '600',
                        color: isActive ? (isDark ? '#fff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
                        textTransform: 'capitalize'
                      }}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Chart Toggles (Visual Style) */}
              <View style={[styles.chartSelector, isDark && { backgroundColor: '#1e293b' }]}>
                <TouchableOpacity
                  style={[styles.selectorBtn, selectedChartType === 'bar' && styles.selectorBtnActive, selectedChartType === 'bar' && isDark && { backgroundColor: '#334155' }]}
                  onPress={() => setSelectedChartType('bar')}
                >
                  <ThemedText style={[styles.selectorText, selectedChartType === 'bar' && styles.selectorTextActive, selectedChartType === 'bar' && isDark && { color: '#818cf8' }]}>Vertical</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectorBtn, selectedChartType === 'pie' && styles.selectorBtnActive, selectedChartType === 'pie' && isDark && { backgroundColor: '#334155' }]}
                  onPress={() => setSelectedChartType('pie')}
                >
                  <ThemedText style={[styles.selectorText, selectedChartType === 'pie' && styles.selectorTextActive, selectedChartType === 'pie' && isDark && { color: '#818cf8' }]}>Circular</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectorBtn, selectedChartType === 'line' && styles.selectorBtnActive, selectedChartType === 'line' && isDark && { backgroundColor: '#334155' }]}
                  onPress={() => setSelectedChartType('line')}
                >
                  <ThemedText style={[styles.selectorText, selectedChartType === 'line' && styles.selectorTextActive, selectedChartType === 'line' && isDark && { color: '#818cf8' }]}>Trend</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.chartWrapper}>
                {selectedChartType === 'bar' && (
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <ThemedText style={styles.chartTitle}>Time Spent (Minutes)</ThemedText>
                    <BarChart
                      data={{
                        labels: analyticsData.tabAnalytics.map(t => {
                          // Shorten labels for mobile
                          const name = t.name;
                          if (name.length > 8) return name.substring(0, 7) + '.';
                          return name;
                        }),
                        datasets: [{
                          data: analyticsData.tabAnalytics.map(t => Math.max(1, Math.round(t.totalSeconds / 60)))
                        }]
                      }}
                      width={width - 64}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix="m"
                      chartConfig={{
                        ...chartConfig,
                        barPercentage: 0.6,
                        propsForLabels: {
                          fontSize: 10,
                          fontWeight: '600',
                        },
                      }}
                      style={styles.chart}
                      verticalLabelRotation={0}
                      fromZero
                      showValuesOnTopOfBars
                    />
                  </View>
                )}

                {selectedChartType === 'pie' && (
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <ThemedText style={styles.chartTitle}>Usage Distribution</ThemedText>
                    <PieChart
                      data={analyticsData.tabAnalytics.map((t, idx) => ({
                        name: t.name.length > 10 ? t.name.substring(0, 9) + '.' : t.name,
                        population: Math.max(1, Math.round(t.totalSeconds / 60)),
                        color: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'][idx % 7],
                        legendFontColor: isDark ? '#cbd5e1' : '#475569',
                        legendFontSize: 11,
                        legendFontWeight: '600',
                      }))}
                      width={width - 64}
                      height={180}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="0"
                      center={[10, 0]}
                      absolute
                      hasLegend
                    />
                  </View>
                )}

                {selectedChartType === 'line' && (
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <ThemedText style={styles.chartTitle}>Activity Trend</ThemedText>
                    <LineChart
                      data={{
                        labels: timeframe === 'monthly'
                          ? ['3W', '2W', '1W', 'Now']
                          : timeframe === 'yearly'
                            ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
                            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                          data: analyticsData.weeklyActivity && analyticsData.weeklyActivity.length > 0
                            ? analyticsData.weeklyActivity.map(v => Math.max(0, v))
                            : (timeframe === 'monthly' ? [0, 0, 0, 0] : (timeframe === 'yearly' ? new Array(12).fill(0) : new Array(7).fill(0)))
                        }]
                      }}
                      width={width - 64}
                      height={220}
                      yAxisSuffix="m"
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                        propsForLabels: {
                          fontSize: 10,
                          fontWeight: '600',
                        },
                        propsForDots: {
                          r: '4',
                          strokeWidth: '2',
                          stroke: '#8b5cf6',
                        },
                      }}
                      bezier
                      style={styles.chart}
                      fromZero
                    />
                  </View>
                )}
              </View>

              {/* Premium Analytics Footer */}
              <View style={[styles.analyticsFooter, isDark && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                <View style={styles.footerItem}>
                  <Text style={[styles.footerLabel, isDark && { color: '#64748b' }]}>MOST ACTIVE HUB</Text>
                  <Text style={[styles.footerValue, isDark && { color: '#818cf8' }]}>
                    {analyticsData.tabAnalytics.length > 0
                      ? [...analyticsData.tabAnalytics].sort((a, b) => b.totalSeconds - a.totalSeconds)[0].name
                      : '--'}
                  </Text>
                </View>
                <View style={[styles.footerDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                <View style={styles.footerItem}>
                  <Text style={[styles.footerLabel, isDark && { color: '#64748b' }]}>TOTAL ENGAGEMENT</Text>
                  <Text style={[styles.footerValue, isDark && { color: '#818cf8' }]}>
                    {Math.round(analyticsData.tabAnalytics.reduce((acc, curr) => acc + curr.totalSeconds, 0) / 60)}m
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
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
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Brighter/Lighter background matching web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
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
    color: '#7c3aed',
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
