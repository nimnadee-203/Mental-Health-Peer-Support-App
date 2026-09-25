import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from './authStore';

export type JournalMoodId = 'great' | 'good' | 'okay' | 'low' | 'stressed';
export type JournalFocusId = 'clear' | 'gratitude' | 'feelings' | 'plan';

export type JournalEntry = {
  _id: string;
  mood: JournalMoodId;
  focus: JournalFocusId;
  answers: string[];
  tinyWin: string;
  createdAt: string;
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (path: string, options?: RequestInit) => {
  const response = await fetch(`${COMMUNITY_API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers || {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Could not save your journal entry.');
  }
  return data;
};

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const data = await request('/journals');
  return data.entries;
}

export async function createJournalEntry(entry: {
  mood: JournalMoodId;
  focus: JournalFocusId;
  answers: string[];
  tinyWin: string;
}): Promise<JournalEntry> {
  const data = await request('/journals', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
  return data.entry;
}
