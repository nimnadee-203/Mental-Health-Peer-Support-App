import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type AuthMode = 'login' | 'signup';

type AuthScreenProps = {
  onAuthenticated: () => void;
};

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create your account' : 'Welcome back';
  const helperText = isSignup
    ? 'Join the support space with a few simple details.'
    : 'Log in to continue sharing and reading patient stories.';

  const canSubmit = useMemo(() => {
    const hasAuthFields = email.trim().length > 0 && password.trim().length > 0;

    if (!isSignup) {
      return hasAuthFields;
    }

    return hasAuthFields && fullName.trim().length > 0;
  }, [email, fullName, isSignup, password]);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

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
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
        return;
      }

      onAuthenticated();
    } catch {
      setErrorMessage('Could not reach the server. Make sure the API is running.');
    } finally {
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
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                  />
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
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={!canSubmit || isSubmitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!canSubmit || isSubmitting) && styles.primaryButtonDisabled,
                  pressed && canSubmit && !isSubmitting && styles.primaryButtonPressed,
                ]}
                onPress={handleSubmit}
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
              onPress={() => setMode(isSignup ? 'login' : 'signup')}
            >
              <Text style={styles.footerAction}>
                {isSignup ? 'Log In' : 'Create Account'}
              </Text>
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
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
});

export default AuthScreen;
