import { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { newsStyles as styles } from '../_styles/news.styles';
import { APP_CONFIG } from '../../constants';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NewsScreen() {
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');

    const categories = ['All', 'Technology', 'Business', 'Science', 'Sports', 'Entertainment', 'World'];

    useEffect(() => {
        fetchNews();
    }, [category]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const baseUrl = `${APP_CONFIG.API_URL}/api/news`;
            const url = category === 'All' ? `${baseUrl}/latest` : `${baseUrl}/category/${category}`;
            const response = await axios.get(url);
            setNewsArticles(response.data);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

    const firstArticle = newsArticles[0];
    const restArticles = newsArticles.slice(1, -5);
    const sideBriefs = newsArticles.slice(-5);

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'News Hub',
                    headerShown: false, // Using custom header for gradient
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Custom Gradient Header */}
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
                    <Ionicons name="newspaper-outline" size={32} color="white" />
                </LinearGradient>

                {/* Top Highlight / Ticker Replacement */}
                {firstArticle && (
                    <TouchableOpacity
                        style={styles.tickerContainer}
                        onPress={() => Linking.openURL(firstArticle.url)}
                    >
                        <View style={styles.tickerLabel}>
                            <ThemedText style={styles.tickerLabelText}>BREAKING</ThemedText>
                        </View>
                        <ThemedText style={styles.tickerText} numberOfLines={1}>
                            {firstArticle.title}
                        </ThemedText>
                        <Ionicons name="chevron-forward" size={16} color="#fa709a" style={{ marginRight: 12 }} />
                    </TouchableOpacity>
                )}

                {/* Category Filtering Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.tab, category === cat && styles.tabActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <ThemedText style={[styles.tabText, category === cat && styles.tabTextActive]}>
                                {cat}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {loading ? (
                    <ActivityIndicator size="large" color="#fa709a" style={styles.loader} />
                ) : (
                    <>
                        {/* Main Feed */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Featured Stories</ThemedText>
                            {restArticles.length > 0 ? restArticles.map((article) => (
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
                                            <Ionicons name="image-outline" size={48} color="#cbd5e1" />
                                        )}
                                    </View>
                                    <View style={styles.newsContent}>
                                        <ThemedText style={styles.category}>{article.category || 'General'}</ThemedText>
                                        <ThemedText style={styles.newsTitle}>{article.title}</ThemedText>
                                        <ThemedText style={styles.newsExcerpt} numberOfLines={2}>
                                            {article.description || 'Tap to read full article from source.'}
                                        </ThemedText>
                                        <View style={styles.newsFooter}>
                                            <ThemedText style={styles.source} numberOfLines={1}>
                                                {article.sourceName} • {dayjs(article.publishedAt).format('MMM D')}
                                            </ThemedText>
                                            <View style={styles.readMore}>
                                                <ThemedText style={styles.readMoreText}>Read</ThemedText>
                                                <Ionicons name="arrow-forward" size={14} color="#fa709a" />
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <ThemedText style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>
                                    No stories found in this category.
                                </ThemedText>
                            )}
                        </View>

                        {/* Side Briefs Section */}
                        {sideBriefs.length > 0 && (
                            <View style={styles.briefsSection}>
                                <ThemedText style={styles.sectionTitle}>Trending Briefs</ThemedText>
                                {sideBriefs.map((article) => (
                                    <TouchableOpacity
                                        key={article.id}
                                        style={styles.briefItem}
                                        onPress={() => Linking.openURL(article.url)}
                                    >
                                        <ThemedText style={styles.briefTitle} numberOfLines={2}>
                                            {article.title}
                                        </ThemedText>
                                        <ThemedText style={styles.briefMeta}>
                                            {article.sourceName} • {dayjs(article.publishedAt).fromNow()}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}
