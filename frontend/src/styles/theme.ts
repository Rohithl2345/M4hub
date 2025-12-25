/**
 * Centralized Theme Configuration for Web App
 * Single source of truth for colors, typography, spacing, and other design tokens
 */

export const theme = {
    colors: {
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

        // Accent Colors
        accentNavy: '#1B2A41',
        accentSlate: '#263238',

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
    },

    typography: {
        fontFamily: {
            primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            heading: "'Poppins', sans-serif",
        },
        fontSize: {
            xs: '12px',
            sm: '13px',
            base: '14px',
            md: '15px',
            lg: '16px',
            xl: '18px',
            '2xl': '20px',
            '3xl': '22px',
            '4xl': '24px',
            '5xl': '28px',
            '6xl': '32px',
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        '5xl': '40px',
        '6xl': '48px',
        '7xl': '56px',
        '8xl': '64px',
    },

    borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        full: '9999px',
    },

    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
        md: '0 2px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 4px 12px rgba(0, 0, 0, 0.1)',
        xl: '0 8px 16px rgba(0, 0, 0, 0.12)',
        primary: '0 2px 8px rgba(255, 107, 53, 0.3)',
        primaryHover: '0 4px 12px rgba(255, 107, 53, 0.4)',
    },

    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px',
    },

    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
    },
} as const;

export type Theme = typeof theme;
