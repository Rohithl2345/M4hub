import { TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../_styles/index.styles';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const features = [
    { id: 'music', title: 'Music', icon: 'musical-notes', description: 'Stream your tracks', gradientColors: ['#4c669f', '#3b5998'] as const },
    { id: 'messages', title: 'Messages', icon: 'chatbubble', description: 'Chat with friends', gradientColors: ['#3b5998', '#192f6a'] as const },
    { id: 'money', title: 'Money', icon: 'wallet', description: 'Manage wallet', gradientColors: ['#192f6a', '#4c669f'] as const },
    { id: 'news', title: 'News', icon: 'newspaper', description: 'Daily updates', gradientColors: ['#4c669f', '#192f6a'] as const },
  ];

  const recentActivity = [
    { id: '1', title: 'New Message', time: '2 mins ago', icon: 'chatbubble', color: '#5433ff' },
    { id: '2', title: 'Wallet Top-up', time: '1 hour ago', icon: 'card', color: '#20bdff' },
    { id: '3', title: 'Trending News', time: '3 hours ago', icon: 'flash', color: '#f59e0b' },
  ];

  return (
    <ThemedView style={homeStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyles.header}
        >
          <View style={homeStyles.headerContent}>
            <ThemedText style={homeStyles.greeting}>Hello, {user?.name || user?.username || 'User'}! 👋</ThemedText>
            <ThemedText style={homeStyles.subtitle}>Your all-in-one digital hub</ThemedText>
          </View>
        </LinearGradient>

        <View style={homeStyles.content}>
          <View style={homeStyles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={homeStyles.featureCardContainer}
                onPress={() => {
                  router.push(`/${feature.id}` as any);
                }}
              >
                <LinearGradient
                  colors={feature.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={homeStyles.featureCard}
                >
                  <View style={homeStyles.featureIconContainer}>
                    <Ionicons name={feature.icon as any} size={28} color="white" />
                  </View>
                  <View style={homeStyles.featureContent}>
                    <ThemedText style={homeStyles.featureTitle}>{feature.title}</ThemedText>
                    <ThemedText style={homeStyles.featureDescription}>{feature.description}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={homeStyles.sectionHeader}>
            <ThemedText style={homeStyles.sectionTitle}>Recent Activity</ThemedText>
            <TouchableOpacity>
              <ThemedText style={homeStyles.sectionLink}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={homeStyles.recentList}>
            {recentActivity.map((item) => (
              <TouchableOpacity key={item.id} style={homeStyles.recentItem}>
                <View style={[homeStyles.recentIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={homeStyles.recentText}>
                  <ThemedText style={homeStyles.recentTitle}>{item.title}</ThemedText>
                  <ThemedText style={homeStyles.recentTime}>{item.time}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
