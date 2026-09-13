import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  peerName: string;
  avatarEmoji: string;
  avatarBgColor: string;
  avatarIsCircle: boolean;
  isOnline: boolean;
  groupName: string;
  groupEmoji: string;
  groupBgColor: string;
  groupBgColorEnd: string;
  lastMessageText: string;
  lastMessageSender: string;
  lastMessageAt: string | null;
  unreadCount: number;
  participants: string[];
}

interface MessagesScreenProps {
  onOpenChat: (conversation: Conversation) => void;
  /** Called whenever the total unread count changes — used to update the nav badge */
  onUnreadCountChange?: (count: number) => void;
}

// ─── Local seed data (shown while backend loads / when offline) ───────────────
const SEED_CONVERSATIONS: Conversation[] = [
  {
    _id: 'seed_alex',
    type: 'direct',
    peerName: 'Alex',
    avatarEmoji: '😊',
    avatarBgColor: '#C5DFF8',
    avatarIsCircle: true,
    isOnline: true,
    groupName: '',
    groupEmoji: '',
    groupBgColor: '',
    groupBgColorEnd: '',
    lastMessageText: 'Thanks for sharing that. I found the breathing activity really helpful!',
    lastMessageSender: 'Alex',
    lastMessageAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 10:42 AM
    unreadCount: 2,
    participants: ['You', 'Alex'],
  },
  {
    _id: 'seed_mindfulness',
    type: 'group',
    peerName: '',
    avatarEmoji: '🧘',
    avatarBgColor: '#D4C9F5',
    avatarIsCircle: false,
    isOnline: true,
    groupName: 'Mindfulness & Healthy Habits',
    groupEmoji: '🧘',
    groupBgColor: 'rgba(212,201,245,0.5)',
    groupBgColorEnd: 'rgba(212,201,245,0.25)',
    lastMessageText: "Sarah: Has anyone tried the new mindfulness activity in the app?",
    lastMessageSender: 'Sarah',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    participants: ['You', 'Sarah', 'Mike', 'Lena'],
  },
  {
    _id: 'seed_academic',
    type: 'group',
    peerName: '',
    avatarEmoji: '📚',
    avatarBgColor: '#FDDCB5',
    avatarIsCircle: false,
    isOnline: false,
    groupName: 'Managing Academic Stress',
    groupEmoji: '📚',
    groupBgColor: 'rgba(253,220,181,0.5)',
    groupBgColorEnd: 'rgba(253,220,181,0.25)',
    lastMessageText: 'Daniel: Thanks everyone for the support!',
    lastMessageSender: 'Daniel',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    participants: ['You', 'Daniel', 'Emma'],
  },
  {
    _id: 'seed_jamie',
    type: 'direct',
    peerName: 'Jamie',
    avatarEmoji: '🌱',
    avatarBgColor: '#C8EDD5',
    avatarIsCircle: true,
    isOnline: false,
    groupName: '',
    groupEmoji: '',
    groupBgColor: '',
    groupBgColorEnd: '',
    lastMessageText: "I completely understand how you're feeling.",
    lastMessageSender: 'Jamie',
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    participants: ['You', 'Jamie'],
  },
  {
    _id: 'seed_sam',
    type: 'direct',
    peerName: 'Sam',
    avatarEmoji: '🙂',
    avatarBgColor: '#F9D4E0',
    avatarIsCircle: true,
    isOnline: false,
    groupName: '',
    groupEmoji: '',
    groupBgColor: '',
    groupBgColorEnd: '',
    lastMessageText: 'Hope things feel a little easier soon 💙',
    lastMessageSender: 'Sam',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    participants: ['You', 'Sam'],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimestamp(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day → show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 6) {
    return date.toLocaleDateString([], { weekday: 'short' }); // Mon, Tue …
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// ─── ConversationRow ─────────────────────────────────────────────────────────
interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isUnread = conversation.unreadCount > 0;
  const displayName =
    conversation.type === 'group' ? conversation.groupName : conversation.peerName;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  // Avatar: circle for direct, rounded-square for group
  const avatarStyle = conversation.avatarIsCircle
    ? styles.avatarCircle
    : styles.avatarSquare;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${displayName}`}>
      <Animated.View
        style={[styles.rowOuter, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.rowInner}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View
              style={[
                avatarStyle,
                {
                  backgroundColor: conversation.avatarBgColor,
                  borderWidth: conversation.avatarIsCircle ? 0 : 1.5,
                  borderColor: conversation.avatarBgColor,
                },
              ]}>
              <Text style={styles.avatarEmoji}>
                {conversation.type === 'group'
                  ? conversation.groupEmoji
                  : conversation.avatarEmoji}
              </Text>
            </View>
            {/* Online indicator */}
            {conversation.isOnline && <View style={styles.onlineDot} />}
          </View>

          {/* Text content */}
          <View style={styles.rowContent}>
            {/* Name row */}
            <View style={styles.nameRow}>
              <Text
                style={[styles.name, isUnread && styles.nameUnread]}
                numberOfLines={1}>
                {displayName}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  isUnread && styles.timestampUnread,
                ]}>
                {formatTimestamp(conversation.lastMessageAt)}
              </Text>
            </View>

            {/* Last message */}
            <Text
              style={[
                styles.lastMessage,
                isUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}>
              {conversation.lastMessageText}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── MessagesScreen ───────────────────────────────────────────────────────────
export default function MessagesScreen({ onOpenChat, onUnreadCountChange }: MessagesScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fade-in animation for the list
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Propagate unread count to parent (nav badge)
  useEffect(() => {
    onUnreadCountChange?.(totalUnread);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalUnread]);

  // ── Fetch from backend (supplements local seed) ─────────────────────────────
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/conversations`);
        if (res.ok) {
          const data: Conversation[] = await res.json();
          if (data.length > 0) {
            setConversations(data);
          }
        }
      } catch {
        // Backend offline — seed data is already displayed
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter by search ─────────────────────────────────────────────────────────
  const filtered = conversations.filter(c => {
    const name =
      c.type === 'group' ? c.groupName.toLowerCase() : c.peerName.toLowerCase();
    const msg = c.lastMessageText.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  const handleOpenChat = useCallback(
    (conversation: Conversation) => {
      onOpenChat(conversation);
    },
    [onOpenChat],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Title + badge */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Messages</Text>
            {totalUnread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalUnread}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            Stay connected with your peer-support community.
          </Text>
        </View>
      </View>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="rgba(45,45,58,0.5)"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search conversations"
          />
        </View>
      </View>

      {/* ── Conversation list ───────────────────────────────────────────────── */}
      {loading && conversations === SEED_CONVERSATIONS ? (
        <ActivityIndicator style={styles.loader} color="#2D2D3A" />
      ) : (
        <Animated.View style={[styles.listWrapper, { opacity: fadeAnim }]}>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <Text style={styles.emptyText}>No conversations found.</Text>
            ) : (
              filtered.map(conv => (
                <ConversationRow
                  key={conv._id}
                  conversation={conv}
                  onPress={() => handleOpenChat(conv)}
                />
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Peer-support disclaimer banner ─────────────────────────────────── */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerEmoji}>🤝</Text>
        <Text style={styles.disclaimerText}>
          MindConnect messages are peer-support only. For professional
          mental-health support, visit the{' '}
          <Text style={styles.disclaimerLink}>Professional Support</Text>
          {' '}section.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: -0.48,
    color: '#2D2D3A',
  },
  badge: {
    backgroundColor: '#2D2D3A',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
  },
  badgeText: {
    fontFamily: 'Nunito-ExtraBold',
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B6B80',
    marginTop: 2,
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#A0A0B8',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 15,
    color: '#2D2D3A',
    padding: 0,
  },

  // ── List ────────────────────────────────────────────────────────────────────
  listWrapper: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  loader: {
    flex: 1,
    alignSelf: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontFamily: 'Nunito-Medium',
    fontSize: 14,
    color: '#A0A0B8',
    textAlign: 'center',
    marginTop: 32,
  },

  // ── Row ─────────────────────────────────────────────────────────────────────
  rowOuter: {
    overflow: 'hidden',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E8E8F0',
    backgroundColor: 'rgba(197,223,248,0.06)',
  },

  // Avatar
  avatarWrapper: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSquare: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  onlineDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    right: 1,
    top: 1,
  },

  // Row content
  rowContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  name: {
    fontFamily: 'Nunito-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    color: '#2D2D3A',
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    fontFamily: 'Nunito-ExtraBold',
    fontWeight: '800',
  },
  timestamp: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 16,
    color: '#A0A0B8',
  },
  timestampUnread: {
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    color: '#2D2D3A',
  },
  lastMessage: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
    color: '#A0A0B8',
    marginTop: 3,
  },
  lastMessageUnread: {
    fontFamily: 'Nunito-SemiBold',
    fontWeight: '600',
    color: '#6B6B80',
  },

  // ── Disclaimer ──────────────────────────────────────────────────────────────
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    gap: 8,
  },
  disclaimerEmoji: {
    fontSize: 14,
    lineHeight: 21,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B6B80',
  },
  disclaimerLink: {
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
    color: '#2D2D3A',
    textDecorationLine: 'underline',
  },
});
