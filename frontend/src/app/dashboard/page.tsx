'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser, selectIsLoading } from '@/store/slices/authSlice';
import DashboardLayout from '@/components/DashboardLayout';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function DashboardPage() {
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const isLoading = useAppSelector(selectIsLoading);

    // DashboardLayout handles the authentication checks and redirects

    return (
        <DashboardLayout title="Dashboard">
            {user && (
                <div className={styles.container}>
                    <div className={styles.welcomeCard}>
                        <div className={styles.welcomeHeader}>
                            <div className={styles.welcomeAvatar}>
                                {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.welcomeText}>
                                <h2>Welcome back, {user.name || user.username || 'User'}!</h2>
                                <div className={styles.userDetails}>
                                    <p>@{user.username || 'username'}</p>
                                    <p>{user.email || 'email@example.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div
                            className={`${styles.featureCard} ${styles.musicCard}`}
                            onClick={() => router.push('/music')}
                        >
                            <MusicNoteIcon className={styles.featureIcon} />
                            <h3>Music</h3>
                            <p>Stream your favorite tracks</p>
                        </div>
                        <div
                            className={`${styles.featureCard} ${styles.messageCard}`}
                            onClick={() => router.push('/messages')}
                        >
                            <ChatBubbleIcon className={styles.featureIcon} />
                            <h3>Chat</h3>
                            <p>Stay connected with friends</p>
                        </div>
                        <div
                            className={`${styles.featureCard} ${styles.moneyCard}`}
                            onClick={() => router.push('/money')}
                        >
                            <AccountBalanceWalletIcon className={styles.featureIcon} />
                            <h3>Money</h3>
                            <p>Manage your finances</p>
                        </div>
                        <div
                            className={`${styles.featureCard} ${styles.newsCard}`}
                            onClick={() => router.push('/news')}
                        >
                            <NewspaperIcon className={styles.featureIcon} />
                            <h3>News</h3>
                            <p>Stay informed with latest updates</p>
                        </div>
                    </div>

                    <div className={styles.analyticsSection}>
                        <AnalyticsDashboard />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
