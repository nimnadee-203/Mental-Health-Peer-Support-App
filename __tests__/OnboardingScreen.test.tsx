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

  test('allows navigating through onboarding and selecting mental health interests', async () => {
    const handleComplete = jest.fn();
    const handleSkip = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />
      );
    });

    const root = renderer!.root;

    // Step 1 -> Next to Step 2 (Mental Health Interests)
    const nextButton = root.findByProps({ testID: 'onboarding-next-button' });
    await ReactTestRenderer.act(async () => {
      nextButton.props.onPress();
    });

    // Verify Mental Health Interests step title and checkboxes
    const stressCheckbox = root.findByProps({ testID: 'interest-checkbox-stress' });
    const lonelinessCheckbox = root.findByProps({ testID: 'interest-checkbox-loneliness' });

    expect(stressCheckbox).toBeTruthy();
    expect(lonelinessCheckbox).toBeTruthy();

    // Toggle Stress ON and Loneliness ON
    await ReactTestRenderer.act(async () => {
      stressCheckbox.props.onPress();
      lonelinessCheckbox.props.onPress();
    });

    // Step 2 -> Continue to Step 3
    await ReactTestRenderer.act(async () => {
      nextButton.props.onPress();
    });

    // Step 3 -> Get Started (Complete)
    await ReactTestRenderer.act(async () => {
      nextButton.props.onPress();
    });

    expect(handleComplete).toHaveBeenCalledWith({
      selectedInterests: expect.arrayContaining(['Stress', 'Anxiety', 'Academic pressure', 'Self-confidence', 'Loneliness']),
    });
  });
});
