import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_BASE, COMMUNITY_API_BASE } from '../config/api';
import { getAuthUserId } from '../api/authStore';

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

interface TeamMember {
  _id: string;
  fullName: string;
  role: string;
}

interface MessagesScreenProps {
  onOpenChat: (conversation: Conversation) => void;
  onUnreadCountChange?: (count: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimestamp(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 6) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// ─── ConversationRow ─────────────────────────────────────────────────────────
function ConversationRow({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isUnread = conversation.unreadCount > 0;
  const displayName = conversation.type === 'group' ? conversation.groupName : conversation.peerName;

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const avatarStyle = conversation.avatarIsCircle ? styles.avatarCircle : styles.avatarSquare;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.rowOuter, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.rowInner}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={[avatarStyle, { backgroundColor: conversation.avatarBgColor, borderWidth: conversation.avatarIsCircle ? 0 : 1.5, borderColor: conversation.avatarBgColor }]}>
              <Feather 
                name={conversation.type === 'group' ? 'users' : 'user'} 
                size={20} 
                color="#5A5AD8" 
              />
            </View>
            {conversation.isOnline && <View style={styles.onlineDot} />}
          </View>

          {/* Text content */}
          <View style={styles.rowContent}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, isUnread && styles.nameUnread]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.timestamp, isUnread && styles.timestampUnread]}>
                {formatTimestamp(conversation.lastMessageAt)}
              </Text>
            </View>
            <Text style={[styles.lastMessage, isUnread && styles.lastMessageUnread]} numberOfLines={1}>
              {conversation.lastMessageText || 'No messages yet'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── MessagesScreen ───────────────────────────────────────────────────────────
export default function MessagesScreen({ onOpenChat, onUnreadCountChange }: MessagesScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [team, setTeam] = useState<{ moderators: TeamMember[]; professionals: TeamMember[] }>({ moderators: [], professionals: [] });
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const userId = getAuthUserId() || 'guest';
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    onUnreadCountChange?.(totalUnread);
  }, [totalUnread, onUnreadCountChange]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/conversations?userId=${userId}`);
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [userId, fadeAnim]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchTeam = async () => {
    setLoadingTeam(true);
    try {
      const res = await fetch(`${COMMUNITY_API_BASE}/communities/team`);
      if (res.ok) setTeam(await res.json());
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleOpenNewChatModal = () => {
    setIsNewChatModalOpen(true);
    if (team.moderators.length === 0 && team.professionals.length === 0) {
      fetchTeam();
    }
  };

  const handleStartChat = async (member: TeamMember) => {
    if (creatingChat) return;
    setCreatingChat(true);
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participants: [userId, member._id],
          peerName: member.fullName,
          avatarEmoji: member.role === 'moderator' ? '🛡️' : '👨‍⚕️',
          avatarBgColor: member.role === 'moderator' ? '#EDE8FA' : '#E8F0FF',
        }),
      });
      if (res.ok) {
        const conv = await res.json();
        setIsNewChatModalOpen(false);
        onOpenChat(conv);
        // Refresh local list in background
        fetchConversations();
      }
    } catch (e) {
      console.warn('Failed to start chat:', e);
    } finally {
      setCreatingChat(false);
    }
  };

  const filtered = conversations.filter(c => {
    const name = c.type === 'group' ? c.groupName.toLowerCase() : c.peerName.toLowerCase();
    const msg = c.lastMessageText.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Messages</Text>
            {totalUnread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalUnread}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>Chat privately with professionals & moderators.</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={16} color="#A0A0B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#A0A0B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={styles.loader} color="#5A5AD8" />
      ) : (
        <Animated.View style={[styles.listWrapper, { opacity: fadeAnim }]}>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={[styles.emptyIconBox, { backgroundColor: '#F0EBF8' }]}>
                  <Feather name="message-circle" size={32} color="#7C67D6" />
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyBody}>Start a conversation with a medical professional or community moderator for support.</Text>
                <Pressable style={styles.emptyBtn} onPress={handleOpenNewChatModal}>
                  <Feather name="edit" size={14} color="#FFFFFF" />
                  <Text style={styles.emptyBtnText}>New Chat</Text>
                </Pressable>
              </View>
            ) : (
              filtered.map(conv => (
                <ConversationRow key={conv._id} conversation={conv} onPress={() => onOpenChat(conv)} />
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* FAB */}
      {filtered.length > 0 && (
        <Pressable style={styles.fab} onPress={handleOpenNewChatModal}>
          <Feather name="edit-2" size={20} color="#FFFFFF" />
        </Pressable>
      )}

      {/* New Chat Modal */}
      <Modal visible={isNewChatModalOpen} animationType="slide" transparent={false} onRequestClose={() => setIsNewChatModalOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalCloseBtn} onPress={() => setIsNewChatModalOpen(false)}>
              <Feather name="x" size={20} color="#0D0D1A" />
            </Pressable>
            <Text style={styles.modalTitle}>New Chat</Text>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.modalSectionTitle}>Direct Support</Text>
            <Text style={styles.modalSectionDesc}>Select a professional or moderator to start a private conversation.</Text>
            
            {loadingTeam ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#5A5AD8" />
            ) : (
              <>
                {team.professionals.length > 0 && (
                  <>
                    <View style={styles.teamLabel}><Feather name="star" size={12} color="#2673FF" /><Text style={styles.teamLabelText}>PROFESSIONALS</Text></View>
                    {team.professionals.map(p => (
                      <Pressable key={p._id} style={styles.teamCard} onPress={() => handleStartChat(p)} disabled={creatingChat}>
                        <View style={[styles.teamAvatar, { backgroundColor: '#E8F0FF' }]}><Feather name="user" size={16} color="#2673FF" /></View>
                        <Text style={styles.teamName}>{p.fullName}</Text>
                        <Feather name="chevron-right" size={16} color="#C0C0D8" />
                      </Pressable>
                    ))}
                  </>
                )}
                {team.moderators.length > 0 && (
                  <>
                    <View style={[styles.teamLabel, { marginTop: 20 }]}><Feather name="shield" size={12} color="#7C67D6" /><Text style={styles.teamLabelText}>MODERATORS</Text></View>
                    {team.moderators.map(p => (
                      <Pressable key={p._id} style={styles.teamCard} onPress={() => handleStartChat(p)} disabled={creatingChat}>
                        <View style={[styles.teamAvatar, { backgroundColor: '#EDE8FA' }]}><Feather name="user" size={16} color="#7C67D6" /></View>
                        <Text style={styles.teamName}>{p.fullName}</Text>
                        <Feather name="chevron-right" size={16} color="#C0C0D8" />
                      </Pressable>
                    ))}
                  </>
                )}
                {team.moderators.length === 0 && team.professionals.length === 0 && (
                  <Text style={{ textAlign: 'center', color: '#A0A0B8', marginTop: 40 }}>No professionals or moderators found.</Text>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.48 },
  badge: { backgroundColor: '#5A5AD8', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 14, fontWeight: '500', color: '#6B6B80', marginTop: 4 },
  searchContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5FA', borderRadius: 12, paddingHorizontal: 14, height: 44 },
  searchInput: { flex: 1, fontSize: 15, color: '#2D2D3A', padding: 0 },
  listWrapper: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingBottom: 100 }, // space for fab
  loader: { flex: 1, alignSelf: 'center', marginTop: 40 },
  rowOuter: { overflow: 'hidden' },
  rowInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 14, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  avatarWrapper: { width: 50, height: 50, position: 'relative' },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarSquare: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 22 },
  onlineDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF', right: 0, top: 0 },
  rowContent: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontWeight: '700', fontSize: 15, color: '#0D0D1A', flex: 1, marginRight: 8 },
  nameUnread: { fontWeight: '800' },
  timestamp: { fontWeight: '500', fontSize: 11, color: '#A0A0B8' },
  timestampUnread: { fontWeight: '700', color: '#5A5AD8' },
  lastMessage: { fontWeight: '500', fontSize: 14, color: '#8A8A9E', marginTop: 2 },
  lastMessageUnread: { fontWeight: '700', color: '#0D0D1A' },

  emptyBox: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 60 },
  emptyIconBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#8A8A9E', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#5A5AD8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#5A5AD8', alignItems: 'center', justifyContent: 'center', shadowColor: '#5A5AD8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  modalCloseBtn: { padding: 4, marginRight: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  modalSectionTitle: { fontSize: 20, fontWeight: '800', color: '#0D0D1A', marginBottom: 6 },
  modalSectionDesc: { fontSize: 14, color: '#8A8A9E', marginBottom: 24, lineHeight: 20 },
  teamLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  teamLabelText: { fontSize: 11, fontWeight: '800', color: '#8A8A9E', letterSpacing: 0.5 },
  teamCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8F9FC', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#ECEEF8' },
  teamAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  teamName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0D0D1A' },
});
