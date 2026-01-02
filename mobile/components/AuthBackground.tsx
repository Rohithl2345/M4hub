import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { useAppSelector } from '@/store/hooks';

const { width, height } = Dimensions.get('window');

interface FloatingIconProps {
    icon: any;
    index: number;
}

function FloatingIcon({ icon, index }: FloatingIconProps) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const posX = ((index * 13 + 7) % 80 + 10) / 100 * width;
    const size = 20 + (index % 6) * 10;
    const duration = 10000 + (index % 12) * 1000;

    // Alternate between top-to-bottom and bottom-to-top
    const fromTop = index % 2 === 0;
    const startY = fromTop ? -100 : height;
    const endY = fromTop ? height : -100;

    useEffect(() => {
        const delay = (index * 1800) % 20000;

        opacity.value = withDelay(delay, withTiming(0.15, { duration: 1000 }));
        translateY.value = startY;
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(endY, {
                    duration: duration,
                    easing: Easing.linear,
                }),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: posX,
                },
                animatedStyle,
            ]}
        >
            <Ionicons name={icon} size={size} color="#fff" />
        </Animated.View>
    );
}

export interface AuthTheme {
    name: string;
    colors: string[];
    icon: any;
}

export const authThemes: AuthTheme[] = [
    {
        name: 'Music',
        colors: ['#064e3b', '#065f46', '#047857'], // Green
        icon: 'musical-notes',
    },
    {
        name: 'Messages',
        colors: ['#172554', '#1e3a8a', '#1e40af'], // Blue
        icon: 'chatbubbles',
    },
    {
        name: 'Money',
        colors: ['#451a03', '#78350f', '#92400e'], // Orange/Brown
        icon: 'wallet',
    },
    {
        name: 'News',
        colors: ['#450a0a', '#7f1d1d', '#991b1b'], // Red
        icon: 'newspaper',
    },
];

interface AuthBackgroundProps {
    currentThemeIndex: number;
}

export function AuthBackground({ currentThemeIndex }: AuthBackgroundProps) {
    const theme = authThemes[currentThemeIndex];
    const magicEnabled = useAppSelector((state) => state.ui.magicEnabled);
    const backgroundOpacity = useSharedValue(1);

    useEffect(() => {
        // Fade effect when theme changes
        backgroundOpacity.value = withSequence(
            withTiming(0.7, { duration: 500 }),
            withTiming(1, { duration: 500 })
        );
    }, [currentThemeIndex]);

    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }));

    return (
        <Animated.View style={[StyleSheet.absoluteFill, animatedBackgroundStyle]}>
            <LinearGradient
                colors={theme.colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            >
                {/* Floating Icons - Reduced for performance on real devices */}
                {magicEnabled && (
                    <View style={StyleSheet.absoluteFill}>
                        {[...Array(40)].map((_, i) => (
                            <FloatingIcon key={`${theme.name}-${i}`} icon={theme.icon} index={i} />
                        ))}
                    </View>
                )}
            </LinearGradient>
        </Animated.View>
    );
}
