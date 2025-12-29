import { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { newsStyles as styles } from '../_styles/news.styles';
import { Skeleton } from '@/components/ui/Skeleton';
import { APP_CONFIG } from '../../constants';
import { storageService } from '../../services/storage.service';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Sidebar } from '@/components/Sidebar';
import { useAppTheme } from '@/hooks/use-app-theme';

dayjs.extend(relativeTime);

export default function NewsScreen() {
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const theme = useAppTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    const categories = ['All', 'Technology', 'Business', 'Science', 'Sports', 'Entertainment', 'World'];

    useEffect(() => {
        fetchNews();
    }, [category]);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await storageService.getAuthToken();
            const baseUrl = `${APP_CONFIG.API_URL}/api/news`;
            const url = category === 'All' ? `${baseUrl}/latest` : `${baseUrl}/category/${category}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewsArticles(response.data);
        } catch (error) {
            console.error("Error fetching news:", error);
            setError("Failed to load news. Please check your connection.");
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
                    headerShown: true,
                    headerTitle: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="newspaper" size={18} color="white" />
                            </View>
                            <ThemedText style={{ fontWeight: '900', color: '#0f172a', fontSize: 18, letterSpacing: -0.5 }}>World News</ThemedText>
                        </View>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ marginLeft: 16 }}>
                            <Ionicons name="menu" size={28} color="#0f172a" />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                    headerTitleAlign: 'left',
                    headerShadowVisible: false,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Professional Header (Red Sync) */}
                <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 }}>
                    <LinearGradient
                        colors={['#7f1d1d', '#ef4444']}
                        style={{ padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}
                    >
                        <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="newspaper" size={30} color="white" />
                        </View>
                        <View>
                            <ThemedText style={{ fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>World News</ThemedText>
                            <ThemedText style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Real-time global events hub</ThemedText>
                        </View>
                    </LinearGradient>
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
                                backgroundColor: '#fa709a',
                                borderRadius: 20
                            }}
                            onPress={fetchNews}
                        >
                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Try Again</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
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
                    </>
                )}
            </ScrollView>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </ThemedView>
    );
}
