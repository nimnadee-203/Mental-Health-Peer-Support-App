import React from 'react';
import { Alert, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import ProfileScreen from '../src/screens/ProfileScreen';
import { getAuthUserId, setAuthUserId } from '../src/api/authStore';
import { getUserProfile, updateUserProfile } from '../src/api/profileApi';

jest.mock('../src/api/authStore', () => ({
  getAuthUserId: jest.fn(),
  setAuthUserId: jest.fn(),
}));

jest.mock('../src/api/profileApi', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}));

const mockGetAuthUserId = getAuthUserId as jest.Mock;
const mockGetUserProfile = getUserProfile as jest.Mock;
const mockUpdateUserProfile = updateUserProfile as jest.Mock;

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guest mode when no user is logged in', async () => {
    mockGetAuthUserId.mockReturnValue(null);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ProfileScreen onBack={() => {}} onNavigateToAuth={() => {}} />,
      );
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Guest User');
    expect(texts).toContain('Log in to sync your profile');
  });

  it('fetches and displays user profile data when logged in', async () => {
    mockGetAuthUserId.mockReturnValue('user-123');
    mockGetUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'Sharing my daily progress and meditation wins.',
      interests: ['Mindfulness', 'Journaling'],
      stats: {
        posts: 7,
        supports: 42,
        replies: 15,
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Jane Doe');
    expect(texts).toContain('jane@example.com');
    expect(texts).toContain('Sharing my daily progress and meditation wins.');
    expect(texts).toContain('Mindfulness');
    expect(texts).toContain('Journaling');
    expect(texts).toContain('7');
    expect(texts).toContain('42');
    expect(texts).toContain('15');
  });

  it('allows opening edit modal and submitting profile updates', async () => {
    mockGetAuthUserId.mockReturnValue('user-123');
    mockGetUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'Initial bio',
      interests: ['Mindfulness'],
      stats: { posts: 2, supports: 5, replies: 1 },
    });
    mockUpdateUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Jane Doe Updated',
      email: 'jane@example.com',
      bio: 'Updated bio content',
      interests: ['Mindfulness', 'Yoga'],
      stats: { posts: 2, supports: 5, replies: 1 },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const editButton = root.findByProps({ testID: 'edit-profile-button' });
    expect(editButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      editButton.props.onPress();
    });

    const nameInput = root.findByProps({ testID: 'edit-name-input' });
    const bioInput = root.findByProps({ testID: 'edit-bio-input' });
    const saveButton = root.findByProps({ testID: 'save-profile-button' });

    await ReactTestRenderer.act(async () => {
      nameInput.props.onChangeText('Jane Doe Updated');
      bioInput.props.onChangeText('Updated bio content');
    });

    await ReactTestRenderer.act(async () => {
      saveButton.props.onPress();
    });

    expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', {
      fullName: 'Jane Doe Updated',
      bio: 'Updated bio content',
      interests: ['Mindfulness'],
    });

    const updatedTexts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(updatedTexts).toContain('Jane Doe Updated');
    expect(updatedTexts).toContain('Updated bio content');
  });

  it('triggers logout prompt when logout button is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockGetAuthUserId.mockReturnValue('user-123');
    mockGetUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'Bio',
      interests: [],
      stats: { posts: 0, supports: 0, replies: 0 },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const logoutButton = root.findByProps({ testID: 'logout-button' });
    expect(logoutButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      logoutButton.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Log Out',
      'Are you sure you want to log out of your account?',
      expect.any(Array),
    );
  });

  it('renders Privacy Settings section and saves privacy updates', async () => {
    mockGetAuthUserId.mockReturnValue('user-123');
    mockGetUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'Bio',
      interests: ['Mindfulness'],
      stats: { posts: 0, supports: 0, replies: 0 },
      privacySettings: {
        profileVisibility: 'Group Members',
        anonymousSharing: true,
        whoCanMessageMe: 'Group Members',
        showInterestsOnProfile: false,
      },
    });

    mockUpdateUserProfile.mockResolvedValue({
      id: 'user-123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'Bio',
      interests: ['Mindfulness'],
      stats: { posts: 0, supports: 0, replies: 0 },
      privacySettings: {
        profileVisibility: 'Everyone',
        anonymousSharing: false,
        whoCanMessageMe: 'Nobody',
        showInterestsOnProfile: true,
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen onBack={() => {}} />);
    });

    const root = renderer!.root;

    // Verify privacy settings section is rendered
    const privacySection = root.findByProps({ testID: 'privacy-settings-section' });
    expect(privacySection).toBeTruthy();

    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Privacy Settings');
    expect(texts).toContain('Profile Visibility');
    expect(texts).toContain('Anonymous Sharing');
    expect(texts).toContain('Who can message me?');
    expect(texts).toContain('Show my interests on profile');

    // Change Visibility to Everyone
    const everyoneRadio = root.findByProps({ testID: 'radio-visibility-everyone' });
    await ReactTestRenderer.act(async () => {
      everyoneRadio.props.onPress();
    });

    // Toggle Anonymous Sharing off
    const anonToggle = root.findByProps({ testID: 'toggle-anonymous-sharing' });
    await ReactTestRenderer.act(async () => {
      anonToggle.props.onPress();
    });

    // Change Messaging to Nobody
    const nobodyRadio = root.findByProps({ testID: 'radio-messaging-nobody' });
    await ReactTestRenderer.act(async () => {
      nobodyRadio.props.onPress();
    });

    // Toggle Show Interests on
    const showInterestsToggle = root.findByProps({ testID: 'toggle-show-interests' });
    await ReactTestRenderer.act(async () => {
      showInterestsToggle.props.onPress();
    });

    // Press Save Changes button
    const savePrivacyBtn = root.findByProps({ testID: 'save-privacy-settings-button' });
    await ReactTestRenderer.act(async () => {
      savePrivacyBtn.props.onPress();
    });

    expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', {
      privacySettings: {
        profileVisibility: 'Everyone',
        anonymousSharing: false,
        whoCanMessageMe: 'Nobody',
        showInterestsOnProfile: true,
      },
    });
  });
});

