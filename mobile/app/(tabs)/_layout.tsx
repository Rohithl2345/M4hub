import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PortalTutorial from '@/components/PortalTutorial';

import { TouchableOpacity, View } from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { Sidebar } from '@/components/Sidebar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="hub"
          options={{
            title: 'M4 Hub',
            tabBarIcon: ({ color }) => (
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#6366f1',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                elevation: 10,
                shadowColor: '#6366f1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8
              }}>
                <Ionicons name="grid" size={26} color="white" />
              </View>
            ),
            tabBarButton: (props) => {
              const { delayLongPress, ...otherProps } = props as any;
              return (
                <TouchableOpacity
                  {...otherProps}
                  onPress={() => dispatch(setSidebarOpen(true))}
                  activeOpacity={0.8}
                />
              );
            }
          }}
        />
        <Tabs.Screen
          name="music"
          options={{
            title: 'Music',
            href: null, // Hide from bottom bar
            tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            href: null, // Hide from bottom bar
            tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="money"
          options={{
            title: 'Money',
            href: null, // Hide from bottom bar
            tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            href: null, // Hide from bottom bar
            tabBarIcon: ({ color }) => <Ionicons name="newspaper" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={24} color={color} />,
          }}
        />
      </Tabs>
      <Sidebar />
      <PortalTutorial />
    </>
  );
}
