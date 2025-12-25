# Web App Styling Guide

## Overview

The web application uses a centralized styling approach with Material-UI (MUI) and custom theme tokens.

## Theme System

### Location
- **Theme**: `frontend/src/styles/theme.ts`
- **Common Styles**: `frontend/src/styles/commonStyles.ts`

### Theme Structure

```typescript
export const theme = {
  colors: {
    primary: '#FF6B35',
    primaryDark: '#E55A2B',
    secondary: '#4A90E2',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    // ... more colors
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      // ... more sizes
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    // ... more spacing
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    // ... more radius
  },
};
```

## Component Styling Patterns

### 1. MUI sx Prop (Recommended for MUI Components)

Use MUI's `sx` prop with theme tokens:

```tsx
<Box
  sx={{
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  }}
>
  Content
</Box>
```

### 2. CSS Modules (Recommended for Custom Components)

Create a `.module.css` file alongside your component:

```css
/* Component.module.css */
.container {
  background-color: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
}
```

```tsx
// Component.tsx
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>Content</div>;
}
```

### 3. Common Styles (For Reusable Patterns)

Import from `commonStyles.ts`:

```tsx
import { commonStyles } from '@/styles/commonStyles';

<div style={commonStyles.card}>
  <h2 style={commonStyles.heading}>Title</h2>
  <p style={commonStyles.text}>Description</p>
</div>
```

## Layout Components

### DashboardLayout

The `DashboardLayout` component provides a consistent layout for authenticated pages:

**Location**: `frontend/src/components/layout/DashboardLayout/`

**Features**:
- Orange gradient sidebar (#FF6B35 → #FF8C42)
- Responsive navigation
- Profile dropdown
- Consistent padding and spacing

**Usage**:
```tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Page() {
  return (
    <DashboardLayout>
      <h1>Page Content</h1>
    </DashboardLayout>
  );
}
```

## Color Palette

### Primary Colors
- **Orange**: `#FF6B35` - Primary brand color
- **Orange Dark**: `#E55A2B` - Hover states
- **Orange Light**: `#FF8C42` - Gradients, accents

### Neutral Colors
- **White**: `#FFFFFF`
- **Surface**: `#F8F9FA`
- **Border Light**: `#E5E7EB`
- **Text Primary**: `#1F2937`
- **Text Secondary**: `#6B7280`

### Status Colors
- **Success**: `#10B981`
- **Error**: `#EF4444`
- **Warning**: `#F59E0B`
- **Info**: `#3B82F6`

## Typography

### Font Families
- **Primary**: Inter, system fonts
- **Monospace**: Fira Code, Consolas, Monaco

### Font Sizes
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

### Font Weights
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing Scale

- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
- 4xl: 6rem (96px)

## Best Practices

### ✅ Do
- Use theme tokens for consistent styling
- Create CSS modules for component-specific styles
- Use MUI `sx` prop for MUI components
- Import from `commonStyles` for reusable patterns
- Keep color values in theme, not hardcoded

### ❌ Don't
- Use inline styles with hardcoded values
- Mix different styling approaches in one component
- Create duplicate style definitions
- Hardcode spacing, colors, or font sizes
- Use !important unless absolutely necessary

## Migration from Inline Styles

When removing inline styles:

1. **Identify reusable patterns** → Move to `commonStyles.ts`
2. **Component-specific styles** → Create `.module.css` or `.styles.ts`
3. **MUI component styles** → Extract to `sx` prop objects
4. **Replace hardcoded values** → Use theme tokens

Example:
```tsx
// Before
<div style={{ backgroundColor: '#F8F9FA', padding: '32px' }}>

// After
<div style={commonStyles.card}>
```

## Dark Mode Support (Future)

The theme structure is prepared for dark mode:

```typescript
colors: {
  background: '#FFFFFF',        // Light mode
  backgroundDark: '#1F2937',    // Dark mode (future)
  // ...
}
```

## Resources

- [MUI Documentation](https://mui.com/)
- [CSS Modules Guide](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- Theme file: `frontend/src/styles/theme.ts`
- Common styles: `frontend/src/styles/commonStyles.ts`
