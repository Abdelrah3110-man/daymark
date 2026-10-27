import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeStringToMinutes,
  findTimeConflicts,
  calculateDayWorkload,
} from '../utils/workload';
import type { Task } from '../types/app';

test('timeStringToMinutes converts HH:mm to minutes', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('09:30'), 570);
  assert.equal(timeStringToMinutes('14:15'), 855);
  assert.equal(timeStringToMinutes('invalid'), null);
});

test('findTimeConflicts identifies overlapping timed tasks', () => {
  const taskA: Task = {
    id: 't1',
    title: 'Design Session',
    category: 'Work',
    priority: 'high',
    difficulty: 'medium',
    scheduledDate: '2026-10-27',
    scheduledTime: '10:00',
    estimatedDuration: 60,
    status: 'pending',
    isDailyPriority: true,
    orderIndex: 0,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const taskB: Task = {
    id: 't2',
    title: 'Architecture Review',
    category: 'Work',
    priority: 'medium',
    difficulty: 'hard',
    scheduledDate: '2026-10-27',
    scheduledTime: '10:30',
    estimatedDuration: 45,
    status: 'pending',
    isDailyPriority: false,
    orderIndex: 1,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const conflicts = findTimeConflicts([taskA, taskB]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].taskA.id, 't1');
  assert.equal(conflicts[0].taskB.id, 't2');
});

test('calculateDayWorkload correctly flags overloaded day', () => {
  const task1: Task = {
    id: 't1',
    title: 'Deep Coding',
    category: 'Work',
    priority: 'high',
    difficulty: 'hard',
    scheduledDate: '2026-10-27',
    estimatedDuration: 300,
    status: 'pending',
    isDailyPriority: true,
    orderIndex: 0,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const task2: Task = {
    id: 't2',
    title: 'Documentation',
    category: 'Work',
    priority: 'medium',
    difficulty: 'medium',
    scheduledDate: '2026-10-27',
    estimatedDuration: 240,
    status: 'pending',
    isDailyPriority: false,
    orderIndex: 1,
    createdAt: '',
    updatedAt: '',
    postponementCount: 0,
  };

  const workload = calculateDayWorkload('2026-10-27', [task1, task2], 480);
  assert.equal(workload.totalMinutes, 540);
  assert.equal(workload.isOverloaded, true);
  assert.equal(workload.priorityCount, 1);
  assert.equal(workload.taskCount, 2);
});
