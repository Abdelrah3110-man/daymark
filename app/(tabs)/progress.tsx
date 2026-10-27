import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/task-store';
import { useFocusStore } from '@/store/focus-store';
import { useGoalStore } from '@/store/goal-store';
import { useReviewsStore } from '@/store/reviews-store';
import { usePlanningStore } from '@/store/planning-store';
import { useAppStore } from '@/store/app-store';
import { calculateHonestStats } from '@/utils/statistics';
import { XPProgressCard } from '@/components/progress/XPProgressCard';
import { MetricsGrid } from '@/components/progress/MetricsGrid';
import { AchievementsSection } from '@/components/progress/AchievementsSection';
import { MedalsAndTitlesSection } from '@/components/progress/MedalsAndTitlesSection';
import { formatWeekRange } from '@/utils/dates';

export default function ProgressScreen() {
  const settings = useAppStore((s) => s.settings);
  const activeWeekStart = useAppStore((s) => s.activeWeekStart);
  const tasks = useTaskStore((s) => s.tasks);
  const focusSessions = useFocusStore((s) => s.sessions);
  const habits = useGoalStore((s) => s.habits);
  const habitOccurrences = useGoalStore((s) => s.habitOccurrences);
  const weeklyPlans = usePlanningStore((s) => s.weeklyPlans);
  const weeklyReviews = useReviewsStore((s) => s.weeklyReviews);
  const saveWeeklyReview = useReviewsStore((s) => s.saveWeeklyReview);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [nextWeekGoal, setNextWeekGoal] = useState('');

  const stats = calculateHonestStats({
    tasks,
    focusSessions,
    habits,
    habitOccurrences,
  });

  const existingReview = weeklyReviews.find((r) => r.weekStartDate === activeWeekStart);

  const handleSaveReview = () => {
    saveWeeklyReview({
      weekStartDate: activeWeekStart,
      plannedTasksCount: stats.totalTasks,
      completedTasksCount: stats.completedTasks,
      totalFocusMinutes: stats.totalFocusMinutes,
      habitConsistencyRate: stats.habitConsistencyRate,
      nextWeekGoal: nextWeekGoal.trim() || 'Maintain high focus and clarity',
      reflectionNotes: reflectionText.trim() || 'Weekly review completed.',
    });

    setReviewModalVisible(false);
  };

  const achievementStats = {
    totalTasksCompleted: stats.completedTasks,
    totalFocusMinutes: stats.totalFocusMinutes,
    completedHabitCount: habitOccurrences.filter((o) => o.completed).length,
    weeklyPlansPrepared: weeklyPlans.filter((p) => p.status === 'prepared').length,
    weeklyReviewsCompleted: weeklyReviews.length,
    consecutiveDaysPlanned: 7,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Progress & Review</Text>
          <Text style={styles.subtitle}>Honest metrics based exclusively on your activity</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* XP Level & Progression Card */}
        <XPProgressCard />

        {/* Honorary Titles, Medals & Unlockable Avatars Gallery */}
        <MedalsAndTitlesSection />

        {/* Honest Metrics Grid */}
        <MetricsGrid stats={stats} />

        {/* Weekly Performance Review Card */}
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewBadge}>
              <Ionicons name="book-outline" size={13} color={THEME.colors.peachDark} />
              <Text style={styles.reviewBadgeText}>WEEKLY PERFORMANCE REVIEW</Text>
            </View>
            <Text style={styles.reviewWeekRange}>{formatWeekRange(activeWeekStart)}</Text>
          </View>

          {existingReview ? (
            <View style={styles.reviewContent}>
              <View style={styles.reviewSuccessRow}>
                <Ionicons name="checkmark-circle" size={18} color={THEME.colors.success} />
                <Text style={styles.reviewSuccessText}>Completed & 15 XP Awarded</Text>
              </View>

              <Text style={styles.reviewGoalLabel}>Next Week's Focal Goal:</Text>
              <Text style={styles.reviewGoalVal}>"{existingReview.nextWeekGoal}"</Text>

              {existingReview.reflectionNotes ? (
                <>
                  <Text style={styles.reviewGoalLabel}>Reflection:</Text>
                  <Text style={styles.reviewReflectionVal}>{existingReview.reflectionNotes}</Text>
                </>
              ) : null}

              <TouchableOpacity
                style={styles.editReviewBtn}
                onPress={() => {
                  setNextWeekGoal(existingReview.nextWeekGoal);
                  setReflectionText(existingReview.reflectionNotes);
                  setReviewModalVisible(true);
                }}
              >
                <Text style={styles.editReviewBtnText}>Update Review</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyReview}>
              <Text style={styles.emptyReviewTitle}>Reflect and solidify your gains</Text>
              <Text style={styles.emptyReviewSub}>
                Review planned vs completed tasks, analyze focus time, and set one key improvement for next week.
              </Text>
              <TouchableOpacity
                style={styles.startReviewBtn}
                onPress={() => {
                  setNextWeekGoal('');
                  setReflectionText('');
                  setReviewModalVisible(true);
                }}
              >
                <Text style={styles.startReviewBtnText}>Start Weekly Review (+15 XP)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Achievements Section */}
        <AchievementsSection stats={achievementStats} />
      </ScrollView>

      {/* Weekly Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Weekly Review</Text>
            <TouchableOpacity onPress={handleSaveReview} style={styles.saveBtn}>
              <Text style={styles.saveText}>Complete</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <Text style={styles.modalSub}>
              Reviewing the week of {formatWeekRange(activeWeekStart)}. Honest reflection drives continuous improvement.
            </Text>

            <View style={styles.statsSummaryBox}>
              <Text style={styles.summaryBoxTitle}>This Week's Record</Text>
              <Text style={styles.summaryBoxText}>• {stats.completedTasks} tasks accomplished</Text>
              <Text style={styles.summaryBoxText}>• {stats.totalFocusMinutes} minutes of deep focus</Text>
              <Text style={styles.summaryBoxText}>• {stats.habitConsistencyRate}% habit consistency</Text>
            </View>

            <Text style={styles.modalLabel}>What will you change or focus on next week? *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Schedule deep work before noon and protect Monday morning"
              placeholderTextColor={THEME.colors.textLight}
              value={nextWeekGoal}
              onChangeText={setNextWeekGoal}
            />

            <Text style={styles.modalLabel}>General reflections or lessons learned</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="What worked well? What caused friction or missed deadlines?"
              placeholderTextColor={THEME.colors.textLight}
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.sm,
  },
  title: {
    ...THEME.typography.h1,
    color: THEME.colors.text,
  },
  subtitle: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: 110,
  },
  reviewCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.peachLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.pill,
    gap: 4,
  },
  reviewBadgeText: {
    ...THEME.typography.micro,
    fontWeight: '800',
    color: THEME.colors.peachDark,
  },
  reviewWeekRange: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
  },
  emptyReview: {
    paddingTop: THEME.spacing.xs,
  },
  emptyReviewTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  emptyReviewSub: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: THEME.spacing.md,
  },
  startReviewBtn: {
    backgroundColor: THEME.colors.text,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.pill,
    alignItems: 'center',
  },
  startReviewBtnText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  reviewContent: {
    paddingTop: THEME.spacing.xs,
  },
  reviewSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: THEME.spacing.sm,
  },
  reviewSuccessText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.success,
  },
  reviewGoalLabel: {
    ...THEME.typography.micro,
    color: THEME.colors.textMuted,
    fontWeight: '700',
    marginTop: 6,
  },
  reviewGoalVal: {
    ...THEME.typography.bodyLg,
    fontWeight: '600',
    color: THEME.colors.text,
    marginTop: 2,
  },
  reviewReflectionVal: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  editReviewBtn: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
    marginTop: THEME.spacing.md,
  },
  editReviewBtnText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  cancelText: {
    ...THEME.typography.body,
    color: THEME.colors.textMuted,
  },
  modalTitle: {
    ...THEME.typography.h3,
    color: THEME.colors.text,
  },
  saveBtn: {
    backgroundColor: THEME.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.pill,
  },
  saveText: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textInverse,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  modalSub: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
  },
  statsSummaryBox: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    gap: 4,
  },
  summaryBoxTitle: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  summaryBoxText: {
    ...THEME.typography.bodySm,
    color: THEME.colors.textSecondary,
  },
  modalLabel: {
    ...THEME.typography.caption,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: THEME.spacing.md,
  },
  modalInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    ...THEME.typography.body,
    color: THEME.colors.text,
  },
  modalTextArea: {
    height: 100,
  },
});

