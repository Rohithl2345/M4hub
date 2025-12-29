import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

// Consistent card height across all auth screens
const CARD_HEIGHT = height * 0.65; // 65% of screen height

interface AuthCardProps {
    children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                >
                    {children}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        padding: 28,
        height: CARD_HEIGHT,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    scrollContent: {
        flexGrow: 1,
    },
});
