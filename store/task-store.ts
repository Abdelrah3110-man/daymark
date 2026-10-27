import { create } from 'zustand';
import { Task, TaskPriority, TaskDifficulty, TaskCategory } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';
import { useXPStore } from './xp-store';
import { XP_REWARDS } from '@/constants/xp-rules';

interface CreateTaskParams {
  title: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  estimatedDuration?: number; // minutes
  dueAt?: string;
  goalId?: string;
  isDailyPriority?: boolean;
}

interface TaskState {
  tasks: Task[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  createTask: (params: CreateTaskParams) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  reopenTask: (id: string) => void;
  postponeTask: (id: string, newDate: string, reason?: string) => void;
  toggleDailyPriority: (id: string) => { success: boolean; message?: string };
  reorderTasksForDay: (date: string, reorderedTaskIds: string[]) => void;
  getTasksForDate: (date: string) => Task[];
  clearTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isHydrated: false,

  hydrate: async () => {
    const saved = await loadItem<Task[]>(STORAGE_KEYS.TASKS, []);
    set({ tasks: saved, isHydrated: true });
  },

  createTask: (params) => {
    const dayTasks = get().tasks.filter((t) => t.scheduledDate === params.scheduledDate);
    const highestOrder = dayTasks.reduce((max, t) => Math.max(max, t.orderIndex || 0), -1);

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: params.title.trim(),
      description: params.description?.trim(),
      category: params.category || 'General',
      priority: params.priority || 'medium',
      difficulty: params.difficulty || 'medium',
      scheduledDate: params.scheduledDate,
      scheduledTime: params.scheduledTime || undefined,
      estimatedDuration: params.estimatedDuration ?? 30,
      dueAt: params.dueAt || undefined,
      status: 'pending',
      goalId: params.goalId || undefined,
      isDailyPriority: Boolean(params.isDailyPriority),
      orderIndex: highestOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postponementCount: 0,
      postponementHistory: [],
    };

    const updated = [...get().tasks, newTask];
    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
    return newTask;
  },

  updateTask: (id, updates) => {
    const prev = get().tasks.find((t) => t.id === id);
    if (!prev) return;

    let postponementUpdates = {};
    if (updates.scheduledDate && updates.scheduledDate !== prev.scheduledDate) {
      const history = prev.postponementHistory || [];
      const newRecord = {
        fromDate: prev.scheduledDate,
        toDate: updates.scheduledDate,
        postponedAt: new Date().toISOString(),
        reason: 'Date changed in editor',
      };
      postponementUpdates = {
        postponementCount: (prev.postponementCount || 0) + 1,
        postponementHistory: [...history, newRecord],
      };
    }

    const updated = get().tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          ...updates,
          ...postponementUpdates,
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });

    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
  },

  deleteTask: (id) => {
    const updated = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
  },

  completeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task || task.status === 'completed') return;

    const completedAt = new Date().toISOString();
    const updated = get().tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt,
          updatedAt: completedAt,
        };
      }
      return t;
    });

    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);

    // Deterministic XP reward for task completion
    const xpReward = XP_REWARDS.TASK_DIFFICULTY[task.difficulty] || 10;
    useXPStore.getState().awardXP(
      'task_completion',
      task.id,
      xpReward,
      `Completed ${task.difficulty} task: ${task.title}`
    );

    // Check if all daily priorities for this date are now completed
    const dayTasks = updated.filter((t) => t.scheduledDate === task.scheduledDate && t.status !== 'cancelled');
    const dayPriorities = dayTasks.filter((t) => t.isDailyPriority);
    if (dayPriorities.length > 0) {
      const allPrioritiesCompleted = dayPriorities.every((t) => t.status === 'completed');
      if (allPrioritiesCompleted) {
        useXPStore.getState().awardXP(
          'daily_priority_bonus',
          `daily_priorities_${task.scheduledDate}`,
          XP_REWARDS.DAILY_PRIORITY_ALL_COMPLETED,
          `Completed all daily priorities for ${task.scheduledDate}`
        );
      }
    }
  },

  reopenTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const updated = get().tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: 'pending' as const,
          completedAt: undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
  },

  postponeTask: (id, newDate, reason) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const history = task.postponementHistory || [];
    const newRecord = {
      fromDate: task.scheduledDate,
      toDate: newDate,
      postponedAt: new Date().toISOString(),
      reason: reason || 'Postponed to future date',
    };

    const updated = get().tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          scheduledDate: newDate,
          postponementCount: (t.postponementCount || 0) + 1,
          postponementHistory: [...history, newRecord],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
  },

  toggleDailyPriority: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return { success: false };

    if (!task.isDailyPriority) {
      // Check current count of priorities on this day
      const currentDayPriorities = get().tasks.filter(
        (t) => t.scheduledDate === task.scheduledDate && t.isDailyPriority && t.id !== id && t.status !== 'cancelled'
      );
      if (currentDayPriorities.length >= 3) {
        return {
          success: false,
          message: 'Maximum 3 primary priorities allowed per day for focused execution.',
        };
      }
    }

    const updated = get().tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          isDailyPriority: !t.isDailyPriority,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
    return { success: true };
  },

  reorderTasksForDay: (date, reorderedTaskIds) => {
    const updated = get().tasks.map((t) => {
      if (t.scheduledDate === date) {
        const newIndex = reorderedTaskIds.indexOf(t.id);
        if (newIndex !== -1) {
          return { ...t, orderIndex: newIndex, updatedAt: new Date().toISOString() };
        }
      }
      return t;
    });

    set({ tasks: updated });
    saveItem(STORAGE_KEYS.TASKS, updated);
  },

  getTasksForDate: (date) => {
    return get()
      .tasks.filter((t) => t.scheduledDate === date)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  clearTasks: async () => {
    set({ tasks: [] });
    await saveItem(STORAGE_KEYS.TASKS, []);
  },
}));

