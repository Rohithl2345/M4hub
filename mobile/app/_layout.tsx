import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReduxProvider } from '@/store/ReduxProvider';
import PortalTutorial from '@/components/PortalTutorial';
import BackendWarmer from '@/components/BackendWarmer';

import { useAppTheme } from '@/hooks/use-app-theme';

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {children}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <AppThemeProvider>
        <BackendWarmer />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/email-login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/email-verification" options={{ headerShown: false }} />
          <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </AppThemeProvider>
    </ReduxProvider>
  );
}
