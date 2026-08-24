import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type OnboardingData = {
  selectedInterests: string[];
};

type OnboardingScreenProps = {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
};

const INTEREST_TOPICS = [
  'Anxiety Support',
  'Depression & Mood',
  'Stress Management',
  'Mindfulness',
  'Sleep & Recovery',
  'Self-Care Routines',
  'Peer Stories',
  'Grief & Healing',
];

const GUIDELINES = [
  {
    title: 'Respectful Communication',
    description: 'Maintain kindness, empathy, and constructive dialogue in all interactions.',
  },
  {
    title: 'Privacy & Confidentiality',
    description: 'Keep shared experiences within the support space and honor member privacy.',
  },
  {
    title: 'Safe Peer Support Space',
    description: 'Provide non-judgmental listening and encourage seeking professional care when needed.',
  },
];

function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Anxiety Support',
    'Self-Care Routines',
  ]);

  const totalSteps = 3;

  const toggleInterest = (topic: string) => {
    setSelectedInterests(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete({ selectedInterests });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete({ selectedInterests });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {currentStep === 1 ? (
          <View style={styles.stepContainer}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Welcome to MHA</Text>
            </View>

            <Text style={styles.title}>How the Peer Support Space Works</Text>
            <Text style={styles.subtitle}>
              Our platform connects you with compassionate peers and structured support
              groups tailored to your mental wellness journey.
            </Text>

            <View style={styles.cardList}>
              <View style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🤝</Text>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Connect with Peers</Text>
                  <Text style={styles.featureDesc}>
                    Share experiences and join support groups with individuals who understand your path.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🔒</Text>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Anonymous & Safe</Text>
                  <Text style={styles.featureDesc}>
                    Post anonymously whenever you need to discuss sensitive health matters safely.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🌱</Text>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Personalized Care</Text>
                  <Text style={styles.featureDesc}>
                    Receive group recommendations based on your selected interests and needs.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {currentStep === 2 ? (
          <View style={styles.stepContainer}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Personalize Your Experience</Text>
            </View>

            <Text style={styles.title}>Select Your Topics of Interest</Text>
            <Text style={styles.subtitle}>
              Choose topics you would like to explore. We will use these to recommend relevant peer support groups.
            </Text>

            <View style={styles.chipGrid}>
              {INTEREST_TOPICS.map(topic => {
                const isSelected = selectedInterests.includes(topic);
                return (
                  <Pressable
                    key={topic}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                    onPress={() => toggleInterest(topic)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {topic}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {currentStep === 3 ? (
          <View style={styles.stepContainer}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Community Principles</Text>
            </View>

            <Text style={styles.title}>Safety & Guidelines Agreement</Text>
            <Text style={styles.subtitle}>
              To ensure a safe environment for everyone, all members agree to uphold our community standards.
            </Text>

            <View style={styles.cardList}>
              {GUIDELINES.map(g => (
                <View key={g.title} style={styles.guidelineCard}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>{g.title}</Text>
                    <Text style={styles.featureDesc}>{g.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            onPress={handleBack}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryButton,
            currentStep > 1 && styles.flexButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentStep === totalSteps ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  stepText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  skipText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    gap: 12,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  badgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
    marginBottom: 16,
  },
  cardList: {
    gap: 14,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  featureInfo: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  featureDesc: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  chipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 14,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkIcon: {
    color: '#047857',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    flex: 1,
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
  secondaryButton: {
    width: 100,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '800',
  },
  flexButton: {
    flex: 1,
  },
});

export default OnboardingScreen;
