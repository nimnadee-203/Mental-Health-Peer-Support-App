import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from './authStore';

export type DigitalDetoxCompletion = {
  day: number;
  completedAt: string;
  reflection?: string;
  mood?: '😣' | '😐' | '🙂' | '😌';
};

export type DigitalDetoxProgress = {
  userId: string;
  currentDay: number;
  completedDays: number[];
  startedAt: string;
  lastCompletedAt?: string;
  completed: boolean;
  history?: DigitalDetoxCompletion[];
};

const headers = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const requestJson = async (path: string, options?: RequestInit) => {
  const response = await fetch(`${COMMUNITY_API_BASE}${path}`, {
    ...options,
    headers: { ...headers(), ...(options?.headers || {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Could not save your challenge progress.');
  }
  return data;
};

export async function getDigitalDetoxProgress(): Promise<DigitalDetoxProgress | null> {
  const data = await requestJson('/digital-detox/progress');
  return data.progress;
}

export async function startDigitalDetox(): Promise<DigitalDetoxProgress> {
  const data = await requestJson('/digital-detox/start', { method: 'POST' });
  return data.progress;
}

export async function completeDigitalDetoxDay(
  day: number,
  reflection?: string,
  mood?: DigitalDetoxCompletion['mood'],
): Promise<DigitalDetoxProgress> {
  const data = await requestJson(`/digital-detox/day/${day}/complete`, {
    method: 'POST',
    body: JSON.stringify({ reflection, mood }),
  });
  return data.progress;
}

export async function getDigitalDetoxHistory(): Promise<DigitalDetoxCompletion[]> {
  const data = await requestJson('/digital-detox/history');
  return data.history;
}
