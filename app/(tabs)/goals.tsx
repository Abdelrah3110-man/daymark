import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useGoalStore } from '@/store/goal-store';
import { useAppStore } from '@/store/app-store';
import { getWeekDates, getWeekStartDate } from '@/utils/dates';
import { GoalCard } from '@/components/goals/GoalCard';
import { HabitCard } from '@/components/goals/HabitCard';
import { GoalEditor } from '@/components/goals/GoalEditor';
import { HabitEditor } from '@/components/goals/HabitEditor';
import { EmptyState } from '@/components/common/EmptyState';
import { Goal, Habit } from '@/types/app';

export default function GoalsScreen() {
  const settings = useAppStore((s) => s.settings);
  const activeWeekStart = useAppStore((s) => s.activeWeekStart);
  const allGoals = useGoalStore((s) => s.goals);
  const allHabits = useGoalStore((s) => s.habits);
  const goals = allGoals.filter((g) => g.status === 'active');
  const habits = allHabits.filter((h) => h.status === 'active');

  const [activeTab, setActiveTab] = useState<'goals' | 'habits'>('goals');
  const [goalEditorVisible, setGoalEditorVisible] = useState(false);
  const [habitEditorVisible, setHabitEditorVisible] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const weekDates = getWeekDates(activeWeekStart);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Goals & Habits</Text>
          <Text style={styles.subtitle}>Long-term objectives and daily rituals</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (activeTab === 'goals') {
              setGoalToEdit(null);
              setGoalEditorVisible(true);
            } else {
              setHabitToEdit(null);
              setHabitEditorVisible(true);
            }
          }}
          accessibilityLabel={`Add new ${activeTab === 'goals' ? 'goal' : 'habit'}`}
        >
          <Ionicons name="add" size={22} color={THEME.colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Segmented Switch */}
      <View style={styles.segmentedWrap}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'goals' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.segmentText, activeTab === 'goals' && styles.segmentTextActive]}>
            Long-Term Goals ({goals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'habits' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('habits')}
        >
          <Text style={[styles.segmentText, activeTab === 'habits' && styles.segmentTextActive]}>
            Daily Habits ({habits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'goals' ? (
          goals.length === 0 ? (
            <EmptyState
              icon="flag-outline"
              title="No goals set yet"
              description="Define overarching targets and break them down into trackable milestones."
              actionLabel="Create Goal"
              onAction={() => {
                setGoalToEdit(null);
                setGoalEditorVisible(true);
              }}
              accentColor={THEME.colors.peach}
            />
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={(g) => {
                  setGoalToEdit(g);
                  setGoalEditorVisible(true);
                }}
              />
            ))
          )
        ) : habits.length === 0 ? (
          <EmptyState
            icon="repeat-outline"
            title="No habits configured"
            description="Establish recurring habits and record check-ins across each day of the week."
            actionLabel="Create Habit"
            onAction={() => {
              setHabitToEdit(null);
              setHabitEditorVisible(true);
            }}
            accentColor={THEME.colors.lavender}
          />
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              weekDates={weekDates}
              onEdit={(h) => {
                setHabitToEdit(h);
                setHabitEditorVisible(true);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Goal Editor Modal */}
      {goalEditorVisible && (
        <GoalEditor
          visible={goalEditorVisible}
          onClose={() => {
            setGoalEditorVisible(false);
            setGoalToEdit(null);
          }}
          goalToEdit={goalToEdit}
        />
      )}

      {/* Habit Editor Modal */}
      {habitEditorVisible && (
        <HabitEditor
          visible={habitEditorVisible}
          onClose={() => {
            setHabitEditorVisible(false);
            setHabitToEdit(null);
          }}
          habitToEdit={habitToEdit}
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
  title: {
    ...THEME.typography.h1,
    color: THEME.colors.text,
  },
  subtitle: {
    ...THEME.typography.caption,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  segmentedWrap: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSecondary,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.xs,
    marginBottom: THEME.spacing.md,
    borderRadius: THEME.borderRadius.pill,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.pill,
  },
  segmentBtnActive: {
    backgroundColor: THEME.colors.surface,
    ...THEME.shadows.subtle,
  },
  segmentText: {
    ...THEME.typography.caption,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  segmentTextActive: {
    color: THEME.colors.text,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 110,
  },
});

