import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import ManageMembersScreen from '../src/screens/ManageMembersScreen';
import { getManagedMembers } from '../src/api/memberManagementApi';

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

jest.mock('../src/api/memberManagementApi', () => ({
  getManagedMembers: jest.fn(),
  approveMemberRequest: jest.fn(),
  rejectMemberRequest: jest.fn(),
  removeMember: jest.fn(),
  makeModerator: jest.fn(),
}));

const mockedGetManagedMembers = getManagedMembers as jest.MockedFunction<typeof getManagedMembers>;

const members = [
  {
    id: 'community-1:user-1',
    userId: 'user-1',
    communityId: 'community-1',
    communityName: 'Anxiety Support',
    fullName: 'Yashodhi Member',
    email: 'member@example.com',
    role: 'user' as const,
    joinDate: '2026-09-01T00:00:00.000Z',
    status: 'active' as const,
  },
  {
    id: 'community-1:moderator-1',
    userId: 'moderator-1',
    communityId: 'community-1',
    communityName: 'Anxiety Support',
    fullName: 'Community Moderator',
    email: 'moderator@example.com',
    role: 'moderator' as const,
    joinDate: '2026-08-01T00:00:00.000Z',
    status: 'active' as const,
  },
];

describe('ManageMembersScreen', () => {
  beforeEach(() => {
    mockedGetManagedMembers.mockResolvedValue({
      members,
      stats: { totalMembers: 2, moderators: 1, pendingRequests: 0 },
    });
  });

  it('renders title, member stats, tabs, and member actions', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ManageMembersScreen role="admin" onBack={() => {}} />);
    });

    const text = renderer!.root
      .findAllByType(Text)
      .map(item => item.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');

    expect(text).toContain('Manage Members');
    expect(text).toContain('Total members');
    expect(text).toContain('Moderators');
    expect(text).toContain('All Members');
    expect(text).toContain('Yashodhi Member');
    expect(text).toContain('View Profile');
    expect(text).toContain('Make Moderator');
    expect(text).toContain('Remove Member');
  });

  it('filters the list to moderators when the Moderators tab is selected', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<ManageMembersScreen role="moderator" onBack={() => {}} />);
    });

    const moderatorsTab = renderer!.root
      .findAllByProps({ accessibilityRole: 'tab' })
      .filter(item => typeof item.props.onPress === 'function')[1];
    expect(moderatorsTab).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      moderatorsTab!.props.onPress();
    });

    const text = renderer!.root
      .findAllByType(Text)
      .map(item => item.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');

    expect(text).toContain('Community Moderator');
    expect(text).not.toContain('Yashodhi Member');
    expect(text).not.toContain('Make Moderator');
  });
});
