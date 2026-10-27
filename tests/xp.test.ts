import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelInfo,
  getXpRequiredForLevel,
  XP_REWARDS,
  getMedalsWithStatus,
  MEDALS,
} from '../constants/xp-rules';
import { isAvatarUnlocked, getAvatarById, AVATARS } from '../constants/avatars';

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

test('getMedalsWithStatus unlocks medals according to cumulative XP thresholds', () => {
  // At 0 XP: all locked
  const atZero = getMedalsWithStatus(0);
  assert.equal(atZero.every((m) => !m.isUnlocked), true);

  // At 50 XP: Bronze Initiate unlocked
  const atFifty = getMedalsWithStatus(50);
  assert.equal(atFifty.find((m) => m.id === 'medal_bronze')?.isUnlocked, true);
  assert.equal(atFifty.find((m) => m.id === 'medal_iron')?.isUnlocked, false);

  // At 650 XP: Bronze, Iron, Silver, Gold unlocked; Platinum locked
  const at650 = getMedalsWithStatus(650);
  assert.equal(at650.find((m) => m.id === 'medal_gold')?.isUnlocked, true);
  assert.equal(at650.find((m) => m.id === 'medal_platinum')?.isUnlocked, false);
});

test('Avatar system correctly handles starter vs XP-locked avatars', () => {
  // Starter avatars are unlocked at 0 XP
  assert.equal(isAvatarUnlocked('fox', 0), true);
  assert.equal(isAvatarUnlocked('panda', 0), true);
  assert.equal(isAvatarUnlocked('lion', 0), true);
  assert.equal(isAvatarUnlocked('spark', 0), true);

  // XP-locked avatars
  assert.equal(isAvatarUnlocked('owl', 50), false);
  assert.equal(isAvatarUnlocked('owl', 100), true);
  assert.equal(isAvatarUnlocked('rocket', 200), false);
  assert.equal(isAvatarUnlocked('rocket', 300), true);
  assert.equal(isAvatarUnlocked('cosmos', 2499), false);
  assert.equal(isAvatarUnlocked('cosmos', 2500), true);
});

