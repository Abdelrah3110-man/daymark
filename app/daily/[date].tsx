import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/task-store';
import { usePlanningStore } from '@/store/planning-store';
import { useAppStore } from '@/store/app-store';
import { formatWeekdayFull, formatDayFull, formatDurationMinutes, getTodayKey } from '@/utils/dates';
import { calculateDayWorkload } from '@/utils/workload';
import { getEffectiveTask, detectPlanningConflicts } from '@/utils/planning';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { PlanConflictDialog } from '@/components/planner/PlanConflictDialog';
import { Task, PlanningConflict } from '@/types/app';

export default function DailyPreviewScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const dateKey = (Array.isArray(date) ? date[0] : date) || getTodayKey();

  const settings = useAppStore((s) => s.settings);
  const tasks = useTaskStore((s) => s.tasks);
  const reorderTasks = useTaskStore((s) => s.reorderTasksForDay);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const dailyPlans = usePlanningStore((s) => s.dailyPlans);
  const dailyOverrides = usePlanningStore((s) => s.dailyOverrides);
  const customizeDailyTask = usePlanningStore((s) => s.customizeDailyTask);
  const resolveConflict = usePlanningStore((s) => s.resolveConflict);

  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeConflict, setActiveConflict] = useState<PlanningConflict | null>(null);

  const dailyPlan = dailyPlans.find((dp) => dp.date === dateKey);
  const dailyPlanId = dailyPlan?.id || `dp_${dateKey}`;

  // Find all tasks planned for this day
  const rawDayTasks = tasks.filter((t) => t.scheduledDate === dateKey);

  // Apply daily overrides to get effective tasks
  const effectiveDayTasks = rawDayTasks
    .map((task) => {
      const override = dailyOverrides.find(
        (o) => o.dailyPlanId === dailyPlanId && o.taskId === task.id
      );
      return getEffectiveTask(task, override);
    })
    .filter((t) => t.status !== 'cancelled' && t.scheduledDate === dateKey)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const workload = calculateDayWorkload(dateKey, effectiveDayTasks, settings.dailyAvailabilityMinutes);
  const priorities = effectiveDayTasks.filter((t) => t.isDailyPriority);
  const standardTasks = effectiveDayTasks.filter((t) => !t.isDailyPriority);

  const conflicts = detectPlanningConflicts(tasks, dailyPlans, dailyOverrides).filter(
    (c) => c.dailyPlanDate === dateKey
  );

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const reordered = [...effectiveDayTasks];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    reorderTasks(dateKey, reordered.map((t) => t.id));
  };

  const handleMoveDown = (index: number) => {
    if (index >= effectiveDayTasks.length - 1) return;
    const reordered = [...effectiveDayTasks];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    reorderTasks(dateKey, reordered.map((t) => t.id));
  };

  const handleQuickPostpone = (task: Task) => {
    const nextDay = new Date(task.scheduledDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDateStr = nextDay.toISOString().split('T')[0];

    postponeTask(task.id, nextDateStr, 'Postponed to tomorrow from daily view');
  };

  const isCustomized = Boolean(dailyPlan?.isCustomized);
  const isConflict = conflicts.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text style={styles.weekdayText}>{formatWeekdayFull(dateKey)}</Text>
          <Text style={styles.dateSubtext}>{formatDayFull(dateKey)}</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setSelectedTask(null);
            setEditorVisible(true);
          }}
        >
          <Ionicons name="add" size={22} color={THEME.colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Sync Status Badge */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.syncPill,
            isConflict
              ? styles.syncPillConflict
              : isCustomized
              ? styles.syncPillCustom
              : styles.syncPillSynced,
          ]}
        >
          <Ionicons
            name={
              isConflict
                ? 'alert-circle'
                : isCustomized
                ? 'brush'
                : 'checkmark-circle'
            }
            size={13}
            color={
              isConflict
                ? THEME.colors.danger
                : isCustomized
                ? THEME.colors.peachDark
                : THEME.colors.mintDark
            }
          />
          <Text
            style={[
              styles.syncPillText,
              isConflict
                ? styles.textDanger
                : isCustomized
                ? styles.textPeach
                : styles.textMint,
            ]}
          >
            {isConflict
              ? 'CONFLICT WITH WEEKLY PLAN'
              : isCustomized
              ? 'DAILY CUSTOMIZATION ACTIVE'
              : 'SYNCED WITH WEEKLY PLAN'}
          </Text>
        </View>

        {isConflict && (
          <TouchableOpacity
            style={styles.reviewDiffBtn}
            onPress={() => setActiveConflict(conflicts[0])}
          >
            <Text style={styles.reviewDiffText}>Review Differences</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Workload Banner */}
      <View style={styles.workloadBanner}>
        <View style={styles.workloadLeft}>
          <Text style={styles.workloadHeading}>DAY WORKLOAD</Text>
          <Text style={styles.workloadValue}>
            {formatDurationMinutes(workload.totalMinutes)}{' '}
            <Text style={styles.workloadLimit}>
              / {formatDurationMinutes(workload.availabilityMinutes)}
            </Text>
          </Text>
        </View>

        <View style={styles.workloadRight}>
          <Text style={styles.workloadTasksCount}>
            {effectiveDayTasks.filter((t) => t.status === 'completed').length}/
            {effectiveDayTasks.length} Completed
          </Text>
        </View>
      </View>

      {workload.isOverloaded && (
        <View style={styles.overloadNotice}>
          <Ionicons name="warning-outline" size={16} color={THEME.colors.danger} />
          <Text style={styles.overloadText}>
            Workload exceeds daily availability by {formatDurationMinutes(workload.totalMinutes - workload.availabilityMinutes)}. Consider rescheduling lower priority tasks.
          </Text>
        </View>
      )}

      {/* Content Scroll */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Top Priorities Section */}
        {priorities.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={14} color="#D97706" />
              <Text style={styles.sectionTitle}>CORE PRIORITIES ({priorities.length}/3)</Text>
            </View>

            {priorities.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => {
                  setSelectedTask(task);
                  setEditorVisible(true);
                }}
              />
            ))}
          </View>
        )}

        {/* Planned Tasks */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={14} color={THEME.colors.textMuted} />
            <Text style={styles.sectionTitle}>ALL PLANNED TASKS ({effectiveDayTasks.length})</Text>
          </View>

          {effectiveDayTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={36} color={THEME.colors.lavenderDark} />
              <Text style={styles.emptyTitle}>No tasks for today</Text>
              <Text style={styles.emptySub}>Tap the + button above to schedule a task directly.</Text>
            </View>
          ) : (
            effectiveDayTasks.map((task, index) => (
              <View key={task.id} style={styles.taskWithActions}>
                <View style={styles.taskCardFlex}>
                  <TaskCard
                    task={task}
                    onPress={() => {
                      setSelectedTask(task);
                      setEditorVisible(true);
                    }}
                  />
                </View>

                {/* Quick execution action buttons */}
                <View style={styles.itemActionsRow}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleMoveUp(index)}
                    disabled={index === 0}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={14}
                      color={index === 0 ? THEME.colors.border : THEME.colors.text}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleMoveDown(index)}
                    disabled={index === effectiveDayTasks.length - 1}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={14}
                      color={
                        index === effectiveDayTasks.length - 1
                          ? THEME.colors.border
                          : THEME.colors.text
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleQuickPostpone(task)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="return-down-forward" size={14} color={THEME.colors.warning} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.focusActionBtn}
                    onPress={() => router.push(`/focus/${task.id}` as any)}
                  >
                    <Ionicons name="timer-outline" size={12} color={THEME.colors.lavenderDark} />
                    <Text style={styles.focusActionText}>Focus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Conflict Resolution Modal */}
      <PlanConflictDialog
        visible={Boolean(activeConflict)}
        conflict={activeConflict}
        onApplyWeekly={() => {
          if (activeConflict) {
            resolveConflict(dailyPlanId, activeConflict.taskId, 'apply_weekly');
            setActiveConflict(null);
          }
        }}
        onKeepDaily={() => {
          if (activeConflict) {
            resolveConflict(dailyPlanId, activeConflict.taskId, 'keep_daily');
            setActiveConflict(null);
          }
        }}
        onDismiss={() => setActiveConflict(null)}
      />

      {/* Task Editor Modal */}
      {editorVisible && (
        <TaskEditor
          visible={editorVisible}
          onClose={() => {
            setEditorVisible(false);
            setSelectedTask(null);
          }}
          taskToEdit={selectedTask}
          defaultDate={dateKey}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    marginRight: THEME.spacing.sm,
    padding: 2,
  },
  titleWrap: {
    flex: 1,
  },
  weekdayText: {
    ...THEME.typography.h2,
    color: THEME.colors.text,
  },
  dateSubtext: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.pill,
    gap: 5,
  },
  syncPillSynced: {
    backgroundColor: THEME.colors.mintLight,
  },
  syncPillCustom: {
    backgroundColor: THEME.colors.peachLight,
  },
  syncPillConflict: {
    backgroundColor: THEME.colors.dangerLight,
  },
  syncPillText: {
    ...THEME.typography.micro,
    fontWeight: '800',
  },
  textMint: {
    color: THEME.colors.mintDark,
  },
  textPeach: {
    color: THEME.colors.peachDark,
  },
  textDanger: {
    color: THEME.colors.danger,
  },
  reviewDiffBtn: {
    backgroundColor: THEME.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.pill,
  },
  reviewDiffText: {
    ...THEME.typography.micro,
    color: THEME.colors.textInverse,
    fontWeight: '700',
  },
  workloadBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  workloadLeft: {},
  workloadHeading: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  workloadValue: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
    marginTop: 1,
  },
  workloadLimit: {
    ...THEME.typography.caption,
    fontWeight: '400',
    color: THEME.colors.textMuted,
  },
  workloadRight: {},
  workloadTasksCount: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  overloadNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    marginHorizontal: THEME.spacing.lg,
    marginTop: 6,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    gap: 6,
  },
  overloadText: {
    ...THEME.typography.micro,
    color: THEME.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: 40,
  },
  sectionWrap: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
    marginTop: THEME.spacing.sm,
  },
  emptySub: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  taskWithActions: {
    marginBottom: THEME.spacing.xs,
  },
  taskCardFlex: {
    flex: 1,
  },
  itemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.lavenderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.pill,
    gap: 3,
  },
  focusActionText: {
    ...THEME.typography.micro,
    color: THEME.colors.lavenderDark,
    fontWeight: '700',
  },
});

