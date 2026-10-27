import { create } from 'zustand';
import { WeeklyPlan, DailyPlan, DailyTaskOverride, PlanningConflict, Task } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';
import { useTaskStore } from './task-store';

interface PlanningStorageData {
  weeklyPlans: WeeklyPlan[];
  dailyPlans: DailyPlan[];
  dailyOverrides: DailyTaskOverride[];
}

interface PlanningState {
  weeklyPlans: WeeklyPlan[];
  dailyPlans: DailyPlan[];
  dailyOverrides: DailyTaskOverride[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  getOrCreateWeeklyPlan: (weekStartDate: string) => WeeklyPlan;
  bumpWeeklyPlanRevision: (weekStartDate: string) => void;
  generateDailyPreviews: (weekStartDate: string, weekDates: string[]) => { success: boolean; dailyPlans: DailyPlan[] };
  
  getDailyPlanForDate: (date: string) => DailyPlan | undefined;
  getOverridesForDailyPlan: (dailyPlanId: string) => DailyTaskOverride[];
  getOverrideForTask: (dailyPlanId: string, taskId: string) => DailyTaskOverride | undefined;
  
  customizeDailyTask: (
    dailyPlanId: string,
    taskId: string,
    overrides: Partial<Pick<Task, 'scheduledTime' | 'estimatedDuration' | 'priority' | 'isDailyPriority' | 'orderIndex' | 'scheduledDate'>>
  ) => void;

  removeTaskFromDailyPlan: (dailyPlanId: string, taskId: string) => void;

  resolveConflict: (dailyPlanId: string, taskId: string, resolution: 'apply_weekly' | 'keep_daily') => void;

  clearPlanningData: () => Promise<void>;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  weeklyPlans: [],
  dailyPlans: [],
  dailyOverrides: [],
  isHydrated: false,

  hydrate: async () => {
    const saved = await loadItem<PlanningStorageData>(STORAGE_KEYS.PLANNING, {
      weeklyPlans: [],
      dailyPlans: [],
      dailyOverrides: [],
    });

    set({
      weeklyPlans: saved.weeklyPlans || [],
      dailyPlans: saved.dailyPlans || [],
      dailyOverrides: saved.dailyOverrides || [],
      isHydrated: true,
    });
  },

  getOrCreateWeeklyPlan: (weekStartDate) => {
    const existing = get().weeklyPlans.find((p) => p.weekStartDate === weekStartDate);
    if (existing) return existing;

    const newPlan: WeeklyPlan = {
      id: `wp_${weekStartDate}`,
      weekStartDate,
      status: 'draft',
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...get().weeklyPlans, newPlan];
    set({ weeklyPlans: updated });
    saveItem(STORAGE_KEYS.PLANNING, {
      weeklyPlans: updated,
      dailyPlans: get().dailyPlans,
      dailyOverrides: get().dailyOverrides,
    });
    return newPlan;
  },

  bumpWeeklyPlanRevision: (weekStartDate) => {
    const plan = get().getOrCreateWeeklyPlan(weekStartDate);
    const newRevision = plan.revision + 1;

    const updatedPlans = get().weeklyPlans.map((p) => {
      if (p.id === plan.id) {
        return {
          ...p,
          revision: newRevision,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    // Mark daily plans that were prepared under older revisions as potentially needing sync check
    const updatedDailyPlans = get().dailyPlans.map((dp) => {
      if (dp.weeklyPlanId === plan.id && dp.sourceRevision < newRevision) {
        return {
          ...dp,
          syncStatus: dp.isCustomized ? ('conflict' as const) : ('outdated' as const),
        };
      }
      return dp;
    });

    set({ weeklyPlans: updatedPlans, dailyPlans: updatedDailyPlans });
    saveItem(STORAGE_KEYS.PLANNING, {
      weeklyPlans: updatedPlans,
      dailyPlans: updatedDailyPlans,
      dailyOverrides: get().dailyOverrides,
    });
  },

  generateDailyPreviews: (weekStartDate, weekDates) => {
    const weeklyPlan = get().getOrCreateWeeklyPlan(weekStartDate);
    const newRevision = weeklyPlan.revision + 1;
    const now = new Date().toISOString();

    const existingDailyMap = new Map(get().dailyPlans.map((dp) => [dp.date, dp]));
    const resultingDailyPlans: DailyPlan[] = [];

    for (const date of weekDates) {
      const existing = existingDailyMap.get(date);
      if (existing) {
        // Idempotent update: update source revision, preserve isCustomized
        const updatedDaily: DailyPlan = {
          ...existing,
          weeklyPlanId: weeklyPlan.id,
          sourceRevision: newRevision,
          syncStatus: existing.isCustomized ? 'customized' : 'synced',
          updatedAt: now,
        };
        resultingDailyPlans.push(updatedDaily);
      } else {
        // Create new daily plan
        const newDaily: DailyPlan = {
          id: `dp_${date}`,
          weeklyPlanId: weeklyPlan.id,
          date,
          sourceRevision: newRevision,
          isCustomized: false,
          syncStatus: 'synced',
          createdAt: now,
          updatedAt: now,
        };
        resultingDailyPlans.push(newDaily);
      }
    }

    // Merge with any daily plans outside of this week
    const otherDailyPlans = get().dailyPlans.filter((dp) => !weekDates.includes(dp.date));
    const allDailyPlans = [...otherDailyPlans, ...resultingDailyPlans];

    // Update weekly plan to prepared
    const updatedWeeklyPlans = get().weeklyPlans.map((wp) => {
      if (wp.id === weeklyPlan.id) {
        return {
          ...wp,
          status: 'prepared' as const,
          revision: newRevision,
          generatedAt: now,
          updatedAt: now,
        };
      }
      return wp;
    });

    set({
      weeklyPlans: updatedWeeklyPlans,
      dailyPlans: allDailyPlans,
    });

    saveItem(STORAGE_KEYS.PLANNING, {
      weeklyPlans: updatedWeeklyPlans,
      dailyPlans: allDailyPlans,
      dailyOverrides: get().dailyOverrides,
    });

    return { success: true, dailyPlans: resultingDailyPlans };
  },

  getDailyPlanForDate: (date) => {
    return get().dailyPlans.find((p) => p.date === date);
  },

  getOverridesForDailyPlan: (dailyPlanId) => {
    return get().dailyOverrides.filter((o) => o.dailyPlanId === dailyPlanId);
  },

  getOverrideForTask: (dailyPlanId, taskId) => {
    return get().dailyOverrides.find((o) => o.dailyPlanId === dailyPlanId && o.taskId === taskId);
  },

  customizeDailyTask: (dailyPlanId, taskId, overrides) => {
    const existingIndex = get().dailyOverrides.findIndex(
      (o) => o.dailyPlanId === dailyPlanId && o.taskId === taskId
    );

    let updatedOverrides = [...get().dailyOverrides];
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = updatedOverrides[existingIndex];
      updatedOverrides[existingIndex] = {
        ...existing,
        overriddenFields: {
          ...existing.overriddenFields,
          ...overrides,
        },
        updatedAt: now,
      };
    } else {
      const newOverride: DailyTaskOverride = {
        id: `ovr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        dailyPlanId,
        taskId,
        overriddenFields: overrides,
        updatedAt: now,
      };
      updatedOverrides.push(newOverride);
    }

    // Mark daily plan as customized
    const updatedDailyPlans = get().dailyPlans.map((dp) => {
      if (dp.id === dailyPlanId) {
        return {
          ...dp,
          isCustomized: true,
          syncStatus: 'customized' as const,
          updatedAt: now,
        };
      }
      return dp;
    });

    set({
      dailyOverrides: updatedOverrides,
      dailyPlans: updatedDailyPlans,
    });

    saveItem(STORAGE_KEYS.PLANNING, {
      weeklyPlans: get().weeklyPlans,
      dailyPlans: updatedDailyPlans,
      dailyOverrides: updatedOverrides,
    });
  },

  removeTaskFromDailyPlan: (dailyPlanId, taskId) => {
    // Customize daily plan by overriding task date to unscheduled or marking removed
    get().customizeDailyTask(dailyPlanId, taskId, { scheduledDate: '' });
  },

  resolveConflict: (dailyPlanId, taskId, resolution) => {
    const now = new Date().toISOString();
    let updatedOverrides = [...get().dailyOverrides];

    if (resolution === 'apply_weekly') {
      // Discard daily overrides for this task
      updatedOverrides = updatedOverrides.filter(
        (o) => !(o.dailyPlanId === dailyPlanId && o.taskId === taskId)
      );
    } else {
      // keep_daily: retain daily override, update timestamp
      updatedOverrides = updatedOverrides.map((o) => {
        if (o.dailyPlanId === dailyPlanId && o.taskId === taskId) {
          return { ...o, updatedAt: now };
        }
        return o;
      });
    }

    // Check if daily plan still has any other conflicts
    const remainingForPlan = updatedOverrides.filter((o) => o.dailyPlanId === dailyPlanId);
    const updatedDailyPlans = get().dailyPlans.map((dp) => {
      if (dp.id === dailyPlanId) {
        return {
          ...dp,
          isCustomized: remainingForPlan.length > 0,
          syncStatus: remainingForPlan.length > 0 ? ('customized' as const) : ('synced' as const),
          updatedAt: now,
        };
      }
      return dp;
    });

    set({
      dailyOverrides: updatedOverrides,
      dailyPlans: updatedDailyPlans,
    });

    saveItem(STORAGE_KEYS.PLANNING, {
      weeklyPlans: get().weeklyPlans,
      dailyPlans: updatedDailyPlans,
      dailyOverrides: updatedOverrides,
    });
  },

  clearPlanningData: async () => {
    set({ weeklyPlans: [], dailyPlans: [], dailyOverrides: [] });
    await saveItem(STORAGE_KEYS.PLANNING, {
      weeklyPlans: [],
      dailyPlans: [],
      dailyOverrides: [],
    });
  },
}));

