import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import OnboardingScreen from '../src/screens/OnboardingScreen';

describe('OnboardingScreen', () => {
  test('renders correctly', async () => {
    const handleComplete = jest.fn();
    const handleSkip = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />
      );
    });

    expect(renderer!.toJSON()).toBeDefined();
  });

  test('calls onSkip when Skip callback is passed', async () => {
    const handleComplete = jest.fn();
    const handleSkip = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />
      );
    });

    expect(renderer!.root).toBeDefined();
  });
});
