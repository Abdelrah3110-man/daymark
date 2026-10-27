import AsyncStorage from '@react-native-async-storage/async-storage';

export const SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'daymark:schema_version',
  SETTINGS: 'daymark:settings',
  TASKS: 'daymark:tasks',
  PLANNING: 'daymark:planning',
  GOALS: 'daymark:goals',
  HABITS: 'daymark:habits',
  NOTES: 'daymark:notes',
  FOCUS: 'daymark:focus',
  XP: 'daymark:xp',
  REVIEWS: 'daymark:reviews',
} as const;

export interface StorageResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export async function saveItem<T>(key: string, value: T): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[Daymark Persistence] Failed to save key "${key}":`, error);
    return false;
  }
}

export async function loadItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch (error) {
    console.error(`[Daymark Persistence] Failed to load key "${key}", falling back to default:`, error);
    return defaultValue;
  }
}

export async function clearAllDaymarkData(): Promise<boolean> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const daymarkKeys = allKeys.filter((k) => k.startsWith('daymark:'));
    if (daymarkKeys.length > 0) {
      await AsyncStorage.multiRemove(daymarkKeys);
    }
    return true;
  } catch (error) {
    console.error('[Daymark Persistence] Failed to clear daymark data:', error);
    return false;
  }
}

export async function exportAllDaymarkData(): Promise<string> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const daymarkKeys = allKeys.filter((k) => k.startsWith('daymark:'));
    const pairs = await AsyncStorage.multiGet(daymarkKeys);
    
    const dump: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      appName: 'Daymark',
    };

    for (const [key, val] of pairs) {
      if (val) {
        try {
          dump[key] = JSON.parse(val);
        } catch {
          dump[key] = val;
        }
      }
    }

    return JSON.stringify(dump, null, 2);
  } catch (error) {
    console.error('[Daymark Persistence] Export failed:', error);
    throw error;
  }
}
