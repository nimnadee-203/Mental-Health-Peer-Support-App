import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthUserId } from './authStore';

export interface FeelingEntry {
  id: string;
  mood: string;
  emoji?: string;
  icon?: string;
  bg?: string;
  border?: string;
  text?: string;
  iconColor?: string;
  note?: string;
  tag?: string;
  communityName?: string;
  timestamp: string;
}

const getStorageKey = (): string => {
  const userId = getAuthUserId() || 'guest';
  return `@user_feelings_${userId}`;
};

/**
 * Save a new feeling check-in entry to persistent local storage.
 */
export async function saveFeelingEntry(
  entry: Omit<FeelingEntry, 'id' | 'timestamp'>
): Promise<FeelingEntry> {
  const newEntry: FeelingEntry = {
    ...entry,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const key = getStorageKey();
    const raw = await AsyncStorage.getItem(key);
    const existing: FeelingEntry[] = raw ? JSON.parse(raw) : [];
    const updated = [newEntry, ...existing].slice(0, 80); // Keep last 80 check-ins
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save feeling entry to storage:', err);
  }

  return newEntry;
}

/**
 * Fetch all feeling check-in entries for the current user.
 */
export async function getFeelingEntries(): Promise<FeelingEntry[]> {
  try {
    const key = getStorageKey();
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed: FeelingEntry[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read feeling entries from storage:', err);
    return [];
  }
}

/**
 * Delete a specific feeling entry by ID.
 */
export async function deleteFeelingEntry(id: string): Promise<void> {
  try {
    const key = getStorageKey();
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const existing: FeelingEntry[] = JSON.parse(raw);
    const filtered = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to delete feeling entry:', err);
  }
}

/**
 * Clear all feeling history for the current user.
 */
export async function clearFeelingEntries(): Promise<void> {
  try {
    const key = getStorageKey();
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn('Failed to clear feeling entries:', err);
  }
}
