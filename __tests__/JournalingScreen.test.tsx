import React from 'react';
import { Text, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import JournalingScreen from '../src/screens/JournalingScreen';
import { createJournalEntry, getJournalEntries } from '../src/api/journalsApi';

jest.mock('../src/api/journalsApi', () => ({
  getJournalEntries: jest.fn().mockResolvedValue([]),
  createJournalEntry: jest.fn().mockResolvedValue({
    _id: 'entry-1',
    mood: 'good',
    focus: 'gratitude',
    answers: ['A small win'],
    tinyWin: '',
    createdAt: new Date().toISOString(),
  }),
}));

const mockGetJournalEntries = getJournalEntries as jest.Mock;
const mockCreateJournalEntry = createJournalEntry as jest.Mock;

test('loads journal history and saves a new reflection', async () => {
  mockGetJournalEntries.mockResolvedValue([
    {
      _id: 'old-entry',
      mood: 'okay',
      focus: 'clear',
      answers: ['An earlier reflection'],
      tinyWin: '',
      createdAt: new Date().toISOString(),
    },
  ]);

  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<JournalingScreen onBack={() => {}} />);
  });

  expect(mockGetJournalEntries).toHaveBeenCalledTimes(1);
  expect(renderer!.root.findAllByType(Text).some(node => node.props.children === 'Previous journals')).toBe(true);

  await ReactTestRenderer.act(() => {
    renderer!.root.findAll(node => node.props.testID === 'journal-mood-good')[0].props.onPress();
    renderer!.root.findAll(node => node.props.testID === 'journal-focus-gratitude')[0].props.onPress();
  });

  const inputs = renderer!.root.findAllByType(TextInput);
  await ReactTestRenderer.act(() => inputs[0].props.onChangeText('A small win today'));

  const saveButton = renderer!.root.findAll(node => node.props.testID === 'journal-save')[0];
  await ReactTestRenderer.act(() => saveButton.props.onPress());

  expect(mockCreateJournalEntry).toHaveBeenCalledWith(expect.objectContaining({ mood: 'good', focus: 'gratitude' }));
  await ReactTestRenderer.act(() => renderer!.unmount());
});
