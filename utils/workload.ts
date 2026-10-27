import type { Task, DayWorkloadSummary } from '@/types/app';

/**
 * Converts HH:mm string to minutes from midnight
 */
export function timeStringToMinutes(timeStr?: string): number | null {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Checks for time collisions between tasks that have explicit start times and durations
 */
export function findTimeConflicts(tasks: Task[]): { taskA: Task; taskB: Task }[] {
  const timedTasks = tasks
    .filter((t) => t.scheduledTime && t.estimatedDuration > 0 && t.status !== 'cancelled')
    .map((t) => {
      const start = timeStringToMinutes(t.scheduledTime)!;
      return {
        task: t,
        start,
        end: start + t.estimatedDuration,
      };
    })
    .sort((a, b) => a.start - b.start);

  const conflicts: { taskA: Task; taskB: Task }[] = [];

  for (let i = 0; i < timedTasks.length; i++) {
    for (let j = i + 1; j < timedTasks.length; j++) {
      const a = timedTasks[i];
      const b = timedTasks[j];
      // If task B starts before task A ends, they overlap
      if (b.start < a.end) {
        conflicts.push({ taskA: a.task, taskB: b.task });
      } else {
        // Since list is sorted by start time, no further overlaps possible for task A
        break;
      }
    }
  }

  return conflicts;
}

/**
 * Calculate workload metrics for a specific date
 */
export function calculateDayWorkload(
  dateKey: string,
  tasksForDay: Task[],
  dailyAvailabilityMinutes: number = 480
): DayWorkloadSummary {
  const activeTasks = tasksForDay.filter((t) => t.status !== 'cancelled');
  const taskCount = activeTasks.length;
  const totalMinutes = activeTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0);
  const missingDurationCount = activeTasks.filter((t) => !t.estimatedDuration || t.estimatedDuration <= 0).length;
  const priorityCount = activeTasks.filter((t) => t.isDailyPriority).length;
  const conflicts = findTimeConflicts(activeTasks);

  return {
    date: dateKey,
    taskCount,
    totalMinutes,
    availabilityMinutes: dailyAvailabilityMinutes,
    isOverloaded: totalMinutes > dailyAvailabilityMinutes,
    missingDurationCount,
    priorityCount,
    conflictCount: conflicts.length,
  };
}

export interface WeeklyWorkloadSummary {
  totalTasks: number;
  totalMinutes: number;
  completedTasks: number;
  overloadedDaysCount: number;
  overloadedDates: string[];
  missingDurationsTotal: number;
  totalTimeConflicts: number;
  dayWorkloads: Record<string, DayWorkloadSummary>;
}

/**
 * Calculate complete weekly workload summary for 7 dates
 */
export function calculateWeeklyWorkload(
  weekDates: string[],
  allTasks: Task[],
  dailyAvailabilityMinutes: number = 480
): WeeklyWorkloadSummary {
  const dayWorkloads: Record<string, DayWorkloadSummary> = {};
  const overloadedDates: string[] = [];
  let totalTasks = 0;
  let totalMinutes = 0;
  let completedTasks = 0;
  let missingDurationsTotal = 0;
  let totalTimeConflicts = 0;

  for (const date of weekDates) {
    const tasksForDay = allTasks.filter((t) => t.scheduledDate === date);
    const daySummary = calculateDayWorkload(date, tasksForDay, dailyAvailabilityMinutes);
    dayWorkloads[date] = daySummary;

    totalTasks += daySummary.taskCount;
    totalMinutes += daySummary.totalMinutes;
    missingDurationsTotal += daySummary.missingDurationCount;
    totalTimeConflicts += daySummary.conflictCount;

    if (daySummary.isOverloaded) {
      overloadedDates.push(date);
    }

    const completedOnDay = tasksForDay.filter((t) => t.status === 'completed').length;
    completedTasks += completedOnDay;
  }

  return {
    totalTasks,
    totalMinutes,
    completedTasks,
    overloadedDaysCount: overloadedDates.length,
    overloadedDates,
    missingDurationsTotal,
    totalTimeConflicts,
    dayWorkloads,
  };
}
