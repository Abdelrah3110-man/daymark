import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { PlanningConflict } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';

interface PlanConflictDialogProps {
  visible: boolean;
  conflict: PlanningConflict | null;
  onApplyWeekly: () => void;
  onKeepDaily: () => void;
  onDismiss: () => void;
}

export const PlanConflictDialog: React.FC<PlanConflictDialogProps> = ({
  visible,
  conflict,
  onApplyWeekly,
  onKeepDaily,
  onDismiss,
}) => {
  if (!conflict) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="git-branch-outline" size={20} color={THEME.colors.peachDark} />
            </View>
            <Text style={styles.title}>Planning Difference</Text>
          </View>

          <Text style={styles.message}>
            Task <Text style={{ fontWeight: '700' }}>"{conflict.taskTitle}"</Text> was customized in
            the daily preview for {conflict.dailyPlanDate}, but differs from the weekly plan.
          </Text>

          <View style={styles.diffBox}>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Field:</Text>
              <Text style={styles.diffValue}>{conflict.fieldName}</Text>
            </View>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Weekly Plan:</Text>
              <Text style={styles.diffValueHighlight}>{String(conflict.weeklyValue || 'None')}</Text>
            </View>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Daily Custom:</Text>
              <Text style={styles.diffValueHighlight}>{String(conflict.dailyValue || 'None')}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onKeepDaily}>
              <Text style={styles.btnSecondaryText}>Keep Daily Customization</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={onApplyWeekly}>
              <Text style={styles.btnPrimaryText}>Apply Weekly Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 19, 28, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    gap: THEME.spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.peachLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  message: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 20,
  },
  diffBox: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    gap: 6,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diffLabel: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
  },
  diffValue: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  diffValueHighlight: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.lavenderDark,
  },
  actions: {
    gap: THEME.spacing.sm,
  },
  btnPrimary: {
    backgroundColor: THEME.colors.text,
    paddingVertical: THEME.spacing.sm + 2,
    borderRadius: THEME.borderRadius.pill,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  btnSecondary: {
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingVertical: THEME.spacing.sm + 2,
    borderRadius: THEME.borderRadius.pill,
    alignItems: 'center',
  },
  btnSecondaryText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.text,
  },
});

