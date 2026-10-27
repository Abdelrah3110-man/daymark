import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelInfo,
  getXpRequiredForLevel,
  XP_REWARDS,
} from '../constants/xp-rules';

test('getXpRequiredForLevel increases smoothly', () => {
  assert.equal(getXpRequiredForLevel(1), 0);
  assert.equal(getXpRequiredForLevel(2), 50);
  assert.equal(getXpRequiredForLevel(3), 150);
  assert.equal(getXpRequiredForLevel(4), 300);
  assert.equal(getXpRequiredForLevel(5), 500);
});

test('calculateLevelInfo returns correct level, progress percent, and titles', () => {
  const level1 = calculateLevelInfo(0);
  assert.equal(level1.level, 1);
  assert.equal(level1.title, 'Initiate');
  assert.equal(level1.progressPercent, 0);

  const level2 = calculateLevelInfo(75);
  assert.equal(level2.level, 2);
  assert.equal(level2.title, 'Apprentice');
  assert.equal(level2.progressPercent, 25);

  const level3 = calculateLevelInfo(150);
  assert.equal(level3.level, 3);
  assert.equal(level3.title, 'Practitioner');
  assert.equal(level3.progressPercent, 0);
});

test('XP rewards match product rules', () => {
  assert.equal(XP_REWARDS.TASK_DIFFICULTY.light, 5);
  assert.equal(XP_REWARDS.TASK_DIFFICULTY.medium, 10);
  assert.equal(XP_REWARDS.TASK_DIFFICULTY.hard, 20);
  assert.equal(XP_REWARDS.DAILY_PRIORITY_ALL_COMPLETED, 10);
  assert.equal(XP_REWARDS.WEEKLY_REVIEW_COMPLETED, 15);
  assert.equal(XP_REWARDS.HABIT_COMPLETED, 5);
});
