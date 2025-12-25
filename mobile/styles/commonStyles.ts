/**
 * Common Reusable Styles for Mobile Components
 */

import { StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from './theme';

export const commonStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },

    // Cards
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING['2xl'],
        ...SHADOWS.md,
    },

    cardCompact: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.sm,
    },

    // Buttons
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.primary,
    },

    buttonSecondary: {
        backgroundColor: COLORS.backgroundGray,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: COLORS.textWhite,
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    buttonTextSecondary: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    // Inputs
    input: {
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.textPrimary,
        backgroundColor: COLORS.background,
    },

    inputFocused: {
        borderColor: COLORS.primary,
    },

    // Text Styles
    heading1: {
        fontSize: TYPOGRAPHY.fontSize['6xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },

    heading2: {
        fontSize: TYPOGRAPHY.fontSize['5xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },

    heading3: {
        fontSize: TYPOGRAPHY.fontSize['4xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },

    heading4: {
        fontSize: TYPOGRAPHY.fontSize.xxl,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.textPrimary,
    },

    bodyText: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.regular,
        color: COLORS.textPrimary,
        lineHeight: TYPOGRAPHY.fontSize.lg * TYPOGRAPHY.lineHeight.normal,
    },

    label: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    caption: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.regular,
        color: COLORS.textTertiary,
    },

    // Layout
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    column: {
        flexDirection: 'column',
    },

    // Spacing
    marginBottomSm: {
        marginBottom: SPACING.sm,
    },

    marginBottomMd: {
        marginBottom: SPACING.md,
    },

    marginBottomLg: {
        marginBottom: SPACING.lg,
    },

    marginBottomXl: {
        marginBottom: SPACING.xl,
    },

    // Status Messages
    successMessage: {
        padding: SPACING.lg,
        backgroundColor: COLORS.successLight,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.success,
    },

    successMessageText: {
        color: COLORS.successDark,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },

    errorMessage: {
        padding: SPACING.lg,
        backgroundColor: COLORS.errorLight,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.error,
    },

    errorMessageText: {
        color: COLORS.errorDark,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },

    // Shadow
    shadow: SHADOWS.md,
});
