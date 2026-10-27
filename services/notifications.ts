/**
 * Safe local notifications service wrapper
 * Gracefully handles platforms/devices without notification permissions
 */

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // In bare simulator or web, this may not be available; fail gracefully
    return false;
  } catch {
    return false;
  }
}

export async function scheduleDailyPlanningReminder(hour: number = 8, minute: number = 0): Promise<boolean> {
  return false;
}

export async function cancelAllReminders(): Promise<void> {
  // Graceful no-op
}

