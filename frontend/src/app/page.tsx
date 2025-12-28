'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';
import HubIcon from '@mui/icons-material/Hub';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(state => state.auth.isLoading);
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.2s
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    // Complete splash after 2.6s
    const completeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  useEffect(() => {
    if (!showSplash && !isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/email-login?mode=signup');
      }
    }
  }, [showSplash, isAuthenticated, isLoading, router]);


  if (showSplash) {
    return (
      <div className={`splash-container ${isExiting ? 'splash-exit' : ''}`}>
        <div className="logo-wrapper">
          <div className="icon-box">
            <HubIcon sx={{ fontSize: 64, color: 'white' }} />
          </div>
          <h1 className="brand-name">M4Hub</h1>
          <p className="tagline">Your Digital Ecosystem</p>
        </div>

        <style jsx>{`
          .splash-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: transform 0.6s cubic-bezier(0.8, 0, 0.2, 1);
          }
          
          .splash-exit {
            transform: translateY(-100%);
          }

          .logo-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: float 3s ease-in-out infinite;
          }

          .icon-box {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 20px 50px rgba(59, 130, 246, 0.4);
            margin-bottom: 24px;
            animation: scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }

          .brand-name {
            font-size: 48px;
            font-weight: 900;
            color: white;
            margin: 0;
            letter-spacing: -1px;
            opacity: 0;
            animation: slideUp 0.6s ease-out 0.4s forwards;
            font-family: 'Inter', sans-serif;
          }

          .tagline {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 8px;
            opacity: 0;
            animation: fadeIn 0.6s ease-out 0.8s forwards;
            font-family: 'Inter', sans-serif;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          @keyframes scaleIn {
            from { transform: scale(0) rotate(-15deg); opacity: 0; }
            to { transform: scale(1) rotate(0); opacity: 1; }
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
           @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f172a', height: '100vh', width: '100vw' }} />
  );
}
