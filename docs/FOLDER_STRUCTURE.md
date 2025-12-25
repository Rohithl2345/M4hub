# Folder Structure Guide

## Web App Structure (frontend/)

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── phone-login/
│   │   │   ├── otp-verify/
│   │   │   └── ...
│   │   ├── dashboard/            # Dashboard page
│   │   │   ├── page.tsx
│   │   │   └── dashboard.module.css
│   │   ├── profile/              # Profile page
│   │   │   ├── page.tsx
│   │   │   └── profile.module.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/               # Reusable components
│   │   ├── common/              # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── ...
│   │   ├── layout/              # Layout components
│   │   │   ├── DashboardLayout/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── DashboardLayout.module.css
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── styles/                   # Centralized styling
│   │   ├── theme.ts             # Theme tokens
│   │   ├── commonStyles.ts      # Common styles
│   │   └── index.ts             # Barrel export
│   │
│   ├── store/                    # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   └── ...
│   │   ├── hooks.ts
│   │   ├── store.ts
│   │   └── ReduxProvider.tsx
│   │
│   ├── services/                 # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── ...
│   │
│   └── utils/                    # Utility functions
│       ├── validation.ts
│       └── ...
```

## Mobile App Structure (mobile/)

```
mobile/
├── app/                          # Expo Router screens
│   ├── auth/                     # Authentication screens
│   │   ├── phone-login.tsx
│   │   ├── otp-verify.tsx
│   │   └── ...
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── profile.tsx          # Profile tab
│   │   └── ...
│   ├── profile-setup.tsx
│   ├── _layout.tsx
│   └── index.tsx
│
├── components/                   # Reusable components
│   ├── common/                  # Common UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   └── ui/                      # UI components
│       └── IconSymbol.tsx
│
├── styles/                       # Centralized styling
│   ├── theme.ts                 # Theme tokens
│   ├── commonStyles.ts          # Common styles
│   └── index.ts                 # Barrel export
│
├── store/                        # Redux store
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── ...
│   ├── hooks.ts
│   ├── store.ts
│   └── ReduxProvider.tsx
│
├── services/                     # API services
│   ├── auth.service.ts
│   ├── storage.service.ts
│   └── ...
│
├── config/                       # Configuration
│   └── index.ts
│
├── constants/                    # Constants (deprecated, use styles/)
│   ├── colors.ts
│   ├── strings.ts
│   └── theme.ts
│
└── utils/                        # Utility functions
    └── ...
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `DashboardLayout.tsx`)
- **Styles**: camelCase with extension (e.g., `commonStyles.ts`, `DashboardLayout.module.css`)
- **Services**: camelCase with .service suffix (e.g., `authService.ts`)
- **Utilities**: camelCase (e.g., `validation.ts`)
- **Stores**: camelCase with Slice suffix (e.g., `authSlice.ts`)

### Folders
- **Lowercase with hyphens**: `phone-login/`, `profile-setup/`
- **PascalCase for component folders**: `Button/`, `DashboardLayout/`

### Variables & Functions
- **camelCase**: `const userName = ...`, `function handleSubmit() {...}`
- **PascalCase for components**: `const UserProfile = () => {...}`
- **SCREAMING_SNAKE_CASE for constants**: `const API_BASE_URL = ...`

## Import Patterns

### Web App
```typescript
// Import theme and common styles
import { theme, commonStyles } from '@/styles';

// Import components
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/common/Button';

// Import store
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
```

### Mobile App
```typescript
// Import theme and common styles
import { COLORS, TYPOGRAPHY, SPACING, commonStyles } from '@/styles';

// Import components
import { Button } from '@/components/common/Button';

// Import store
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
```

## Best Practices

1. **Centralized Styling**: Always use theme tokens from `styles/theme.ts`
2. **Component Structure**: One component per file with its styles
3. **Reusability**: Create common components for repeated UI patterns
4. **Type Safety**: Use TypeScript for all new files
5. **Barrel Exports**: Use index.ts for cleaner imports
6. **Naming**: Follow conventions strictly for consistency
