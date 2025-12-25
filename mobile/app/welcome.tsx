import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require('@/assets/images/icon.png')}
                    style={styles.logo}
                />
                <ThemedText type="title" style={styles.title}>Welcome to M4Hub</ThemedText>
                <ThemedText style={styles.subtitle}>Choose your login method to continue</ThemedText>

                <View style={styles.methodContainer}>
                    <TouchableOpacity
                        style={styles.methodCard}
                        onPress={() => router.push('/auth/email-login')}
                    >
                        <View style={styles.iconCircle}>
                            <ThemedText style={styles.iconText}>📧</ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" style={styles.methodTitle}>
                            Email Address
                        </ThemedText>
                        <ThemedText style={styles.methodDescription}>
                            Login with email and password
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 24,
        marginBottom: 32,
        alignSelf: 'center',
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 32,
    },
    subtitle: {
        textAlign: 'center',
        opacity: 0.7,
        fontSize: 16,
        marginBottom: 48,
    },
    methodContainer: {
        gap: 16,
        marginBottom: 32,
    },
    methodCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconText: {
        fontSize: 32,
    },
    methodTitle: {
        fontSize: 18,
        marginBottom: 8,
    },
    methodDescription: {
        textAlign: 'center',
        opacity: 0.7,
        fontSize: 14,
    },
});
