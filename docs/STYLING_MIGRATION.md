# Styling Migration Guide

## Overview
This guide helps migrate from inline styles and duplicate code to centralized theme system.

## Web App (Frontend)

### Before (Old Approach)
```tsx
// ❌ Inline styles and hardcoded values
<div style={{
    padding: '24px',
    background: '#FF6B35',
    borderRadius: '12px',
    fontSize: '16px'
}}>
    Content
</div>

// ❌ CSS with hardcoded values
.card {
    background: #FFFFFF;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

### After (New Approach)
```tsx
// ✅ Import theme
import { theme } from '@/styles';

// ✅ Use theme tokens in CSS modules
.card {
    background: var(--card-bg);
    padding: var(--spacing-2xl);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
}

// ✅ Or use theme in TypeScript
const cardStyle = {
    padding: theme.spacing['2xl'],
    background: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.typography.fontSize.lg,
};
```

### Update globals.css
Add CSS variables from theme:
```css
:root {
  /* Colors */
  --primary: #FF6B35;
  --text-primary: #1A1A1A;
  --background: #FFFFFF;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-4xl: 32px;
  
  /* Border Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-primary: 0 2px 8px rgba(255, 107, 53, 0.3);
}
```

## Mobile App

### Before (Old Approach)
```tsx
// ❌ Inline styles with hardcoded values
<View style={{
    padding: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
}}>
    <Text style={{ fontSize: 16, color: '#1A1A1A' }}>
        Content
    </Text>
</View>

// ❌ StyleSheet with hardcoded values
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
});
```

### After (New Approach)
```tsx
// ✅ Import from centralized theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, commonStyles } from '@/styles';

// ✅ Use theme tokens
<View style={[commonStyles.card, { marginBottom: SPACING.lg }]}>
    <Text style={commonStyles.heading3}>
        Content
    </Text>
</View>

// ✅ Or create component-specific styles
const styles = StyleSheet.create({
    customCard: {
        backgroundColor: COLORS.cardBackground,
        padding: SPACING['2xl'],
        borderRadius: BORDER_RADIUS.xl,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['4xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },
});
```

## Component Migration Example

### Web Component (Before)
```tsx
// Old: dashboard/page.tsx
import styles from './dashboard.module.css';

export default function DashboardPage() {
    return (
        <div style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '32px', color: '#1A1A1A' }}>Dashboard</h1>
            <div style={{
                background: '#FFFFFF',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
            }}>
                Content
            </div>
        </div>
    );
}
```

### Web Component (After)
```tsx
// New: dashboard/page.tsx
import styles from './dashboard.module.css';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
    return (
        <DashboardLayout title="Dashboard">
            <div className={styles.card}>
                Content
            </div>
        </DashboardLayout>
    );
}

// dashboard.module.css
.card {
    background: var(--card-bg);
    padding: var(--spacing-2xl);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-md);
}
```

### Mobile Component (Before)
```tsx
// Old: profile.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.card}>
                Content
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
});
```

### Mobile Component (After)
```tsx
// New: profile.tsx
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, commonStyles } from '@/styles';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={commonStyles.heading2}>Profile</Text>
            <View style={commonStyles.card}>
                Content
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING['2xl'],
    },
});
```

## Quick Reference

### Common Replacements

| Old Value | New Token (Web) | New Token (Mobile) |
|-----------|-----------------|-------------------|
| `#FF6B35` | `var(--primary)` or `theme.colors.primary` | `COLORS.primary` |
| `#1A1A1A` | `var(--text-primary)` or `theme.colors.textPrimary` | `COLORS.textPrimary` |
| `#FFFFFF` | `var(--background)` or `theme.colors.background` | `COLORS.background` |
| `24px` | `var(--spacing-2xl)` or `theme.spacing['2xl']` | `SPACING['2xl']` |
| `16px` | `var(--spacing-lg)` or `theme.spacing.lg` | `SPACING.lg` |
| `12px` (radius) | `var(--radius-xl)` or `theme.borderRadius.xl` | `BORDER_RADIUS.xl` |
| `font-size: 16px` | `var(--font-lg)` or `theme.typography.fontSize.lg` | `TYPOGRAPHY.fontSize.lg` |
| `font-weight: 600` | `theme.typography.fontWeight.semibold` | `TYPOGRAPHY.fontWeight.semibold` |

## Migration Checklist

### Web App
- [ ] Create `styles/theme.ts` with design tokens
- [ ] Create `styles/commonStyles.ts` with reusable styles
- [ ] Update `globals.css` with CSS variables
- [ ] Move components to proper folder structure
- [ ] Replace inline styles with CSS modules
- [ ] Replace hardcoded values with theme tokens
- [ ] Create barrel exports (`index.ts`)

### Mobile App
- [ ] Create `styles/theme.ts` with design tokens
- [ ] Create `styles/commonStyles.ts` with StyleSheet
- [ ] Update components to import from `@/styles`
- [ ] Replace inline styles with StyleSheet
- [ ] Replace hardcoded values with theme tokens
- [ ] Create barrel exports (`index.ts`)

## Benefits

✅ **Consistency**: All components use same design tokens  
✅ **Maintainability**: Change once, update everywhere  
✅ **Type Safety**: TypeScript autocomplete for theme values  
✅ **Performance**: CSS modules and StyleSheet optimization  
✅ **Scalability**: Easy to add new themes or variants  
✅ **Documentation**: Self-documenting design system
