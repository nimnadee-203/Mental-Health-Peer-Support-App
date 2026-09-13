import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import HomeScreen from '../src/screens/HomeScreen';
import { getAuthUserId } from '../src/api/authStore';
import { getUserProfile } from '../src/api/profileApi';

jest.mock('../src/api/authStore', () => ({
  getAuthUserId: jest.fn(),
}));

jest.mock('../src/api/profileApi', () => ({
  getUserProfile: jest.fn(),
}));

const mockGetAuthUserId = getAuthUserId as jest.Mock;
const mockGetUserProfile = getUserProfile as jest.Mock;

describe('HomeScreen Dynamic Check-in', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates check-in score and mood logs when user selects a mood', async () => {
    mockGetAuthUserId.mockReturnValue('user-123');
    mockGetUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Alice Walker',
      email: 'alice@example.com',
      stats: { posts: 1, supports: 5, replies: 3 },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen onOpenProfile={() => {}} />);
    });

    const root = renderer!.root;

    // Select 'Calm' mood chip
    const calmChip = root.findByProps({ testID: 'mood-Calm' });
    expect(calmChip).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      calmChip.props.onPress();
    });

    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Checked in as Calm 🌿');
    expect(texts).toContain('Logged as Calm today');
  });
});
