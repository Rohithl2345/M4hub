/**
 * Updated Theme Configuration for Mobile App
 * Centralized design tokens matching web app
 */

// Color Palette
export const COLORS = {
    // Primary Colors
    primary: '#5433ff',
    primaryDark: '#3d1fcc',
    primaryLight: '#20bdff',

    // Text Colors
    textPrimary: '#1A1A1A',
    textSecondary: '#4F4F4F',
    textTertiary: '#8E8E8E',
    textWhite: '#FFFFFF',

    // Background Colors
    background: '#FFFFFF',
    backgroundGray: '#F5F6FA',
    cardBackground: '#FFFFFF',

    // Border Colors
    border: '#E0E0E0',
    borderLight: '#F0F0F0',

    // Status Colors
    success: '#4CAF50',
    successLight: '#d4edda',
    successDark: '#155724',
    error: '#F44336',
    errorLight: '#f8d7da',
    errorDark: '#721c24',
    warning: '#FFC107',
    info: '#2196F3',
} as const;

// Typography
export const TYPOGRAPHY = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 13,
        base: 14,
        md: 15,
        lg: 16,
        xl: 18,
        xxl: 20,
        '3xl': 22,
        '4xl': 24,
        '5xl': 28,
        '6xl': 32,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

// Spacing
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
    '7xl': 56,
    '8xl': 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    '2xl': 16,
    '3xl': 20,
    full: 9999,
} as const;

// Shadows (for iOS)
export const SHADOWS = {
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    primary: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
} as const;

// Common Styles
export const COMMON_STYLES = {
    // Container
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Card
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING['2xl'],
        ...SHADOWS.md,
    },

    // Button
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING['2xl'],
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...SHADOWS.primary,
    },
    buttonText: {
        color: COLORS.textWhite,
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    // Input
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

    // Text
    heading: {
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.textSecondary,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
} as const;

// Export theme object
export const THEME = {
    colors: COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    commonStyles: COMMON_STYLES,
} as const;
