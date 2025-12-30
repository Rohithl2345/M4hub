import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Text, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withDelay,
    Easing,
    Layout,
    FadeIn
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Data matching Web Layout features
const FEATURES = [
    {
        id: 'music',
        icon: 'musical-notes',
        title: 'Music',
        desc: 'Stream unlimited premium tracks',
        colors: ['#065f46', '#064e3b'] as [string, string], // Emerald
    },
    {
        id: 'messages',
        icon: 'chatbubbles',
        title: 'Messages',
        desc: 'Connect with 256-bit encryption',
        colors: ['#1e3a8a', '#172554'] as [string, string], // Blue
    },
    {
        id: 'money',
        icon: 'wallet',
        title: 'Money',
        desc: 'Manage global finances instantly',
        colors: ['#78350f', '#451a03'] as [string, string], // Amber
    },
    {
        id: 'news',
        icon: 'newspaper',
        title: 'News',
        desc: 'Stay informed with breaking news',
        colors: ['#7f1d1d', '#450a0a'] as [string, string], // Red
    }
];

// --- Floating Icons (Web Style) ---
function FloatingIcon({ icon, delay }: { icon: string; delay: number }) {
    // Randomize start position logic
    const edge = Math.floor(Math.random() * 4); // 0: bottom, 1: top, 2: left, 3: right

    // Initial positions
    let startX = Math.random() * width;
    let startY = Math.random() * height;

    // Target positions
    let targetX = Math.random() * width;
    let targetY = Math.random() * height;

    if (edge === 0) { // From Bottom -> Up
        startY = height + 50;
        targetY = -50;
    } else if (edge === 1) { // From Top -> Down
        startY = -50;
        targetY = height + 50;
    } else if (edge === 2) { // From Left -> Right
        startX = -50;
        targetX = width + 50;
    } else { // From Right -> Left
        startX = width + 50;
        targetX = -50;
    }

    const translateX = useSharedValue(startX);
    const translateY = useSharedValue(startY);
    const opacity = useSharedValue(0);

    const size = Math.random() * 20 + 15;
    const duration = 4000 + Math.random() * 5000; // Faster (4s - 9s)

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(0.2, { duration: 1000 }));

        translateX.value = withDelay(
            delay,
            withRepeat(
                withTiming(targetX, { duration, easing: Easing.linear }),
                -1
            )
        );

        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(targetY, { duration, easing: Easing.linear }),
                -1
            )
        );
    }, [icon, edge]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
            <Ionicons name={icon as any} size={size} color="white" />
        </Animated.View>
    );
}

// --- Feature List Item Component ---
function FeatureItem({ item, isActive, onPress }: { item: typeof FEATURES[0], isActive: boolean, onPress: () => void }) {
    const heightAnim = useSharedValue(isActive ? 80 : 50);
    const bgOpacity = useSharedValue(isActive ? 0.2 : 0);
    const textOpacity = useSharedValue(isActive ? 1 : 0.6);

    useEffect(() => {
        heightAnim.value = withTiming(isActive ? 85 : 56, { duration: 300 });
        bgOpacity.value = withTiming(isActive ? 0.15 : 0, { duration: 300 });
        textOpacity.value = withTiming(isActive ? 1 : 0.5, { duration: 300 });
    }, [isActive]);

    const containerStyle = useAnimatedStyle(() => ({
        height: heightAnim.value,
        backgroundColor: `rgba(255,255,255,${bgOpacity.value})`,
        opacity: textOpacity.value,
        transform: [{ scale: withTiming(isActive ? 1.02 : 1, { duration: 300 }) }]
    }));

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <Animated.View style={[styles.featureItem, containerStyle]}>
                {/* Icon Box */}
                <View style={[styles.featureIconBox, isActive && styles.featureIconBoxActive]}>
                    <Ionicons name={item.icon as any} size={22} color="white" />
                </View>

                {/* Text Info */}
                <View style={styles.featureInfo}>
                    <Text style={[styles.featureTitle, isActive && styles.featureTitleActive]}>{item.title}</Text>
                    {isActive && (
                        <Animated.Text
                            entering={FadeIn.delay(100)}
                            style={styles.featureDesc}
                            numberOfLines={1}
                        >
                            {item.desc}
                        </Animated.Text>
                    )}
                </View>

                {isActive && (
                    <View style={styles.activeIndicator} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function WelcomeScreen() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const current = FEATURES[activeIndex];

    // Auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % FEATURES.length);
        }, 4000); // 4 seconds per feature
        return () => clearInterval(interval);
    }, []);

    // Background Gradient Animation
    const animatedBgStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(current.colors[0], { duration: 800 })
        };
    });

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 1. Dynamic Background Layer */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]}>
                <LinearGradient
                    colors={[current.colors[0], current.colors[1]]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* 2. Floating Icons (Web Sidebar Style) */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <FloatingIcon
                        key={`float-${i}`}
                        icon={current.icon}
                        delay={i * 100} // Reduced delay for faster initial fill
                    />
                ))}
            </View>

            {/* 3. Gradient Overlay for Readability */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <View style={styles.safeArea}>
                {/* Header Branding */}
                <View style={styles.header}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="infinite" size={24} color="white" />
                    </View>
                    <View>
                        <Text style={styles.brandName}>M4HUB</Text>
                        <Text style={styles.tagline}>Your Digital Ecosystem</Text>
                    </View>
                </View>

                {/* Main Content: Interactive Feature List (Web Sidebar Style) */}
                <View style={styles.listContainer}>
                    <View style={styles.listWrapper}>
                        {FEATURES.map((item, index) => (
                            <FeatureItem
                                key={item.id}
                                item={item}
                                isActive={index === activeIndex}
                                onPress={() => setActiveIndex(index)}
                            />
                        ))}
                    </View>
                </View>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/auth/email-login')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 60 : 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 20,
    },
    logoBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    brandName: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    listContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    listWrapper: {
        gap: 12, // Spacing between items
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    featureIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureIconBoxActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    featureInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    featureTitleActive: {
        fontWeight: '700',
    },
    featureDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    activeIndicator: {
        width: 4,
        height: 24,
        backgroundColor: 'white',
        borderRadius: 2,
        marginLeft: 12,
    },
    footer: {
        paddingTop: 20,
    },
    primaryButton: {
        height: 60,
        backgroundColor: 'white',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: 'black',
    },
});
