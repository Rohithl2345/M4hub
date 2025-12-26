'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './news.module.css';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import { CircularProgress, Box } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NewsPage() {
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/news/latest');
                setNewsArticles(response.data);
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <DashboardLayout title="News">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <NewspaperIcon className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Latest News</h1>
                        <p className={styles.subtitle}>Stay updated with what&apos;s happening around the world</p>
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <TrendingUpIcon className={styles.statIcon} />
                        <div>
                            <h3>12</h3>
                            <p>Trending Stories</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <PublicIcon className={styles.statIcon} />
                        <div>
                            <h3>8</h3>
                            <p>Categories</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <NewspaperIcon className={styles.statIcon} />
                        <div>
                            <h3>156</h3>
                            <p>Daily Articles</p>
                        </div>
                    </div>
                </div>

                {/* News Feed */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Top Stories</h2>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                            <CircularProgress color="inherit" sx={{ color: '#fa709a' }} />
                        </Box>
                    ) : (
                        <div className={styles.newsGrid}>
                            {newsArticles.map((article) => (
                                <div key={article.id} className={styles.newsCard}>
                                    <div className={styles.newsImage}>
                                        {article.urlToImage ? (
                                            <img src={article.urlToImage} alt={article.title} />
                                        ) : (
                                            <NewspaperIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                                        )}
                                    </div>
                                    <div className={styles.newsContent}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <span className={styles.category}>{article.category || 'General'}</span>
                                            <span className={styles.source}>{article.sourceName}</span>
                                        </div>
                                        <h3 className={styles.newsTitle}>{article.title}</h3>
                                        <p className={styles.newsExcerpt}>
                                            {article.description || 'No description available for this article.'}
                                        </p>
                                        <div className={styles.newsFooter}>
                                            <span className={styles.time}>{dayjs(article.publishedAt).fromNow()}</span>
                                            <button
                                                className={styles.readMore}
                                                onClick={() => window.open(article.url, '_blank')}
                                            >
                                                Read Source
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coming Soon */}
                <div className={styles.comingSoon}>
                    <h3>📰 More Features Coming Soon!</h3>
                    <p>Building a comprehensive news experience for you</p>
                    <ul>
                        <li>Personalized news feed</li>
                        <li>Category filters</li>
                        <li>Bookmark articles</li>
                        <li>Share stories</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
