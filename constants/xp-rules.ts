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

export interface MedalDefinition {
  id: string;
  title: string;
  requiredXP: number;
  icon: string;
  color: string;
  tier: 'bronze' | 'iron' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'mythic';
  description: string;
}

export const MEDALS: MedalDefinition[] = [
  {
    id: 'medal_bronze',
    title: 'Bronze Initiate',
    requiredXP: 50,
    icon: 'medal',
    color: '#CD7F32',
    tier: 'bronze',
    description: 'Awarded upon reaching 50 cumulative XP.',
  },
  {
    id: 'medal_iron',
    title: 'Iron Discipline',
    requiredXP: 150,
    icon: 'shield-checkmark',
    color: '#708090',
    tier: 'iron',
    description: 'Awarded upon reaching 150 cumulative XP for consistent daily execution.',
  },
  {
    id: 'medal_silver',
    title: 'Silver Achiever',
    requiredXP: 300,
    icon: 'trophy',
    color: '#A0AEC0',
    tier: 'silver',
    description: 'Awarded upon reaching 300 cumulative XP with high task follow-through.',
  },
  {
    id: 'medal_gold',
    title: 'Gold Strategist',
    requiredXP: 600,
    icon: 'ribbon',
    color: '#EAB308',
    tier: 'gold',
    description: 'Awarded upon reaching 600 cumulative XP for mastery in weekly planning.',
  },
  {
    id: 'medal_platinum',
    title: 'Platinum Champion',
    requiredXP: 1000,
    icon: 'sparkles',
    color: '#CBD5E1',
    tier: 'platinum',
    description: 'Awarded upon reaching 1,000 cumulative XP for elite productivity.',
  },
  {
    id: 'medal_diamond',
    title: 'Diamond Master',
    requiredXP: 1800,
    icon: 'diamond',
    color: '#38BDF8',
    tier: 'diamond',
    description: 'Awarded upon reaching 1,800 cumulative XP for unshakeable focus.',
  },
  {
    id: 'medal_mythic',
    title: 'Mythic Sovereign',
    requiredXP: 3000,
    icon: 'star',
    color: '#A855F7',
    tier: 'mythic',
    description: 'Highest honorary distinction in Daymark for complete mastery over time.',
  },
];

export function getMedalsWithStatus(totalXP: number) {
  const safeXP = Math.max(0, totalXP || 0);
  return MEDALS.map((medal) => {
    const isUnlocked = safeXP >= medal.requiredXP;
    const progress = Math.min(100, Math.floor((safeXP / medal.requiredXP) * 100));
    const remainingXP = Math.max(0, medal.requiredXP - safeXP);
    return {
      ...medal,
      isUnlocked,
      progress,
      remainingXP,
    };
  });
}

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
