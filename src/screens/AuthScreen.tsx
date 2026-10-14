import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { Feather } from '@expo/vector-icons';
import { setAuthSession } from '../api/authStore';
import { AUTH_BASE } from '../config/api';

type AuthMode = 'login' | 'signup' | 'resetPassword';

type AuthScreenProps = {
  initialMode?: AuthMode;
  onBack?: () => void;
  onAuthenticated: (isSignup?: boolean) => void;
};

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

const API_BASE_URL = AUTH_BASE;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthScreen({
  initialMode = 'login',
  onBack,
  onAuthenticated,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const isReset = mode === 'resetPassword';

  const handleToggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('');
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

    if (!isReset) {
      if (!password) {
        errors.password = 'Password is required.';
      } else if (isSignup && password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields() || isSubmitting) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    // Handle Reset Password Mode
    if (isReset) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(`Reset link sent! Please check ${email.trim()} for instructions.`);
        Alert.alert(
          'Reset Link Sent 📬',
          `We have sent a password reset link to ${email.trim()}. Please check your inbox.`,
          [{ text: 'Return to Sign In', onPress: () => handleToggleMode('login') }]
        );
      }, 700);
      return;
    }

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

      if (!result?.user?.id || !result?.token) {
        setErrorMessage('The server did not create a login session. Please try again.');
        return;
      }

      setAuthSession({
        userId: result.user.id,
        token: result.token,
        role: result.user.role,
      });
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

  const handleGoogleSignIn = () => {
    // Demo Google Sign In
    Alert.alert(
      'Continue with Google',
      'Signing in with Google Account...',
      [
        {
          text: 'Continue',
          onPress: () => {
            onAuthenticated(false);
          },
        },
      ]
    );
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
          showsVerticalScrollIndicator={false}
        >
          {/* Top Row / Back Button for Signup & Reset */}
          {(isSignup || isReset) && (
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Back"
                style={styles.backButton}
                onPress={() => {
                  if (isReset) {
                    handleToggleMode('login');
                  } else if (onBack) {
                    onBack();
                  } else {
                    handleToggleMode('login');
                  }
                }}
              >
                <Feather name="chevron-left" size={24} color="#1E2432" />
              </Pressable>
            </View>
          )}

          {/* Reset Password Icon Box */}
          {isReset && (
            <View style={styles.mailIconBox}>
              <Feather name="mail" size={26} color="#2563EB" />
            </View>
          )}

          {/* Hero Illustration for Sign In Mode */}
          {mode === 'login' && (
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../assets/signin-hero.png')}
                style={styles.signinHero}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Header Title & Subtitle */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isReset
                ? 'Reset password'
                : isSignup
                ? 'Create your account'
                : 'Welcome back'}
            </Text>
            <Text style={styles.helperText}>
              {isReset
                ? "Enter the email address linked to your account and we'll send you a reset link."
                : isSignup
                ? 'You deserve a place to feel heard.'
                : "We're glad to see you again."}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Display Name (Only in Signup) */}
            {isSignup && (
              <View style={styles.field}>
                <Text style={styles.label}>Display name</Text>
                <TextInput
                  autoCapitalize="words"
                  placeholder="How should we call you?"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.input,
                    fieldErrors.fullName ? styles.inputError : null,
                  ]}
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
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.fullName}
                  </Text>
                ) : null}
              </View>
            )}

            {/* Email Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.input,
                  fieldErrors.email ? styles.inputError : null,
                ]}
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

            {/* Password Field (Only in Login & Signup) */}
            {!isReset && (
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    fieldErrors.password ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder={
                      isSignup ? 'Create a password' : 'Your password'
                    }
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    testID="auth-password-input"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(prev => !prev)}
                    hitSlop={8}
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={18}
                      color="#8A94A6"
                    />
                  </Pressable>
                </View>
                {fieldErrors.password ? (
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.password}
                  </Text>
                ) : null}
              </View>
            )}

            {/* Forgot Password Link in Login Mode */}
            {mode === 'login' && (
              <Pressable
                style={styles.forgotPasswordButton}
                onPress={() => handleToggleMode('resetPassword')}
                hitSlop={6}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Pressable>
            )}

            {/* Error & Success Messages */}
            {errorMessage ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}

            {successMessage ? (
              <Text accessibilityRole="alert" style={styles.successText}>
                {successMessage}
              </Text>
            ) : null}

            {/* Primary Action Button */}
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
                <ActivityIndicator color="#1E2432" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isReset
                    ? 'Send Reset Link'
                    : isSignup
                    ? 'Create Account'
                    : 'Sign In'}
                </Text>
              )}
            </Pressable>

            {/* Social Divider & Google Button (Login & Signup) */}
            {!isReset && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.googleButton,
                    pressed && styles.googleButtonPressed,
                  ]}
                  onPress={handleGoogleSignIn}
                >
                  <Image
                    source={require('../assets/google-icon.png')}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            {isReset ? (
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Remembered it? </Text>
                <Pressable
                  onPress={() => handleToggleMode('login')}
                  testID="auth-toggle-mode-button"
                >
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            ) : isSignup ? (
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable
                  onPress={() => handleToggleMode('login')}
                  testID="auth-toggle-mode-button"
                >
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Pressable
                  onPress={() => handleToggleMode('signup')}
                  testID="auth-toggle-mode-button"
                >
                  <Text style={styles.footerLink}>Sign Up</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  signinHero: {
    width: 290,
    height: 220,
  },
  header: {
    marginTop: 14,
    marginBottom: 20,
  },
  title: {
    color: '#1E2432',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  helperText: {
    color: '#64748B',
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: '#1E2432',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#EDF0F5',
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: '#1E2432',
  },
  passwordContainer: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#EDF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    color: '#1E2432',
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#A8E4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonPressed: {
    backgroundColor: '#95D6C9',
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#1E2432',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF0F5',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  googleButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonPressed: {
    backgroundColor: '#F8FAFC',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#1E2432',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlign: 'center',
  },
  successText: {
    color: '#065F46',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#8A94A6',
    fontSize: 13.5,
  },
  footerLink: {
    color: '#1E2432',
    fontSize: 13.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
