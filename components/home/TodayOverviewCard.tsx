import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task, DailyPlan } from '@/types/app';
import { getTodayKey, formatWeekdayFull, formatDayShort, formatDurationMinutes } from '@/utils/dates';
import { useTaskStore } from '@/store/task-store';

interface TodayOverviewCardProps {
  todayTasks: Task[];
  dailyPlan?: DailyPlan;
  availabilityMinutes: number;
}

export const TodayOverviewCard: React.FC<TodayOverviewCardProps> = ({
  todayTasks,
  dailyPlan,
  availabilityMinutes,
}) => {
  const router = useRouter();
  const todayKey = getTodayKey();
  const completeTask = useTaskStore((s) => s.completeTask);
  const reopenTask = useTaskStore((s) => s.reopenTask);

  const activeTasks = todayTasks.filter((t) => t.status !== 'cancelled');
  const completedTasks = activeTasks.filter((t) => t.status === 'completed');
  const totalMinutes = activeTasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);
  const priorities = activeTasks.filter((t) => t.isDailyPriority);

  const isOverloaded = totalMinutes > availabilityMinutes;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.sectionTag}>TODAY'S EXECUTION</Text>
          <Text style={styles.dateTitle}>{formatWeekdayFull(todayKey)}</Text>
          <Text style={styles.dateSubtitle}>{formatDayShort(todayKey)}</Text>
        </View>

        <TouchableOpacity
          style={styles.openBtn}
          onPress={() => router.push(`/daily/${todayKey}` as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.openBtnText}>Open Day</Text>
          <Ionicons name="arrow-forward" size={14} color={THEME.colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Progress & Workload Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{completedTasks.length}/{activeTasks.length}</Text>
          <Text style={styles.statLabel}>Tasks Done</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statNum, isOverloaded && styles.overloadNum]}>
            {formatDurationMinutes(totalMinutes)}
          </Text>
          <Text style={styles.statLabel}>
            {isOverloaded ? 'Overloaded' : `of ${formatDurationMinutes(availabilityMinutes)}`}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNum}>{priorities.length}</Text>
          <Text style={styles.statLabel}>Priorities</Text>
        </View>
      </View>

      {/* Top Priorities preview */}
      {priorities.length > 0 && (
        <View style={styles.prioritiesSection}>
          <Text style={styles.prioritiesHeading}>PRIMARY PRIORITIES</Text>
          {priorities.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.priorityItem}
                onPress={() => (isDone ? reopenTask(task.id) : completeTask(task.id))}
                activeOpacity={0.7}
              >
                <View style={[styles.priorityCheckbox, isDone && styles.priorityCheckboxChecked]}>
                  {isDone && <Ionicons name="checkmark" size={13} color={THEME.colors.textInverse} />}
                </View>
                <Text style={[styles.priorityTitle, isDone && styles.priorityTitleDone]} numberOfLines={1}>
                  {task.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {activeTasks.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No tasks planned for today yet.</Text>
          <TouchableOpacity
            style={styles.planWeekLink}
            onPress={() => router.push('/planner')}
          >
            <Text style={styles.planWeekLinkText}>Open Weekly Planner →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.peach,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#F0B775',
    ...THEME.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  sectionTag: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.peachDark,
    letterSpacing: 0.5,
  },
  dateTitle: {
    ...THEME.typography.h2,
    color: THEME.colors.text,
    marginTop: 2,
  },
  dateSubtitle: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.pill,
    gap: 4,
  },
  openBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm + 2,
    marginBottom: THEME.spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  overloadNum: {
    color: THEME.colors.danger,
  },
  statLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  prioritiesSection: {
    marginTop: THEME.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
  },
  prioritiesHeading: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.peachDark,
    marginBottom: 6,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priorityCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: THEME.colors.text,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  priorityCheckboxChecked: {
    backgroundColor: THEME.colors.text,
  },
  priorityTitle: {
    ...THEME.typography.bodySm,
    fontWeight: '600',
    color: THEME.colors.text,
    flex: 1,
  },
  priorityTitleDone: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  emptyText: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  planWeekLink: {
    paddingVertical: 2,
  },
  planWeekLinkText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.text,
  },
});

