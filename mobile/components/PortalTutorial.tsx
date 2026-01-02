import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, markTutorialSeen } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    SlideOutLeft,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence
} from 'react-native-reanimated';
import axios from 'axios';
import { storageService } from '@/services/storage.service';

const { width } = Dimensions.get('window');

// Use the correct internal API URL base on platform
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const STEPS = [
    {
        title: "Welcome to M4hub",
        description: "Your all-in-one platform for communication, entertainment, and finance. Let's take a quick tour!",
        icon: "rocket",
        colors: ['#6366f1', '#a855f7'] as [string, string]
    },
    {
        title: "Messenger",
        description: "Secure, real-time messaging with your friends. Chat, share media, and stay connected.",
        icon: "chatbubbles",
        colors: ['#0ea5e9', '#2563eb'] as [string, string]
    },
    {
        title: "Music Hub",
        description: "Stream high-quality music and discover your next favorite track with our integrated player.",
        icon: "musical-notes",
        colors: ['#f43f5e', '#e11d48'] as [string, string]
    },
    {
        title: "World News",
        description: "Stay in the loop with breaking news and stories from around the world, updated instantly.",
        icon: "newspaper",
        colors: ['#10b981', '#059669'] as [string, string]
    },
    {
        title: "Digital Wallet",
        description: "Complete control over your finances. Manage transactions and monitor your balance securely.",
        icon: "wallet",
        colors: ['#f59e0b', '#d97706'] as [string, string]
    },
    {
        title: "Ready to Explore!",
        description: "You're all set to experience M4hub. Enjoy your journey!",
        icon: "checkmark-circle",
        colors: ['#6366f1', '#a855f7'] as [string, string]
    }
];

export const PortalTutorial = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const iconRotation = useSharedValue(0);

    useEffect(() => {
        if (user && user.hasSeenTutorial === false) {
            setIsVisible(true);
        }
    }, [user]);

    useEffect(() => {
        if (isVisible) {
            iconRotation.value = withRepeat(
                withSequence(
                    withSpring(10, { damping: 2 }),
                    withSpring(-10, { damping: 2 }),
                    withSpring(0, { damping: 2 })
                ),
                -1,
                true
            );
        }
    }, [isVisible]);

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await finishTutorial();
        }
    };

    const finishTutorial = async () => {
        try {
            dispatch(markTutorialSeen());
            setIsVisible(false);

            // Notify backend
            const authToken = await storageService.getAuthToken();
            if (authToken) {
                await axios.post(`${API_URL}/api/users/tutorial-seen`, {}, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
            }
        } catch (error) {
            console.error("Failed to finish tutorial:", error);
            // Redux state already updated above, just hide
        }
    };

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${iconRotation.value}deg` }]
        };
    });

    if (!isVisible) return null;

    const step = STEPS[currentStep];

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={FadeIn.duration(400)}
                    exiting={FadeOut.duration(400)}
                    style={styles.modal}
                >
                    <View style={styles.progressContainer}>
                        {STEPS.map((_, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.progressDot,
                                    idx === currentStep && styles.progressDotActive
                                ]}
                            />
                        ))}
                    </View>

                    <Animated.View
                        key={currentStep}
                        entering={SlideInRight.duration(400)}
                        exiting={SlideOutLeft.duration(400)}
                        style={styles.content}
                    >
                        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                            <LinearGradient
                                colors={step.colors}
                                style={styles.iconGradient}
                            >
                                <Ionicons name={step.icon as any} size={48} color="white" />
                            </LinearGradient>
                        </Animated.View>

                        <Text style={styles.title}>{step.title}</Text>
                        <Text style={styles.description}>{step.description}</Text>
                    </Animated.View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={finishTutorial}
                            style={styles.btnSkip}
                        >
                            <Text style={styles.btnSkipText}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNext}
                            style={styles.btnNext}
                        >
                            <LinearGradient
                                colors={['#6366f1', '#4f46e5']}
                                style={styles.btnNextGradient}
                            >
                                <Text style={styles.btnNextText}>
                                    {currentStep === STEPS.length - 1 ? 'Start' : 'Next'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 4,
    },
    progressDotActive: {
        width: 20,
        backgroundColor: '#6366f1',
    },
    content: {
        alignItems: 'center',
        height: 260,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 90,
        height: 90,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    btnSkip: {
        padding: 12,
    },
    btnSkipText: {
        color: '#94a3b8',
        fontWeight: '700',
        fontSize: 15,
    },
    btnNext: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnNextGradient: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnNextText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
    }
});

export default PortalTutorial;
