import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from './authStore';

export type MemberStatus = 'active' | 'pending';
export type ManagedMemberRole = 'user' | 'moderator' | 'admin' | 'professional';

export type ManagedMember = {
  id: string;
  userId: string;
  communityId: string;
  communityName: string;
  fullName: string;
  email: string;
  role: ManagedMemberRole;
  joinDate: string;
  status: MemberStatus;
};

export type MemberStats = {
  totalMembers: number;
  moderators: number;
  pendingRequests: number;
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

export const getManagedMembers = () =>
  request<{ members: ManagedMember[]; stats: MemberStats }>('/moderation/members');

export const approveMemberRequest = (communityId: string, userId: string) =>
  request<{ success: boolean }>(`/moderation/members/${communityId}/${userId}/approve`, {
    method: 'POST',
  });

export const rejectMemberRequest = (communityId: string, userId: string) =>
  request<{ success: boolean }>(`/moderation/members/${communityId}/${userId}/reject`, {
    method: 'POST',
  });

export const removeMember = (communityId: string, userId: string) =>
  request<{ success: boolean }>(`/moderation/members/${communityId}/${userId}`, {
    method: 'DELETE',
  });

export const makeModerator = (userId: string) =>
  request<{ user: { _id: string; fullName: string; email: string; role: string } }>(
    `/moderation/users/${userId}/role`,
    {
      method: 'PATCH',
      body: JSON.stringify({ role: 'moderator' }),
    },
  );
