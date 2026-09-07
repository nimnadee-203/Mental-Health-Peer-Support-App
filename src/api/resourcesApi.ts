import { COMMUNITY_API_BASE } from '../config/api';
import { ResourceArticle } from '../types/ResourceArticle';

export async function getResources(): Promise<ResourceArticle[]> {
  const response = await fetch(`${COMMUNITY_API_BASE}/resources`);

  if (!response.ok) {
    throw new Error('Failed to fetch resources.');
  }

  return response.json();
}

export async function createResource(
  resource: ResourceArticle,
): Promise<ResourceArticle> {
  const response = await fetch(`${COMMUNITY_API_BASE}/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || 'Failed to create resource.');
  }

  const data = await response.json();
  return data.resource;
}
