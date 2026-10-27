import type { Task, FocusSession, Habit, HabitOccurrence } from '@/types/app';
import { parseDateKey, formatDateKey } from './dates';

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0 to 100
  onTimeCompletionRate: number; // 0 to 100 or 0 if no deadlines
  tasksWithDeadlinesCount: number;
  onTimeCompletedCount: number;
  totalFocusMinutes: number;
  focusSessionsCount: number;
  habitConsistencyRate: number; // 0 to 100
  currentStreakDays: number;
  longestStreakDays: number;
  hasEnoughData: boolean;
}

/**
 * Calculates honest productivity metrics derived strictly from user records.
 * Never fabricates numbers. If zero activity, returns genuine zeroes.
 */
export function calculateHonestStats(params: {
  tasks: Task[];
  focusSessions: FocusSession[];
  habits: Habit[];
  habitOccurrences: HabitOccurrence[];
  startDateKey?: string;
  endDateKey?: string;
}): ProductivityStats {
  const { tasks, focusSessions, habits, habitOccurrences, startDateKey, endDateKey } = params;

  // Filter tasks within date bounds if provided
  const eligibleTasks = tasks.filter((t) => {
    if (t.status === 'cancelled') return false;
    if (startDateKey && t.scheduledDate < startDateKey) return false;
    if (endDateKey && t.scheduledDate > endDateKey) return false;
    return true;
  });

  const totalTasks = eligibleTasks.length;
  const completedTasks = eligibleTasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // On-time completion calculation
  const tasksWithDeadlines = eligibleTasks.filter((t) => Boolean(t.dueAt));
  let onTimeCompletedCount = 0;

  for (const t of tasksWithDeadlines) {
    if (t.status === 'completed' && t.completedAt && t.dueAt) {
      const completedTime = new Date(t.completedAt).getTime();
      const dueTime = new Date(t.dueAt).getTime();
      if (completedTime <= dueTime) {
        onTimeCompletedCount++;
      }
    }
  }

  const onTimeCompletionRate =
    tasksWithDeadlines.length > 0
      ? Math.round((onTimeCompletedCount / tasksWithDeadlines.length) * 100)
      : 0;

  // Focus metrics
  const completedSessions = focusSessions.filter((s) => s.status === 'completed');
  const totalFocusSeconds = completedSessions.reduce((acc, s) => acc + (s.actualDurationSeconds || 0), 0);
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
  const focusSessionsCount = completedSessions.length;

  // Habit metrics
  const activeHabits = habits.filter((h) => h.status === 'active');
  let habitConsistencyRate = 0;

  if (activeHabits.length > 0 && habitOccurrences.length > 0) {
    const totalOccurrences = habitOccurrences.length;
    const completedOccurrences = habitOccurrences.filter((o) => o.completed).length;
    habitConsistencyRate = totalOccurrences > 0 ? Math.round((completedOccurrences / totalOccurrences) * 100) : 0;
  }

  // Activity streak calculation based on real completions
  const activityDates = new Set<string>();

  for (const t of tasks) {
    if (t.status === 'completed' && t.completedAt) {
      activityDates.add(formatDateKey(new Date(t.completedAt)));
    }
  }
  for (const o of habitOccurrences) {
    if (o.completed && o.completedAt) {
      activityDates.add(formatDateKey(new Date(o.completedAt)));
    }
  }

  const { currentStreakDays, longestStreakDays } = calculateStreaks(activityDates);

  const hasEnoughData = totalTasks > 0 || focusSessionsCount > 0 || habitOccurrences.length > 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    onTimeCompletionRate,
    tasksWithDeadlinesCount: tasksWithDeadlines.length,
    onTimeCompletedCount,
    totalFocusMinutes,
    focusSessionsCount,
    habitConsistencyRate,
    currentStreakDays,
    longestStreakDays,
    hasEnoughData,
  };
}

/**
 * Calculates current and longest streaks from a set of active date keys (YYYY-MM-DD)
 */
function calculateStreaks(activeDates: Set<string>): { currentStreakDays: number; longestStreakDays: number } {
  if (activeDates.size === 0) {
    return { currentStreakDays: 0, longestStreakDays: 0 };
  }

  const sortedDates = Array.from(activeDates).sort();
  const todayKey = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  // Check if current streak is alive (active today or yesterday)
  let currentStreak = 0;
  let checkDate = activeDates.has(todayKey) ? new Date() : activeDates.has(yesterdayKey) ? yesterday : null;

  if (checkDate) {
    while (true) {
      const key = formatDateKey(checkDate);
      if (activeDates.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateKey of sortedDates) {
    const curDate = parseDateKey(dateKey);
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) {
      longestStreak = running;
    }
    prevDate = curDate;
  }

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: longestStreak,
  };
}
