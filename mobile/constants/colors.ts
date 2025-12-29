/**
 * Color Palette for M4Hub Application
 * Clean, minimal, rounded UI with orange primary
 */

export const COLORS = {
    // Primary Brand Colors - Purple/Blue
    PRIMARY: '#6366f1',
    PRIMARY_LIGHT: '#818cf8',
    PRIMARY_DARK: '#4f46e5',

    // Secondary Colors
    SECONDARY: '#5856D6',
    SECONDARY_LIGHT: '#AF52DE',
    SECONDARY_DARK: '#3634A3',

    // Neutral Colors
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_50: '#F8F8F8',
    GRAY_100: '#F5F6FA',
    GRAY_200: '#E0E0E0',
    GRAY_300: '#D1D5DB',
    GRAY_400: '#9CA3AF',
    GRAY_500: '#8E8E8E',
    GRAY_600: '#4F4F4F',
    GRAY_700: '#374151',
    GRAY_800: '#1A1A1A',
    GRAY_900: '#111827',

    // Accent Colors
    ACCENT_NAVY: '#1B2A41',
    ACCENT_SLATE: '#263238',

    // Semantic Colors
    SUCCESS: '#34C759',
    SUCCESS_LIGHT: '#66D988',
    SUCCESS_DARK: '#28A745',

    ERROR: '#FF3B30',
    ERROR_LIGHT: '#FF6B63',
    ERROR_DARK: '#DC2626',

    WARNING: '#FF9500',
    WARNING_LIGHT: '#FFAD33',
    WARNING_DARK: '#F59E0B',

    INFO: '#5AC8FA',
    INFO_LIGHT: '#8BDAFC',
    INFO_DARK: '#3B9DD8',

    // Background Colors
    BACKGROUND: '#f8fafc',
    BACKGROUND_SECONDARY: '#FFFFFF',
    CARD: '#FFFFFF',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',

    // Feature Card Colors
    MUSIC: '#10b981',
    MESSAGE: '#3b82f6',
    MONEY: '#f59e0b',
    NEWS: '#ef4444',

    // Text Colors
    TEXT_PRIMARY: '#1e293b',
    TEXT_SECONDARY: '#64748b',
    TEXT_TERTIARY: '#94a3b8',
    TEXT_INVERSE: '#FFFFFF',

    // Border Colors
    BORDER: '#E0E0E0',
    BORDER_LIGHT: '#F0F0F0',
    BORDER_DARK: '#D1D5DB',

    // Input Colors
    INPUT_BACKGROUND: '#F8F8F8',
    INPUT_BORDER: '#E0E0E0',
    INPUT_PLACEHOLDER: '#8E8E8E',
    INPUT_FOCUS: '#5433ff',
} as const;

export type ColorKey = keyof typeof COLORS;
