import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import DigitalDetoxChallengeScreen from '../src/screens/DigitalDetoxChallengeScreen';

jest.mock('../src/api/digitalDetoxApi', () => ({
  getDigitalDetoxProgress: jest.fn().mockResolvedValue({
    userId: 'user-1',
    currentDay: 1,
    completedDays: [],
    startedAt: new Date().toISOString(),
    completed: false,
  }),
  startDigitalDetox: jest.fn(),
  completeDigitalDetoxDay: jest.fn(),
}));

test('loads the persisted current day and shows the guided Day 1 challenge', async () => {
  jest.useFakeTimers();
  let component: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    component = ReactTestRenderer.create(<DigitalDetoxChallengeScreen onBack={() => {}} />);
  });

  const text = component!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .join(' ')
    .replace(/\s+/g, ' ');

  expect(text).toContain('Day 1 of 31');
  expect(text).toContain('5-Minute Digital Break');

  const startButton = component!.root.findAll(node => node.props.testID === 'digital-detox-start')[0];
  await ReactTestRenderer.act(() => startButton.props.onPress());

  const startedText = component!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .join(' ');
  expect(startedText).toContain('Take a few slow breaths');

  await ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
    component!.unmount();
  });
  jest.useRealTimers();
});
