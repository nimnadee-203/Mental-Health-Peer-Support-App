import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeScreenProps = {
  onGetStarted: () => void;
  onSignIn?: () => void;
};

export default function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <View style={styles.webOuter}>
      <SafeAreaView style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Brand Pill Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MIND MATE</Text>
          </View>

          {/* Hero Illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/welcome-hero.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Main Headline */}
          <Text style={styles.title}>
            You don't have to{'\n'}go through this alone.
          </Text>

          {/* Subtitle Description */}
          <Text style={styles.subtitle}>
            Connect with peers who understand. Share your story, listen to others, and find comfort together.
          </Text>

          {/* Pastel Category Chips */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: '#BFDBFE' }]}>
              <Text style={[styles.chipText, { color: '#1E40AF' }]}>Anxiety</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: '#FCE7F3' }]}>
              <Text style={[styles.chipText, { color: '#9D174D' }]}>Grief</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: '#FED7AA' }]}>
              <Text style={[styles.chipText, { color: '#9A3412' }]}>Burnout</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: '#A7F3D0' }]}>
              <Text style={[styles.chipText, { color: '#065F46' }]}>Recovery</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onGetStarted}
            testID="welcome-get-started-button"
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          {/* Footer Navigation Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={onSignIn || onGetStarted} hitSlop={8}>
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 32,
  },
  badge: {
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  heroImage: {
    width: 320,
    height: 240,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1E232C',
    textAlign: 'center',
    lineHeight: 37,
    letterSpacing: -0.4,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#A3E7D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
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
  primaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    color: '#64748B',
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
