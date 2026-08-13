import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type WelcomeScreenProps = {
  onGetStarted: () => void;
};

const supportPoints = [
  'Share what feels safe',
  'Read real patient stories',
  'Find steady peer support',
];

function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>M</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Mental Health Peer Support</Text>
          <Text style={styles.title}>You do not have to carry it alone.</Text>
          <Text style={styles.subtitle}>
            A gentle space to share your health journey, hear from people who
            understand, and take the next small step at your pace.
          </Text>
        </View>

        <View style={styles.supportList}>
          {supportPoints.map(point => (
            <View key={point} style={styles.supportItem}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>+</Text>
              </View>
              <Text style={styles.supportText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onGetStarted}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
          <Text style={styles.disclaimer}>
            Your story stays yours. Share only when you feel ready.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  hero: {
    marginTop: 36,
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 46,
    marginTop: 14,
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 17,
    lineHeight: 26,
    marginTop: 16,
  },
  supportList: {
    gap: 14,
  },
  supportItem: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkText: {
    color: '#047857',
    fontSize: 16,
    fontWeight: '900',
  },
  supportText: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    gap: 14,
  },
  primaryButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  disclaimer: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
