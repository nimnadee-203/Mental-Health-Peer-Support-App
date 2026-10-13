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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export interface AppNotification {
  id: string;
  type: 'checkin' | 'group' | 'resource' | 'activity' | 'welcome';
  icon: keyof typeof Feather.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  action?: 'checkin' | 'groups' | 'resources' | 'activity';
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'checkin',
    icon: 'smile',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    title: 'Daily Check-in Reminder',
    body: 'Take a gentle moment to record how you are feeling today.',
    time: '10m ago',
    isRead: false,
    action: 'checkin',
  },
  {
    id: 'notif-2',
    type: 'group',
    icon: 'message-circle',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'New Response in Support Group',
    body: 'Someone replied to your post in Managing Academic Stress.',
    time: '2h ago',
    isRead: false,
    action: 'groups',
  },
  {
    id: 'notif-3',
    type: 'resource',
    icon: 'book-open',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    title: 'New Coping Resource Added',
    body: 'Explore "Small Steps for Difficult Days" curated for your wellbeing.',
    time: '5h ago',
    isRead: false,
    action: 'resources',
  },
  {
    id: 'notif-4',
    type: 'activity',
    icon: 'activity',
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    title: 'Mindfulness Break Reminder',
    body: 'A quick 2-minute breathing exercise can help settle a busy mind.',
    time: '1d ago',
    isRead: true,
    action: 'activity',
  },
  {
    id: 'notif-5',
    type: 'welcome',
    icon: 'shield',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    title: 'Safe Space Confirmation',
    body: 'Your identity stays protected. Share only when and what you feel ready.',
    time: '2d ago',
    isRead: true,
  },
];

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  // Load and persist notifications
  useEffect(() => {
    const loadStoredNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('@peer_support_notifications_v1');
        if (stored) {
          setNotifications(JSON.parse(stored));
        } else {
          setNotifications(INITIAL_NOTIFICATIONS);
          await AsyncStorage.setItem('@peer_support_notifications_v1', JSON.stringify(INITIAL_NOTIFICATIONS));
        }
      } catch {
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    };
    loadStoredNotifications();
  }, []);

  const persistNotifications = useCallback(async (updated: AppNotification[]) => {
    setNotifications(updated);
    try {
      await AsyncStorage.setItem('@peer_support_notifications_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const markAllNotificationsAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    persistNotifications(updated);
    setToastMessage('All notifications marked as read');
  }, [notifications, persistNotifications]);

  const dismissNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    persistNotifications(updated);
  }, [notifications, persistNotifications]);

  const clearAllNotifications = useCallback(() => {
    persistNotifications([]);
    setToastMessage('Notifications cleared');
  }, [persistNotifications]);

  const handleNotificationPress = useCallback((notif: AppNotification) => {
    // Mark as read
    const updated = notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n);
    persistNotifications(updated);
    setShowNotifications(false);

    // Execute navigation action
    if (notif.action === 'checkin') {
      setToastMessage('How are you feeling right now? Tap a mood below 👇');
    } else if (notif.action === 'groups') {
      onOpenGroups?.();
    } else if (notif.action === 'resources') {
      onOpenResources?.();
    } else if (notif.action === 'activity') {
      onOpenActivity?.('breathing');
    }
  }, [notifications, persistNotifications, onOpenGroups, onOpenResources, onOpenActivity]);

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
          interest => {
            const articleAny = article as any;
            return (
              (Array.isArray(articleAny?.tags) &&
                articleAny.tags.some(
                  (t: any) =>
                    t &&
                    t.toString().toLowerCase().includes(interest.toString().toLowerCase()),
                )) ||
              (article?.title &&
                article.title
                  .toLowerCase()
                  .includes(interest.toString().toLowerCase())) ||
              (article?.description &&
                article.description
                  .toLowerCase()
                  .includes(interest.toString().toLowerCase())) ||
              (articleAny?.summary &&
                articleAny.summary
                  .toLowerCase()
                  .includes(interest.toString().toLowerCase()))
            );
          },
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
      ? (((recommendedArticle as any)?.tags?.[0] || recommendedArticle?.category || 'FOR YOU')).toUpperCase()
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
            <Text style={styles.subGreeting}>WELCOME BACK</Text>
            <Text style={styles.mainGreeting}>{`${greetingTime}, ${firstName}`}</Text>
            <Text style={styles.headerSubtitle}>How are you feeling today?</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowNotifications(true)}
              accessibilityLabel={`Notifications, ${unreadNotifCount} unread`}
              accessibilityRole="button"
            >
              <Feather name="bell" size={20} color="#1E293B" />
              {unreadNotifCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={onOpenProfile}
              accessibilityLabel="Profile"
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#2563EB' }}>
                {(profile?.email || profile?.fullName || 'U').trim().charAt(0).toUpperCase()}
              </Text>
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
            {recommendedArticle?.title || 'Daily Wellness Reflection'}
          </Text>
          <Text style={styles.recommendedDesc}>
            {(recommendedArticle as any)?.summary || recommendedArticle?.description || 'Take a mindful pause for yourself today.'}
          </Text>

          <Text style={styles.recommendedFooter}>
            {(recommendedArticle as any)?.readTimeMinutes
              ? `${(recommendedArticle as any).readTimeMinutes} min read`
              : recommendedArticle?.readTime || '3 min read'}
          </Text>
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
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowNotifications(false)}
          />
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Notifications</Text>
                {unreadNotifCount > 0 && (
                  <View style={styles.unreadCountBadge}>
                    <Text style={styles.unreadCountBadgeText}>{unreadNotifCount} new</Text>
                  </View>
                )}
              </View>

              <View style={styles.modalHeaderActions}>
                {unreadNotifCount > 0 && (
                  <Pressable
                    style={styles.markAllReadBtn}
                    onPress={markAllNotificationsAsRead}
                  >
                    <Text style={styles.markAllReadText}>Mark all read</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.modalCloseCircle}
                  onPress={() => setShowNotifications(false)}
                  accessibilityLabel="Close notifications"
                >
                  <Feather name="x" size={18} color="#64748B" />
                </Pressable>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.notifFilterRow}>
              <Pressable
                style={[styles.notifFilterTab, notifFilter === 'all' && styles.notifFilterTabActive]}
                onPress={() => setNotifFilter('all')}
              >
                <Text style={[styles.notifFilterText, notifFilter === 'all' && styles.notifFilterTextActive]}>
                  All ({notifications.length})
                </Text>
              </Pressable>
              <Pressable
                style={[styles.notifFilterTab, notifFilter === 'unread' && styles.notifFilterTabActive]}
                onPress={() => setNotifFilter('unread')}
              >
                <Text style={[styles.notifFilterText, notifFilter === 'unread' && styles.notifFilterTextActive]}>
                  Unread ({unreadNotifCount})
                </Text>
              </Pressable>
            </View>

            {/* Notifications Scroll List */}
            <ScrollView
              style={styles.notifScrollView}
              contentContainerStyle={styles.notifScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {(() => {
                const displayed = notifFilter === 'unread'
                  ? notifications.filter(n => !n.isRead)
                  : notifications;

                if (displayed.length === 0) {
                  return (
                    <View style={styles.notifEmptyBox}>
                      <View style={styles.notifEmptyIconCircle}>
                        <Feather name="check" size={28} color="#059669" />
                      </View>
                      <Text style={styles.notifEmptyTitle}>All caught up!</Text>
                      <Text style={styles.notifEmptySub}>
                        {notifFilter === 'unread'
                          ? 'You have no unread notifications.'
                          : 'No notifications at this time.'}
                      </Text>
                    </View>
                  );
                }

                return displayed.map(item => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.notificationItem,
                      !item.isRead && styles.notificationItemUnread,
                    ]}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <View style={[styles.notifIconBox, { backgroundColor: item.iconBg }]}>
                      <Feather name={item.icon} size={18} color={item.iconColor} />
                    </View>

                    <View style={styles.notifBodyCol}>
                      <View style={styles.notifTitleTimeRow}>
                        <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                          {item.title}
                        </Text>
                        <Text style={styles.notifTimeText}>{item.time}</Text>
                      </View>
                      <Text style={styles.notifBodyText} numberOfLines={2}>
                        {item.body}
                      </Text>
                      {item.action && (
                        <View style={styles.notifActionRow}>
                          <Text style={styles.notifActionLink}>Open ›</Text>
                        </View>
                      )}
                    </View>

                    <Pressable
                      style={styles.notifDismissBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        dismissNotification(item.id);
                      }}
                      hitSlop={8}
                      accessibilityLabel="Dismiss notification"
                    >
                      <Feather name="x" size={14} color="#94A3B8" />
                    </Pressable>

                    {!item.isRead && <View style={styles.notifUnreadDot} />}
                  </Pressable>
                ));
              })()}
            </ScrollView>

            {/* Footer */}
            {notifications.length > 0 && (
              <View style={styles.notifFooterRow}>
                <Pressable onPress={clearAllNotifications}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
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
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 12,
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadCountBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unreadCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A5AD8',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A5AD8',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  notifFilterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  notifFilterTabActive: {
    backgroundColor: '#5A5AD8',
  },
  notifFilterText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  notifFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  notifScrollView: {
    maxHeight: 380,
  },
  notifScrollContent: {
    paddingVertical: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  notificationItemUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  notifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBodyCol: {
    flex: 1,
    paddingRight: 16,
  },
  notifTitleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  notifTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifBodyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
  },
  notifActionRow: {
    marginTop: 4,
  },
  notifActionLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5A5AD8',
  },
  notifDismissBtn: {
    padding: 4,
    marginLeft: 4,
  },
  notifUnreadDot: {
    position: 'absolute',
    top: 14,
    right: 32,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#5A5AD8',
  },
  notifEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  notifEmptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notifEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  notifEmptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
  notifFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
