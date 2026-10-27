/**
 * Calendar and Date Utilities for Daymark
 * All calendar math operates on local dates to prevent UTC shifting issues.
 */

/**
 * Format a Date object to 'YYYY-MM-DD'
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a 'YYYY-MM-DD' string safely into a local Date at 00:00:00
 */
export function parseDateKey(key: string): Date {
  const [yearStr, monthStr, dayStr] = key.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Get today's local date key
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Given any date, find the start date (YYYY-MM-DD) of its week
 * weekStartDay: 0 = Sunday, 1 = Monday, 6 = Saturday
 */
export function getWeekStartDate(date: Date | string, weekStartDay: 0 | 1 | 6 = 0): string {
  const d = typeof date === 'string' ? parseDateKey(date) : new Date(date.getTime());
  d.setHours(0, 0, 0, 0);

  const dayOfWeek = d.getDay(); // 0 (Sun) to 6 (Sat)
  let diff = dayOfWeek - weekStartDay;
  if (diff < 0) {
    diff += 7;
  }

  d.setDate(d.getDate() - diff);
  return formatDateKey(d);
}

/**
 * Generate 7 consecutive date keys for a week starting at weekStartDateKey
 */
export function getWeekDates(weekStartDateKey: string): string[] {
  const start = parseDateKey(weekStartDateKey);
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    dates.push(formatDateKey(cur));
  }

  return dates;
}

/**
 * Shift week by +/- weeks
 */
export function shiftWeek(weekStartDateKey: string, weeksDelta: number): string {
  const start = parseDateKey(weekStartDateKey);
  start.setDate(start.getDate() + weeksDelta * 7);
  return formatDateKey(start);
}

/**
 * Formats a date key to a human readable short label, e.g. "Mon, Oct 27"
 */
export function formatDayShort(dateKey: string): string {
  const d = parseDateKey(dateKey);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${weekday}, ${month} ${day}`;
}

/**
 * Formats a date key to weekday name, e.g. "Monday"
 */
export function formatWeekdayFull(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Formats a date key to weekday short name, e.g. "Mon"
 */
export function formatWeekdayShort(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Formats a date key to a full date label, e.g. "Monday, October 27, 2026"
 */
export function formatDayFull(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a week range, e.g. "Oct 25 – Oct 31, 2026"
 */
export function formatWeekRange(weekStartDateKey: string): string {
  const start = parseDateKey(weekStartDateKey);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

/**
 * Formats minutes into "1h 30m" or "45m"
 */
export function formatDurationMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Check if a date string is valid YYYY-MM-DD
 */
export function isValidDateKey(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = parseDateKey(str);
  return !isNaN(d.getTime());
}

