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
import { Avatar } from '@mui/material';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth/email-login');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
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
        </div>
    );
}
