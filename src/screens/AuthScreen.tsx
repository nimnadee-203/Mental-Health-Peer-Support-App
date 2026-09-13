import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setAuthUserId } from '../api/authStore';
import { API_BASE } from '../config/api';

type AuthMode = 'login' | 'signup';

type AuthScreenProps = {
  onAuthenticated: (isSignup?: boolean) => void;
};

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

const API_BASE_URL = API_BASE;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create your account' : 'Welcome back';
  const helperText = isSignup
    ? 'Join the support space with a few simple details.'
    : 'Log in to continue sharing and reading patient stories.';

  const handleToggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFieldErrors({});
    setErrorMessage('');
  };

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};

    if (isSignup) {
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required.';
      } else if (fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters long.';
      }
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. user@example.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (isSignup && password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields() || isSubmitting) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/${isSignup ? 'signup' : 'login'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
          }),
          signal: controller.signal,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
        return;
      }

      if (result?.user?.id) {
        setAuthUserId(result.user.id);
      }
      onAuthenticated(isSignup);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setErrorMessage(
          'The server took too long to respond. Check that the API is reachable from this device.',
        );
      } else {
        setErrorMessage('Could not reach the server. Make sure the API is running.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>M</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.helperText}>{helperText}</Text>
            </View>

            <View style={styles.form}>
              {isSignup ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Full name</Text>
                  <TextInput
                    autoCapitalize="words"
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, fieldErrors.fullName ? styles.inputError : null]}
                    value={fullName}
                    onChangeText={text => {
                      setFullName(text);
                      if (fieldErrors.fullName) {
                        setFieldErrors(prev => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    testID="signup-name-input"
                  />
                  {fieldErrors.fullName ? (
                    <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputMode="email"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, fieldErrors.email ? styles.inputError : null]}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  testID="auth-email-input"
                />
                {fieldErrors.email ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  style={[styles.input, fieldErrors.password ? styles.inputError : null]}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  testID="auth-password-input"
                />
                {fieldErrors.password ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                  pressed && !isSubmitting && styles.primaryButtonPressed,
                ]}
                onPress={handleSubmit}
                testID="auth-submit-button"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isSignup ? 'Sign Up' : 'Log In'}
                  </Text>
                )}
              </Pressable>

              {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {errorMessage}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignup ? 'Already have an account?' : 'New to the app?'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleToggleMode(isSignup ? 'login' : 'signup')}
            >
              <Text style={styles.footerAction}>
                {isSignup ? 'Log In' : 'Create Account'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.guestButton}
              onPress={() => onAuthenticated(false)}
            >
              <Text style={styles.guestButtonText}>Continue as Guest →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  header: {
    marginTop: 36,
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  helperText: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  form: {
    marginTop: 30,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  primaryButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  primaryButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 28,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  footerAction: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '900',
  },
  guestButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  guestButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default AuthScreen;
