import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  accentColor = THEME.colors.lavender,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
        <Ionicons name={icon} size={28} color={THEME.colors.text} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.xxxl,
    paddingHorizontal: THEME.spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  title: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  description: {
    ...THEME.typography.body,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: THEME.spacing.lg,
    backgroundColor: THEME.colors.text,
    paddingVertical: THEME.spacing.sm + 2,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.pill,
  },
  actionText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textInverse,
  },
});
