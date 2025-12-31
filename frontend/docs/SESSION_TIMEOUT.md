# Session Timeout Feature

## Overview
The M4Hub web application now includes a premium session timeout feature that automatically logs users out after a period of inactivity, with a beautiful warning dialog before the session expires.

## Features

### 🎨 Premium Design
- **Stunning gradient background** with purple/violet theme
- **Animated floating elements** for visual appeal
- **Smooth transitions** and micro-animations
- **Glassmorphism effects** for modern UI
- **Responsive countdown timer** with progress bar
- **Color-coded urgency** (green → orange → red as time runs out)

### 🔒 Security
- Automatic logout after 30 minutes of inactivity
- 2-minute warning before session expires
- Activity tracking (mouse, keyboard, scroll, touch)
- Secure token cleanup on logout

### ⚡ User Experience
- **Real-time countdown** showing remaining time
- **Two action buttons**:
  - "Continue Session" - Extends the session
  - "Logout Now" - Immediately logs out
- **Auto-logout** if user doesn't respond
- **Activity detection** automatically resets the timer

## Configuration

### Default Settings
```typescript
{
  timeoutDuration: 30 * 60 * 1000,  // 30 minutes total session
  warningDuration: 2 * 60 * 1000,   // 2 minutes warning
  enabled: true
}
```

### Customization
You can customize the timeout settings in `DashboardLayout.tsx`:

```typescript
const {
  showWarning,
  remainingTime,
  extendSession,
  handleLogout: handleSessionTimeout,
} = useSessionTimeout({
  timeoutDuration: 30 * 60 * 1000,  // Change this for different timeout
  warningDuration: 2 * 60 * 1000,   // Change this for different warning time
  onTimeout: handleLogout,
  enabled: true,
});
```

## How It Works

### 1. Activity Tracking
The system monitors these user activities:
- Mouse clicks and movements
- Keyboard input
- Scrolling
- Touch events

### 2. Timer Flow
```
User Activity → Reset Timer (28 min) → Show Warning (2 min) → Auto Logout
                     ↑                                              ↓
                     └──────── User Clicks "Continue" ──────────────┘
```

### 3. Warning Dialog
When 2 minutes remain:
- Beautiful modal appears
- Countdown timer starts
- Progress bar shows remaining time
- User can extend or logout

### 4. Auto Logout
If user doesn't respond:
- Session ends automatically
- Tokens are cleared
- Redirected to login page with reason

## Components

### SessionTimeoutDialog
Located: `src/components/SessionTimeoutDialog.tsx`

Premium dialog component with:
- Animated background elements
- Real-time countdown display
- Progress bar with color transitions
- Action buttons with hover effects

### useSessionTimeout Hook
Located: `src/hooks/useSessionTimeout.ts`

Custom hook that manages:
- Timer state and logic
- Activity detection
- Warning triggers
- Logout handling

## Integration

The feature is automatically integrated into `DashboardLayout.tsx`, so all pages using this layout get session timeout protection:
- Dashboard
- Music
- Messages
- Money
- News
- Profile

## Visual Design

### Color Scheme
- **Primary Gradient**: Purple to Violet (`#667eea` → `#764ba2`)
- **Urgency Colors**:
  - Safe (>60s): Indigo `#6366f1`
  - Warning (30-60s): Orange `#f59e0b`
  - Critical (<30s): Red `#ef4444`

### Animations
- **Pulse Effect**: Breathing animation on background circles
- **Float Effect**: Gentle up-down motion on icon
- **Glow Effect**: Pulsing glow on icon container
- **Progress Bar**: Smooth color transitions based on urgency

## Testing

To test the session timeout feature:

1. **Quick Test** (modify timeout for testing):
   ```typescript
   timeoutDuration: 2 * 60 * 1000,  // 2 minutes
   warningDuration: 30 * 1000,      // 30 seconds warning
   ```

2. **Test Scenarios**:
   - Stay inactive for the timeout period
   - Click "Continue Session" when warning appears
   - Click "Logout Now" when warning appears
   - Let the timer run out without action
   - Perform activity during countdown (should NOT reset)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

## Security Notes

- Tokens are cleared from localStorage on logout
- Session state is managed client-side
- Warning threshold prevents abrupt logouts
- Activity tracking is debounced for performance

## Future Enhancements

Potential improvements:
- Server-side session validation
- Configurable timeout per user role
- Remember user preference for timeout duration
- Sound notification option
- Multiple device session management
