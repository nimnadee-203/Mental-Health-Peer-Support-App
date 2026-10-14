import React from 'react';
import {
  Image,
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

function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        {/* Main Heading */}
        <Text style={styles.title}>
          You don't have to{'\n'}go through this alone.
        </Text>

        {/* Subtitle Description */}
        <Text style={styles.subtitle}>
          Connect with peers who understand.{'\n'}Share your story, listen to others, and{'\n'}find comfort together.
        </Text>

        {/* Category Pills */}
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: '#BDE0FE' }]}>
            <Text style={[styles.chipText, { color: '#1E40AF' }]}>Anxiety</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#FBCFE8' }]}>
            <Text style={[styles.chipText, { color: '#9D174D' }]}>Grief</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#FED7AA' }]}>
            <Text style={[styles.chipText, { color: '#9A3412' }]}>Burnout</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#A7F3D0' }]}>
            <Text style={[styles.chipText, { color: '#065F46' }]}>Recovery</Text>
          </View>
        </View>

        {/* Primary Call to Action Button */}
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

        {/* Footer Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={onSignIn || onGetStarted} hitSlop={8}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#A8F0D0',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  heroImage: {
    width: 320,
    height: 250,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1E2432',
    textAlign: 'center',
    lineHeight: 37,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#A8E4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  primaryButtonPressed: {
    backgroundColor: '#95D6C9',
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#1E2432',
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

export default WelcomeScreen;
