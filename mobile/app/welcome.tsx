import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
    interpolateColor
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const FEATURES = [
    {
        icon: 'musical-notes',
        title: 'Music',
        desc: 'Stream unlimited tracks',
        colors: ['#064e3b', '#065f46'] as [string, string],
        accent: '#10b981'
    },
    {
        icon: 'chatbubble-ellipses',
        title: 'Messages',
        desc: 'Connect with friends',
        colors: ['#172554', '#1e40af'] as [string, string],
        accent: '#3b82f6'
    },
    {
        icon: 'wallet',
        title: 'Money',
        desc: 'Manage finances securely',
        colors: ['#451a03', '#92400e'] as [string, string],
        accent: '#f59e0b'
    },
    {
        icon: 'newspaper',
        title: 'News',
        desc: 'Stay updated daily',
        colors: ['#450a0a', '#991b1b'] as [string, string],
        accent: '#ef4444'
    }
];

function FloatingIcon({ icon, delay }: { icon: any, delay: number }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.1);
    const posX = Math.random() * width;
    const posY = Math.random() * height * 0.6;

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(translateY.value - 50, {
                duration: 3000 + Math.random() * 2000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
        position: 'absolute',
        left: posX,
        top: posY,
    }));

    return (
        <Animated.View style={animatedStyle}>
            <Ionicons name={icon} size={30 + Math.random() * 30} color="white" />
        </Animated.View>
    );
}

export default function WelcomeScreen() {
    const router = useRouter();
    const [activeFeature, setActiveFeature] = useState(0);
    const fadeAnim = useSharedValue(1);

    useEffect(() => {
        const interval = setInterval(() => {
            fadeAnim.value = withTiming(0, { duration: 500 }, () => {
                setActiveFeature((prev) => (prev + 1) % FEATURES.length);
                fadeAnim.value = withTiming(1, { duration: 500 });
            });
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const contentStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ scale: 0.95 + 0.05 * fadeAnim.value }]
    }));

    const current = FEATURES[activeFeature];

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={current.colors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Floating Icons Background */}
                <View style={StyleSheet.absoluteFill}>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <FloatingIcon key={i} icon={current.icon} delay={i * 200} />
                    ))}
                </View>

                <View style={styles.content}>
                    <Animated.View style={[styles.mainContent, contentStyle]}>
                        <View style={styles.logoBadge}>
                            <Ionicons name={current.icon as any} size={60} color="white" />
                        </View>
                        <ThemedText style={styles.title}>M4Hub</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Your premium digital ecosystem for {current.title.toLowerCase()} and more.
                        </ThemedText>

                        <View style={styles.featureIndicator}>
                            {FEATURES.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        i === activeFeature && styles.activeDot,
                                        i === activeFeature && { backgroundColor: 'white' }
                                    ]}
                                />
                            ))}
                        </View>
                    </Animated.View>

                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/auth/email-login')}
                        >
                            <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
                            <View style={styles.buttonIcon}>
                                <Ionicons name="arrow-forward" size={20} color={current.accent} />
                            </View>
                        </TouchableOpacity>

                        <ThemedText style={styles.footerText}>
                            SECURE • FAST • RELIABLE
                        </ThemedText>
                    </View>
                </View>
            </LinearGradient>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'space-between',
        paddingTop: 100,
        paddingBottom: 60,
    },
    mainContent: {
        alignItems: 'center',
    },
    logoBadge: {
        width: 120,
        height: 120,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '600',
        paddingHorizontal: 10,
    },
    featureIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    activeDot: {
        width: 24,
    },
    actionContainer: {
        width: '100%',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#ffffff',
        width: '100%',
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 24,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    buttonIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 2,
    },
});
