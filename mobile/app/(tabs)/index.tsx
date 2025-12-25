import { TouchableOpacity, View } from 'react-native';
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
    { id: 'music', title: 'Music', icon: 'musical-notes', description: 'Stream your favorite tracks', gradientColors: ['#5433ff', '#20bdff'] as const },
    { id: 'messages', title: 'Messages', icon: 'chatbubble', description: 'Stay connected with friends', gradientColors: ['#20bdff', '#a5fecb'] as const },
    { id: 'money', title: 'Money', icon: 'wallet', description: 'Manage your finances', gradientColors: ['#5433ff', '#a5fecb'] as const },
    { id: 'news', title: 'News', icon: 'newspaper', description: 'Stay informed with latest updates', gradientColors: ['#20bdff', '#5433ff'] as const },
  ];

  return (
    <ThemedView style={homeStyles.container}>
      <LinearGradient
        colors={['#5433ff', '#20bdff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={homeStyles.header}
      >
        <View style={homeStyles.headerContent}>
          <ThemedText style={homeStyles.greeting}>Hello, {user?.firstName || 'User'}! 👋</ThemedText>
          <ThemedText style={homeStyles.subtitle}>Welcome to M4Hub</ThemedText>
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
                <Ionicons name={feature.icon as any} size={64} color="white" style={homeStyles.featureIcon} />
                <View style={homeStyles.featureContent}>
                  <ThemedText style={homeStyles.featureTitle}>{feature.title}</ThemedText>
                  <ThemedText style={homeStyles.featureDescription}>{feature.description}</ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}
