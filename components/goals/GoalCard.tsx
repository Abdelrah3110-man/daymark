import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Goal } from '@/types/app';
import { Ionicons } from '@expo/vector-icons';
import { useGoalStore } from '@/store/goal-store';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const toggleMilestone = useGoalStore((s) => s.toggleMilestone);

  const totalMilestones = goal.milestones.length;
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const progressPct =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{goal.category}</Text>
            </View>
            {goal.targetDate && (
              <View style={styles.dateBadge}>
                <Ionicons name="calendar-outline" size={11} color={THEME.colors.textMuted} />
                <Text style={styles.dateText}>{goal.targetDate}</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{goal.title}</Text>
          {goal.description ? <Text style={styles.description}>{goal.description}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(goal)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {totalMilestones > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Milestones</Text>
            <Text style={styles.progressValue}>
              {completedMilestones}/{totalMilestones} ({progressPct}%)
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>

          {/* Milestones checklist */}
          <View style={styles.milestonesList}>
            {goal.milestones.map((ms) => (
              <TouchableOpacity
                key={ms.id}
                style={styles.milestoneRow}
                onPress={() => toggleMilestone(goal.id, ms.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, ms.completed && styles.checkboxChecked]}>
                  {ms.completed && <Ionicons name="checkmark" size={13} color={THEME.colors.textInverse} />}
                </View>
                <Text style={[styles.milestoneTitle, ms.completed && styles.milestoneDone]} numberOfLines={1}>
                  {ms.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: THEME.colors.lavenderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
  },
  categoryText: {
    ...THEME.typography.micro,
    color: THEME.colors.lavenderDark,
    fontWeight: '700',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateText: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
  },
  title: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  description: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: 4,
  },
  progressWrap: {
    marginTop: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  progressValue: {
    ...THEME.typography.micro,
    color: THEME.colors.text,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: THEME.spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: THEME.colors.lavenderDark,
    borderRadius: 3,
  },
  milestonesList: {
    marginTop: 4,
    gap: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: THEME.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: THEME.colors.text,
    borderColor: THEME.colors.text,
  },
  milestoneTitle: {
    ...THEME.typography.bodySm,
    color: THEME.colors.text,
    flex: 1,
  },
  milestoneDone: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted,
  },
});

