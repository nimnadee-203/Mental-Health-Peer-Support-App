import {
  calculateMatchScore,
  getRecommendedCommunities,
} from '../src/utils/recommendationEngine';
import type { Community } from '../src/screens/GroupDiscussionScreen';

describe('Recommendation Engine Utility', () => {
  const sampleCommunities: Community[] = [
    {
      _id: '1',
      name: 'Student Stress Support',
      category: 'Academic Pressure',
      topics: ['Stress', 'Academic Pressure'],
      emoji: '📚',
      bgColor: '#EFF6FF',
      description: 'Manage exam pressure and burnout.',
      guidelines: 'Be supportive.',
      memberCount: 1540,
      memberAvatarColors: ['#3B82F6'],
      isJoined: false,
    },
    {
      _id: '2',
      name: 'Anxiety Support Circle',
      category: 'Stress & Anxiety',
      topics: ['Anxiety', 'Stress'],
      emoji: '🌿',
      bgColor: '#E6F4EA',
      description: 'Coping strategies for anxiety.',
      guidelines: 'Be kind.',
      memberCount: 1420,
      memberAvatarColors: ['#34D399'],
      isJoined: false,
    },
    {
      _id: '3',
      name: 'Relationship Support',
      category: 'Relationships',
      topics: ['Relationships', 'Relationship problems'],
      emoji: '🤝',
      bgColor: '#FCE7F3',
      description: 'Discuss family and relationships.',
      guidelines: 'Respect privacy.',
      memberCount: 960,
      memberAvatarColors: ['#EC4899'],
      isJoined: false,
    },
    {
      _id: '4',
      name: 'Grief Support Group',
      category: 'Grief',
      topics: ['Grief', 'Loss'],
      emoji: '🕯️',
      bgColor: '#F3F4F6',
      description: 'Comfort for navigating loss.',
      guidelines: 'Gentle space.',
      memberCount: 680,
      memberAvatarColors: ['#6B7280'],
      isJoined: false,
    },
    {
      _id: '5',
      name: 'Self-Confidence Group',
      category: 'Self-Care',
      topics: ['Self-confidence', 'General wellbeing'],
      emoji: '✨',
      bgColor: '#FEF3C7',
      description: 'Building self-worth.',
      guidelines: 'Uplifting space.',
      memberCount: 1210,
      memberAvatarColors: ['#F59E0B'],
      isJoined: false,
    },
  ];

  describe('calculateMatchScore', () => {
    it('calculates score = 2 when user interests match 2 group topics', () => {
      const userInterests = ['Stress', 'Anxiety', 'Academic Pressure'];
      const groupTopics = ['Stress', 'Academic Pressure'];

      const { score, matchingTopics } = calculateMatchScore(
        userInterests,
        groupTopics,
      );

      expect(score).toBe(2);
      expect(matchingTopics).toEqual(['Stress', 'Academic Pressure']);
    });

    it('handles case insensitivity correctly', () => {
      const userInterests = ['stress', 'ACADEMIC PRESSURE'];
      const groupTopics = ['Stress', 'Academic pressure'];

      const { score, matchingTopics } = calculateMatchScore(
        userInterests,
        groupTopics,
      );

      expect(score).toBe(2);
      expect(matchingTopics).toHaveLength(2);
    });

    it('returns score = 0 when there are no matching topics', () => {
      const userInterests = ['Grief', 'Loss'];
      const groupTopics = ['Stress', 'Academic pressure'];

      const { score, matchingTopics } = calculateMatchScore(
        userInterests,
        groupTopics,
      );

      expect(score).toBe(0);
      expect(matchingTopics).toEqual([]);
    });

    it('returns score = 0 if user interests are empty', () => {
      const { score } = calculateMatchScore([], ['Stress']);
      expect(score).toBe(0);
    });
  });

  describe('getRecommendedCommunities', () => {
    it('recommends and orders groups by match score descending', () => {
      const userInterests = ['Stress', 'Anxiety', 'Academic Pressure'];

      const recommended = getRecommendedCommunities(
        userInterests,
        sampleCommunities,
      );

      expect(recommended.length).toBeGreaterThanOrEqual(2);

      // Student Stress Support (Matches 2: Stress, Academic Pressure)
      // Anxiety Support Circle (Matches 2: Anxiety, Stress)
      expect(recommended[0].score).toBe(2);
      expect(recommended[1].score).toBe(2);

      const recommendedNames = recommended.map(r => r.community.name);
      expect(recommendedNames).toContain('Student Stress Support');
      expect(recommendedNames).toContain('Anxiety Support Circle');
      expect(recommendedNames).not.toContain('Relationship Support');
      expect(recommendedNames).not.toContain('Grief Support Group');
    });

    it('returns empty list if user has no matching interests', () => {
      const userInterests = ['Quantum Physics'];
      const recommended = getRecommendedCommunities(
        userInterests,
        sampleCommunities,
      );

      expect(recommended).toEqual([]);
    });
  });
});
