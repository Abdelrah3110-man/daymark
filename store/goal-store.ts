import { create } from 'zustand';
import { Goal, Habit, HabitOccurrence, Milestone, HabitFrequency } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';
import { useXPStore } from './xp-store';
import { XP_REWARDS } from '@/constants/xp-rules';

interface GoalStorageData {
  goals: Goal[];
}

interface HabitStorageData {
  habits: Habit[];
  habitOccurrences: HabitOccurrence[];
}

interface GoalState {
  goals: Goal[];
  habits: Habit[];
  habitOccurrences: HabitOccurrence[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  // Goal actions
  createGoal: (params: {
    title: string;
    description?: string;
    category?: string;
    targetDate?: string;
    targetMetricValue?: number;
    metricUnit?: string;
    milestones?: string[];
  }) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;

  // Habit actions
  createHabit: (params: {
    title: string;
    description?: string;
    frequency: HabitFrequency;
    customDays?: number[];
    targetDaysPerWeek?: number;
    color?: string;
  }) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Occurrence actions
  toggleHabitOccurrence: (habitId: string, date: string) => void;
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;

  clearGoalData: () => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  habits: [],
  habitOccurrences: [],
  isHydrated: false,

  hydrate: async () => {
    const savedGoals = await loadItem<GoalStorageData>(STORAGE_KEYS.GOALS, { goals: [] });
    const savedHabits = await loadItem<HabitStorageData>(STORAGE_KEYS.HABITS, {
      habits: [],
      habitOccurrences: [],
    });

    set({
      goals: savedGoals.goals || [],
      habits: savedHabits.habits || [],
      habitOccurrences: savedHabits.habitOccurrences || [],
      isHydrated: true,
    });
  },

  createGoal: (params) => {
    const milestones: Milestone[] = (params.milestones || []).map((title) => ({
      id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      completed: false,
    }));

    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: params.title.trim(),
      description: params.description?.trim(),
      category: params.category || 'General',
      targetDate: params.targetDate,
      targetMetricValue: params.targetMetricValue,
      currentMetricValue: 0,
      metricUnit: params.metricUnit,
      milestones,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newGoal, ...get().goals];
    set({ goals: updated });
    saveItem(STORAGE_KEYS.GOALS, { goals: updated });
    return newGoal;
  },

  updateGoal: (id, updates) => {
    const updated = get().goals.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return g;
    });

    set({ goals: updated });
    saveItem(STORAGE_KEYS.GOALS, { goals: updated });
  },

  deleteGoal: (id) => {
    const updated = get().goals.filter((g) => g.id !== id);
    set({ goals: updated });
    saveItem(STORAGE_KEYS.GOALS, { goals: updated });
  },

  toggleMilestone: (goalId, milestoneId) => {
    const updated = get().goals.map((g) => {
      if (g.id === goalId) {
        const now = new Date().toISOString();
        const updatedMilestones = g.milestones.map((m) => {
          if (m.id === milestoneId) {
            return {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? now : undefined,
            };
          }
          return m;
        });
        return {
          ...g,
          milestones: updatedMilestones,
          updatedAt: now,
        };
      }
      return g;
    });

    set({ goals: updated });
    saveItem(STORAGE_KEYS.GOALS, { goals: updated });
  },

  createHabit: (params) => {
    let targetDays = params.targetDaysPerWeek || 7;
    if (params.frequency === 'weekdays') targetDays = 5;
    if (params.frequency === 'weekends') targetDays = 2;
    if (params.frequency === 'custom' && params.customDays) targetDays = params.customDays.length;

    const newHabit: Habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: params.title.trim(),
      description: params.description?.trim(),
      frequency: params.frequency,
      customDays: params.customDays,
      targetDaysPerWeek: targetDays,
      color: params.color || '#D0C9FF',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newHabit, ...get().habits];
    set({ habits: updated });
    saveItem(STORAGE_KEYS.HABITS, {
      habits: updated,
      habitOccurrences: get().habitOccurrences,
    });
    return newHabit;
  },

  updateHabit: (id, updates) => {
    const updated = get().habits.map((h) => {
      if (h.id === id) {
        return {
          ...h,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return h;
    });

    set({ habits: updated });
    saveItem(STORAGE_KEYS.HABITS, {
      habits: updated,
      habitOccurrences: get().habitOccurrences,
    });
  },

  archiveHabit: (id) => {
    get().updateHabit(id, { status: 'archived' });
  },

  deleteHabit: (id) => {
    const updatedHabits = get().habits.filter((h) => h.id !== id);
    const updatedOccurrences = get().habitOccurrences.filter((o) => o.habitId !== id);

    set({ habits: updatedHabits, habitOccurrences: updatedOccurrences });
    saveItem(STORAGE_KEYS.HABITS, {
      habits: updatedHabits,
      habitOccurrences: updatedOccurrences,
    });
  },

  toggleHabitOccurrence: (habitId, date) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const existingIndex = get().habitOccurrences.findIndex(
      (o) => o.habitId === habitId && o.date === date
    );

    let updated = [...get().habitOccurrences];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = updated[existingIndex];
      const nextCompleted = !existing.completed;
      updated[existingIndex] = {
        ...existing,
        completed: nextCompleted,
        completedAt: nextCompleted ? now : undefined,
      };

      if (nextCompleted) {
        useXPStore.getState().awardXP(
          'habit_completion',
          `habit_${habitId}_${date}`,
          XP_REWARDS.HABIT_COMPLETED,
          `Completed habit: ${habit.title}`
        );
      }
    } else {
      const newOccurrence: HabitOccurrence = {
        id: `occ_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        habitId,
        date,
        completed: true,
        completedAt: now,
      };
      updated.push(newOccurrence);

      useXPStore.getState().awardXP(
        'habit_completion',
        `habit_${habitId}_${date}`,
        XP_REWARDS.HABIT_COMPLETED,
        `Completed habit: ${habit.title}`
      );
    }

    set({ habitOccurrences: updated });
    saveItem(STORAGE_KEYS.HABITS, {
      habits: get().habits,
      habitOccurrences: updated,
    });
  },

  isHabitCompletedOnDate: (habitId, date) => {
    return get().habitOccurrences.some(
      (o) => o.habitId === habitId && o.date === date && o.completed
    );
  },

  clearGoalData: async () => {
    set({ goals: [], habits: [], habitOccurrences: [] });
    await saveItem(STORAGE_KEYS.GOALS, { goals: [] });
    await saveItem(STORAGE_KEYS.HABITS, { habits: [], habitOccurrences: [] });
  },
}));
