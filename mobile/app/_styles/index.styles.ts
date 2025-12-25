import { StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles';

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: SPACING['2xl'],
    },
    headerContent: {
        gap: SPACING.sm,
    },
    greeting: {
        fontSize: TYPOGRAPHY.fontSize['5xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textWhite,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        color: COLORS.textWhite,
        opacity: 0.9,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.lg,
    },
    featuresGrid: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        gap: SPACING.lg,
        marginBottom: 0,
        flex: 1,
    },
    featureCardContainer: {
        width: '100%',
        borderRadius: SPACING.md,
        overflow: 'hidden',
        flex: 1,
    },
    featureCard: {
        padding: SPACING['2xl'],
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        borderBottomWidth: 0,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    featureIcon: {
        marginRight: SPACING['2xl'],
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        marginBottom: SPACING.xs,
        color: 'white',
    },
    featureDescription: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        color: 'white',
        opacity: 0.9,
    },
});
