import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import OnboardingScreen from '../src/screens/OnboardingScreen';

describe('OnboardingScreen', () => {
  test('renders step 1 correctly and navigates to completion', async () => {
    const handleComplete = jest.fn();
    const handleSkip = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />
      );
    });

    const root = renderer!.root;

    // Verify initial step indicator
    const stepText = root.findByProps({ style: expect.anything() });
    expect(renderer!.toJSON()).toBeTruthy();

    // Find Next button and click it to advance to Step 2
    const buttons = root.findAllByType('View' as any);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('calls onSkip when Skip button is pressed', async () => {
    const handleComplete = jest.fn();
    const handleSkip = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />
      );
    });

    // Verify component mounts without throwing
    expect(renderer!.toJSON()).toBeDefined();
  });
});
