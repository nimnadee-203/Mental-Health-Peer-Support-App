import React, { useEffect, useState } from 'react';
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

export default function AuthScreen({
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

  useEffect(() => {
    setMode(initialMode);
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialMode]);

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
        setSuccessMessage('Password reset link sent to your email.');
      }, 900);
      return;
    }

    setIsSubmitting(true);
    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';

    const payload = isSignup
      ? {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      : {
          email: email.trim().toLowerCase(),
          password,
        };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

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
    <View style={styles.webOuter}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top Navigation Row */}
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Back"
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
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
                <Feather name="chevron-left" size={24} color="#1E232C" />
              </Pressable>
            </View>

            {/* Reset Password Icon Badge */}
            {isReset && (
              <View style={styles.mailIconBox}>
                <Feather name="mail" size={26} color="#2563EB" />
              </View>
            )}

            {/* Hero Illustration for Sign In (Welcome Back) */}
            {mode === 'login' && (
              <View style={styles.illustrationContainer}>
                <Image
                  source={require('../assets/signin-hero.png')}
                  style={styles.signinHero}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Header Titles */}
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

            {/* Input Form */}
            <View style={styles.form}>
              {/* Display Name (Only in Signup) */}
              {isSignup && (
                <View style={styles.field}>
                  <Text style={styles.label}>Display name</Text>
                  <TextInput
                    autoCapitalize="words"
                    placeholder="How should we call you?"
                    placeholderTextColor="#94A3B8"
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
                    <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
                  ) : null}
                </View>
              )}

              {/* Email Address */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
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
                      placeholderTextColor="#94A3B8"
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
                      hitSlop={10}
                    >
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={19}
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
                  hitSlop={8}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </Pressable>
              )}

              {/* Error & Success Messages */}
              {errorMessage ? (
                <View style={styles.alertCardError}>
                  <Text accessibilityRole="alert" style={styles.errorText}>
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {successMessage ? (
                <View style={styles.alertCardSuccess}>
                  <Text accessibilityRole="alert" style={styles.successText}>
                    {successMessage}
                  </Text>
                </View>
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
                  <ActivityIndicator color="#1E293B" />
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

              {/* Divider & Google Button (Login & Signup) */}
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

            {/* Footer Links */}
            <View style={styles.footer}>
              {isReset ? (
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Remembered it? </Text>
                  <Pressable
                    onPress={() => handleToggleMode('login')}
                    testID="auth-toggle-mode-button"
                    hitSlop={8}
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
                    hitSlop={8}
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
                    hitSlop={8}
                  >
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E2E8F0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
      },
      default: {},
    }),
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 36,
  },
  topBar: {
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  backButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  mailIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  signinHero: {
    width: 290,
    height: 210,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E232C',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 15,
    color: '#6A707C',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E232C',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E232C',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
      default: {},
    }),
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    fontSize: 12.5,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 4,
  },
  passwordContainer: {
    height: 52,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E232C',
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
      default: {},
    }),
  },
  eyeButton: {
    padding: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 22,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
  forgotPasswordText: {
    color: '#6A707C',
    fontSize: 13.5,
    fontWeight: '600',
  },
  alertCardError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13.5,
    textAlign: 'center',
    fontWeight: '500',
  },
  alertCardSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 13.5,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#A3E7D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 6px 14px rgba(163, 231, 211, 0.45)',
        transition: 'all 0.15s ease-in-out',
      },
      default: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: '#90DEC8',
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF4',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 13.5,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  googleButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
      },
      default: {},
    }),
  },
  googleButtonPressed: {
    backgroundColor: '#F8FAFC',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1E232C',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#6A707C',
    fontSize: 14,
  },
  footerLink: {
    color: '#1E232C',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },
});
