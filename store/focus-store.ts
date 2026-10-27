import { create } from 'zustand';
import { FocusSession } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';
import { useXPStore } from './xp-store';
import { useTaskStore } from './task-store';

interface FocusStorageData {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  targetEndTimeMs: number | null;
  pausedRemainingSeconds: number | null;
}

interface FocusState {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  status: 'idle' | 'running' | 'paused' | 'completed';
  targetEndTimeMs: number | null;
  pausedRemainingSeconds: number | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  startSession: (params: { taskId?: string; taskTitle?: string; durationMinutes: number }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  cancelSession: () => void;
  finishSession: (reflectionNote?: string, markTaskComplete?: boolean) => void;
  getRemainingSeconds: () => number;

  clearFocusData: () => Promise<void>;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  sessions: [],
  activeSession: null,
  status: 'idle',
  targetEndTimeMs: null,
  pausedRemainingSeconds: null,
  isHydrated: false,

  hydrate: async () => {
    const saved = await loadItem<FocusStorageData>(STORAGE_KEYS.FOCUS, {
      sessions: [],
      activeSession: null,
      targetEndTimeMs: null,
      pausedRemainingSeconds: null,
    });

    let currentStatus: 'idle' | 'running' | 'paused' = 'idle';
    let targetEnd = saved.targetEndTimeMs;
    let pausedRemaining = saved.pausedRemainingSeconds;

    if (saved.activeSession) {
      if (saved.pausedRemainingSeconds !== null) {
        currentStatus = 'paused';
      } else if (saved.targetEndTimeMs) {
        const remaining = Math.round((saved.targetEndTimeMs - Date.now()) / 1000);
        if (remaining > 0) {
          currentStatus = 'running';
        } else {
          // Timer finished while app was closed!
          currentStatus = 'paused';
          pausedRemaining = 0;
        }
      }
    }

    set({
      sessions: saved.sessions || [],
      activeSession: saved.activeSession,
      status: currentStatus,
      targetEndTimeMs: targetEnd,
      pausedRemainingSeconds: pausedRemaining,
      isHydrated: true,
    });
  },

  startSession: ({ taskId, taskTitle, durationMinutes }) => {
    const nowMs = Date.now();
    const durationSeconds = durationMinutes * 60;
    const targetEnd = nowMs + durationSeconds * 1000;

    const newSession: FocusSession = {
      id: `focus_${nowMs}_${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      taskTitle: taskTitle || (taskId ? 'Planned Task' : 'Focus Session'),
      durationMinutes,
      actualDurationSeconds: 0,
      startTime: new Date().toISOString(),
      status: 'active',
      completedTask: false,
    };

    set({
      activeSession: newSession,
      status: 'running',
      targetEndTimeMs: targetEnd,
      pausedRemainingSeconds: null,
    });

    saveItem(STORAGE_KEYS.FOCUS, {
      sessions: get().sessions,
      activeSession: newSession,
      targetEndTimeMs: targetEnd,
      pausedRemainingSeconds: null,
    });
  },

  pauseSession: () => {
    const { status, targetEndTimeMs, activeSession } = get();
    if (status !== 'running' || !targetEndTimeMs || !activeSession) return;

    const remainingSecs = Math.max(0, Math.round((targetEndTimeMs - Date.now()) / 1000));

    set({
      status: 'paused',
      pausedRemainingSeconds: remainingSecs,
      targetEndTimeMs: null,
    });

    saveItem(STORAGE_KEYS.FOCUS, {
      sessions: get().sessions,
      activeSession,
      targetEndTimeMs: null,
      pausedRemainingSeconds: remainingSecs,
    });
  },

  resumeSession: () => {
    const { status, pausedRemainingSeconds, activeSession } = get();
    if (status !== 'paused' || pausedRemainingSeconds === null || !activeSession) return;

    const targetEnd = Date.now() + pausedRemainingSeconds * 1000;

    set({
      status: 'running',
      targetEndTimeMs: targetEnd,
      pausedRemainingSeconds: null,
    });

    saveItem(STORAGE_KEYS.FOCUS, {
      sessions: get().sessions,
      activeSession,
      targetEndTimeMs: targetEnd,
      pausedRemainingSeconds: null,
    });
  },

  cancelSession: () => {
    const { activeSession, sessions } = get();
    if (activeSession) {
      const abandonedSession: FocusSession = {
        ...activeSession,
        status: 'abandoned',
        endTime: new Date().toISOString(),
      };
      const updated = [abandonedSession, ...sessions];
      set({
        sessions: updated,
        activeSession: null,
        status: 'idle',
        targetEndTimeMs: null,
        pausedRemainingSeconds: null,
      });

      saveItem(STORAGE_KEYS.FOCUS, {
        sessions: updated,
        activeSession: null,
        targetEndTimeMs: null,
        pausedRemainingSeconds: null,
      });
    } else {
      set({ status: 'idle', targetEndTimeMs: null, pausedRemainingSeconds: null });
    }
  },

  finishSession: (reflectionNote, markTaskComplete) => {
    const { activeSession, sessions } = get();
    if (!activeSession) return;

    const remaining = get().getRemainingSeconds();
    const plannedSecs = activeSession.durationMinutes * 60;
    const actualSecs = Math.max(0, plannedSecs - remaining);

    const completedSession: FocusSession = {
      ...activeSession,
      status: 'completed',
      actualDurationSeconds: actualSecs,
      endTime: new Date().toISOString(),
      reflectionNote: reflectionNote?.trim() || undefined,
      completedTask: Boolean(markTaskComplete && activeSession.taskId),
    };

    const updated = [completedSession, ...sessions];

    set({
      sessions: updated,
      activeSession: null,
      status: 'idle',
      targetEndTimeMs: null,
      pausedRemainingSeconds: null,
    });

    saveItem(STORAGE_KEYS.FOCUS, {
      sessions: updated,
      activeSession: null,
      targetEndTimeMs: null,
      pausedRemainingSeconds: null,
    });

    // Award XP: 1 XP per 5 minutes of focused time
    const focusMinutes = Math.floor(actualSecs / 60);
    const xpAmount = Math.max(1, Math.floor(focusMinutes / 5));
    if (xpAmount > 0) {
      useXPStore.getState().awardXP(
        'focus_session',
        completedSession.id,
        xpAmount,
        `Deep focus session (${focusMinutes}m)`
      );
    }

    // Optionally complete the associated task
    if (markTaskComplete && activeSession.taskId) {
      useTaskStore.getState().completeTask(activeSession.taskId);
    }
  },

  getRemainingSeconds: () => {
    const { status, targetEndTimeMs, pausedRemainingSeconds, activeSession } = get();
    if (!activeSession) return 0;
    if (status === 'paused') {
      return pausedRemainingSeconds ?? 0;
    }
    if (status === 'running' && targetEndTimeMs) {
      return Math.max(0, Math.round((targetEndTimeMs - Date.now()) / 1000));
    }
    return activeSession.durationMinutes * 60;
  },

  clearFocusData: async () => {
    set({
      sessions: [],
      activeSession: null,
      status: 'idle',
      targetEndTimeMs: null,
      pausedRemainingSeconds: null,
    });
    await saveItem(STORAGE_KEYS.FOCUS, {
      sessions: [],
      activeSession: null,
      targetEndTimeMs: null,
      pausedRemainingSeconds: null,
    });
  },
}));
