import { API_BASE } from '../config/api';
import { getAuthToken } from './authStore';
import { UpdateProfilePayload, UserProfile } from '../types/user';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/profile/${userId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Could not fetch profile');
  }

  const data = await response.json();
  return data.user;
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/profile/${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Could not update profile');
  }

  const data = await response.json();
  return data.user;
}
