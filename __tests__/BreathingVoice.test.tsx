import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ActivitiesScreen from '../src/screens/ActivitiesScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

const mockSpeak = jest.fn();
const mockStop = jest.fn();

jest.mock('expo-speech', () => ({
  speak: (...args: unknown[]) => mockSpeak(...args),
  stop: (...args: unknown[]) => mockStop(...args),
}));

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  useAudioPlayer: () => ({
    loop: false,
    volume: 0.35,
    play: jest.fn(),
    pause: jest.fn(),
  }),
  useAudioPlayerStatus: () => ({ isLoaded: true }),
}));

describe('Breathing voice guidance', () => {
  let component: ReactTestRenderer.ReactTestRenderer;

  beforeEach(() => {
    jest.useFakeTimers();
    mockSpeak.mockClear();
    mockStop.mockClear();
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      component?.unmount();
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  const renderBreathing = async () => {
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <ActivitiesScreen
          activity="breathing"
          onBack={() => {}}
          onSelectActivity={() => {}}
        />,
      );
    });
  };

  it('speaks once when each breathing phase begins', async () => {
    await renderBreathing();

    expect(mockSpeak).toHaveBeenCalledWith(
      'Breathe in slowly.',
      expect.any(Object),
    );

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSpeak).toHaveBeenCalledWith(
      'Hold gently.',
      expect.any(Object),
    );

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSpeak).toHaveBeenCalledWith(
      'Now slowly breathe out.',
      expect.any(Object),
    );

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSpeak).toHaveBeenCalledWith(
      'Relax and breathe normally.',
      expect.any(Object),
    );
    expect(mockSpeak).toHaveBeenCalledTimes(4);
  });

  it('does not repeat the phase message after pause and resume', async () => {
    await renderBreathing();

    await ReactTestRenderer.act(async () => {
      component!.root.findByProps({ testID: 'breathing-pause' }).props.onPress();
      jest.advanceTimersByTime(3000);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      component!.root.findByProps({ testID: 'breathing-pause' }).props.onPress();
      jest.advanceTimersByTime(1000);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });

  it('stops voice announcements when guidance is turned off', async () => {
    await renderBreathing();

    await ReactTestRenderer.act(async () => {
      component!.root.findByProps({ testID: 'breathing-voice-toggle' }).props.onPress();
      jest.advanceTimersByTime(5000);
    });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalled();
  });
});
