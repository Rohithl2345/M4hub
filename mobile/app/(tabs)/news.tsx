import { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { newsStyles as styles } from '../_styles/news.styles';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NewsScreen() {
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            // Using placeholder IP for local development, should be env variable
            const response = await axios.get('http://192.168.1.2:8080/api/news/latest');
            setNewsArticles(response.data);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

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
                    <View style={styles.headerTextContainer}>
                        <ThemedText style={styles.headerTitle}>Latest News</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Stay updated with world events</ThemedText>
                    </View>
                    <Ionicons name="newspaper" size={40} color="white" />
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

                    {loading ? (
                        <ActivityIndicator size="large" color="#fa709a" style={{ marginTop: 40 }} />
                    ) : (
                        newsArticles.map((article) => (
                            <TouchableOpacity
                                key={article.id}
                                style={styles.newsCard}
                                onPress={() => Linking.openURL(article.url)}
                            >
                                <View style={styles.newsImage}>
                                    {article.urlToImage ? (
                                        <Image
                                            source={{ uri: article.urlToImage }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Ionicons name="newspaper" size={64} color="white" style={{ opacity: 0.3 }} />
                                    )}
                                </View>
                                <View style={styles.newsContent}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <View style={styles.categoryBadge}>
                                            <ThemedText style={styles.categoryText}>{article.category || 'General'}</ThemedText>
                                        </View>
                                        <ThemedText style={{ fontSize: 12, fontWeight: '600', color: '#666' }}>
                                            {article.sourceName}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.newsTitle}>{article.title}</ThemedText>
                                    <ThemedText style={styles.newsExcerpt} numberOfLines={3}>
                                        {article.description || 'No description available for this article.'}
                                    </ThemedText>
                                    <View style={styles.newsFooter}>
                                        <ThemedText style={styles.time}>{dayjs(article.publishedAt).fromNow()}</ThemedText>
                                        <TouchableOpacity
                                            style={styles.readMoreBtn}
                                            onPress={() => Linking.openURL(article.url)}
                                        >
                                            <ThemedText style={styles.readMoreText}>Read Source</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
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
