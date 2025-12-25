'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>M4Hub</h1>
        <p className={styles.subtitle}>
          Music, Message, Money, News - All in One Place
        </p>
        <div className={styles.getStartedWrapper}>
          <button
            className={styles.button}
            onClick={() => router.push('/auth/email-login')}
          >
            Get Started
          </button>
        </div>

        {/* Sign Up / Login buttons removed from landing page; Get Started leads to the form page */}
      </div>
    </div>
  );
}
