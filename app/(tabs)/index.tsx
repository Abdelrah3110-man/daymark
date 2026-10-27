import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/app-store';
import { useTaskStore } from '@/store/task-store';
import { usePlanningStore } from '@/store/planning-store';
import { getTodayKey, getWeekStartDate, getWeekDates, formatDayShort } from '@/utils/dates';
import { calculateWeeklyWorkload } from '@/utils/workload';
import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { WeeklyDayPicker } from '@/components/home/WeeklyDayPicker';
import { YourPlanBentoGrid } from '@/components/home/YourPlanBentoGrid';
import { WeeklySummaryCard } from '@/components/home/WeeklySummaryCard';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { getAvatarById } from '@/constants/avatars';

export default function HomeScreen() {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const daysSinceLastActive = useAppStore((s) => s.daysSinceLastActive);
  const tasks = useTaskStore((s) => s.tasks);

  const todayKey = getTodayKey();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [taskEditorVisible, setTaskEditorVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const weekStart = getWeekStartDate(new Date(), settings.weekStartDay);
  const weekDates = getWeekDates(weekStart);

  const selectedDateTasks = tasks.filter((t) => t.scheduledDate === selectedDate);
  const weeklySummary = calculateWeeklyWorkload(weekDates, tasks, settings.dailyAvailabilityMinutes);

  // Task counts map for the weekly day picker dots
  const taskCountsByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.scheduledDate && t.status !== 'cancelled') {
      taskCountsByDate[t.scheduledDate] = (taskCountsByDate[t.scheduledDate] || 0) + 1;
    }
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  };

  const currentAvatar = getAvatarById(settings.avatarId);
  const displayName = settings.displayName && settings.displayName.trim()
    ? settings.displayName.trim()
    : 'Planner';

  const todayDisplay = `Today ${formatDayShort(todayKey)}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header matching reference layout */}
      <View style={styles.header}>
        <View style={styles.headerProfileRow}>
          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: currentAvatar.bgColor }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
            accessibilityLabel="Profile settings"
          >
            <Text style={styles.avatarEmojiText}>{currentAvatar.emoji}</Text>
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.greetingText}>Hello, {displayName}</Text>
            <Text style={styles.dateText}>{todayDisplay}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('/notes')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Search notes and tasks"
        >
          <Ionicons name="search-outline" size={20} color="#12131C" />
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
        {/* Welcome back alert after 2+ inactive days */}
        {daysSinceLastActive >= 2 && (
          <View style={styles.welcomeBackCard}>
            <Ionicons name="sunny-outline" size={20} color={THEME.colors.lavenderDark} />
            <View style={styles.welcomeBackTextWrap}>
              <Text style={styles.welcomeBackTitle}>Welcome back</Text>
              <Text style={styles.welcomeBackSub}>
                Every day is a fresh opportunity. Focus on today's highest priority.
              </Text>
            </View>
          </View>
        )}

        {/* 1. Daily Challenge Hero Banner (Lavender with 3D Composition) */}
        <DailyChallengeCard />

        {/* 2. Horizontal Calendar Strip (Weekly Day Picker with Pill Caps) */}
        <WeeklyDayPicker
          dates={weekDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          taskCountsByDate={taskCountsByDate}
        />

        {/* 3. Your Plan Bento Grid (Tall Peach, Sky Blue & Pink action hub) */}
        <YourPlanBentoGrid
          selectedDate={selectedDate}
          tasks={selectedDateTasks}
          onAddTask={() => setTaskEditorVisible(true)}
          onOpenDay={() => router.push(`/daily/${selectedDate}` as any)}
        />

        {/* 4. Weekly Workload & Performance Summary */}
        <WeeklySummaryCard weekStartDate={weekStart} summary={weeklySummary} />
      </ScrollView>

      {/* Task Editor Modal */}
      {taskEditorVisible && (
        <TaskEditor
          visible={taskEditorVisible}
          onClose={() => setTaskEditorVisible(false)}
          defaultDate={selectedDate}
        />
      )}

      {/* First-time User Onboarding Modal */}
      {isHydrated && !settings.isOnboarded && (
        <OnboardingModal visible={!settings.isOnboarded} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...THEME.shadows.subtle,
  },
  avatarEmojiText: {
    fontSize: 22,
  },
  headerTextWrap: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#12131C',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E92A4',
    marginTop: 2,
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF5',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 110, // Space for floating bottom bar
  },
  welcomeBackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAFF',
    padding: 14,
    borderRadius: 20,
    marginBottom: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#D8CEFC',
  },
  welcomeBackTextWrap: {
    flex: 1,
  },
  welcomeBackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#432C81',
  },
  welcomeBackSub: {
    fontSize: 12,
    color: '#6B7082',
    marginTop: 2,
  },
});

