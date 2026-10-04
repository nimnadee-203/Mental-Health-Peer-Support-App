import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from './authStore';

export interface VolunteerApplication {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export async function applyForVolunteer(reason: string): Promise<VolunteerApplication> {
  const token = getAuthToken();
  const response = await fetch(`${COMMUNITY_API_BASE}/volunteer/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ reason }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to submit volunteer application.');
  }

  return data.application;
}

export async function getVolunteerStatus(): Promise<VolunteerApplication | null> {
  const token = getAuthToken();
  const response = await fetch(`${COMMUNITY_API_BASE}/volunteer/my-status`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch application status.');
  }

  return data.application;
}

export async function getVolunteerApplications(): Promise<VolunteerApplication[]> {
  const token = getAuthToken();
  const response = await fetch(`${COMMUNITY_API_BASE}/volunteer/applications`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch volunteer applications.');
  }

  return data.applications || [];
}

export async function approveVolunteerApplication(id: string): Promise<VolunteerApplication> {
  const token = getAuthToken();
  const response = await fetch(`${COMMUNITY_API_BASE}/volunteer/applications/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to approve application.');
  }

  return data.application;
}

export async function rejectVolunteerApplication(id: string): Promise<VolunteerApplication> {
  const token = getAuthToken();
  const response = await fetch(`${COMMUNITY_API_BASE}/volunteer/applications/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to reject application.');
  }

  return data.application;
}

