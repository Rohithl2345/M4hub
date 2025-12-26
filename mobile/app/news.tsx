import { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Linking, Image } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { newsStyles as styles } from './_styles/news.styles';
import { APP_CONFIG } from '../constants';
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

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'News Feed',
                    headerShown: false,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
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
                    <View style={styles.section}>
                        {newsArticles
                            .filter(a => !a.externalId?.includes('mock'))
                            .map((article) => (
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
                            ))}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}
