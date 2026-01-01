import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform, View, Text } from 'react-native';
import Reanimated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/hooks/use-app-theme';
import PortalTutorial from '@/components/PortalTutorial';
import { Sidebar } from '@/components/Sidebar';
import { useAppSelector } from '@/store/hooks';
import { selectToken } from '@/store/slices/authSlice';
import { analyticsService } from '@/services/analytics.service';

const TabIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => {
  const scale = useSharedValue(focused ? 1.2 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 10,
      stiffness: 100,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Reanimated.View style={animatedStyle}>
        <Ionicons name={name} size={24} color={color} />
      </Reanimated.View>
      {focused && (
        <View style={{
          position: 'absolute',
          bottom: -10,
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
        }} />
      )}
    </View>
  );
};

export default function TabLayout() {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const pathname = usePathname();
  const token = useAppSelector(selectToken);
  const startTimeRef = useRef<number>(Date.now());
  const currentTabRef = useRef<string>('dashboard');

  useEffect(() => {
    // Extract tab name from pathname
    // e.g. "/(tabs)/music" -> "music", "/" -> "dashboard"
    let tabName = 'dashboard';

    if (pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/') {
      tabName = 'dashboard';
    } else {
      const parts = pathname.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart !== '(tabs)') {
        tabName = lastPart;
      }
    }

    // Capture previous session duration
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);

    // Track if valid duration (> 1s) and we have a token
    if (durationSeconds > 1 && token) {
      // Track the PREVIOUS tab
      const previousTab = currentTabRef.current;
      analyticsService.trackTabUsage(token, previousTab, durationSeconds).catch(err =>
        console.log('Failed to track usage:', err)
      );
    }

    // Reset timer and update current tab
    startTimeRef.current = Date.now();
    currentTabRef.current = tabName;

  }, [pathname, token]); // Re-run when pathname changes

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 8,
            elevation: 20,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: -2,
            letterSpacing: 0.2,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}>
        {/* Home/Dashboard - Main Hub (like web Dashboard) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? "apps" : "apps-outline"} color={color} focused={focused} />
            ),
          }}
        />

        {/* Music - Hidden from tab bar */}
        <Tabs.Screen
          name="music"
          options={{
            title: 'Music',
            href: null,
            tabBarIcon: ({ color, focused }) => <TabIcon name="musical-notes" color={color} focused={focused} />,
          }}
        />

        {/* Messages - Hidden from tab bar */}
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            href: null,
            tabBarIcon: ({ color, focused }) => <TabIcon name="chatbubbles" color={color} focused={focused} />,
          }}
        />

        {/* Money - Hidden from tab bar */}
        <Tabs.Screen
          name="money"
          options={{
            title: 'Money',
            href: null,
            tabBarIcon: ({ color, focused }) => <TabIcon name="wallet" color={color} focused={focused} />,
          }}
        />

        {/* News - Hidden from tab bar */}
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            href: null,
            tabBarIcon: ({ color, focused }) => <TabIcon name="newspaper" color={color} focused={focused} />,
          }}
        />

        {/* More - Hidden from tab bar */}
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            href: null,
            tabBarIcon: ({ color, focused }) => <TabIcon name="menu" color={color} focused={focused} />,
          }}
        />

        {/* Profile - User Account (like web header profile) */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      <Sidebar />
      <PortalTutorial />
    </>
  );
}
