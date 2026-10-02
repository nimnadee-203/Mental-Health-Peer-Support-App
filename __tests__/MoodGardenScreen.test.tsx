import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import MoodGardenScreen from '../src/screens/MoodGardenScreen';

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock('../src/api/authStore', () => ({
  getAuthUserId: jest.fn(() => 'mood-garden-user'),
}));

const textContent = (renderer: ReactTestRenderer.ReactTestRenderer) => renderer.root
  .findAllByType(Text)
  .map(node => node.props.children)
  .flatMap(value => (Array.isArray(value) ? value : [value]))
  .join(' ');

describe('MoodGardenScreen', () => {
  beforeEach(() => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  it('shows the garden, completes a water moment, and saves progress', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<MoodGardenScreen onBack={() => {}} />);
    });

    expect(textContent(renderer!)).toContain('A softer place to grow');

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ testID: 'mood-garden-grow' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ testID: 'mood-garden-option-water' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      await renderer!.root.findByProps({ testID: 'mood-garden-complete-water' }).props.onPress();
    });

    expect(textContent(renderer!)).toContain('Your garden is growing');
    expect(textContent(renderer!).replace(/\s+/g, ' ')).toContain('1 moments nurtured');
    expect(mockSetItem).toHaveBeenCalledWith(
      '@mood_garden_mood-garden-user',
      JSON.stringify({ completedActivities: 1 }),
    );
  });

  it('supports a reflection activity with three responses', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<MoodGardenScreen onBack={() => {}} />);
    });
    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ testID: 'mood-garden-grow' }).props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ testID: 'mood-garden-option-notice' }).props.onPress();
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    for (const [index, input] of inputs.entries()) {
      await ReactTestRenderer.act(async () => {
        input.props.onChangeText(`Something noticed ${index + 1}`);
      });
    }

    await ReactTestRenderer.act(async () => {
      await renderer!.root.findByProps({ testID: 'mood-garden-complete-notice' }).props.onPress();
    });

    expect(textContent(renderer!)).toContain('Your garden is growing');
  });
});
