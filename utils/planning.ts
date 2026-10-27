import type { Task, DailyPlan, DailyTaskOverride, PlanningConflict, WeeklyPlan } from '@/types/app';

/**
 * Resolves the effective task attributes for a given daily view by applying
 * any day-specific overrides on top of the canonical task record.
 */
export function getEffectiveTask(task: Task, override?: DailyTaskOverride): Task {
  if (!override || !override.overriddenFields) {
    return task;
  }

  return {
    ...task,
    ...override.overriddenFields,
  };
}

/**
 * Detects conflicts between current canonical task data and day-specific overrides.
 * A conflict occurs when a daily preview has an explicit override on a task field
 * that differs from the weekly/canonical plan.
 */
export function detectPlanningConflicts(
  tasks: Task[],
  dailyPlans: DailyPlan[],
  overrides: DailyTaskOverride[]
): PlanningConflict[] {
  const conflicts: PlanningConflict[] = [];

  for (const override of overrides) {
    const dailyPlan = dailyPlans.find((p) => p.id === override.dailyPlanId);
    if (!dailyPlan || dailyPlan.syncStatus !== 'conflict') continue;

    const task = tasks.find((t) => t.id === override.taskId);
    if (!task) continue;

    const fields = Object.keys(override.overriddenFields) as (keyof typeof override.overriddenFields)[];
    for (const field of fields) {
      const weeklyVal = (task as any)[field];
      const dailyVal = (override.overriddenFields as any)[field];

      if (weeklyVal !== undefined && dailyVal !== undefined && weeklyVal !== dailyVal) {
        conflicts.push({
          id: `${override.id}_${field}`,
          taskId: task.id,
          dailyPlanDate: dailyPlan.date,
          taskTitle: task.title,
          fieldName: field as any,
          weeklyValue: weeklyVal,
          dailyValue: dailyVal,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Validates a weekly plan before preview generation.
 * Returns warnings and notice issues without blocking the user.
 */
export function validateWeeklyPlan(
  weekDates: string[],
  tasks: Task[],
  dailyAvailabilityMinutes: number = 480
): { warnings: string[]; info: string[]; hasOverloadedDays: boolean } {
  const warnings: string[] = [];
  const info: string[] = [];
  let hasOverloadedDays = false;

  const plannedTasks = tasks.filter((t) => weekDates.includes(t.scheduledDate) && t.status !== 'cancelled');

  if (plannedTasks.length === 0) {
    info.push('No tasks planned for this week yet. You can still generate previews.');
  }

  for (const date of weekDates) {
    const dayTasks = plannedTasks.filter((t) => t.scheduledDate === date);
    const dayMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);

    if (dayMinutes > dailyAvailabilityMinutes) {
      hasOverloadedDays = true;
      warnings.push(`${date} exceeds availability (${Math.round(dayMinutes / 60)}h planned vs ${Math.round(dailyAvailabilityMinutes / 60)}h limit).`);
    }

    const priorityCount = dayTasks.filter((t) => t.isDailyPriority).length;
    if (priorityCount > 3) {
      warnings.push(`${date} has ${priorityCount} primary priorities (recommended maximum is 3).`);
    }
  }

  return { warnings, info, hasOverloadedDays };
}
