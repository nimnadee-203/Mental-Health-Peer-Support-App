import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import GroupsHomeScreen from '../src/screens/Groups/GroupsHomeScreen';
import type { Community } from '../src/screens/GroupDiscussionScreen';

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

jest.mock('../src/api/authStore', () => ({
  getAuthUserId: jest.fn().mockReturnValue(null),
}));

jest.mock('../src/api/profileApi', () => ({
  getUserProfile: jest.fn(),
}));

const mockCommunities: Community[] = [
  {
    _id: '1',
    name: 'Student Stress Support',
    category: 'Academic Pressure',
    topics: ['Stress', 'Academic pressure'],
    emoji: '📚',
    bgColor: '#EFF6FF',
    description: 'Manage exam pressure.',
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
    topics: ['Relationships'],
    emoji: '🤝',
    bgColor: '#FCE7F3',
    description: 'Relationship guidance.',
    guidelines: 'Respect privacy.',
    memberCount: 960,
    memberAvatarColors: ['#EC4899'],
    isJoined: false,
  },
];

describe('GroupsHomeScreen - Personalized Recommendations', () => {
  it('hides joined groups and join controls for admins', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupsHomeScreen
          communities={mockCommunities}
          joinedIds={['1']}
          onGroupPress={() => {}}
          onCreateGroup={() => {}}
          isAdmin
        />,
      );
    });

    expect(renderer!.root.findAllByProps({ testID: 'your-groups-section' })).toHaveLength(0);
    const texts = renderer!.root
      .findAllByType(Text)
      .map(item => item.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');
    expect(texts).not.toContain('Joined');
    expect(texts).not.toContain('Join');
  });

  it('uses the joined-group callback for joined community cards', async () => {
    const onJoinedGroupPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupsHomeScreen
          communities={mockCommunities}
          joinedIds={['1']}
          onGroupPress={() => {}}
          onJoinedGroupPress={onJoinedGroupPress}
          onCreateGroup={() => {}}
        />,
      );
    });

    renderer!.root.findByProps({ testID: 'joined-group-card-1' }).props.onPress();

    expect(onJoinedGroupPress).toHaveBeenCalledWith(mockCommunities[0]);
  });

  it('hides the create group button when the user is not an admin', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupsHomeScreen
          communities={mockCommunities}
          joinedIds={[]}
          onGroupPress={() => {}}
          onCreateGroup={() => {}}
        />,
      );
    });

    expect(renderer!.root.findAllByProps({ testID: 'create-group-button' })).toHaveLength(0);
  });

  it('shows the create group button for admins', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupsHomeScreen
          communities={mockCommunities}
          joinedIds={[]}
          onGroupPress={() => {}}
          onCreateGroup={() => {}}
          canCreateGroup
        />,
      );
    });

    expect(renderer!.root.findByProps({ testID: 'create-group-button' })).toBeTruthy();
  });

  it('renders RECOMMENDED FOR YOU section when user has matching interests', async () => {
    const userInterests = ['Stress', 'Anxiety', 'Academic pressure'];

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupsHomeScreen
          communities={mockCommunities}
          joinedIds={[]}
          onGroupPress={() => {}}
          onCreateGroup={() => {}}
          userInterestsOverride={userInterests}
        />,
      );
    });

    const root = renderer!.root;

    // Verify recommended groups section is present
    const recSection = root.findByProps({ testID: 'recommended-groups-section' });
    expect(recSection).toBeTruthy();

    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('RECOMMENDED FOR YOU');
    expect(texts).toContain('Why recommended: Matches 2 of your interests');
    expect(texts).toContain('Student Stress Support');
    expect(texts).toContain('Anxiety Support Circle');
  });

  it('hides RECOMMENDED FOR YOU section when user has no matching interests', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupsHomeScreen
          communities={mockCommunities}
          joinedIds={[]}
          onGroupPress={() => {}}
          onCreateGroup={() => {}}
          userInterestsOverride={[]}
        />,
      );
    });

    const root = renderer!.root;

    const recSection = root.findAllByProps({ testID: 'recommended-groups-section' });
    expect(recSection).toHaveLength(0);
  });
});
