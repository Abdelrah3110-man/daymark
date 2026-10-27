import { create } from 'zustand';
import { UserSettings } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem, clearAllDaymarkData } from '@/services/persistence';
import { getTodayKey, getWeekStartDate } from '@/utils/dates';
import { useTaskStore } from './task-store';
import { usePlanningStore } from './planning-store';
import { useGoalStore } from './goal-store';
import { useFocusStore } from './focus-store';
import { useNotesStore } from './notes-store';
import { useReviewsStore } from './reviews-store';
import { useXPStore } from './xp-store';

const DEFAULT_SETTINGS: UserSettings = {
  displayName: '',
  weekStartDay: 0, // Sunday default
  defaultFocusMinutes: 25,
  dailyAvailabilityMinutes: 480, // 8 hours default
  dailyChallengeText: '',
  dailyChallengeCompletedDate: undefined,
  notificationsEnabled: false,
  lastActiveDate: undefined,
};

interface AppState {
  settings: UserSettings;
  activeWeekStart: string;
  isHydrated: boolean;
  daysSinceLastActive: number;

  initApp: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => void;
  setActiveWeekStart: (weekStart: string) => void;
  setDailyChallenge: (challengeText: string) => void;
  toggleDailyChallengeCompleted: () => void;
  resetAllApplicationData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  activeWeekStart: getWeekStartDate(new Date(), 0),
  isHydrated: false,
  daysSinceLastActive: 0,

  initApp: async () => {
    try {
      // Hydrate all stores in parallel
      const [savedSettings] = await Promise.all([
        loadItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
        useTaskStore.getState().hydrate(),
        usePlanningStore.getState().hydrate(),
        useGoalStore.getState().hydrate(),
        useFocusStore.getState().hydrate(),
        useNotesStore.getState().hydrate(),
        useReviewsStore.getState().hydrate(),
        useXPStore.getState().hydrate(),
      ]);

      const todayKey = getTodayKey();
      let inactivityDays = 0;

      if (savedSettings.lastActiveDate) {
        const last = new Date(savedSettings.lastActiveDate).getTime();
        const now = new Date(todayKey).getTime();
        inactivityDays = Math.max(0, Math.round((now - last) / (1000 * 60 * 60 * 24)));
      }

      const weekStart = getWeekStartDate(new Date(), savedSettings.weekStartDay);

      const updatedSettings: UserSettings = {
        ...savedSettings,
        lastActiveDate: todayKey,
      };

      set({
        settings: updatedSettings,
        activeWeekStart: weekStart,
        isHydrated: true,
        daysSinceLastActive: inactivityDays,
      });

      saveItem(STORAGE_KEYS.SETTINGS, updatedSettings);
    } catch (error) {
      console.error('[Daymark AppStore] Hydration error:', error);
      set({ isHydrated: true });
    }
  },

  updateSettings: (updates) => {
    const current = get().settings;
    const updated = { ...current, ...updates };

    // If weekStartDay changed, recalculate activeWeekStart
    let newActiveWeek = get().activeWeekStart;
    if (updates.weekStartDay !== undefined && updates.weekStartDay !== current.weekStartDay) {
      newActiveWeek = getWeekStartDate(new Date(), updates.weekStartDay);
    }

    set({ settings: updated, activeWeekStart: newActiveWeek });
    saveItem(STORAGE_KEYS.SETTINGS, updated);
  },

  setActiveWeekStart: (weekStart) => {
    set({ activeWeekStart: weekStart });
  },

  setDailyChallenge: (challengeText) => {
    get().updateSettings({
      dailyChallengeText: challengeText.trim(),
      dailyChallengeCompletedDate: undefined,
    });
  },

  toggleDailyChallengeCompleted: () => {
    const current = get().settings;
    const todayKey = getTodayKey();
    const isCompletedToday = current.dailyChallengeCompletedDate === todayKey;

    get().updateSettings({
      dailyChallengeCompletedDate: isCompletedToday ? undefined : todayKey,
    });
  },

  resetAllApplicationData: async () => {
    await clearAllDaymarkData();
    await Promise.all([
      useTaskStore.getState().clearTasks(),
      usePlanningStore.getState().clearPlanningData(),
      useGoalStore.getState().clearGoalData(),
      useFocusStore.getState().clearFocusData(),
      useNotesStore.getState().clearNotes(),
      useReviewsStore.getState().clearReviews(),
      useXPStore.getState().clearXP(),
    ]);

    const cleanSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      lastActiveDate: getTodayKey(),
    };

    set({
      settings: cleanSettings,
      activeWeekStart: getWeekStartDate(new Date(), 0),
      daysSinceLastActive: 0,
    });

    await saveItem(STORAGE_KEYS.SETTINGS, cleanSettings);
  },
}));

