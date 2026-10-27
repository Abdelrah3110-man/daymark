import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME, useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/app-store';
import { useTaskStore } from '@/store/task-store';
import { usePlanningStore } from '@/store/planning-store';
import { getWeekDates, formatDurationMinutes } from '@/utils/dates';
import { calculateWeeklyWorkload } from '@/utils/workload';
import { validateWeeklyPlan } from '@/utils/planning';
import { WeekNavigationHeader } from '@/components/planner/WeekNavigationHeader';
import { WeekDaySummaryCard } from '@/components/planner/WeekDaySummaryCard';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { Task } from '@/types/app';

export default function PlannerScreen() {
  const { colors, isDark } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const activeWeekStart = useAppStore((s) => s.activeWeekStart);
  const setActiveWeekStart = useAppStore((s) => s.setActiveWeekStart);
  const tasks = useTaskStore((s) => s.tasks);
  const weeklyPlans = usePlanningStore((s) => s.weeklyPlans);
  const generateDailyPreviews = usePlanningStore((s) => s.generateDailyPreviews);

  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [targetDateForNewTask, setTargetDateForNewTask] = useState<string>(activeWeekStart);
  const [generationNotice, setGenerationNotice] = useState<string>('');

  const weekDates = getWeekDates(activeWeekStart);
  const weeklyPlan = weeklyPlans.find((wp) => wp.weekStartDate === activeWeekStart);
  const workloadSummary = calculateWeeklyWorkload(weekDates, tasks, settings.dailyAvailabilityMinutes);

  const handleAddTask = (dateKey: string) => {
    setSelectedTask(null);
    setTargetDateForNewTask(dateKey);
    setEditorVisible(true);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setTargetDateForNewTask(task.scheduledDate);
    setEditorVisible(true);
  };

  const handleGeneratePreviews = () => {
    const validation = validateWeeklyPlan(weekDates, tasks, settings.dailyAvailabilityMinutes);

    generateDailyPreviews(activeWeekStart, weekDates);
    setGenerationNotice('Daily previews successfully generated for all 7 days!');

    setTimeout(() => {
      setGenerationNotice('');
    }, 4000);
  };

  const isPrepared = weeklyPlan?.status === 'prepared';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Week Navigation Header */}
      <WeekNavigationHeader
        currentWeekStart={activeWeekStart}
        onWeekChange={(newWeek) => setActiveWeekStart(newWeek)}
      />

      {/* Plan Status & Generation Header Bar */}
      <View style={[styles.statusBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.statusCol}>
          <View style={styles.statusTagRow}>
            <View
              style={[
                styles.statusBadge,
                isPrepared
                  ? { backgroundColor: colors.mintLight }
                  : { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPrepared ? { color: colors.mintDark } : { color: colors.textMuted },
                ]}
              >
                {isPrepared ? 'PREVIEWS PREPARED' : 'WEEKLY DRAFT'}
              </Text>
            </View>
            <Text style={[styles.workloadOverviewText, { color: colors.textSecondary }]}>
              {workloadSummary.totalTasks} tasks • {formatDurationMinutes(workloadSummary.totalMinutes)} total
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.generateBtn,
            isPrepared
              ? { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border }
              : { backgroundColor: colors.text },
          ]}
          onPress={handleGeneratePreviews}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPrepared ? 'sync' : 'sparkles'}
            size={14}
            color={isPrepared ? colors.text : colors.textInverse}
          />
          <Text
            style={[
              styles.generateBtnText,
              { color: isPrepared ? colors.text : colors.textInverse },
            ]}
          >
            {isPrepared ? 'Regenerate' : 'Generate Previews'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generation success banner */}
      {generationNotice ? (
        <View style={styles.noticeBanner}>
          <Ionicons name="checkmark-circle" size={16} color={THEME.colors.success} />
          <Text style={styles.noticeText}>{generationNotice}</Text>
        </View>
      ) : null}

      {/* Overloaded days warning banner */}
      {workloadSummary.overloadedDaysCount > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={16} color={THEME.colors.danger} />
          <Text style={styles.warningBannerText}>
            Workload alert: {workloadSummary.overloadedDaysCount} day(s) exceed your {formatDurationMinutes(settings.dailyAvailabilityMinutes)} daily limit.
          </Text>
        </View>
      )}

      {/* 7 Days Overview List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {weekDates.map((dateKey) => {
          const dayTasks = tasks.filter((t) => t.scheduledDate === dateKey);
          const dayWorkload = workloadSummary.dayWorkloads[dateKey];

          return (
            <WeekDaySummaryCard
              key={dateKey}
              dateKey={dateKey}
              tasks={dayTasks}
              workload={dayWorkload}
              onAddTask={handleAddTask}
              onSelectTask={handleSelectTask}
            />
          );
        })}
      </ScrollView>

      {/* Task Editor Modal */}
      {editorVisible && (
        <TaskEditor
          visible={editorVisible}
          onClose={() => {
            setEditorVisible(false);
            setSelectedTask(null);
          }}
          taskToEdit={selectedTask}
          defaultDate={targetDateForNewTask}
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  statusCol: {
    flex: 1,
  },
  statusTagRow: {
    gap: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
  },
  statusDraft: {
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  statusPrepared: {
    backgroundColor: THEME.colors.mintLight,
  },
  statusBadgeText: {
    ...THEME.typography.micro,
    fontWeight: '800',
  },
  textDraft: {
    color: THEME.colors.textMuted,
  },
  textPrepared: {
    color: THEME.colors.mintDark,
  },
  workloadOverviewText: {
    ...THEME.typography.micro,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.pill,
    gap: 6,
    ...THEME.shadows.subtle,
  },
  regenerateBtn: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  generateBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  regenerateBtnText: {
    color: THEME.colors.text,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.mintLight,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    gap: 8,
  },
  noticeText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.mintDark,
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    gap: 8,
  },
  warningBannerText: {
    ...THEME.typography.micro,
    fontWeight: '600',
    color: THEME.colors.danger,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: 110,
  },
});

