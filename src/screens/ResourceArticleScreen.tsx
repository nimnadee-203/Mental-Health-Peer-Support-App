import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ResourceArticleScreenProps = {
  onBack: () => void;
};

function ResourceArticleScreen({ onBack }: ResourceArticleScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Pressable
            testID="resource-article-back"
            onPress={onBack}
            style={styles.backButton}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Resource</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.label}>EMOTIONAL WELLBEING</Text>
        <Text style={styles.title}>Take one breath at a time</Text>

        <Text style={styles.intro}>
          Difficult days can feel overwhelming, but small actions still count.
          Focus on one gentle movement, one slow breath, or one moment of stillness.
        </Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Start with one small thing</Text>
          <Text style={styles.body}>
            Instead of trying to fix everything at once, choose one manageable step.
            A short walk, a glass of water, or a quiet pause is still progress.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Take a mindful pause</Text>
          <Text style={styles.body}>
            Put one hand on your chest or stomach and notice the rise and fall of your
            breath. Let your breath slow down naturally and return to the present.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Be kind to yourself</Text>
          <Text style={styles.body}>
            You do not need to earn rest. Slow, gentle support is part of healing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F5F7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#1F2A37',
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#1F2A37',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 36,
  },
  label: {
    color: '#7A7F86',
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: 12,
  },
  title: {
    color: '#1F2A37',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 14,
  },
  intro: {
    color: '#6A7280',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  heading: {
    color: '#1F2A37',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    color: '#5F6875',
    fontSize: 14,
    lineHeight: 22,
  },
});

export default ResourceArticleScreen;