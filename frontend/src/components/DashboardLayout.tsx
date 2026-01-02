'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import Badge from '@mui/material/Badge';
import Switch from '@mui/material/Switch';
import chatService from '@/services/chat.service';
import styles from './DashboardLayout.module.css';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FloatingSidebarIcons = React.memo(({ Icon }: { Icon: any }) => {
    const items = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${(i * 17) % 80 + 10}%`,
        delay: `-${(i * 1.5) % 15}s`,
        duration: `${10 + (i % 8)}s`,
        size: `${18 + (i % 4) * 8}px`
    })), []);

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
});
import { logger } from '@/utils/logger';
import dynamic from 'next/dynamic';

const PortalTutorial = dynamic(() => import('./PortalTutorial'), { ssr: false });
const SnakeGame = dynamic(() => import('./SnakeGame'), { ssr: false });
const InactivityHandler = dynamic(() => import('./InactivityHandler'), { ssr: false });

import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import HubIcon from '@mui/icons-material/Hub';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
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
    const [animationsEnabled, setAnimationsEnabled] = useState(false);

    // Persist Animation State
    useEffect(() => {
        const saved = localStorage.getItem('animationsEnabled');
        if (saved === 'true') setAnimationsEnabled(true);
    }, []);

    const handleAnimationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setAnimationsEnabled(isChecked);
        localStorage.setItem('animationsEnabled', String(isChecked));
    };

    // Sidebar Themes
    const getSidebarGradient = () => {
        if (pathname.startsWith('/music')) return 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)';
        if (pathname.startsWith('/messages')) return 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)';
        if (pathname.startsWith('/money')) return 'linear-gradient(180deg, #78350f 0%, #451a03 100%)';
        if (pathname.startsWith('/news')) return 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)';
        return 'linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)';
    };

    const getAccentGradient = () => {
        if (pathname.startsWith('/music')) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        if (pathname.startsWith('/messages')) return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        if (pathname.startsWith('/money')) return 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)';
        if (pathname.startsWith('/news')) return 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
        return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    };

    const getSidebarIcon = () => {
        if (pathname.startsWith('/music')) return MusicNoteIcon;
        if (pathname.startsWith('/messages')) return ChatBubbleIcon;
        if (pathname.startsWith('/money')) return AccountBalanceWalletIcon;
        if (pathname.startsWith('/news')) return NewspaperIcon;
        return DashboardIcon;
    };

    // Global Chat Connection and Presence
    useEffect(() => {
        // Protect the route
        const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')) : null;
        if (!token && !isLoading) {
            router.push('/auth/email-login?mode=login');
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
        const interval = setInterval(loadPendingCount, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleLogout = () => {
        chatService.disconnect();
        dispatch(logout());
        router.push('/auth/email-login?mode=login');
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setIsSidebarOpen(false);
    };

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const handleClickOutside = () => {
            if (showProfileDropdown) {
                setShowProfileDropdown(false);
            }
        };
        if (showProfileDropdown) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showProfileDropdown]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Authenticating...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

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

            <aside
                className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}
                style={{ background: getSidebarGradient() }}
            >
                {animationsEnabled && (
                    <FloatingSidebarIcons Icon={getSidebarIcon()} />
                )}

                <div className={styles.logo} onClick={() => router.push('/dashboard')}>
                    <div
                        className={styles.logoIconWrapper}
                        style={{ background: getAccentGradient() }}
                    >
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
                        onClick={() => handleNavigation('/dashboard')}
                        role="button"
                        tabIndex={0}
                        data-tab="dashboard"
                    >
                        <DashboardIcon className={styles.navIcon} />
                        <span>Dashboard</span>
                    </div>

                    <div
                        className={`${styles.navItem} ${isActive('/music') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/music')}
                        role="button"
                        tabIndex={0}
                        data-tab="music"
                    >
                        <MusicNoteIcon className={styles.navIcon} />
                        <span>Music</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/messages') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/messages')}
                        role="button"
                        tabIndex={0}
                        data-tab="messages"
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
                        data-tab="money"
                    >
                        <AccountBalanceWalletIcon className={styles.navIcon} />
                        <span>Money</span>
                        <span className={styles.prototypeBadge}>PROTOTYPE</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/news') ? styles.navItemActive : ''}`}
                        onClick={() => handleNavigation('/news')}
                        role="button"
                        tabIndex={0}
                        data-tab="news"
                    >
                        <NewspaperIcon className={styles.navIcon} />
                        <span>News</span>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.sidebarToggle}>
                        <div className={styles.toggleLabelWrapper}>
                            {animationsEnabled ? <AutoAwesomeIcon sx={{ fontSize: 16 }} /> : <AutoFixHighIcon sx={{ fontSize: 16, opacity: 0.5 }} />}
                            <span className={styles.toggleLabel}>{animationsEnabled ? 'Magic On' : 'Magic Off'}</span>
                        </div>
                        <Switch
                            size="small"
                            checked={animationsEnabled}
                            onChange={handleAnimationToggle}
                            sx={{
                                width: 42,
                                height: 24,
                                padding: 0,
                                '& .MuiSwitch-switchBase': {
                                    padding: 0,
                                    margin: '2px',
                                    transitionDuration: '300ms',
                                    '&.Mui-checked': {
                                        transform: 'translateX(18px)',
                                        color: '#fff',
                                        '& + .MuiSwitch-track': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            opacity: 1,
                                            border: 0,
                                        },
                                        '& .MuiSwitch-thumb': {
                                            background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        }
                                    },
                                    '&:not(.Mui-checked)': {
                                        '& .MuiSwitch-thumb': {
                                            background: 'rgba(255, 255, 255, 0.3)',
                                        }
                                    }
                                },
                                '& .MuiSwitch-thumb': {
                                    boxSizing: 'border-box',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                },
                                '& .MuiSwitch-track': {
                                    borderRadius: 24 / 2,
                                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                    opacity: 1,
                                    transition: 'background-color 500ms',
                                },
                            }}
                        />
                    </div>
                </div>
            </aside>

            {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} />}

            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.title}>{title}</h1>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>

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
                                            {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`${styles.statusBadge} ${isOnline && chatStatus.isConnected ? styles.statusOnline : styles.statusOffline}`} />
                                    </div>
                                    <div className={styles.headerUserDetails}>
                                        <span className={styles.headerUsername}>{user?.name || user?.username}</span>
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
                                <div className={`${styles.dropdownArrowContainer} ${showProfileDropdown ? styles.arrowRotate : ''}`}>
                                    <div className={styles.divider} />
                                    <ExpandMoreIcon className={styles.dropdownArrow} />
                                </div>

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
                <InactivityHandler onLogout={handleLogout} />
                <SnakeGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
            </main>
        </div>
    );
}
