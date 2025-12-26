import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#5433ff', '#20bdff', '#a5fecb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.logo}
                        />
                    </View>
                    <ThemedText style={styles.title}>Welcome to M4Hub</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Your all-in-one digital platform for music, messages, money, and news
                    </ThemedText>

                    <View style={styles.methodContainer}>
                        <TouchableOpacity
                            style={styles.methodCard}
                            onPress={() => router.push('/auth/email-login')}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="mail" size={32} color="#5433ff" />
                            </View>
                            <ThemedText style={styles.methodTitle}>
                                Email Login
                            </ThemedText>
                            <ThemedText style={styles.methodDescription}>
                                Sign in with your email and password
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={24} color="#5433ff" style={styles.arrow} />
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.footerText}>
                        Secure • Fast • Reliable
                    </ThemedText>
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
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignSelf: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 30,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
        fontSize: 36,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    subtitle: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        marginBottom: 48,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    methodContainer: {
        gap: 16,
        marginBottom: 32,
    },
    methodCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0edff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    methodTitle: {
        fontSize: 22,
        marginBottom: 8,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    methodDescription: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 15,
        lineHeight: 22,
    },
    arrow: {
        marginTop: 16,
    },
    footerText: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
});
