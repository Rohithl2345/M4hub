import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        // Navigate to welcome screen after 2 seconds
        const timer = setTimeout(() => {
            router.replace('/auth/email-login');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]); return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
            />
            <ThemedText type="title" style={styles.title}>M4Hub</ThemedText>
            <ThemedText style={styles.subtitle}>Your Music Hub</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E6F4FE',
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 30,
        marginBottom: 24,
    },
    title: {
        fontSize: 42,
        marginBottom: 8,
        color: '#007AFF',
    },
    subtitle: {
        fontSize: 18,
        opacity: 0.7,
    },
});
