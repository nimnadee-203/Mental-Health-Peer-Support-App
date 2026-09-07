import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthUserId } from './authStore';
import {
  EmergencyType,
  EmergencyStatus,
  EmergencyRequest,
  TrustedContact,
} from '../types/emergency';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthUserId();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export async function createEmergencyRequest(
  type: EmergencyType,
  description: string,
): Promise<{ success: boolean; requestId: string; status: EmergencyStatus }> {
  const response = await fetch(`${COMMUNITY_API_BASE}/emergency`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ type, description }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to submit emergency request');
  }

  return response.json();
}

export async function getMyEmergencyRequests(): Promise<EmergencyRequest[]> {
  const response = await fetch(`${COMMUNITY_API_BASE}/emergency/my-requests`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to fetch emergency requests');
  }

  return response.json();
}

export async function updateEmergencyRequestStatus(
  id: string,
  status: EmergencyStatus,
): Promise<EmergencyRequest> {
  const response = await fetch(`${COMMUNITY_API_BASE}/emergency/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to update emergency request status');
  }

  return response.json();
}

export async function getTrustedContact(): Promise<TrustedContact | null> {
  const response = await fetch(`${COMMUNITY_API_BASE}/trusted-contact`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to fetch trusted contact');
  }

  const data = await response.json();
  return data.contact || null;
}

export async function createTrustedContact(contact: {
  name: string;
  phone: string;
  relationship: string;
}): Promise<TrustedContact> {
  const response = await fetch(`${COMMUNITY_API_BASE}/trusted-contact`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to create trusted contact');
  }

  const data = await response.json();
  return data.contact;
}

export async function updateTrustedContact(contact: {
  name?: string;
  phone?: string;
  relationship?: string;
}): Promise<TrustedContact> {
  const response = await fetch(`${COMMUNITY_API_BASE}/trusted-contact`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to update trusted contact');
  }

  const data = await response.json();
  return data.contact;
}

export async function deleteTrustedContact(): Promise<{ success: boolean }> {
  const response = await fetch(`${COMMUNITY_API_BASE}/trusted-contact`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to delete trusted contact');
  }

  return response.json();
}

export async function notifyTrustedContact(
  requestId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${COMMUNITY_API_BASE}/emergency/${requestId}/notify-trusted-contact`,
    {
      method: 'POST',
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to notify trusted contact');
  }

  return response.json();
}
