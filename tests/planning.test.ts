import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEffectiveTask,
  detectPlanningConflicts,
} from '../utils/planning';
import type { Task, DailyPlan, DailyTaskOverride } from '../types/app';

test('getEffectiveTask overlays day overrides without mutating the canonical task', () => {
  const canonicalTask: Task = {
    id: 't1',
    title: 'Implement Synchronization',
    category: 'Work',
    priority: 'medium',
    difficulty: 'hard',
    scheduledDate: '2026-10-27',
    scheduledTime: '09:00',
    estimatedDuration: 60,
    status: 'pending',
    isDailyPriority: false,
    orderIndex: 0,
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
    postponementCount: 0,
  };

  const override: DailyTaskOverride = {
    id: 'ovr1',
    dailyPlanId: 'dp_2026-10-27',
    taskId: 't1',
    overriddenFields: {
      scheduledTime: '14:00',
      estimatedDuration: 90,
      isDailyPriority: true,
    },
    updatedAt: '2026-10-26T12:00:00Z',
  };

  const effective = getEffectiveTask(canonicalTask, override);

  assert.equal(effective.scheduledTime, '14:00');
  assert.equal(effective.estimatedDuration, 90);
  assert.equal(effective.isDailyPriority, true);

  assert.equal(effective.id, 't1');
  assert.equal(effective.title, 'Implement Synchronization');
  assert.equal(effective.difficulty, 'hard');

  assert.equal(canonicalTask.scheduledTime, '09:00');
  assert.equal(canonicalTask.estimatedDuration, 60);
});

test('detectPlanningConflicts finds conflicting fields between weekly and daily customization', () => {
  const task: Task = {
    id: 't1',
    title: 'Draft Sprint Plan',
    category: 'Work',
    priority: 'high',
    difficulty: 'medium',
    scheduledDate: '2026-10-27',
    scheduledTime: '11:00',
    estimatedDuration: 45,
    status: 'pending',
    isDailyPriority: false,
    orderIndex: 0,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const dailyPlan: DailyPlan = {
    id: 'dp_2026-10-27',
    weeklyPlanId: 'wp_2026-10-25',
    date: '2026-10-27',
    sourceRevision: 1,
    isCustomized: true,
    syncStatus: 'conflict',
    createdAt: '',
    updatedAt: '',
  };

  const override: DailyTaskOverride = {
    id: 'ovr1',
    dailyPlanId: 'dp_2026-10-27',
    taskId: 't1',
    overriddenFields: {
      scheduledTime: '15:00',
    },
    updatedAt: '',
  };

  const conflicts = detectPlanningConflicts([task], [dailyPlan], [override]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].fieldName, 'scheduledTime');
  assert.equal(conflicts[0].weeklyValue, '11:00');
  assert.equal(conflicts[0].dailyValue, '15:00');
});

