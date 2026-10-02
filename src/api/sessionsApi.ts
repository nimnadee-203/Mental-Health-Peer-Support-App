import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from './authStore';

export type SessionGroup = {
  _id: string;
  name: string;
  emoji?: string;
};

export type OnlineSession = {
  _id: string;
  title: string;
  description: string;
  group: SessionGroup;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  hostName: string;
  host?: { fullName?: string; email?: string };
};

export type SessionPayload = {
  title: string;
  description: string;
  group: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${COMMUNITY_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

export const getSessions = () => request<OnlineSession[]>('/sessions');

export const getSession = (id: string) => request<OnlineSession>(`/sessions/${id}`);

export const createSession = (payload: SessionPayload) =>
  request<OnlineSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateSession = (id: string, payload: Partial<SessionPayload>) =>
  request<OnlineSession>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteSession = (id: string) =>
  request<{ success: boolean }>(`/sessions/${id}`, { method: 'DELETE' });
