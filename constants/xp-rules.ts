import type { TaskDifficulty } from '@/types/app';

export const XP_REWARDS = {
  TASK_DIFFICULTY: {
    light: 5,
    medium: 10,
    hard: 20,
  } as Record<TaskDifficulty, number>,
  
  DAILY_PRIORITY_ALL_COMPLETED: 10,
  WEEKLY_REVIEW_COMPLETED: 15,
  HABIT_COMPLETED: 5,
  FOCUS_5_MINUTES: 1, // 1 XP per 5 full minutes of focus
} as const;

export interface LevelInfo {
  level: number;
  totalXP: number;
  currentLevelBaseXP: number;
  nextLevelXP: number;
  progressPercent: number;
  title: string;
}

export const LEVEL_TITLES: { [level: number]: string } = {
  1: 'Initiate',
  2: 'Apprentice',
  3: 'Practitioner',
  4: 'Strategist',
  5: 'Craftsman',
  6: 'Specialist',
  7: 'Architect',
  8: 'Master Planner',
  9: 'Grandmaster',
  10: 'Legendary Sovereign',
};

/**
 * Returns XP threshold required to reach a specific level.
 * Level 1: 0 XP
 * Level 2: 50 XP
 * Level 3: 150 XP
 * Level 4: 300 XP
 * Level 5: 500 XP
 * Level 6: 750 XP
 * Level 7: 1050 XP
 * Level 8: 1400 XP
 * Level 9: 1800 XP
 * Level 10: 2250 XP
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(25 * (level - 1) * level);
}

export function calculateLevelInfo(totalXP: number): LevelInfo {
  const safeXP = Math.max(0, totalXP || 0);
  let level = 1;

  while (getXpRequiredForLevel(level + 1) <= safeXP && level < 99) {
    level++;
  }

  const currentLevelBaseXP = getXpRequiredForLevel(level);
  const nextLevelXP = getXpRequiredForLevel(level + 1);
  const xpInCurrentLevel = safeXP - currentLevelBaseXP;
  const xpNeededForNext = nextLevelXP - currentLevelBaseXP;
  const progressPercent = xpNeededForNext > 0 
    ? Math.min(100, Math.max(0, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100))) 
    : 100;

  const title = LEVEL_TITLES[Math.min(10, level)] || 'Master Planner';

  return {
    level,
    totalXP: safeXP,
    currentLevelBaseXP,
    nextLevelXP,
    progressPercent,
    title,
  };
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  checkUnlocked: (stats: {
    totalTasksCompleted: number;
    totalFocusMinutes: number;
    completedHabitCount: number;
    weeklyPlansPrepared: number;
    weeklyReviewsCompleted: number;
    consecutiveDaysPlanned: number;
  }) => boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_task',
    title: 'First Step',
    description: 'Complete your first planned task.',
    icon: 'check-circle',
    checkUnlocked: (s) => s.totalTasksCompleted >= 1,
  },
  {
    id: 'weekly_architect',
    title: 'Weekly Architect',
    description: 'Prepare and generate your first weekly plan.',
    icon: 'calendar',
    checkUnlocked: (s) => s.weeklyPlansPrepared >= 1,
  },
  {
    id: 'focus_explorer',
    title: 'Deep Focus',
    description: 'Complete at least 50 minutes of deep focus time.',
    icon: 'clock',
    checkUnlocked: (s) => s.totalFocusMinutes >= 50,
  },
  {
    id: 'habit_spark',
    title: 'Habit Spark',
    description: 'Check in on habits 5 times.',
    icon: 'zap',
    checkUnlocked: (s) => s.completedHabitCount >= 5,
  },
  {
    id: 'task_veteran',
    title: 'Task Veteran',
    description: 'Reach 25 completed tasks.',
    icon: 'award',
    checkUnlocked: (s) => s.totalTasksCompleted >= 25,
  },
  {
    id: 'reflective_mind',
    title: 'Reflective Mind',
    description: 'Complete your first weekly review.',
    icon: 'book-open',
    checkUnlocked: (s) => s.weeklyReviewsCompleted >= 1,
  },
  {
    id: 'century_tasks',
    title: 'Century Club',
    description: 'Complete 100 planned tasks.',
    icon: 'shield',
    checkUnlocked: (s) => s.totalTasksCompleted >= 100,
  },
];
