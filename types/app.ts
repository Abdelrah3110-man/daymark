export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Workout' | 'Project' | string;
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'light' | 'medium' | 'hard';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface PostponementRecord {
  fromDate: string;
  toDate: string;
  postponedAt: string;
  reason?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  estimatedDuration: number; // in minutes
  dueAt?: string; // ISO string or YYYY-MM-DD HH:mm
  status: TaskStatus;
  goalId?: string;
  isDailyPriority: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  postponementCount: number;
  postponementHistory?: PostponementRecord[];
}

export type PlanStatus = 'draft' | 'prepared';

export interface WeeklyPlan {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (start of week based on weekStartDay)
  status: PlanStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
}

export type SyncStatus = 'synced' | 'customized' | 'conflict' | 'outdated';

export interface DailyPlan {
  id: string;
  weeklyPlanId: string;
  date: string; // YYYY-MM-DD
  sourceRevision: number;
  isCustomized: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTaskOverride {
  id: string;
  dailyPlanId: string;
  taskId: string;
  overriddenFields: Partial<Pick<Task, 'scheduledTime' | 'estimatedDuration' | 'priority' | 'isDailyPriority' | 'orderIndex' | 'scheduledDate'>>;
  updatedAt: string;
}

export interface PlanningConflict {
  id: string;
  taskId: string;
  dailyPlanDate: string;
  taskTitle: string;
  fieldName: 'scheduledTime' | 'estimatedDuration' | 'priority' | 'isDailyPriority' | 'scheduledDate';
  weeklyValue: any;
  dailyValue: any;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  targetMetricValue?: number;
  currentMetricValue?: number;
  metricUnit?: string;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  targetDaysPerWeek: number;
  color?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface HabitOccurrence {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linkedTaskId?: string;
  linkedGoalId?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  actualDurationSeconds: number;
  startTime: string; // ISO
  endTime?: string; // ISO
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  reflectionNote?: string;
  completedTask: boolean;
}

export type XPSourceType =
  | 'task_completion'
  | 'daily_priority_bonus'
  | 'weekly_review_bonus'
  | 'habit_completion'
  | 'focus_session';

export interface XPTransaction {
  id: string;
  sourceType: XPSourceType;
  sourceId: string;
  reason: string;
  amount: number;
  createdAt: string; // ISO
}

export interface UserSettings {
  displayName: string;
  weekStartDay: 0 | 1 | 6; // 0=Sunday, 1=Monday, 6=Saturday
  defaultFocusMinutes: number;
  dailyAvailabilityMinutes: number; // default 480 mins (8 hours)
  dailyChallengeText?: string;
  dailyChallengeCompletedDate?: string; // YYYY-MM-DD
  notificationsEnabled: boolean;
  lastActiveDate?: string; // YYYY-MM-DD
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  completedAt: string;
  plannedTasksCount: number;
  completedTasksCount: number;
  totalFocusMinutes: number;
  habitConsistencyRate: number;
  nextWeekGoal: string;
  reflectionNotes: string;
}

export interface DayWorkloadSummary {
  date: string;
  taskCount: number;
  totalMinutes: number;
  availabilityMinutes: number;
  isOverloaded: boolean;
  missingDurationCount: number;
  priorityCount: number;
  conflictCount: number;
}

