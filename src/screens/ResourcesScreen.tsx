import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const quickTips = [
  {
    title: 'Breathing exercise',
    time: '5 min',
    accent: '#C9E8D3',
    icon: '❋',
  },
  {
    title: 'Mindfulness break',
    time: '3 min',
    accent: '#D8E6FC',
    icon: '✦',
  },
  {
    title: 'Journaling prompt',
    time: 'Open-ended',
    accent: '#F2D9BC',
    icon: '✎',
  },
];

type ResourcesScreenProps = {
  onOpenArticle: () => void;
};

function ResourcesScreen({ onOpenArticle }: ResourcesScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Emotional Wellbeing Article */}
        <Pressable
          testID="resource-article-card"
          style={({ pressed }) => [
            styles.topCard,
            pressed && styles.cardPressed,
          ]}
          onPress={onOpenArticle}
        >
          <Text style={styles.miniLabel}>EMOTIONAL WELLBEING</Text>

          <View style={styles.topRow}>
            <View style={styles.iconWrap}>
              <Text style={styles.iconText}>✦</Text>
            </View>

            <View style={styles.topTextWrap}>
              <Text style={styles.cardTitle}>
                Small Steps for Difficult Days
              </Text>

              <Text style={styles.cardBody}>
                When everything feels hard, small actions still count.
              </Text>
            </View>

            <View style={styles.arrowButton}>
              <Text style={styles.arrowText}>↗</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>TRY SOMETHING NEW</Text>

          {quickTips.map(item => (
            <View key={item.title} style={styles.tipRow}>
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: item.accent },
                ]}
              >
                <Text style={styles.tipIconText}>{item.icon}</Text>
              </View>

              <View style={styles.tipCopy}>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipMeta}>{item.time}</Text>
              </View>

              <Pressable style={styles.startButton}>
                <Text style={styles.startButtonText}>Start</Text>
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.savedRow}>
            <View style={styles.savedLeft}>
              <View style={styles.savedIcon}>
                <Text style={styles.savedIconText}>✚</Text>
              </View>

              <Text style={styles.savedText}>Saved resources</Text>
            </View>

            <Text style={styles.chevron}>{'>'}</Text>
          </Pressable>
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
  },

  topCard: {
    backgroundColor: '#F7F4F0',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6E3DF',
    marginBottom: 20,
  },

  cardPressed: {
    opacity: 0.8,
  },

  miniLabel: {
    color: '#8B8F93',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '800',
    marginBottom: 10,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F8D978',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 22,
  },

  topTextWrap: {
    flex: 1,
    marginRight: 10,
  },

  cardTitle: {
    color: '#1F2A37',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  cardBody: {
    color: '#6A7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    color: '#1F2A37',
    fontSize: 18,
    fontWeight: '700',
  },

  sectionContainer: {
    paddingTop: 12,
  },

  sectionTitle: {
    color: '#7A7F86',
    fontSize: 12,
    letterSpacing: 1.1,
    fontWeight: '800',
    marginBottom: 12,
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginBottom: 10,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  tipIconText: {
    fontSize: 18,
  },

  tipCopy: {
    flex: 1,
  },

  tipTitle: {
    color: '#202938',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },

  tipMeta: {
    color: '#758195',
    fontSize: 12,
    fontWeight: '500',
  },

  startButton: {
    backgroundColor: '#CBE9D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  startButtonText: {
    color: '#1D2E25',
    fontSize: 12,
    fontWeight: '800',
  },

  savedRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  savedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  savedIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E7F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  savedIconText: {
    fontSize: 16,
  },

  savedText: {
    color: '#1F2A37',
    fontSize: 15,
    fontWeight: '700',
  },

  chevron: {
    color: '#5A6473',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default ResourcesScreen;