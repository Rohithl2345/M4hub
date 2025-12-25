import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { newsStyles as styles } from '../_styles/news.styles';

export default function NewsScreen() {
    const newsArticles = [
        {
            id: 1,
            category: 'Technology',
            title: 'AI Revolution: New Breakthrough in Machine Learning',
            excerpt: 'Researchers announce major advancement in artificial intelligence capabilities...',
            time: '2 hours ago',
            emoji: '🤖'
        },
        {
            id: 2,
            category: 'Business',
            title: 'Global Markets Reach New Heights',
            excerpt: 'Stock markets worldwide show strong performance as economic indicators improve...',
            time: '4 hours ago',
            emoji: '📈'
        },
        {
            id: 3,
            category: 'Sports',
            title: 'Championship Finals Set Records',
            excerpt: 'Historic match draws millions of viewers as teams battle for the title...',
            time: '6 hours ago',
            emoji: '⚽'
        },
        {
            id: 4,
            category: 'Entertainment',
            title: 'New Movie Breaks Box Office Records',
            excerpt: 'Latest blockbuster surpasses expectations with incredible opening weekend...',
            time: '8 hours ago',
            emoji: '🎬'
        },
    ];

    const stats = [
        { label: 'Trending Stories', value: '12', icon: 'trending-up' },
        { label: 'Categories', value: '8', icon: 'globe' },
        { label: 'Daily Articles', value: '156', icon: 'newspaper' },
    ];

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'News',
                    headerShown: true,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#fa709a', '#fee140']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Ionicons name="newspaper" size={64} color="white" />
                    <ThemedText style={styles.headerTitle}>Latest News</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Stay updated with what&apos;s happening around the world</ThemedText>
                </LinearGradient>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Ionicons name={stat.icon as any} size={32} color="#fa709a" />
                            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                            <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* News Feed */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Top Stories</ThemedText>
                    {newsArticles.map((article) => (
                        <TouchableOpacity key={article.id} style={styles.newsCard}>
                            <View style={styles.newsImage}>
                                <ThemedText style={styles.newsEmoji}>{article.emoji}</ThemedText>
                            </View>
                            <View style={styles.newsContent}>
                                <View style={styles.categoryBadge}>
                                    <ThemedText style={styles.categoryText}>{article.category}</ThemedText>
                                </View>
                                <ThemedText style={styles.newsTitle}>{article.title}</ThemedText>
                                <ThemedText style={styles.newsExcerpt}>{article.excerpt}</ThemedText>
                                <View style={styles.newsFooter}>
                                    <ThemedText style={styles.time}>{article.time}</ThemedText>
                                    <TouchableOpacity style={styles.readMoreBtn}>
                                        <ThemedText style={styles.readMoreText}>Read More</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Coming Soon */}
                <View style={styles.comingSoon}>
                    <ThemedText style={styles.comingSoonTitle}>📰 More Features Coming Soon!</ThemedText>
                    <ThemedText style={styles.comingSoonText}>Building a comprehensive news experience for you</ThemedText>
                    <View style={styles.featuresList}>
                        {['Personalized news feed', 'Category filters', 'Bookmark articles', 'Share stories'].map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <ThemedText style={styles.featureText}>{feature}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}
