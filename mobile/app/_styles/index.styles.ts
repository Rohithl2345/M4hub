import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/styles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    headerContent: {
        gap: 8,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    sectionLink: {
        fontSize: 14,
        color: '#5433ff',
        fontWeight: '600',
    },
    recentList: {
        gap: 12,
        paddingBottom: 40,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recentIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentText: {
        flex: 1,
        marginLeft: 16,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    recentTime: {
        fontSize: 13,
        color: '#6b7280',
    },
    featuresGrid: {
        gap: 16,
    },
    featureCardContainer: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    featureCard: {
        flex: 1,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    featureIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureIcon: {
        // Controlled by icon size prop in component
    },
    featureContent: {
        flex: 1,
        marginLeft: 16,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '500',
    },
});
