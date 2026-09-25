import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthUserId } from '../api/authStore';
import { getUserProfile } from '../api/profileApi';
import { UserProfile } from '../types/user';
import { ResourceArticle, resourceArticles } from '../types/ResourceArticle';

const moods = [
  { label: 'Very low', emoji: '😭', key: 'Very low' },
  { label: 'Low', emoji: '😔', key: 'Low' },
  { label: 'Okay', emoji: '😐', key: 'Okay' },
  { label: 'Good', emoji: '😊', key: 'Good' },
  { label: 'Great', emoji: '😁', key: 'Great' },
];

type HomeScreenProps = {
  onOpenProfile?: () => void;
  onOpenResources?: () => void;
  onOpenArticle?: (article: ResourceArticle) => void;
  onOpenActivity?: (
    activity?:
      | 'breathing'
      | 'mindfulness'
      | 'journaling'
      | 'digitalDetox'
      | 'healthyRoutine',
  ) => void;
  onOpenGroups?: () => void;
  onOpenEmergencySupport?: () => void;
};

export default function HomeScreen({
  onOpenProfile,
  onOpenResources,
  onOpenArticle,
  onOpenActivity,
  onOpenGroups,
  onOpenEmergencySupport,
}: HomeScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loggedMoods, setLoggedMoods] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<{ [key: string]: boolean }>({});
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchProfileData = useCallback(async () => {
    const userId = getAuthUserId();
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch {
      // Ignore fetch error in home
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleSelectMood = (moodLabel: string, emoji: string) => {
    setSelectedMood(moodLabel);
    if (!loggedMoods.includes(moodLabel)) {
      setLoggedMoods(prev => [...prev, moodLabel]);
    }
    setToastMessage(`Checked in as ${moodLabel} ${emoji}`);
  };

  const toggleGroupJoin = (groupName: string) => {
    setJoinedGroups(prev => {
      const isJoined = !prev[groupName];
      setToastMessage(isJoined ? `Joined ${groupName}!` : `Left ${groupName}`);
      return { ...prev, [groupName]: isJoined };
    });
  };

  const hour = new Date().getHours();
  const greetingTime =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.fullName ? profile.fullName.trim().split(' ')[0] : 'Alex';

  // Dynamic user interests & preference matching
  const userInterests = profile?.interests || [];

  // Match recommended article based on user's interests/preferences safely
  const recommendedArticle = React.useMemo(() => {
    if (userInterests && userInterests.length > 0) {
      const matched = resourceArticles.find(article =>
        userInterests.some(
          interest =>
            (Array.isArray(article?.tags) &&
              article.tags.some(
                t =>
                  t &&
                  t.toLowerCase().includes(interest.toString().toLowerCase()),
              )) ||
            (article?.title &&
              article.title
                .toLowerCase()
                .includes(interest.toString().toLowerCase())) ||
            (article?.summary &&
              article.summary
                .toLowerCase()
                .includes(interest.toString().toLowerCase())),
        ),
      );
      if (matched) return matched;
    }
    return (
      resourceArticles.find(
        a => a.id === 'art-1' || a.title?.toLowerCase().includes('stress'),
      ) || resourceArticles[0]
    );
  }, [userInterests]);

  const recommendedBadge =
    userInterests && userInterests.length > 0
      ? (recommendedArticle?.tags?.[0] || 'FOR YOU').toUpperCase()
      : 'STRESS';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.subGreeting}>{greetingTime}</Text>
            <Text style={styles.mainGreeting}>{`${greetingTime}, ${firstName} 👋`}</Text>
            <Text style={styles.headerSubtitle}>How are you feeling today?</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowNotifications(true)}
              accessibilityLabel="Notifications"
            >
              <Text style={styles.iconEmoji}>🔔</Text>
              <View style={styles.notificationBadge} />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={onOpenProfile}
              accessibilityLabel="Profile"
            >
              <Text style={styles.iconEmoji}>😊</Text>
            </Pressable>
          </View>
        </View>

        {/* Toast Feedback */}
        {toastMessage && (
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Mood Tracker Hero Card */}
        <View style={styles.moodHeroCard}>
          <Text style={styles.moodHeroTitle}>How are you feeling today?</Text>

          <View style={styles.moodGrid}>
            {moods.map(moodItem => {
              const isSelected = selectedMood === moodItem.label;
              return (
                <Pressable
                  key={moodItem.key}
                  testID={`mood-${moodItem.label}`}
                  style={[
                    styles.moodCardItem,
                    isSelected && styles.moodCardItemSelected,
                  ]}
                  onPress={() =>
                    handleSelectMood(moodItem.label, moodItem.emoji)
                  }
                >
                  <Text style={styles.moodEmoji}>{moodItem.emoji}</Text>
                  <Text
                    style={[
                      styles.moodCardLabel,
                      isSelected && styles.moodCardLabelSelected,
                    ]}
                  >
                    {moodItem.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.moodActionButton}
            onPress={() => {
              if (!selectedMood) {
                setToastMessage('Please select how you are feeling above');
              } else {
                setToastMessage(`Mood ${selectedMood} logged for today! ✨`);
              }
            }}
          >
            <Text style={styles.moodActionButtonText}>
              {selectedMood
                ? `Logged as ${selectedMood} today`
                : 'Select a mood first'}
            </Text>
          </Pressable>
        </View>

        {/* RECOMMENDED FOR YOU */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>RECOMMENDED FOR YOU</Text>
          <Pressable onPress={onOpenResources}>
            <Text style={styles.sectionHeaderLink}>View all</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.recommendedCard}
          onPress={() => onOpenArticle && onOpenArticle(recommendedArticle)}
        >
          <View style={styles.recommendedTopRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>{recommendedBadge}</Text>
            </View>
            <Pressable
              onPress={() => {
                setIsBookmarked(!isBookmarked);
                setToastMessage(
                  !isBookmarked
                    ? 'Saved to bookmarks'
                    : 'Removed from bookmarks',
                );
              }}
              hitSlop={8}
            >
              <Text style={styles.bookmarkIcon}>
                {isBookmarked ? '🔖' : '🏷️'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.recommendedTitle}>
            {recommendedArticle.title}
          </Text>
          <Text style={styles.recommendedDesc}>
            {recommendedArticle.summary}
          </Text>

          <Text style={styles.recommendedFooter}>{`${recommendedArticle.readTimeMinutes} min read`}</Text>
        </Pressable>

        {/* SOMETHING GOOD FOR YOU */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>SOMETHING GOOD FOR YOU</Text>
          <Pressable onPress={onOpenResources}>
            <Text style={styles.sectionHeaderLink}>See all</Text>
          </Pressable>
        </View>

        {/* Activity 1 */}
        <View style={styles.activityCard}>
          <View style={[styles.activityIconBox, { backgroundColor: '#D4F4E4' }]}>
            <Text style={styles.activityEmoji}>🌱</Text>
          </View>
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>5-minute breathing</Text>
            <Text style={styles.activityDesc}>
              Calm your nervous system with slow, guided breathing.
            </Text>
            <Text style={styles.activityMeta}>5 min</Text>
          </View>
          <Pressable
            style={styles.actionPillButton}
            onPress={() => onOpenActivity && onOpenActivity('breathing')}
          >
            <Text style={styles.actionPillButtonText}>Start</Text>
          </Pressable>
        </View>

        {/* Activity 2 */}
        <View style={styles.activityCard}>
          <View style={[styles.activityIconBox, { backgroundColor: '#E5DCF9' }]}>
            <Text style={styles.activityEmoji}>🧘</Text>
          </View>
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Quick mindfulness break</Text>
            <Text style={styles.activityDesc}>
              Pause, observe, and react with a short, mindful moment.
            </Text>
            <Text style={styles.activityMeta}>3 min</Text>
          </View>
          <Pressable
            style={styles.actionPillButton}
            onPress={() => onOpenActivity && onOpenActivity('mindfulness')}
          >
            <Text style={styles.actionPillButtonText}>Start</Text>
          </Pressable>
        </View>

        {/* FIND YOUR COMMUNITY */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>FIND YOUR COMMUNITY</Text>
          <Pressable onPress={onOpenGroups}>
            <Text style={styles.sectionHeaderLink}>See all</Text>
          </Pressable>
        </View>

        {/* Community 1 */}
        <View style={styles.communityCard}>
          <View style={[styles.activityIconBox, { backgroundColor: '#FCE6D6' }]}>
            <Text style={styles.activityEmoji}>📚</Text>
          </View>
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Managing Academic Stress</Text>
            <Text style={styles.activityDesc}>
              Share strategies and support for academic pressures.
            </Text>
            <View style={styles.memberMetaRow}>
              <View style={styles.avatarDotsRow}>
                <View style={[styles.avatarDot, { backgroundColor: '#F87171' }]} />
                <View
                  style={[
                    styles.avatarDot,
                    { backgroundColor: '#60A5FA', marginLeft: -6 },
                  ]}
                />
                <View
                  style={[
                    styles.avatarDot,
                    { backgroundColor: '#34D399', marginLeft: -6 },
                  ]}
                />
              </View>
              <Text style={styles.memberCountText}>3.2k members</Text>
            </View>
          </View>
          <Pressable
            style={[
              styles.actionPillButton,
              joinedGroups['Academic'] && styles.actionPillButtonJoined,
            ]}
            onPress={() => {
              toggleGroupJoin('Academic');
              if (onOpenGroups) onOpenGroups();
            }}
          >
            <Text
              style={[
                styles.actionPillButtonText,
                joinedGroups['Academic'] && styles.actionPillButtonTextJoined,
              ]}
            >
              {joinedGroups['Academic'] ? 'Joined' : 'Join'}
            </Text>
          </Pressable>
        </View>

        {/* Community 2 */}
        <View style={styles.communityCard}>
          <View style={[styles.activityIconBox, { backgroundColor: '#E5DCF9' }]}>
            <Text style={styles.activityEmoji}>🧘‍♀️</Text>
          </View>
          <View style={styles.activityBody}>
            <Text style={styles.activityTitle}>Mindfulness & Healthy Habits</Text>
            <Text style={styles.activityDesc}>
              Build gentle daily practices alongside others.
            </Text>
            <View style={styles.memberMetaRow}>
              <View style={styles.avatarDotsRow}>
                <View style={[styles.avatarDot, { backgroundColor: '#FBBF24' }]} />
                <View
                  style={[
                    styles.avatarDot,
                    { backgroundColor: '#A78BFA', marginLeft: -6 },
                  ]}
                />
                <View
                  style={[
                    styles.avatarDot,
                    { backgroundColor: '#F472B6', marginLeft: -6 },
                  ]}
                />
              </View>
              <Text style={styles.memberCountText}>850 members</Text>
            </View>
          </View>
          <Pressable
            style={[
              styles.actionPillButton,
              joinedGroups['Mindfulness'] && styles.actionPillButtonJoined,
            ]}
            onPress={() => {
              toggleGroupJoin('Mindfulness');
              if (onOpenGroups) onOpenGroups();
            }}
          >
            <Text
              style={[
                styles.actionPillButtonText,
                joinedGroups['Mindfulness'] && styles.actionPillButtonTextJoined,
              ]}
            >
              {joinedGroups['Mindfulness'] ? 'Joined' : 'Join'}
            </Text>
          </Pressable>
        </View>

        {/* NEED PROFESSIONAL SUPPORT BANNER */}
        <View style={styles.proSupportCard}>
          <View style={styles.proSupportTop}>
            <View style={styles.proSupportIconBox}>
              <Text style={styles.proSupportEmoji}>💼</Text>
            </View>
            <View style={styles.proSupportTextCol}>
              <Text style={styles.proSupportTitle}>
                Need professional support?
              </Text>
              <Text style={styles.proSupportDesc}>
                Connect with a qualified professional when you need additional
                support.
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.proSupportButton}
            onPress={onOpenEmergencySupport}
          >
            <Text style={styles.proSupportButtonText}>Explore support</Text>
          </Pressable>
        </View>

        {/* NEED URGENT HELP BANNER */}
        <Pressable
          style={styles.urgentHelpCard}
          onPress={onOpenEmergencySupport}
        >
          <View style={styles.urgentIconBox}>
            <Text style={styles.urgentEmoji}>🤝</Text>
          </View>
          <View style={styles.urgentTextCol}>
            <Text style={styles.urgentTitle}>Need urgent help?</Text>
            <Text style={styles.urgentDesc}>
              Access emergency support information.
            </Text>
          </View>
          <Text style={styles.urgentChevron}>›</Text>
        </Pressable>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <Pressable onPress={() => setShowNotifications(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.notificationItem}>
              <Text style={styles.notifIcon}>🌿</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Daily Check-in Reminder</Text>
                <Text style={styles.notifTime}>Take a moment to record your mood today.</Text>
              </View>
            </View>
            <View style={styles.notificationItem}>
              <Text style={styles.notifIcon}>💬</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Community Update</Text>
                <Text style={styles.notifTime}>New responses in Academic Stress group.</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },

  /* Header Bar */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  subGreeting: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 2,
  },
  mainGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F1F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },

  /* Toast Box */
  toastBox: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  /* Mood Tracker Hero Card */
  moodHeroCard: {
    backgroundColor: '#C3C5FC',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  moodHeroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212059',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  moodCardItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodCardItemSelected: {
    borderColor: '#4E46E5',
    backgroundColor: '#F5F5FF',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  moodCardLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  moodCardLabelSelected: {
    color: '#4E46E5',
    fontWeight: '700',
  },
  moodActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  moodActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212059',
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C7C8A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionHeaderLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A68',
  },

  /* Recommended Card */
  recommendedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECECF0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  recommendedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagBadge: {
    backgroundColor: '#E4F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  recommendedDesc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 12,
  },
  recommendedFooter: {
    fontSize: 12,
    color: '#8E8E93',
  },

  /* Something Good / Community Card */
  activityCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFF0F4',
  },
  communityCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFF0F4',
  },
  activityIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityBody: {
    flex: 1,
    marginHorizontal: 14,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  activityMeta: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  avatarDotsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  avatarDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  memberCountText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  actionPillButton: {
    backgroundColor: '#D7EFE6',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionPillButtonJoined: {
    backgroundColor: '#E2E8F0',
  },
  actionPillButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B503E',
  },
  actionPillButtonTextJoined: {
    color: '#475569',
  },

  /* Professional Support Banner */
  proSupportCard: {
    backgroundColor: '#EFF873',
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 14,
  },
  proSupportTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  proSupportIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proSupportEmoji: {
    fontSize: 22,
  },
  proSupportTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  proSupportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  proSupportDesc: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 16,
    marginTop: 4,
  },
  proSupportButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  proSupportButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },

  /* Urgent Help Banner */
  urgentHelpCard: {
    backgroundColor: '#F7B5C5',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  urgentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FDE4CD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentEmoji: {
    fontSize: 20,
  },
  urgentTextCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  urgentDesc: {
    fontSize: 12,
    color: '#444444',
    marginTop: 1,
  },
  urgentChevron: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalClose: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  notifIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  notifTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});
