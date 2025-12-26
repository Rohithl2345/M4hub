'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectIsLoading } from '@/store/slices/authSlice';
import { Badge } from '@mui/material';
import chatService from '@/services/chat.service';
import styles from './DashboardLayout.module.css';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Global Chat Connection and Presence
    useEffect(() => {
        // Protect the route
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
        if (!token && !isLoading) {
            router.push('/auth/email-login');
        }

        if (user?.id) {
            chatService.connect(user.id, () => {
                console.log('Global presence established');
            });

            // Disconnect only on component unmount (effectively logout or app close)
            return () => {
                // If we are just navigating between dashboard pages, we might not want to disconnect
                // but Next.js might remount the layout. Our chatService.connect already checks
                // for active connections, but we should be careful.
                // For now, let's keep it connected as long as user is logged in.
            };
        }
    }, [user?.id, isLoading, router]);

    // Load pending requests count
    useEffect(() => {
        const loadPendingCount = async () => {
            if (user?.id) {
                try {
                    const requests = await chatService.getPendingRequests();
                    setPendingCount(requests.length);
                } catch (error) {
                    console.error('Error loading pending count:', error);
                }
            }
        };
        loadPendingCount();
        // Refresh count every 30 seconds
        const interval = setInterval(loadPendingCount, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleLogout = () => {
        chatService.disconnect();
        dispatch(logout());
        router.push('/auth/email-login');
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setIsSidebarOpen(false);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.container}>
            <button
                className={styles.mobileMenuButton}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logo} onClick={() => router.push('/dashboard')}>M4Hub</div>
                {user?.username && (
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.username}>@{user.username}</span>
                    </div>
                )}

                <nav className={styles.nav}>
                    <div
                        className={`${styles.navItem} ${isActive('/dashboard') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/dashboard')}
                        role="button"
                        tabIndex={0}
                    >
                        <DashboardIcon className={styles.navIcon} />
                        <span>Dashboard</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/profile') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/profile')}
                        role="button"
                        tabIndex={0}
                    >
                        <PersonIcon className={styles.navIcon} />
                        <span>Profile</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/music') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/music')}
                        role="button"
                        tabIndex={0}
                    >
                        <MusicNoteIcon className={styles.navIcon} />
                        <span>Music</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/messages') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/messages')}
                        role="button"
                        tabIndex={0}
                    >
                        <Badge badgeContent={pendingCount} color="error" max={99}>
                            <ChatBubbleIcon className={styles.navIcon} />
                        </Badge>
                        <span>Messages</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/money') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/money')}
                        role="button"
                        tabIndex={0}
                    >
                        <AccountBalanceWalletIcon className={styles.navIcon} />
                        <span>Money</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/news') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/news')}
                        role="button"
                        tabIndex={0}
                    >
                        <NewspaperIcon className={styles.navIcon} />
                        <span>News</span>
                    </div>
                </nav>

                <div className={styles.rightSection}>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogoutIcon /> Logout
                    </button>
                </div>
            </aside>

            {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} />}

            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.title}>{title}</h1>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
