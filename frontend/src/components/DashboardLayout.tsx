'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectIsLoading } from '@/store/slices/authSlice';
import { Badge } from '@mui/material';
import chatService from '@/services/chat.service';
import styles from './DashboardLayout.module.css';
import { logger } from '@/utils/logger';
import PortalTutorial from './PortalTutorial';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SnakeGame from './SnakeGame';

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
    const [chatStatus, setChatStatus] = useState({ isConnected: false, isConnecting: false });
    const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isGameOpen, setIsGameOpen] = useState(false);





    // Global Chat Connection and Presence
    useEffect(() => {
        // Protect the route
        const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')) : null;
        if (!token && !isLoading) {
            router.push('/auth/email-login');
        }

        if (user?.id) {
            const connectChat = () => {
                chatService.connect(user.id, () => {
                    logger.info('Global presence established');
                });
            };

            connectChat();

            const handleOnline = () => {
                logger.info('Internet connection restored, reconnecting chat...');
                connectChat();
            };

            const handleOffline = () => {
                logger.info('Internet connection lost');
                // The WebSocket will naturally disconnect, but we could explicitly handle UI here if needed
            };

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            const unsubStatus = chatService.onStatusChange((status) => {
                setChatStatus(status);
            });

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                unsubStatus();
            };
        }
    }, [user?.id, isLoading, router]);

    useEffect(() => {
        const handleStatus = () => setIsOnline(window.navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);


    // Tab Usage Tracking
    useEffect(() => {
        if (!user?.id) return;

        const startTime = Date.now();
        const currentTab = pathname.split('/')[1]?.toUpperCase() || 'DASHBOARD';

        return () => {
            const endTime = Date.now();
            const durationSeconds = Math.round((endTime - startTime) / 1000);

            // Only log if they spent at least 1 second
            if (durationSeconds > 0) {
                import('@/services/analytics.service').then(({ default: analyticsService }) => {
                    analyticsService.logUsage(currentTab, durationSeconds);
                });
            }
        };
    }, [pathname, user?.id]);

    // Load pending requests count
    useEffect(() => {
        const loadPendingCount = async () => {
            if (user?.id) {
                try {
                    const requests = await chatService.getPendingRequests();
                    setPendingCount(requests.length);
                } catch (error) {
                    logger.error('Error loading pending count:', error);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showProfileDropdown) {
                setShowProfileDropdown(false);
            }
        };
        if (showProfileDropdown) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showProfileDropdown]);

    return (
        <div className={styles.container}>
            <PortalTutorial />
            <button
                className={styles.mobileMenuButton}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logo} onClick={() => router.push('/dashboard')}>M4Hub</div>


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

            </aside>

            {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} />}

            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.title}>{title}</h1>

                    {user?.username && (
                        <div className={styles.headerProfileContainer}>
                            <div
                                className={`${styles.headerProfile} ${showProfileDropdown ? styles.headerProfileActive : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProfileDropdown(!showProfileDropdown);
                                }}
                            >
                                <div className={styles.headerUserInfo}>
                                    <div className={styles.avatarWrapper}>
                                        <div className={styles.userAvatar}>
                                            {(user.name || user.username).charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`${styles.statusBadge} ${isOnline && chatStatus.isConnected ? styles.statusOnline : styles.statusOffline}`} />
                                    </div>
                                    <div className={styles.headerUserDetails}>
                                        <span className={styles.headerUsername}>{user.name || user.username}</span>
                                        <span className={styles.headerStatusText}>
                                            {!isOnline || !chatStatus.isConnected ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => setIsGameOpen(true)}>
                                                    <span style={{ color: '#ef4444', fontWeight: 700 }}>Offline</span>
                                                    <VideogameAssetIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                                                </div>
                                            ) : (
                                                <span style={{ color: '#10b981' }}>Online</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={`${styles.dropdownArrow} ${showProfileDropdown ? styles.arrowRotate : ''}`}>▾</div>

                                {showProfileDropdown && (
                                    <div className={styles.profileDropdown} onClick={(e) => e.stopPropagation()}>
                                        <div className={styles.dropdownItem} onClick={() => setIsGameOpen(true)}>
                                            <VideogameAssetIcon fontSize="small" sx={{ color: '#6366f1' }} />
                                            <span>Play Game</span>
                                        </div>
                                        <div className={styles.dropdownItem} onClick={() => handleNavigation('/profile')}>
                                            <PersonIcon fontSize="small" />
                                            <span>My Profile</span>
                                        </div>
                                        <div className={styles.dropdownDivider} />
                                        <div className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={handleLogout}>
                                            <LogoutIcon fontSize="small" />
                                            <span>Logout</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.content}>
                    {children}
                </div>
                <SnakeGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
            </main>
        </div>
    );
}
