import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ProductivityStats } from '@/utils/statistics';
import { formatDurationMinutes } from '@/utils/dates';

interface MetricsGridProps {
  stats: ProductivityStats;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {/* Completion Rate */}
      <View style={[styles.tile, { backgroundColor: colors.lightBlue }]}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: colors.lightBlueDark }]}>COMPLETION RATE</Text>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.lightBlueDark} />
        </View>
        <Text style={[styles.value, { color: colors.text }]}>{stats.completionRate}%</Text>
        <Text style={[styles.subtext, { color: colors.lightBlueDark }]}>
          {stats.completedTasks} of {stats.totalTasks} planned tasks
        </Text>
      </View>

      {/* On-Time Rate */}
      <View style={[styles.tile, { backgroundColor: colors.peach }]}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: colors.peachDark }]}>ON-TIME RATE</Text>
          <Ionicons name="time-outline" size={16} color={colors.peachDark} />
        </View>
        <Text style={[styles.value, { color: colors.text }]}>
          {stats.tasksWithDeadlinesCount > 0 ? `${stats.onTimeCompletionRate}%` : '—'}
        </Text>
        <Text style={[styles.subtext, { color: colors.peachDark }]}>
          {stats.tasksWithDeadlinesCount > 0
            ? `${stats.onTimeCompletedCount} of ${stats.tasksWithDeadlinesCount} met deadline`
            : 'No tasks with deadlines'}
        </Text>
      </View>

      {/* Focus Time */}
      <View style={[styles.tile, { backgroundColor: colors.lavender }]}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: colors.lavenderDark }]}>FOCUS SPRINT</Text>
          <Ionicons name="timer-outline" size={16} color={colors.lavenderDark} />
        </View>
        <Text style={[styles.value, { color: colors.text }]}>{formatDurationMinutes(stats.totalFocusMinutes)}</Text>
        <Text style={[styles.subtext, { color: colors.lavenderDark }]}>{stats.focusSessionsCount} completed sessions</Text>
      </View>

      {/* Consistency & Streaks */}
      <View style={[styles.tile, { backgroundColor: colors.softPink }]}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: colors.softPinkDark }]}>QUALIFYING STREAK</Text>
          <Ionicons name="flame-outline" size={16} color={colors.softPinkDark} />
        </View>
        <Text style={[styles.value, { color: colors.text }]}>{stats.currentStreakDays} days</Text>
        <Text style={[styles.subtext, { color: colors.softPinkDark }]}>Best record: {stats.longestStreakDays} days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  tile: {
    flex: 1,
    minWidth: '47%',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...THEME.shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  value: {
    ...THEME.typography.h2,
    color: THEME.colors.text,
    fontSize: 24,
  },
  subtext: {
    ...THEME.typography.micro,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
});

