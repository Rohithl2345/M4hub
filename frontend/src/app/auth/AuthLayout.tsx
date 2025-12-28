'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import styles from './email-login/email-login.module.css';

interface AuthLayoutProps {
    children: ReactNode;
}

function FloatingBackground({ Icon }: { Icon: any }) {
    const items = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${(i * 13 + 7) % 80 + 10}%`, // Keep within 10-90% to avoid edges
        delay: `-${(i * 1.8) % 20}s`,
        duration: `${10 + (i % 12)}s`,
        size: `${20 + (i % 6) * 10}px`
    }));

    return (
        <Box className={styles.floatingIconsContainer}>
            {items.map((item) => (
                <Icon
                    key={item.id}
                    className={styles.floatingIcon}
                    sx={{
                        left: item.left,
                        fontSize: item.size,
                        animationDelay: item.delay,
                        animationDuration: item.duration,
                    }}
                />
            ))}
        </Box>
    );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: MusicNoteIcon,
            title: 'Music',
            desc: 'Stream unlimited tracks',
            color: '#10b981', // Portal Green
            bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
        },
        {
            icon: ChatBubbleIcon,
            title: 'Messages',
            desc: 'Connect with friends',
            color: '#3b82f6',
            bg: 'linear-gradient(135deg, #172554 0%, #1e40af 100%)'
        },
        {
            icon: AccountBalanceWalletIcon,
            title: 'Money',
            desc: 'Manage finances securely',
            color: '#f59e0b',
            bg: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)'
        },
        {
            icon: NewspaperIcon,
            title: 'News',
            desc: 'Stay updated daily',
            color: '#ef4444',
            bg: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [features.length]);

    return (
        <Box className={styles.container}>
            {/* Left Side - Vertical Feature List */}
            <Box
                className={styles.brandingSide}
                sx={{ background: `${features[activeFeature].bg} !important` }}
            >
                {/* Floating Icons Background */}
                <FloatingBackground Icon={features[activeFeature].icon} />

                <Box className={styles.logoSection}>
                    <Typography className={styles.logoText}>M4Hub</Typography>
                    <Typography className={styles.tagline}>Your Digital Ecosystem</Typography>
                </Box>

                <Box className={styles.featureList}>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isActive = index === activeFeature;
                        return (
                            <Box
                                key={index}
                                className={`${styles.featureRow} ${isActive ? styles.activeRow : styles.inactiveRow}`}
                                onClick={() => setActiveFeature(index)}
                            >
                                <Box className={styles.iconWrapper} sx={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                                    <Icon className={styles.featureIcon} sx={{ color: 'white' }} />
                                </Box>
                                <Box className={styles.textWrapper}>
                                    <Typography className={styles.featureTitle}>{feature.title}</Typography>
                                    <Box className={styles.descWrapper}>
                                        <Typography className={styles.featureDesc}>{feature.desc}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
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
