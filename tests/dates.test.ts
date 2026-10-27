import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateKey,
  parseDateKey,
  getWeekStartDate,
  getWeekDates,
  shiftWeek,
  formatDurationMinutes,
} from '../utils/dates';

test('formatDateKey and parseDateKey roundtrip correctly', () => {
  const d = new Date(2026, 9, 27);
  const key = formatDateKey(d);
  assert.equal(key, '2026-10-27');

  const parsed = parseDateKey(key);
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 9);
  assert.equal(parsed.getDate(), 27);
});

test('getWeekStartDate handles Sunday, Monday, and Saturday week start settings', () => {
  const sundayStart = getWeekStartDate('2026-10-27', 0);
  assert.equal(sundayStart, '2026-10-25');

  const mondayStart = getWeekStartDate('2026-10-27', 1);
  assert.equal(mondayStart, '2026-10-26');

  const saturdayStart = getWeekStartDate('2026-10-27', 6);
  assert.equal(saturdayStart, '2026-10-24');
});

test('getWeekDates produces exactly 7 consecutive dates', () => {
  const dates = getWeekDates('2026-10-25');
  assert.equal(dates.length, 7);
  assert.deepEqual(dates, [
    '2026-10-25',
    '2026-10-26',
    '2026-10-27',
    '2026-10-28',
    '2026-10-29',
    '2026-10-30',
    '2026-10-31',
  ]);
});

test('shiftWeek moves back and forward by weeks', () => {
  const nextWeek = shiftWeek('2026-10-25', 1);
  assert.equal(nextWeek, '2026-11-01');

  const prevWeek = shiftWeek('2026-10-25', -1);
  assert.equal(prevWeek, '2026-10-18');
});

test('formatDurationMinutes formats correctly', () => {
  assert.equal(formatDurationMinutes(0), '0m');
  assert.equal(formatDurationMinutes(45), '45m');
  assert.equal(formatDurationMinutes(60), '1h');
  assert.equal(formatDurationMinutes(90), '1h 30m');
  assert.equal(formatDurationMinutes(150), '2h 30m');
});
