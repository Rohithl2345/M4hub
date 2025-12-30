"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, markTutorialSeen } from '@/store/slices/authSlice';
import axios from 'axios';
import styles from './PortalTutorial.module.css';
import WelcomeIcon from '@mui/icons-material/RocketLaunch';
import MessengerIcon from '@mui/icons-material/Chat';
import MusicIcon from '@mui/icons-material/MusicNote';
import NewsIcon from '@mui/icons-material/Newspaper';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DoneIcon from '@mui/icons-material/CheckCircle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STEPS = [
    {
        title: "Welcome to M4hub",
        description: "Your all-in-one platform for communication, entertainment, and finance. Let's take a quick tour!",
        icon: <WelcomeIcon sx={{ fontSize: 40 }} />,
        color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
    },
    {
        title: "Secure Messaging",
        description: "Connect with friends and colleagues through our encrypted chat system. Real-time, fast, and private.",
        icon: <MessengerIcon sx={{ fontSize: 40 }} />,
        color: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)"
    },
    {
        title: "Music Everywhere",
        description: "Stream your favorite tracks and discover new artists with our built-in high-fidelity music player.",
        icon: <MusicIcon sx={{ fontSize: 40 }} />,
        color: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
    },
    {
        title: "Global News",
        description: "Stay informed with real-time updates from across the globe, tailored to your interests.",
        icon: <NewsIcon sx={{ fontSize: 40 }} />,
        color: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
        title: "Smart Wallet",
        description: "Manage your finances, track transactions, and stay in control with our integrated digital wallet.",
        icon: <WalletIcon sx={{ fontSize: 40 }} />,
        color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    {
        title: "You're All Set!",
        description: "Explore M4hub and make the most of your digital life. Welcome aboard!",
        icon: <DoneIcon sx={{ fontSize: 40 }} />,
        color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
    }
];

export const PortalTutorial: React.FC = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (user && user.hasSeenTutorial === false && !isVisible) {
            setIsVisible(true);
        }
    }, [user, isVisible]);

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await finishTutorial();
        }
    };

    const finishTutorial = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await axios.post(`${API_URL}/api/users/tutorial-seen`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            dispatch(markTutorialSeen());
            setIsVisible(false);
        } catch (error) {
            console.error("Failed to mark tutorial as seen:", error);
            // Still close it so user isn't stuck
            dispatch(markTutorialSeen());
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    const step = STEPS[currentStep];

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {currentStep === STEPS.length - 1 && <div className={styles.finishConfetti} />}

                <div className={styles.progressContainer}>
                    {STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`${styles.progressDot} ${idx === currentStep ? styles.progressDotActive : ''}`}
                        />
                    ))}
                </div>

                <div className={styles.content}>
                    <div className={styles.iconWrapper} style={{ background: step.color }}>
                        {step.icon}
                    </div>
                    <h2 className={styles.title}>{step.title}</h2>
                    <p className={styles.description}>{step.description}</p>
                </div>

                <div className={styles.footer}>
                    <button className="btn-ghost" onClick={finishTutorial}>
                        Skip Tutorial
                    </button>
                    <button className="btn-primary" onClick={handleNext}>
                        {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PortalTutorial;
