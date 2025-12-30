
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withDelay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 120; // Appropriate height for navigation headers

function FloatingHeaderIcon({ icon, index }: { icon: any; index: number }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const posX = ((index * 17 + 5) % 90 + 5) / 100 * SCREEN_WIDTH;
    const size = 14 + (index % 3) * 6;
    const duration = 8000 + (index % 10) * 1500;

    useEffect(() => {
        const delay = (index * 1200) % 12000;
        opacity.value = withDelay(delay, withTiming(0.15, { duration: 1000 }));
        translateY.value = 80; // Start below header
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-40, { // Float up out of header
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
        <Reanimated.View
            style={[
                {
                    position: 'absolute',
                    left: posX,
                    zIndex: 0,
                },
                animatedStyle,
            ]}
        >
            <Ionicons name={icon} size={size} color="#fff" />
        </Reanimated.View>
    );
}

interface HubHeaderBackgroundProps {
    colors: [string, string, ...string[]];
    icon: any;
}

export function HubHeaderBackground({ colors, icon }: HubHeaderBackgroundProps) {
    const magicEnabled = useAppSelector((state) => state.ui.magicEnabled);

    return (
        <View style={StyleSheet.absoluteFill}>
            <LinearGradient
                colors={colors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            />
            {magicEnabled && (
                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                    {[...Array(8)].map((_, i) => (
                        <FloatingHeaderIcon key={i} icon={icon} index={i} />
                    ))}
                </View>
            )}
        </View>
    );
}
