import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Linking, Text, TextInput, StyleSheet, RefreshControl, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubHeaderBackground } from '@/components/HubHeaderBackground';
import { newsStyles as styles } from '../_styles/news.styles';
import { Skeleton } from '@/components/ui/Skeleton';
import { APP_CONFIG } from '../../constants';
import { storageService } from '../../services/storage.service';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { useAppTheme } from '@/hooks/use-app-theme';

dayjs.extend(relativeTime);

export default function NewsScreen() {
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('All');
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const categories = ['All', 'Technology', 'Business', 'Science', 'Sports', 'Entertainment', 'World'];
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

    const fetchNews = useCallback(async (forceRefresh = false) => {
        // Check if we have cached data and it's still fresh
        const now = Date.now();
        const isCacheValid = !forceRefresh && newsArticles.length > 0 && (now - lastFetchTime) < CACHE_DURATION;

        if (isCacheValid) {
            console.log('[News] Using cached data');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await storageService.getAuthToken();
            const baseUrl = `${APP_CONFIG.API_URL}/api/news`;
            const url = category === 'All' ? `${baseUrl}/latest` : `${baseUrl}/category/${category}`;

            console.log('[News] Fetching from:', url);

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000, // Reduced from 8000ms to 5000ms
            });

            setNewsArticles(response.data);
            setLastFetchTime(now);
            console.log('[News] Fetched', response.data.length, 'articles');
        } catch (error: any) {
            console.error("[News] Error fetching news:", error);
            // More specific error messages
            if (error.code === 'ECONNABORTED') {
                setError("Request timeout. Please try again.");
            } else if (error.response?.status === 401) {
                setError("Authentication failed. Please login again.");
            } else if (error.response?.status >= 500) {
                setError("Server error. Please try again later.");
            } else {
                setError("Failed to load news. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    }, [category, newsArticles.length, lastFetchTime]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNews(true);
        setRefreshing(false);
    }, [fetchNews]);

    useFocusEffect(
        useCallback(() => {
            // Only fetch if we don't have data or cache is stale
            if (newsArticles.length === 0 || (Date.now() - lastFetchTime) >= CACHE_DURATION) {
                fetchNews();
            }
        }, [fetchNews, newsArticles.length, lastFetchTime])
    );

    const filteredArticles = newsArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const firstArticle = filteredArticles[0];
    const restArticles = filteredArticles.slice(1);
    const sideBriefs = filteredArticles.slice(-5);

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: () => (
                        <View style={{ gap: 2 }}>
                            <Text style={{ fontWeight: '900', fontSize: 16, letterSpacing: -0.5, color: '#ffffff' }}>World News</Text>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Real-time global events</Text>
                        </View>
                    ),
                    headerBackground: () => (
                        <HubHeaderBackground
                            colors={['#7f1d1d', '#450a0a']}
                            icon="newspaper"
                        />
                    ),
                    headerTintColor: '#ffffff',
                    headerTitleAlign: 'left',
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => dispatch(setSidebarOpen(true))}
                            style={{ marginLeft: 16, marginRight: 8 }}
                        >
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="menu" size={22} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => fetchNews(true)} style={{ marginRight: 16 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="refresh" size={18} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />

            <FlatList
                data={restArticles}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
                }
                ListHeaderComponent={
                    <View style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff' }}>
                        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', padding: 12, borderRadius: 12, gap: 10 }}>
                                <Ionicons name="search" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                                <TextInput
                                    style={{ flex: 1, fontSize: 13, color: isDark ? '#f8fafc' : '#1e293b', padding: 0, fontWeight: '500' }}
                                    placeholder="Search keywords or headlines..."
                                    placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>

                        {error ? (
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50, padding: 20 }}>
                                <Ionicons name="cloud-offline-outline" size={64} color="#ef4444" />
                                <ThemedText style={{ fontSize: 18, marginTop: 16, color: '#ef4444' }}>{error}</ThemedText>
                                <TouchableOpacity
                                    style={{
                                        marginTop: 20,
                                        paddingVertical: 10,
                                        paddingHorizontal: 24,
                                        backgroundColor: '#ef4444',
                                        borderRadius: 20
                                    }}
                                    onPress={() => fetchNews(true)}
                                >
                                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Try Again</ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {firstArticle && (
                                    <TouchableOpacity
                                        style={[styles.tickerContainer, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}
                                        onPress={() => Linking.openURL(firstArticle.url)}
                                    >
                                        <View style={styles.tickerLabel}>
                                            <ThemedText style={styles.tickerLabelText}>BREAKING</ThemedText>
                                        </View>
                                        <ThemedText style={[styles.tickerText, isDark && { color: '#cbd5e1' }]} numberOfLines={1}>
                                            {firstArticle.title}
                                        </ThemedText>
                                        <Ionicons name="chevron-forward" size={16} color="#ef4444" style={{ marginRight: 12 }} />
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

                                {loading && (
                                    <View style={styles.section}>
                                        <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
                                        {[1, 2, 3].map((i) => (
                                            <View key={i} style={[styles.newsCard, { padding: 0, overflow: 'hidden' }]}>
                                                <Skeleton width="100%" height={200} borderRadius={0} />
                                                <View style={{ padding: 16 }}>
                                                    <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
                                                    <Skeleton width="90%" height={20} style={{ marginBottom: 8 }} />
                                                    <Skeleton width="100%" height={16} style={{ marginBottom: 4 }} />
                                                    <Skeleton width="80%" height={16} />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {!loading && (
                                    <View style={styles.sectionHeader}>
                                        <ThemedText style={styles.sectionTitle}>Featured Stories</ThemedText>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                }
                renderItem={({ item: article }) => (
                    <TouchableOpacity
                        style={[styles.newsCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}
                        onPress={() => Linking.openURL(article.url)}
                    >
                        <View style={[styles.newsImage, isDark && { backgroundColor: '#0f172a' }]}>
                            {article.urlToImage ? (
                                <Image
                                    source={{ uri: article.urlToImage }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                    transition={500}
                                />
                            ) : (
                                <Ionicons name="image-outline" size={48} color={isDark ? '#334155' : '#cbd5e1'} />
                            )}
                        </View>
                        <View style={styles.newsContent}>
                            <ThemedText style={styles.category}>{article.category || 'General'}</ThemedText>
                            <ThemedText style={[styles.newsTitle, isDark && { color: '#f8fafc' }]}>{article.title}</ThemedText>
                            <ThemedText style={[styles.newsExcerpt, isDark && { color: '#94a3b8' }]} numberOfLines={2}>
                                {article.description || 'Tap to read full article from source.'}
                            </ThemedText>
                            <View style={[styles.newsFooter, isDark && { borderTopColor: '#334155' }]}>
                                <ThemedText style={styles.source} numberOfLines={1}>
                                    {article.sourceName} • {dayjs(article.publishedAt).format('MMM D')}
                                </ThemedText>
                                <View style={styles.readMore}>
                                    <ThemedText style={styles.readMoreText}>Read</ThemedText>
                                    <Ionicons name="arrow-forward" size={14} color="#ef4444" />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    !loading && sideBriefs.length > 0 ? (
                        <View style={[styles.briefsSection, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
                            <ThemedText style={[styles.sectionTitle, isDark && { color: '#f8fafc' }]}>Trending Briefs</ThemedText>
                            {sideBriefs.map((article) => (
                                <TouchableOpacity
                                    key={article.id}
                                    style={[styles.briefItem, isDark && { borderBottomColor: '#334155' }]}
                                    onPress={() => Linking.openURL(article.url)}
                                >
                                    <ThemedText style={[styles.briefTitle, isDark && { color: '#cbd5e1' }]} numberOfLines={2}>
                                        {article.title}
                                    </ThemedText>
                                    <ThemedText style={styles.briefMeta}>
                                        {article.sourceName} • {dayjs(article.publishedAt).fromNow()}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading && !error && restArticles.length === 0 ? (
                        <ThemedText style={{ textAlign: 'center', color: isDark ? '#4b5563' : '#64748b', marginTop: 20 }}>
                            No stories found in this category.
                        </ThemedText>
                    ) : null
                }
            />
        </ThemedView>
    );
}
