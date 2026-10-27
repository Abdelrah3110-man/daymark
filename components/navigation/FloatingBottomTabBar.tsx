import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export interface CustomTabBarProps {
  state?: {
    index: number;
    routes: Array<{ key: string; name: string; params?: any }>;
  };
  descriptors?: {
    [key: string]: {
      options: {
        tabBarAccessibilityLabel?: string;
        title?: string;
      };
    };
  };
  navigation?: {
    emit?: (event: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate?: (name: string, params?: any) => void;
  };
}

export const FloatingBottomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  if (!state || !state.routes || state.routes.length === 0) {
    return null;
  }

  const getTabIcon = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'index':
        return isFocused ? 'home' : 'home-outline';
      case 'planner':
        return isFocused ? 'grid' : 'grid-outline';
      case 'goals':
        return isFocused ? 'flag' : 'flag-outline';
      case 'progress':
        return isFocused ? 'stats-chart' : 'stats-chart-outline';
      case 'notes':
        return isFocused ? 'document-text' : 'document-text-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getTabLabel = (routeName: string): string => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'planner':
        return 'Planner';
      case 'goals':
        return 'Goals';
      case 'progress':
        return 'Progress';
      case 'notes':
        return 'Notes';
      default:
        return routeName;
    }
  };

  return (
    <View style={[styles.outerContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: colors.navBackground,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.navBorder,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors ? descriptors[route.key] : undefined;
          const options = descriptor?.options || {};
          const isFocused = state.index === index;
          const iconName = getTabIcon(route.name, isFocused);
          const label = getTabLabel(route.name);

          const onPress = () => {
            if (!isFocused) {
              if (navigation && typeof navigation.navigate === 'function') {
                try {
                  navigation.navigate(route.name, route.params);
                  return;
                } catch {
                  // Fallback to Expo Router
                }
              }
              const targetPath = route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}`;
              router.navigate(targetPath as any);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              {isFocused ? (
                <View style={[styles.activeCircle, { backgroundColor: colors.navActiveCircle }]}>
                  <Ionicons name={iconName} size={22} color={colors.navActive} />
                </View>
              ) : (
                <Ionicons name={iconName} size={22} color={colors.navInactive} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  pillContainer: {
    flexDirection: 'row',
    borderRadius: 40,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
    maxWidth: 390,
    ...THEME.shadows.floating,
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
});


