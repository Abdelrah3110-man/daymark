import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WeeklyWorkloadSummary } from '@/utils/workload';
import { formatDurationMinutes, formatWeekRange } from '@/utils/dates';

interface WeeklySummaryCardProps {
  weekStartDate: string;
  summary: WeeklyWorkloadSummary;
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  weekStartDate,
  summary,
}) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name="calendar-outline" size={13} color={THEME.colors.softPinkDark} />
          <Text style={styles.badgeText}>WEEKLY OVERVIEW</Text>
        </View>
        <Text style={styles.rangeText}>{formatWeekRange(weekStartDate)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{summary.totalTasks}</Text>
          <Text style={styles.statLabel}>Tasks Planned</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{formatDurationMinutes(summary.totalMinutes)}</Text>
          <Text style={styles.statLabel}>Est. Workload</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCol}>
          <Text style={styles.statValue}>{summary.completedTasks}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {summary.overloadedDaysCount > 0 && (
        <View style={styles.alertBox}>
          <Ionicons name="alert-circle-outline" size={14} color={THEME.colors.danger} />
          <Text style={styles.alertText}>
            {summary.overloadedDaysCount} day(s) exceed configured availability.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => router.push('/planner')}
        activeOpacity={0.8}
      >
        <Text style={styles.actionBtnText}>Open Weekly Planner</Text>
        <Ionicons name="chevron-forward" size={14} color={THEME.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.softPink,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#F2ACDC',
    ...THEME.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.pill,
    gap: 4,
  },
  badgeText: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.softPinkDark,
  },
  rangeText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  statValue: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  statLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginTop: THEME.spacing.sm,
    gap: 6,
  },
  alertText: {
    ...THEME.typography.micro,
    color: THEME.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 9,
    borderRadius: THEME.borderRadius.pill,
    marginTop: THEME.spacing.md,
    gap: 4,
  },
  actionBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.text,
  },
});

