import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/hooks/use-app-theme';
import PortalTutorial from '@/components/PortalTutorial';

import { StyleSheet } from 'react-native';
import { Sidebar } from '@/components/Sidebar';

export default function TabLayout() {
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#334155' : '#e2e8f0',
            height: 68,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
            letterSpacing: 0.3,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}>
        {/* Home/Dashboard - Main Hub (like web Dashboard) */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "apps" : "apps-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />

        {/* Music - Hidden from tab bar */}
        <Tabs.Screen
          name="music"
          options={{
            title: 'Music',
            href: null,
            tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} />,
          }}
        />

        {/* Messages - Hidden from tab bar */}
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            href: null,
            tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          }}
        />

        {/* Money - Hidden from tab bar */}
        <Tabs.Screen
          name="money"
          options={{
            title: 'Money',
            href: null,
            tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} />,
          }}
        />

        {/* News - Hidden from tab bar */}
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            href: null,
            tabBarIcon: ({ color }) => <Ionicons name="newspaper" size={24} color={color} />,
          }}
        />

        {/* More - Hidden from tab bar */}
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            href: null,
            tabBarIcon: ({ color }) => <Ionicons name="menu" size={24} color={color} />,
          }}
        />

        {/* Profile - User Account (like web header profile) */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <Sidebar />
      <PortalTutorial />
    </>
  );
}
