import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/app-store';
import { useTaskStore } from '@/store/task-store';
import { usePlanningStore } from '@/store/planning-store';
import { getTodayKey, getWeekStartDate, getWeekDates, formatDayFull } from '@/utils/dates';
import { calculateWeeklyWorkload } from '@/utils/workload';
import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { TodayOverviewCard } from '@/components/home/TodayOverviewCard';
import { WeeklySummaryCard } from '@/components/home/WeeklySummaryCard';
import { QuickActionsRow } from '@/components/home/QuickActionsRow';
import { TaskEditor } from '@/components/tasks/TaskEditor';

export default function HomeScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const daysSinceLastActive = useAppStore((s) => s.daysSinceLastActive);
  const tasks = useTaskStore((s) => s.tasks);
  const dailyPlans = usePlanningStore((s) => s.dailyPlans);

  const [taskEditorVisible, setTaskEditorVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const todayKey = getTodayKey();
  const weekStart = getWeekStartDate(new Date(), settings.weekStartDay);
  const weekDates = getWeekDates(weekStart);

  const todayTasks = tasks.filter((t) => t.scheduledDate === todayKey);
  const todayPlan = dailyPlans.find((dp) => dp.date === todayKey);
  const weeklySummary = calculateWeeklyWorkload(weekDates, tasks, settings.dailyAvailabilityMinutes);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    if (hour >= 17) timeGreeting = 'Good evening';

    if (settings.displayName && settings.displayName.trim()) {
      return `${timeGreeting}, ${settings.displayName.trim()}`;
    }
    return timeGreeting;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.dateText}>{formatDayFull(todayKey)}</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={20} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.text} />
        }
      >
        {/* Return after inactivity flow */}
        {daysSinceLastActive >= 2 && (
          <View style={styles.welcomeBackCard}>
            <Ionicons name="sunny-outline" size={20} color={THEME.colors.lavenderDark} />
            <View style={styles.welcomeBackTextWrap}>
              <Text style={styles.welcomeBackTitle}>Welcome back</Text>
              <Text style={styles.welcomeBackSub}>
                Every day is a fresh opportunity. Focus on today's single highest priority.
              </Text>
            </View>
          </View>
        )}

        {/* Daily Challenge Card (Lavender) */}
        <DailyChallengeCard />

        {/* Today's Overview (Peach) */}
        <TodayOverviewCard
          todayTasks={todayTasks}
          dailyPlan={todayPlan}
          availabilityMinutes={settings.dailyAvailabilityMinutes}
        />

        {/* Quick Actions Grid (Asymmetric) */}
        <QuickActionsRow
          onAddTask={() => setTaskEditorVisible(true)}
          onOpenNotes={() => router.push('/notes')}
        />

        {/* Weekly Summary (Soft Pink) */}
        <WeeklySummaryCard weekStartDate={weekStart} summary={weeklySummary} />
      </ScrollView>

      {/* Task Editor Modal */}
      {taskEditorVisible && (
        <TaskEditor
          visible={taskEditorVisible}
          onClose={() => setTaskEditorVisible(false)}
          defaultDate={todayKey}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    ...THEME.typography.h2,
    color: THEME.colors.text,
  },
  dateText: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: 100, // Space for floating bottom bar
  },
  welcomeBackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.lavenderLight,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#D0C9FF',
  },
  welcomeBackTextWrap: {
    flex: 1,
  },
  welcomeBackTitle: {
    ...THEME.typography.bodyLg,
    fontWeight: '700',
    color: THEME.colors.lavenderDark,
  },
  welcomeBackSub: {
    ...THEME.typography.micro,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});

