import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import CreatePostScreen from '../src/screens/CreatePostScreen';
import type { Community } from '../src/screens/GroupDiscussionScreen';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('../src/api/authStore', () => ({
  getAuthToken: jest.fn().mockReturnValue('mock-token'),
  clearAuthSession: jest.fn(),
}));

const mockCommunity: Community = {
  _id: 'community-1',
  name: 'Student Stress Support',
  category: 'Academic Pressure',
  topics: ['Stress', 'Academic pressure'],
  emoji: '📚',
  bgColor: '#EFF6FF',
  description: 'Manage exam pressure and burnout.',
  guidelines: 'Respectful Communication',
  memberCount: 1540,
  memberAvatarColors: ['#3B82F6'],
  isJoined: true,
};

describe('CreatePostScreen', () => {
  it('renders post creation form correctly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <CreatePostScreen
          community={mockCommunity}
          onBack={() => {}}
          onPostCreated={() => {}}
        />,
      );
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Share with the community');
    expect(texts).toContain('You can share anonymously');
    expect(texts).toContain('Post anonymously');
  });

  it('submits post and triggers onPostCreated callback', async () => {
    const mockPostCreated = jest.fn();
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Post created' }),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <CreatePostScreen
          community={mockCommunity}
          onBack={() => {}}
          onPostCreated={mockPostCreated}
        />,
      );
    });

    const root = renderer!.root;

    // Find input and type content
    const input = root.findByProps({
      placeholder: "Share what's on your mind...",
    });

    await ReactTestRenderer.act(async () => {
      input.props.onChangeText('This is a test post sharing my story.');
    });

    // Find submit button
    const submitBtn = root.findByProps({ testID: 'submit-post-button' });
    expect(submitBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      submitBtn.props.onPress();
    });

    expect((global as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/group/community-1'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          content: 'This is a test post sharing my story.',
          topic: 'General',
          contentNote: 'None',
          isAnonymous: true,
        }),
      }),
    );

    expect(mockPostCreated).toHaveBeenCalled();
  });
});
