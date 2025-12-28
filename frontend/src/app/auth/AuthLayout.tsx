'use client';

import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import styles from './email-login/email-login.module.css';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <Box className={styles.container}>
            {/* Left Side - Branding */}
            <Box className={styles.brandingSide}>
                <Box className={styles.logoSection}>
                    <Typography component="div" className={styles.logoText}>
                        M4Hub
                    </Typography>
                    <Typography component="div" className={styles.tagline}>
                        Music, Messages, Money, News - All in One Place
                    </Typography>
                </Box>

                <Box className={styles.featuresGrid}>
                    <Box className={`${styles.featureCard} ${styles.musicCard}`}>
                        <MusicNoteIcon className={styles.featureIcon} />
                        <Typography className={styles.featureTitle}>Music</Typography>
                        <Typography className={styles.featureDesc}>Stream unlimited tracks</Typography>
                    </Box>
                    <Box className={`${styles.featureCard} ${styles.messagesCard}`}>
                        <ChatBubbleIcon className={styles.featureIcon} />
                        <Typography className={styles.featureTitle}>Messages</Typography>
                        <Typography className={styles.featureDesc}>Connect with friends</Typography>
                    </Box>
                    <Box className={`${styles.featureCard} ${styles.moneyCard}`}>
                        <AccountBalanceWalletIcon className={styles.featureIcon} />
                        <Typography className={styles.featureTitle}>Money</Typography>
                        <Typography className={styles.featureDesc}>Manage finances</Typography>
                    </Box>
                    <Box className={`${styles.featureCard} ${styles.newsCard}`}>
                        <NewspaperIcon className={styles.featureIcon} />
                        <Typography className={styles.featureTitle}>News</Typography>
                        <Typography className={styles.featureDesc}>Stay updated daily</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Right Side - Form Content */}
            <Box className={styles.formSide}>
                <Box className={styles.formContainer}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
