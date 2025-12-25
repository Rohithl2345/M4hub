'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './DashboardLayout.module.css';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LogoutIcon from '@mui/icons-material/Logout';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth/email-login');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.logo}>M4Hub</div>
                <nav className={styles.nav}>
                    <div
                        className={`${styles.navItem} ${isActive('/dashboard') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/dashboard')}
                    >
                        <DashboardIcon className={styles.navIcon} />
                        Dashboard
                    </div>
                    <div
                        className={`${styles.navItem} ${isActive('/profile') ? styles.navItemActive : ''}`}
                        onClick={() => router.push('/profile')}
                    >
                        <PersonIcon className={styles.navIcon} />
                        Profile
                    </div>
                    <div className={styles.navItem}>
                        <MusicNoteIcon className={styles.navIcon} />
                        Music
                    </div>
                    <div className={styles.navItem}>
                        <ChatBubbleIcon className={styles.navIcon} />
                        Messages
                    </div>
                    <div className={styles.navItem}>
                        <AccountBalanceWalletIcon className={styles.navIcon} />
                        Money
                    </div>
                    <div className={styles.navItem}>
                        <NewspaperIcon className={styles.navIcon} />
                        News
                    </div>
                </nav>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogoutIcon className={styles.logoutIcon} />
                        Logout
                    </button>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
