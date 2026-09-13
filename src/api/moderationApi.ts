import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from './authStore';

export type ModerationStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface ModerationReport {
  _id: string;
  category: string;
  reasonNote?: string;
  targetContentPreview?: string;
  targetId: string;
  targetAuthor?: string;
  targetAuthorId?: string;
  status: ModerationStatus;
  createdAt: string;
}

export interface ModerationStats {
  pending: number;
  under_review: number;
  resolved: number;
  dismissed: number;
  hiddenPosts: number;
}

export interface ModerationUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
}

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

export const getModerationStats = () =>
  request<{ stats: ModerationStats }>('/moderation/stats');

export const getModerationReports = (status = 'all') =>
  request<{ reports: ModerationReport[] }>(
    `/moderation/reports${status === 'all' ? '' : `?status=${status}`}`,
  );

export const updateModerationReport = (id: string, status: ModerationStatus) =>
  request<{ report: ModerationReport }>(`/moderation/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const moderatePost = (
  id: string,
  action: 'hide' | 'restore',
  reportId?: string,
) =>
  request(`/moderation/posts/${id}/${action}`, {
    method: 'PATCH',
    body: JSON.stringify({ reportId }),
  });

export const getModerationUsers = () =>
  request<{ users: ModerationUser[] }>('/moderation/users');

export const updateUserRole = (
  id: string,
  role: ModerationUser['role'],
) =>
  request<{ user: ModerationUser }>(`/moderation/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

export const warnUser = (userId: string, reason: string) =>
  request(`/moderation/users/${userId}/warn`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });