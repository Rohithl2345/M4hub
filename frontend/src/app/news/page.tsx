'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './news.module.css';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CircularProgress, Box } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { env } from '@/utils/env';

dayjs.extend(relativeTime);

export default function NewsPage() {
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');

    const categories = ['All', 'Technology', 'Business', 'Science', 'Sports', 'Entertainment', 'World'];

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const url = category === 'All'
                    ? `${env.apiUrl}/api/news/latest`
                    : `${env.apiUrl}/api/news/category/${category}`;
                const response = await axios.get(url);
                setNewsArticles(response.data);
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [category]);

    // Filter out any residual mock data and handle splitting logic safely
    const filteredArticles = newsArticles.filter(a => !a.externalId?.includes('mock'));

    // Main feed gets the first 12 articles (after filtering)
    const displayArticles = filteredArticles.slice(0, 12);
    // Sidebar gets a different set to avoid duplicates
    const sidebarNews = filteredArticles.length > 12 ? filteredArticles.slice(12, 20) : [];

    return (
        <DashboardLayout title="News">
            <div className={styles.container}>
                {/* Header - Standard Tab Style */}
                <div className={styles.header}>
                    <NewspaperIcon className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Latest News</h1>
                        <p className={styles.subtitle}>Stay updated with what&apos;s happening around the world</p>
                    </div>
                </div>

                {/* News Ticker */}
                <div className={styles.tickerWrap}>
                    <div className={styles.ticker}>
                        {displayArticles.length > 0 ? displayArticles.slice(0, 5).map((article, idx) => (
                            <div key={idx} className={styles.tickerItem}>
                                <span>BREAKING</span> {article.title}
                            </div>
                        )) : (
                            <div className={styles.tickerItem}>
                                <span>LATEST</span> Global news synchronization in progress...
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Tabs - Beautiful Filter */}
                <div className={styles.tabs}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.tab} ${category === cat ? styles.tabActive : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <CircularProgress sx={{ color: '#fa709a' }} />
                    </div>
                ) : (
                    <div className={styles.mainLayout}>
                        {/* Main Feed - Standard Cards */}
                        <div className={styles.newsGrid}>
                            {displayArticles.length > 0 ? displayArticles.map((article) => (
                                <div key={article.id} className={styles.newsCard}>
                                    <div className={styles.newsImage}>
                                        <img
                                            src={article.urlToImage || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800'}
                                            alt={article.title}
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <span className={styles.category}>{article.category || 'General'}</span>
                                        <h3 className={styles.newsTitle}>{article.title}</h3>
                                        <p className={styles.newsExcerpt}>
                                            {article.description || 'No additional details available for this story.'}
                                        </p>
                                        <div className={styles.newsFooter}>
                                            <span className={styles.source}>
                                                {article.sourceName} • {dayjs(article.publishedAt).fromNow()}
                                            </span>
                                            <button
                                                className={styles.readMore}
                                                onClick={() => window.open(article.url, '_blank')}
                                            >
                                                Read <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <Box sx={{ p: 4, textAlign: 'center', gridColumn: '1 / -1' }}>
                                    <p style={{ color: '#64748b' }}>No news articles found in this category.</p>
                                </Box>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarSection}>
                                <h4 className={styles.sidebarTitle}>
                                    <TrendingUpIcon /> Trending Briefs
                                </h4>
                                {sidebarNews.length > 0 ? sidebarNews.map((article) => (
                                    <div
                                        key={article.id}
                                        className={styles.sideItem}
                                        onClick={() => window.open(article.url, '_blank')}
                                    >
                                        <h5 className={styles.sideTitle}>{article.title}</h5>
                                        <div className={styles.sideMeta}>
                                            {article.sourceName} • {dayjs(article.publishedAt).fromNow()}
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '10px 0' }}>
                                        More stories moving into trends soon...
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
