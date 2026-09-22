import type { Community } from '../screens/GroupDiscussionScreen';

export interface RecommendationResult {
  community: Community;
  score: number;
  matchingTopics: string[];
}

/**
 * Normalizes string for case-insensitive and whitespace-insensitive matching.
 */

function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase();
}

/**
 * Compares user interests with community topics/category to calculate a recommendation match.
 */

export function calculateMatchScore(
  userInterests: string[] = [],
  communityTopics: string[] = [],
): { score: number; matchingTopics: string[] } {
  if (!userInterests.length || !communityTopics.length) {
    return { score: 0, matchingTopics: [] };
  }

  const normalizedUserInterests = userInterests.map(normalizeTopic);
  const matchingTopics: string[] = [];

  for (const topic of communityTopics) {
    const normalizedTopic = normalizeTopic(topic);
    // Check exact or partial phrase containment
    const isMatch = normalizedUserInterests.some(
      interest =>
        interest === normalizedTopic ||
        interest.includes(normalizedTopic) ||
        normalizedTopic.includes(interest),
    );

    if (isMatch && !matchingTopics.includes(topic)) {
      matchingTopics.push(topic);
    }
  }

  return {
    score: matchingTopics.length,
    matchingTopics,
  };
}

/**
 * Given user interests and a list of communities, returns communities scored and sorted by recommendation relevance.
 */

export function getRecommendedCommunities(
  userInterests: string[] = [],
  communities: Community[] = [],
): RecommendationResult[] {
  if (!userInterests || userInterests.length === 0 || !communities || communities.length === 0) {
    return [];
  }

  const results: RecommendationResult[] = [];

  for (const community of communities) {
    // Combine explicit topics with community category for comprehensive matching
    const groupTopics = community.topics && community.topics.length > 0
      ? community.topics
      : [community.category];

    const { score, matchingTopics } = calculateMatchScore(userInterests, groupTopics);

    if (score > 0) {
      results.push({
        community,
        score,
        matchingTopics,
      });
    }
  }

  // Sort descending by recommendation score (highest match score first)
  return results.sort((a, b) => b.score - a.score);
}
