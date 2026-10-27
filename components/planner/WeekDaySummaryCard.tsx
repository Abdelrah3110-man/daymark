import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task, DayWorkloadSummary } from '@/types/app';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatWeekdayFull, formatDayShort, getTodayKey, formatDurationMinutes } from '@/utils/dates';
import { useRouter } from 'expo-router';

interface WeekDaySummaryCardProps {
  dateKey: string;
  tasks: Task[];
  workload: DayWorkloadSummary;
  onAddTask: (date: string) => void;
  onSelectTask: (task: Task) => void;
}

export const WeekDaySummaryCard: React.FC<WeekDaySummaryCardProps> = ({
  dateKey,
  tasks,
  workload,
  onAddTask,
  onSelectTask,
}) => {
  const router = useRouter();
  const isToday = dateKey === getTodayKey();
  const activeTasks = tasks.filter((t) => t.status !== 'cancelled');
  const completedCount = activeTasks.filter((t) => t.status === 'completed').length;

  const workloadPct = Math.min(
    100,
    Math.round((workload.totalMinutes / (workload.availabilityMinutes || 480)) * 100)
  );

  const getMeterColor = () => {
    if (workload.isOverloaded) return THEME.colors.danger;
    if (workloadPct > 75) return THEME.colors.peachDark;
    return THEME.colors.mintDark;
  };

  return (
    <View style={[styles.card, isToday && styles.cardToday]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.dateCol}>
          <View style={styles.titleRow}>
            <Text style={styles.weekdayText}>{formatWeekdayFull(dateKey)}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateText}>{formatDayShort(dateKey)}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddTask(dateKey)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Add task to ${dateKey}`}
          >
            <Ionicons name="add" size={18} color={THEME.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.openDayBtn}
            onPress={() => router.push(`/daily/${dateKey}` as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.openDayText}>Daily View</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Workload Meter */}
      <View style={styles.workloadWrap}>
        <View style={styles.workloadStatsRow}>
          <Text style={styles.workloadLabel}>
            Workload: <Text style={styles.workloadVal}>{formatDurationMinutes(workload.totalMinutes)}</Text>
            {' '}/ {formatDurationMinutes(workload.availabilityMinutes)}
          </Text>
          <Text style={styles.taskCountLabel}>
            {completedCount}/{activeTasks.length} Done
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${workloadPct}%`, backgroundColor: getMeterColor() },
            ]}
          />
        </View>
      </View>

      {/* Warnings if overloaded or conflicts */}
      {workload.isOverloaded && (
        <View style={styles.warningPill}>
          <Ionicons name="warning-outline" size={13} color={THEME.colors.danger} />
          <Text style={styles.warningText}>
            Overloaded day! Exceeds available time by {formatDurationMinutes(workload.totalMinutes - workload.availabilityMinutes)}.
          </Text>
        </View>
      )}

      {workload.conflictCount > 0 && (
        <View style={[styles.warningPill, styles.conflictPill]}>
          <Ionicons name="time-outline" size={13} color={THEME.colors.peachDark} />
          <Text style={[styles.warningText, { color: THEME.colors.peachDark }]}>
            {workload.conflictCount} scheduling conflict(s) detected.
          </Text>
        </View>
      )}

      {/* Tasks Preview List */}
      <View style={styles.taskList}>
        {activeTasks.length === 0 ? (
          <Text style={styles.emptyTasksText}>No tasks planned yet. Tap + to add.</Text>
        ) : (
          activeTasks.slice(0, 4).map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => onSelectTask(task)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.miniDot,
                  task.status === 'completed' && styles.miniDotCompleted,
                ]}
              />
              <Text
                style={[
                  styles.taskTitle,
                  task.status === 'completed' && styles.taskTitleCompleted,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.isDailyPriority && (
                <Ionicons name="star" size={11} color="#D97706" style={{ marginRight: 4 }} />
              )}
              {task.scheduledTime ? (
                <Text style={styles.taskTime}>{task.scheduledTime}</Text>
              ) : null}
            </TouchableOpacity>
          ))
        )}

        {activeTasks.length > 4 && (
          <TouchableOpacity
            onPress={() => router.push(`/daily/${dateKey}` as any)}
            style={styles.moreTasksBtn}
          >
            <Text style={styles.moreTasksText}>+ {activeTasks.length - 4} more tasks</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  cardToday: {
    borderColor: THEME.colors.lavenderDark,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.xs,
  },
  dateCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekdayText: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  todayBadge: {
    backgroundColor: THEME.colors.lavenderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
  },
  todayText: {
    ...THEME.typography.micro,
    color: THEME.colors.lavenderDark,
    fontWeight: '800',
  },
  dateText: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    gap: 3,
  },
  openDayText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  workloadWrap: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  workloadStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workloadLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
  },
  workloadVal: {
    fontWeight: '700',
    color: THEME.colors.text,
  },
  taskCountLabel: {
    ...THEME.typography.micro,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  track: {
    height: 5,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.xs,
    marginTop: 6,
    gap: 6,
  },
  conflictPill: {
    backgroundColor: THEME.colors.peachLight,
  },
  warningText: {
    ...THEME.typography.micro,
    color: THEME.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  taskList: {
    marginTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingTop: THEME.spacing.xs,
  },
  emptyTasksText: {
    ...THEME.typography.caption,
    color: THEME.colors.textLight,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.lavenderDark,
    marginRight: 8,
  },
  miniDotCompleted: {
    backgroundColor: THEME.colors.textLight,
  },
  taskTitle: {
    ...THEME.typography.bodySm,
    color: THEME.colors.text,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted,
  },
  taskTime: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
  },
  moreTasksBtn: {
    paddingTop: 4,
  },
  moreTasksText: {
    ...THEME.typography.micro,
    color: THEME.colors.lavenderDark,
    fontWeight: '600',
  },
});

