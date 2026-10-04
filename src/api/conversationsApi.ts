import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthUserId, getAuthToken } from './authStore';

export async function requestProfessionalSupport(): Promise<{ sentTo: number }> {
  const userId = getAuthUserId();
  if (!userId) {
    throw new Error('Please log in before requesting professional support.');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${COMMUNITY_API_BASE}/conversations/professional-support`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId,
      message: 'I would like professional mental health support. Please get in touch when available.',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || 'Failed to request professional support.');
  }

  return response.json();
}