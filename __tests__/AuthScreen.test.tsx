import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import AuthScreen from '../src/screens/AuthScreen';

describe('AuthScreen Input Validations', () => {
  it('validates email and password on login submit', async () => {
    const onAuthenticated = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthScreen onAuthenticated={onAuthenticated} />,
      );
    });

    const root = renderer!.root;
    const submitButton = root.findByProps({ testID: 'auth-submit-button' });

    await ReactTestRenderer.act(async () => {
      submitButton.props.onPress();
    });

    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Email address is required.');
    expect(texts).toContain('Password is required.');
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it('validates full name, email format, and password length on signup submit', async () => {
    const onAuthenticated = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthScreen onAuthenticated={onAuthenticated} />,
      );
    });

    const root = renderer!.root;

    // Toggle to signup mode
    const createAccountButton = root
      .findAllByType(Text)
      .find(t => t.props.children === 'Create Account');

    expect(createAccountButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      createAccountButton!.parent!.props.onPress();
    });

    const nameInput = root.findByProps({ testID: 'signup-name-input' });
    const emailInput = root.findByProps({ testID: 'auth-email-input' });
    const passwordInput = root.findByProps({ testID: 'auth-password-input' });
    const submitButton = root.findByProps({ testID: 'auth-submit-button' });

    await ReactTestRenderer.act(async () => {
      nameInput.props.onChangeText('A');
      emailInput.props.onChangeText('invalid-email');
      passwordInput.props.onChangeText('123');
    });

    await ReactTestRenderer.act(async () => {
      submitButton.props.onPress();
    });

    const texts = root
      .findAllByType(Text)
      .map(t => t.props.children)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .join(' ');

    expect(texts).toContain('Full name must be at least 2 characters long.');
    expect(texts).toContain('Please enter a valid email address');
    expect(texts).toContain('Password must be at least 6 characters long.');
    expect(onAuthenticated).not.toHaveBeenCalled();
  });
});
