/**
 * Common UI Styles for Web Components
 * Reusable style objects and utility classes
 */

import { theme } from './theme';

export const commonStyles = {
    // Button Styles
    button: {
        primary: {
            padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
            background: theme.colors.primary,
            color: theme.colors.textWhite,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: theme.transitions.normal,
            boxShadow: theme.shadows.primary,
        },
        secondary: {
            padding: `${theme.spacing.md} ${theme.spacing['2xl']}`,
            background: theme.colors.backgroundGray,
            color: theme.colors.textPrimary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: theme.transitions.normal,
        },
    },

    // Card Styles
    card: {
        base: {
            background: theme.colors.cardBackground,
            borderRadius: theme.borderRadius['2xl'],
            padding: theme.spacing['4xl'],
            boxShadow: theme.shadows.md,
            border: `2px solid ${theme.colors.border}`,
        },
        compact: {
            background: theme.colors.cardBackground,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing['2xl'],
            boxShadow: theme.shadows.sm,
            border: `1px solid ${theme.colors.border}`,
        },
    },

    // Input Styles
    input: {
        base: {
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            transition: theme.transitions.normal,
            width: '100%',
        },
    },

    // Container Styles
    container: {
        page: {
            display: 'flex',
            minHeight: '100vh',
            background: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: theme.spacing['4xl'],
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
        },
    },

    // Text Styles
    text: {
        heading: {
            fontFamily: theme.typography.fontFamily.heading,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
        },
        body: {
            fontFamily: theme.typography.fontFamily.primary,
            fontWeight: theme.typography.fontWeight.regular,
            color: theme.colors.textPrimary,
        },
        label: {
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.textSecondary,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
        },
    },
} as const;

export type CommonStyles = typeof commonStyles;
