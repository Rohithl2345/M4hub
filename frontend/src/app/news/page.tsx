'use client';

import DashboardLayout from '@/components/DashboardLayout';
import styles from './news.module.css';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';

export default function NewsPage() {
    const newsArticles = [
        {
            id: 1,
            category: 'Technology',
            title: 'AI Revolution: New Breakthrough in Machine Learning',
            excerpt: 'Researchers announce major advancement in artificial intelligence capabilities...',
            time: '2 hours ago',
            image: '🤖'
        },
        {
            id: 2,
            category: 'Business',
            title: 'Global Markets Reach New Heights',
            excerpt: 'Stock markets worldwide show strong performance as economic indicators improve...',
            time: '4 hours ago',
            image: '📈'
        },
        {
            id: 3,
            category: 'Sports',
            title: 'Championship Finals Set Records',
            excerpt: 'Historic match draws millions of viewers as teams battle for the title...',
            time: '6 hours ago',
            image: '⚽'
        },
        {
            id: 4,
            category: 'Entertainment',
            title: 'New Movie Breaks Box Office Records',
            excerpt: 'Latest blockbuster surpasses expectations with incredible opening weekend...',
            time: '8 hours ago',
            image: '🎬'
        },
    ];

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
                    <div className={styles.newsGrid}>
                        {newsArticles.map((article) => (
                            <div key={article.id} className={styles.newsCard}>
                                <div className={styles.newsImage}>{article.image}</div>
                                <div className={styles.newsContent}>
                                    <span className={styles.category}>{article.category}</span>
                                    <h3 className={styles.newsTitle}>{article.title}</h3>
                                    <p className={styles.newsExcerpt}>{article.excerpt}</p>
                                    <div className={styles.newsFooter}>
                                        <span className={styles.time}>{article.time}</span>
                                        <button className={styles.readMore}>Read More</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
