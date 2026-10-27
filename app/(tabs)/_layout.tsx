import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingBottomTabBar } from '@/components/navigation/FloatingBottomTabBar';
import { THEME } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <FloatingBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: THEME.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="planner" options={{ title: 'Planner' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
    </Tabs>
  );
}
