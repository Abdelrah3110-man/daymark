import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app-store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME } from '@/constants/theme';

export default function RootLayout() {
  const isHydrated = useAppStore((s) => s.isHydrated);
  const settings = useAppStore((s) => s.settings);
  const initApp = useAppStore((s) => s.initApp);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inOnboarding = segments[0] === 'onboarding';
    const isUserOnboarded = Boolean(settings.isOnboarded && settings.displayName && settings.displayName.trim());

    if (!isUserOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isHydrated, settings.isOnboarded, settings.displayName, segments]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.text} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={settings.themePreference === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="daily/[date]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="focus/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="widgets"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

