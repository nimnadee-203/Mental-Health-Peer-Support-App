import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import ScheduleScreen from '../src/screens/ScheduleScreen';
import { getSessions } from '../src/api/sessionsApi';

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

jest.mock('../src/api/sessionsApi', () => ({
  getSessions: jest.fn(),
  createSession: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
}));

const mockedGetSessions = getSessions as jest.MockedFunction<typeof getSessions>;

const communities = [
  {
    _id: 'group-1',
    name: 'Student Mental Wellness',
    category: 'Academic Pressure',
    topics: ['Stress'],
    emoji: '📚',
    bgColor: '#EFF6FF',
    description: 'Support group',
    guidelines: 'Be kind',
    memberCount: 10,
    memberAvatarColors: ['#3B82F6'],
    isJoined: true,
  },
];

const session = {
  _id: 'session-1',
  title: 'Managing Academic Stress',
  description: 'A supportive conversation about study pressure.',
  group: { _id: 'group-1', name: 'Student Mental Wellness' },
  date: '2020-10-10',
  startTime: '19:00',
  endTime: '20:00',
  meetingLink: 'https://example.com/meeting',
  hostName: 'Sarah',
};

describe('ScheduleScreen', () => {
  beforeEach(() => {
    mockedGetSessions.mockResolvedValue([session]);
  });

  it('lets members view details and join a started online session', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ScheduleScreen role="user" communities={communities} onBack={() => {}} />,
      );
    });

    const viewDetails = renderer!.root.findByProps({ accessibilityLabel: 'View details for Managing Academic Stress' });
    await ReactTestRenderer.act(async () => {
      viewDetails.props.onPress();
    });

    const text = renderer!.root
      .findAllByType(Text)
      .map(item => item.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');

    expect(text).toContain('Session Details');
    expect(text).toContain('Join Online Session');
    expect(text).not.toContain('Add Session');
  });

  it('shows the add session control only to moderators and admins', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ScheduleScreen role="moderator" communities={communities} onBack={() => {}} />,
      );
    });

    expect(renderer!.root.findByProps({ accessibilityLabel: 'Add session' })).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ accessibilityLabel: 'Add session' }).props.onPress();
    });

    const text = renderer!.root
      .findAllByType(Text)
      .map(item => item.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');
    expect(text).toContain('Create Session');
  });
});
