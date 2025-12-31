'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './DashboardLayout.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LogoutIcon from '@mui/icons-material/Logout';
import HubIcon from '@mui/icons-material/Hub';
import { Avatar, Switch } from '@mui/material';
import { useState } from 'react';
import SessionTimeoutDialog from '@/components/SessionTimeoutDialog';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

function FloatingSidebarIcons({ Icon }: { Icon: any }) {
    const items = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${(i * 17) % 80 + 10}%`,
        delay: `-${(i * 1.5) % 15}s`,
        duration: `${10 + (i % 8)}s`,
        size: `${18 + (i % 4) * 8}px`
    }));

    return (
        <div className={styles.sidebarIconsContainer}>
            {items.map((item) => (
                <Icon
                    key={item.id}
                    className={styles.sidebarFloatIcon}
                    style={{
                        left: item.left,
                        fontSize: item.size,
                        animationDelay: item.delay,
                        animationDuration: item.duration,
                    }}
                />
            ))}
        </div>
    );
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [animationsEnabled, setAnimationsEnabled] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth/email-login');
    };

    // Session timeout management
    const {
        showWarning,
        remainingTime,
        extendSession,
        handleLogout: handleSessionTimeout,
    } = useSessionTimeout({
        timeoutDuration: 30 * 60 * 1000, // 30 minutes
        warningDuration: 2 * 60 * 1000, // 2 minutes warning
        onTimeout: handleLogout,
        enabled: true,
    });

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    const getSidebarGradient = () => {
        if (pathname.startsWith('/music')) return 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)';
        if (pathname.startsWith('/messages')) return 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)';
        if (pathname.startsWith('/money')) return 'linear-gradient(180deg, #78350f 0%, #451a03 100%)';
        if (pathname.startsWith('/news')) return 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)';
        return 'linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)'; // Dashboard Purple
    };

    const getSidebarIcon = () => {
        if (pathname.startsWith('/music')) return MusicNoteIcon;
        if (pathname.startsWith('/messages')) return ChatBubbleIcon;
        if (pathname.startsWith('/money')) return AccountBalanceWalletIcon;
        if (pathname.startsWith('/news')) return NewspaperIcon;
        return DashboardIcon;
    };

    return (
        <div className={styles.container}>
            <div
                className={styles.sidebar}
                style={{ background: getSidebarGradient() }}
            >
                {animationsEnabled && (
                    <FloatingSidebarIcons Icon={getSidebarIcon()} />
                )}

                <div className={styles.logo}>
                    <div className={styles.logoIconWrapper}>
                        <HubIcon className={styles.logoIcon} />
                    </div>
                    <div>
                        <div className={styles.logoText}>M4Hub</div>
                        <div className={styles.logoTagline}>Your Digital Hub</div>
                    </div>
                </div>
                <nav className={styles.nav}>
                    <div
                        className={`${styles.navItem} ${isActive('/dashboard') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/dashboard')}
                        data-tab="dashboard"
                    >
                        <DashboardIcon className={styles.navIcon} />
                        Dashboard
                    </div>
                    {/* Profile link removed from sidebar as requested */}
                    <div
                        className={`${styles.navItem} ${isActive('/music') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/music')}
                        data-tab="music"
                    >
                        <MusicNoteIcon className={styles.navIcon} />
                        Music
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/messages') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/messages')}
                        data-tab="messages"
                    >
                        <ChatBubbleIcon className={styles.navIcon} />
                        Messages
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/money') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/money')}
                        data-tab="money"
                    >
                        <AccountBalanceWalletIcon className={styles.navIcon} />
                        Money
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/news') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/news')}
                        data-tab="news"
                    >
                        <NewspaperIcon className={styles.navIcon} />
                        News
                    </div>
                </nav>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>

                    <div className={styles.headerRight}>
                        <div className={styles.animationToggle}>
                            <span className={styles.toggleLabel}>Animations</span>
                            <Switch
                                size="small"
                                checked={animationsEnabled}
                                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' }
                                }}
                            />
                        </div>

                        <div
                            className={`${styles.profilePreview} ${isActive('/profile') ? styles.profileActive : ''}`}
                            onClick={() => router.push('/profile')}
                        >
                            <div className={styles.profileInfo}>
                                <span className={styles.profileName}>{user?.username || 'User'}</span>
                                <span className={styles.profileRole}>My Profile</span>
                            </div>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: '#3b82f6',
                                    fontWeight: 700,
                                    border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {(user?.username || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                        </div>

                        <div className={styles.divider} />

                        <button onClick={handleLogout} className={styles.logoutButton} title="Logout">
                            <LogoutIcon className={styles.logoutIcon} />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </div>

            {/* Session Timeout Dialog */}
            <SessionTimeoutDialog
                open={showWarning}
                remainingTime={remainingTime}
                onExtendSession={extendSession}
                onLogout={handleSessionTimeout}
                warningThreshold={120}
            />
        </div>
    );
}
