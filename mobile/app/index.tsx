import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withRepeat,
    Easing,
    withDelay
} from 'react-native-reanimated';


const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const logoScale = useSharedValue(0.8);
    const logoOpacity = useSharedValue(0);
    const footerOpacity = useSharedValue(0);

    useEffect(() => {
        // Initial logo animation
        logoScale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.back(1.5))
        });
        logoOpacity.value = withTiming(1, { duration: 1000 });

        // Pulse animation
        logoScale.value = withDelay(1000, withRepeat(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        ));

        // Footer animation
        footerOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));

        // Always navigate to Welcome screen after animation
        const timer = setTimeout(() => {
            router.replace('/welcome');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const animatedFooterStyle = useAnimatedStyle(() => ({
        opacity: footerOpacity.value,
        transform: [{ translateY: withTiming(footerOpacity.value === 1 ? 0 : 20, { duration: 800 }) }]
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e1b4b', '#2e1065', '#4c1d95']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.centerContainer}>
                <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                    <LinearGradient
                        colors={['#7c3aed', '#6d28d9']}
                        style={styles.logoGradient}
                    >
                        <Ionicons name="infinite" size={80} color="white" />
                    </LinearGradient>
                    <Text style={styles.title}>M4Hub</Text>
                    <Text style={styles.subtitle}>Digital Ecosystem</Text>
                </Animated.View>
            </View>

            <Animated.View style={[styles.footer, animatedFooterStyle]}>
                <Text style={styles.footerText}>SECURE • FAST • RELIABLE</Text>
                <View style={styles.loadingBar}>
                    <Animated.View style={styles.loadingProgress} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoGradient: {
        width: 140,
        height: 140,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ffffff',
        marginTop: 24,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 3,
        marginBottom: 20,
    },
    loadingBar: {
        width: width * 0.4,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingProgress: {
        width: '100%',
        height: '100%',
        backgroundColor: '#7c3aed',
    }
});
