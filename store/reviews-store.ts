import { create } from 'zustand';
import { WeeklyReview } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';
import { useXPStore } from './xp-store';
import { XP_REWARDS } from '@/constants/xp-rules';

interface ReviewStorageData {
  weeklyReviews: WeeklyReview[];
}

interface ReviewsState {
  weeklyReviews: WeeklyReview[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  saveWeeklyReview: (params: {
    weekStartDate: string;
    plannedTasksCount: number;
    completedTasksCount: number;
    totalFocusMinutes: number;
    habitConsistencyRate: number;
    nextWeekGoal: string;
    reflectionNotes: string;
  }) => WeeklyReview;

  getReviewForWeek: (weekStartDate: string) => WeeklyReview | undefined;
  clearReviews: () => Promise<void>;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  weeklyReviews: [],
  isHydrated: false,

  hydrate: async () => {
    const saved = await loadItem<ReviewStorageData>(STORAGE_KEYS.REVIEWS, { weeklyReviews: [] });
    set({ weeklyReviews: saved.weeklyReviews || [], isHydrated: true });
  },

  saveWeeklyReview: (params) => {
    const existingIndex = get().weeklyReviews.findIndex(
      (r) => r.weekStartDate === params.weekStartDate
    );

    const now = new Date().toISOString();
    const newReview: WeeklyReview = {
      id: `rev_${params.weekStartDate}`,
      weekStartDate: params.weekStartDate,
      completedAt: now,
      plannedTasksCount: params.plannedTasksCount,
      completedTasksCount: params.completedTasksCount,
      totalFocusMinutes: params.totalFocusMinutes,
      habitConsistencyRate: params.habitConsistencyRate,
      nextWeekGoal: params.nextWeekGoal.trim(),
      reflectionNotes: params.reflectionNotes.trim(),
    };

    let updated: WeeklyReview[];
    if (existingIndex >= 0) {
      updated = [...get().weeklyReviews];
      updated[existingIndex] = newReview;
    } else {
      updated = [newReview, ...get().weeklyReviews];
    }

    set({ weeklyReviews: updated });
    saveItem(STORAGE_KEYS.REVIEWS, { weeklyReviews: updated });

    // Award deterministic XP for completing weekly review
    useXPStore.getState().awardXP(
      'weekly_review_bonus',
      `weekly_review_${params.weekStartDate}`,
      XP_REWARDS.WEEKLY_REVIEW_COMPLETED,
      `Completed weekly review for week of ${params.weekStartDate}`
    );

    return newReview;
  },

  getReviewForWeek: (weekStartDate) => {
    return get().weeklyReviews.find((r) => r.weekStartDate === weekStartDate);
  },

  clearReviews: async () => {
    set({ weeklyReviews: [] });
    await saveItem(STORAGE_KEYS.REVIEWS, { weeklyReviews: [] });
  },
}));
