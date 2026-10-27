import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHonestStats } from '../utils/statistics';
import type { Task, FocusSession, Habit, HabitOccurrence } from '../types/app';

test('calculateHonestStats produces genuine 0% and false hasEnoughData when no records exist', () => {
  const stats = calculateHonestStats({
    tasks: [],
    focusSessions: [],
    habits: [],
    habitOccurrences: [],
  });

  assert.equal(stats.totalTasks, 0);
  assert.equal(stats.completedTasks, 0);
  assert.equal(stats.completionRate, 0);
  assert.equal(stats.onTimeCompletionRate, 0);
  assert.equal(stats.totalFocusMinutes, 0);
  assert.equal(stats.focusSessionsCount, 0);
  assert.equal(stats.habitConsistencyRate, 0);
  assert.equal(stats.currentStreakDays, 0);
  assert.equal(stats.hasEnoughData, false);
});

test('calculateHonestStats computes accurate completion rate and on-time rate', () => {
  const taskA: Task = {
    id: 't1',
    title: 'Review PR',
    category: 'Work',
    priority: 'high',
    difficulty: 'medium',
    scheduledDate: '2026-10-27',
    dueAt: '2026-10-27T18:00:00Z',
    estimatedDuration: 45,
    status: 'completed',
    completedAt: '2026-10-27T16:00:00Z',
    isDailyPriority: true,
    orderIndex: 0,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const taskB: Task = {
    id: 't2',
    title: 'Submit Expense Report',
    category: 'Work',
    priority: 'medium',
    difficulty: 'light',
    scheduledDate: '2026-10-27',
    dueAt: '2026-10-27T12:00:00Z',
    estimatedDuration: 30,
    status: 'completed',
    completedAt: '2026-10-27T15:00:00Z',
    isDailyPriority: false,
    orderIndex: 1,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const taskC: Task = {
    id: 't3',
    title: 'Plan Next Sprint',
    category: 'Work',
    priority: 'low',
    difficulty: 'medium',
    scheduledDate: '2026-10-27',
    estimatedDuration: 60,
    status: 'pending',
    isDailyPriority: false,
    orderIndex: 2,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const stats = calculateHonestStats({
    tasks: [taskA, taskB, taskC],
    focusSessions: [],
    habits: [],
    habitOccurrences: [],
  });

  assert.equal(stats.totalTasks, 3);
  assert.equal(stats.completedTasks, 2);
  assert.equal(stats.completionRate, 67);
  assert.equal(stats.tasksWithDeadlinesCount, 2);
  assert.equal(stats.onTimeCompletedCount, 1);
  assert.equal(stats.onTimeCompletionRate, 50);
  assert.equal(stats.hasEnoughData, true);
});

