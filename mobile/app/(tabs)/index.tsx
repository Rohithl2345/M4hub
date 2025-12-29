import { TouchableOpacity, View, ScrollView, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { analyticsService, HubAnalytics, TabAnalytics } from '@/services/analytics.service';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

function FloatingParticle({ delay = 0 }: { delay?: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const posX = Math.random() * width;
  const posY = Math.random() * 150 + 50;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.3, { duration: 800 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-30, {
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    position: 'absolute',
    left: posX,
    top: posY,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.particle} />
    </Animated.View>
  );
}

function CircularProgress({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(300, withSpring(percentage, { damping: 15 }));
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(progress.value / 100) * 360}deg` }],
  }));

  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <View style={[styles.circularProgressBg, { width: size, height: size, borderColor: color + '20' }]} />
      <Animated.View style={[styles.circularProgressFill, { width: size, height: size, borderColor: color }, animatedStyle]} />
      <View style={[styles.circularProgressInner, { width: size - 12, height: size - 12 }]}>
        <ThemedText style={[styles.circularProgressText, { color }]}>{Math.round(percentage)}%</ThemedText>
      </View>
    </View>
  );
}

function BarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
  return (
    <View style={styles.barChartContainer}>
      {data.map((value, index) => {
        const barHeight = useSharedValue(0);

        useEffect(() => {
          barHeight.value = withDelay(index * 100, withSpring((value / maxValue) * 100, { damping: 12 }));
        }, [value]);

        const animatedBarStyle = useAnimatedStyle(() => ({
          height: `${barHeight.value}%`,
        }));

        return (
          <View key={index} style={styles.barWrapper}>
            <View style={styles.barContainer}>
              <Animated.View style={[styles.bar, animatedBarStyle]}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <ThemedText style={styles.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const cardScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  const [analyticsData, setAnalyticsData] = useState<HubAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      setIsLoading(true);
      const data = await analyticsService.getHubAnalytics(token);
      if (data) {
        setAnalyticsData(data);
      }
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [token]);

  const features = [
    {
      id: 'music',
      title: 'Music',
      icon: 'musical-notes',
      description: 'Stream & Discover',
      gradientColors: ['#8b5cf6', '#6366f1'] as const,
      iconBg: 'rgba(139, 92, 246, 0.15)'
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: 'chatbubbles',
      description: 'Connect & Chat',
      gradientColors: ['#3b82f6', '#2563eb'] as const,
      iconBg: 'rgba(59, 130, 246, 0.15)'
    },
    {
      id: 'money',
      title: 'Money',
      icon: 'wallet',
      description: 'Manage Finances',
      gradientColors: ['#10b981', '#059669'] as const,
      iconBg: 'rgba(16, 185, 129, 0.15)'
    },
    {
      id: 'news',
      title: 'News',
      icon: 'newspaper',
      description: 'Stay Informed',
      gradientColors: ['#f59e0b', '#d97706'] as const,
      iconBg: 'rgba(245, 158, 11, 0.15)'
    },
  ];

  const stats = [
    { label: 'Active Sessions', value: '3', icon: 'pulse', color: '#8b5cf6' },
    { label: 'Messages', value: '12', icon: 'chatbubble', color: '#3b82f6' },
    { label: 'Balance', value: '$2.4K', icon: 'trending-up', color: '#10b981' },
  ];

  // Use real data from API or fallback to defaults
  const hubAnalytics = analyticsData?.tabAnalytics || [
    { name: 'Music', percentage: 25, color: '#8b5cf6', icon: 'musical-notes', sessions: 0, totalSeconds: 0 },
    { name: 'Messages', percentage: 25, color: '#3b82f6', icon: 'chatbubbles', sessions: 0, totalSeconds: 0 },
    { name: 'Money', percentage: 25, color: '#10b981', icon: 'wallet', sessions: 0, totalSeconds: 0 },
    { name: 'News', percentage: 25, color: '#f59e0b', icon: 'newspaper', sessions: 0, totalSeconds: 0 },
  ];

  const weeklyActivity = analyticsData?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0];

  const engagementMetrics = [
    {
      label: 'Daily Active Time',
      value: analyticsData?.engagementMetrics?.dailyActiveTime || '0h',
      change: analyticsData?.engagementMetrics?.dailyChange || '+0%',
      trending: 'up'
    },
    {
      label: 'Features Used',
      value: analyticsData?.engagementMetrics?.featuresUsed || '0/12',
      change: analyticsData?.engagementMetrics?.featuresChange || '+0',
      trending: 'up'
    },
    {
      label: 'Engagement Score',
      value: analyticsData?.engagementMetrics?.engagementScore || '0%',
      change: analyticsData?.engagementMetrics?.scoreChange || '+0%',
      trending: 'up'
    },
  ];

  const recentActivity = [
    { id: '1', title: 'New Message from Alex', time: '2 mins ago', icon: 'chatbubble-ellipses', color: '#3b82f6' },
    { id: '2', title: 'Wallet Top-up Successful', time: '1 hour ago', icon: 'checkmark-circle', color: '#10b981' },
    { id: '3', title: 'Breaking: Tech News Update', time: '3 hours ago', icon: 'flash', color: '#f59e0b' },
  ];

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Hero Header */}
        <LinearGradient
          colors={['#064e3b', '#065f46', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          {/* Floating Particles */}
          <View style={StyleSheet.absoluteFill}>
            {[...Array(8)].map((_, i) => (
              <FloatingParticle key={i} delay={i * 100} />
            ))}
          </View>

          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#fff', '#f0fdf4']}
                style={styles.avatarGradient}
              >
                <Ionicons name="person" size={32} color="#059669" />
              </LinearGradient>
            </View>
            <ThemedText style={styles.heroGreeting}>
              Welcome back,
            </ThemedText>
            <ThemedText style={styles.heroName}>
              {user?.firstName || user?.username || 'Explorer'}
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              YOUR DIGITAL COMMAND CENTER
            </ThemedText>
          </View>
        </LinearGradient>

        <Animated.View style={[styles.mainContent, animatedContentStyle]}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              </View>
            ))}
          </View>

          {/* Hub Analytics Section */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Hub Analytics</ThemedText>
            <View style={styles.sectionBadge}>
              <Ionicons name="analytics" size={12} color="#8b5cf6" />
              <ThemedText style={[styles.sectionBadgeText, { color: '#6b21a8' }]}>INSIGHTS</ThemedText>
            </View>
          </View>

          {/* Usage Breakdown */}
          <View style={styles.analyticsGrid}>
            {hubAnalytics.map((item, index) => (
              <View key={index} style={styles.analyticsCard}>
                <CircularProgress percentage={item.percentage} color={item.color} size={70} />
                <View style={styles.analyticsInfo}>
                  <View style={styles.analyticsHeader}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                    <ThemedText style={styles.analyticsName}>{item.name}</ThemedText>
                  </View>
                  <ThemedText style={styles.analyticsSessions}>{item.sessions} sessions</ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* Weekly Activity Chart */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <ThemedText style={styles.chartTitle}>Weekly Activity</ThemedText>
              <ThemedText style={styles.chartSubtitle}>Last 7 days</ThemedText>
            </View>
            <BarChart data={weeklyActivity} maxValue={Math.max(...weeklyActivity)} />
          </View>

          {/* Engagement Metrics */}
          <View style={styles.metricsContainer}>
            {engagementMetrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
                <View style={styles.metricValueRow}>
                  <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
                  <View style={[styles.metricChange, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="trending-up" size={12} color="#166534" />
                    <ThemedText style={styles.metricChangeText}>{metric.change}</ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Quick Access</ThemedText>
            <View style={styles.sectionBadge}>
              <Ionicons name="flash" size={12} color="#10b981" />
              <ThemedText style={styles.sectionBadgeText}>LIVE</ThemedText>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCardContainer}
                onPress={() => router.push(`/${feature.id}` as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.featureCard}
                >
                  <View style={[styles.featureIconWrapper, { backgroundColor: feature.iconBg }]}>
                    <Ionicons name={feature.icon as any} size={28} color={feature.gradientColors[0]} />
                  </View>
                  <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                  <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                  <View style={styles.featureArrow}>
                    <Ionicons name="arrow-forward" size={16} color="#94a3b8" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.sectionLink}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <TouchableOpacity key={item.id} style={styles.activityItem} activeOpacity={0.7}>
                <View style={[styles.activityIconContainer, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.activityTime}>{item.time}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroHeader: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroGreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  particle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  mainContent: {
    marginTop: -20,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 0.5,
  },
  sectionLink: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '700',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  analyticsCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  circularProgress: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressBg: {
    position: 'absolute',
    borderWidth: 6,
    borderRadius: 100,
  },
  circularProgressFill: {
    position: 'absolute',
    borderWidth: 6,
    borderRadius: 100,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  circularProgressInner: {
    backgroundColor: '#fff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressText: {
    fontSize: 14,
    fontWeight: '900',
  },
  analyticsInfo: {
    flex: 1,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  analyticsName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  analyticsSessions: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
  },
  metricsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  featureCardContainer: {
    width: (width - 56) / 2,
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureCard: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  featureArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 14,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});
