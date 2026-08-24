import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const moods = ['Calm', 'Anxious', 'Hopeful'];

const quickActions = [
  { label: 'Journal', detail: 'Capture a private reflection', icon: 'J' },
  { label: 'Find peers', detail: 'Browse people with shared experiences', icon: 'P' },
  { label: 'Crisis help', detail: 'View emergency support options', icon: '!' },
];

const supportSpaces = [
  { title: 'Anxiety support circle', members: '128 active today' },
  { title: 'Recovery milestones', members: '76 active today' },
];

const groundingTools = [
  { title: '2 min breathing', meta: 'Guided calm' },
  { title: 'Gratitude prompt', meta: 'Quick reflection' },
  { title: 'Body scan', meta: 'Release tension' },
];

type HomeScreenProps = {
  onOpenProfile: () => void;
};

function HomeScreen({ onOpenProfile }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.title}>Patient Stories</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.avatar}
            onPress={onOpenProfile}
          >
            <Text style={styles.avatarText}>P</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Share your health journey</Text>
          <Text style={styles.heroText}>
            Write updates, read patient experiences, and find gentle support
            from people who understand.
          </Text>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create Post</Text>
          </Pressable>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map(action => (
            <Pressable key={action.label} style={styles.quickCard}>
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>{action.icon}</Text>
              </View>
              <Text style={styles.quickTitle}>{action.label}</Text>
              <Text style={styles.quickDetail}>{action.detail}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.checkInPanel}>
          <View style={styles.checkInHeader}>
            <View>
              <Text style={styles.checkInTitle}>Today's check-in</Text>
              <Text style={styles.checkInSubtitle}>A gentle snapshot for you</Text>
            </View>
            <Text style={styles.checkInScore}>72%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.checkInStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>mood logs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>18m</Text>
              <Text style={styles.statLabel}>mindful time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>peer replies</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
        </View>

        <View style={styles.moodRow}>
          {moods.map(mood => (
            <Pressable key={mood} style={styles.moodChip}>
              <Text style={styles.moodText}>{mood}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support spaces</Text>
        </View>

        <View style={styles.spaceList}>
          {supportSpaces.map(space => (
            <Pressable key={space.title} style={styles.spaceCard}>
              <View style={styles.spaceAccent} />
              <View style={styles.spaceContent}>
                <Text style={styles.spaceTitle}>{space.title}</Text>
                <Text style={styles.spaceMeta}>{space.members}</Text>
              </View>
              <Text style={styles.spaceArrow}>&gt;</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grounding tools</Text>
        </View>

        <View style={styles.toolRow}>
          {groundingTools.map(tool => (
            <Pressable key={tool.title} style={styles.toolCard}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolMeta}>{tool.meta}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postAvatar}>
              <Text style={styles.postAvatarText}>M</Text>
            </View>
            <View>
              <Text style={styles.author}>Maya</Text>
              <Text style={styles.time}>12 min ago</Text>
            </View>
          </View>
          <Text style={styles.postTitle}>A small win today</Text>
          <Text style={styles.postBody}>
            I went for a short walk after a hard morning. It was not perfect,
            but it helped me breathe a little easier.
          </Text>
          <View style={styles.postFooter}>
            <Text style={styles.footerText}>24 supports</Text>
            <Text style={styles.footerText}>8 replies</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  heroText: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  quickCard: {
    flex: 1,
    minHeight: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconText: {
    color: '#0F766E',
    fontSize: 15,
    fontWeight: '900',
  },
  quickTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },
  quickDetail: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  checkInPanel: {
    backgroundColor: '#17324D',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  checkInTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  checkInSubtitle: {
    color: '#C8D5E2',
    fontSize: 13,
    marginTop: 4,
  },
  checkInScore: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D4966',
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    width: '72%',
    height: '100%',
    backgroundColor: '#34D399',
  },
  checkInStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  statLabel: {
    color: '#C8D5E2',
    fontSize: 11,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#3E5C78',
    marginHorizontal: 10,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodText: {
    color: '#2563EB',
    fontWeight: '800',
  },
  spaceList: {
    gap: 10,
  },
  spaceCard: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  spaceAccent: {
    width: 5,
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  spaceContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  spaceTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  spaceMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  spaceArrow: {
    color: '#9CA3AF',
    fontSize: 28,
    paddingRight: 14,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toolCard: {
    flex: 1,
    minHeight: 82,
    backgroundColor: '#FDFBF3',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE6C8',
    justifyContent: 'space-between',
  },
  toolTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  toolMeta: {
    color: '#7C6F4F',
    fontSize: 11,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  author: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  time: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  postTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 16,
  },
  postBody: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default HomeScreen;
