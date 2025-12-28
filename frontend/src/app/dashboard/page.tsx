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
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function DashboardPage() {
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const isLoading = useAppSelector(selectIsLoading);

    // DashboardLayout handles the authentication checks and redirects

    return (
        <DashboardLayout title="">
            {user && (
                <div className={styles.container}>
                    <div className={styles.welcomeCard}>
                        {/* Decorative Background Elements */}
                        <div className={styles.decoration1}></div>
                        <div className={styles.decoration2}></div>

                        <div className={styles.welcomeContent}>
                            <div className={styles.welcomeMain}>
                                <div className={styles.welcomeAvatar}>
                                    {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.textContainer}>
                                    <div className={styles.greetingPre} suppressHydrationWarning>
                                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                                    </div>
                                    <h1 className={styles.userName}>
                                        {user.name || user.username || 'User'}
                                    </h1>
                                    <div className={styles.userDetailsRow}>
                                        <div className={styles.detailItem}>
                                            <AlternateEmailIcon className={styles.detailIcon} />
                                            <span>{user.username || 'username'}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <MailOutlineIcon className={styles.detailIcon} />
                                            <span>{user.email || 'email@example.com'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.dateBadge}>
                                <span className={styles.dateLabel}>TODAY</span>
                                <span className={styles.dateDay}>{new Date().getDate()}</span>
                                <span className={styles.dateMonth}>{new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div
                            className={`${styles.featureCard} ${styles.musicCard}`}
                            onClick={() => router.push('/music')}
                        >
                            <div className={styles.featureIconWrapper}>
                                <MusicNoteIcon className={styles.featureIcon} />
                            </div>
                            <div>
                                <h3>Music</h3>
                                <p>Stream your favorite tracks</p>
                            </div>
                        </div>
                        <div
                            className={`${styles.featureCard} ${styles.messageCard}`}
                            onClick={() => router.push('/messages')}
                        >
                            <div className={styles.featureIconWrapper}>
                                <ChatBubbleIcon className={styles.featureIcon} />
                            </div>
                            <div>
                                <h3>Chat</h3>
                                <p>Stay connected with friends</p>
                            </div>
                        </div>
                        <div
                            className={`${styles.featureCard} ${styles.moneyCard}`}
                            onClick={() => router.push('/money')}
                        >
                            <div className={styles.featureIconWrapper}>
                                <AccountBalanceWalletIcon className={styles.featureIcon} />
                            </div>
                            <div>
                                <h3>Money</h3>
                                <p>Manage your finances</p>
                            </div>
                        </div>
                        <div
                            className={`${styles.featureCard} ${styles.newsCard}`}
                            onClick={() => router.push('/news')}
                        >
                            <div className={styles.featureIconWrapper}>
                                <NewspaperIcon className={styles.featureIcon} />
                            </div>
                            <div>
                                <h3>News</h3>
                                <p>Stay informed with updates</p>
                            </div>
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
