import React from 'react';
import { Alert, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import GroupDetailScreen from '../src/screens/Groups/GroupDetailScreen';
import type { Community } from '../src/screens/GroupDiscussionScreen';

const mockCommunity: Community = {
  _id: 'community-1',
  name: 'Student Stress Support',
  category: 'Academic Pressure',
  topics: ['Stress', 'Academic pressure'],
  emoji: '📚',
  bgColor: '#EFF6FF',
  description: 'Manage exam pressure and burnout.',
  guidelines: 'Respectful Communication\nBe kind and supportive',
  memberCount: 1540,
  memberAvatarColors: ['#3B82F6'],
  isJoined: false,
};

describe('GroupDetailScreen', () => {
  it('renders community details and guidelines correctly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupDetailScreen
          community={mockCommunity}
          isJoined={false}
          onBack={() => {}}
          onJoin={() => {}}
          onEnter={() => {}}
        />,
      );
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Student Stress Support');
    expect(texts).toContain('Manage exam pressure and burnout.');
    expect(texts).toContain('1540');
    expect(texts).toContain('members');
    expect(texts).toContain('COMMUNITY GUIDELINES');
    expect(texts).toContain('Respectful Communication');
  });

  it('allows user to join group and triggers onJoin callback', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const mockOnJoin = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <GroupDetailScreen
          community={mockCommunity}
          isJoined={false}
          onBack={() => {}}
          onJoin={mockOnJoin}
          onEnter={() => {}}
        />,
      );
    });

    const root = renderer!.root;
    const buttons = root.findAllByType(Text);
    const joinBtnText = buttons.find(b => b.props.children === 'Join');
    expect(joinBtnText).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      const pressables = root.findAll(
        node => node.props && node.props.onPress && typeof node.props.onPress === 'function',
      );
      const joinPressable = pressables.find(p => {
        const textNodes = p.findAllByType(Text);
        return textNodes.some(t => t.props.children === 'Join');
      });
      if (joinPressable) {
        joinPressable.props.onPress();
      }
    });

    expect(mockOnJoin).toHaveBeenCalledWith('community-1');
    expect(alertSpy).toHaveBeenCalledWith(
      'You’re a member! 🎉',
      'You have joined Student Stress Support.',
      expect.any(Array),
    );
  });
});
