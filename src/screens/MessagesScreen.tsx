import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthUserId } from '../api/authStore';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  peerName: string;
  peerRole: string;
  avatarEmoji: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    peerName: 'Sarah Jenkins',
    peerRole: 'Peer Support Volunteer 🌱',
    avatarEmoji: '🌸',
    avatarBg: '#E0E7FF',
    lastMessage: 'Remember to take a few deep breaths today. You are doing great!',
    time: '10:42 AM',
    unreadCount: 2,
    online: true,
    messages: [
      {
        id: 'm1',
        senderId: 'peer-1',
        senderName: 'Sarah Jenkins',
        text: 'Hi there! I saw your check-in earlier. How are you feeling right now?',
        timestamp: '10:30 AM',
        isMe: false,
      },
      {
        id: 'm2',
        senderId: 'user-me',
        senderName: 'Me',
        text: 'A bit overwhelmed with exams, but trying to take small breaks.',
        timestamp: '10:35 AM',
        isMe: true,
      },
      {
        id: 'm3',
        senderId: 'peer-1',
        senderName: 'Sarah Jenkins',
        text: 'Remember to take a few deep breaths today. You are doing great!',
        timestamp: '10:42 AM',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-2',
    peerName: 'David Chen',
    peerRole: 'Mindfulness Peer',
    avatarEmoji: '🧘',
    avatarBg: '#DCFCE7',
    lastMessage: 'The 5-4-3-2-1 grounding method worked really well for me.',
    time: 'Yesterday',
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: 'm201',
        senderId: 'peer-2',
        senderName: 'David Chen',
        text: 'Hey! Have you tried any grounding exercises for anxiety recently?',
        timestamp: 'Yesterday 4:15 PM',
        isMe: false,
      },
      {
        id: 'm202',
        senderId: 'peer-2',
        senderName: 'David Chen',
        text: 'The 5-4-3-2-1 grounding method worked really well for me.',
        timestamp: 'Yesterday 4:16 PM',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-3',
    peerName: 'Academic Stress Circle',
    peerRole: 'Peer Group Chat 📚',
    avatarEmoji: '💬',
    avatarBg: '#FEF3C7',
    lastMessage: 'Elena: Anyone up for a silent study break walk?',
    time: '2 days ago',
    unreadCount: 0,
    online: true,
    messages: [
      {
        id: 'm301',
        senderId: 'peer-3',
        senderName: 'Elena P.',
        text: 'Anyone up for a silent study break walk?',
        timestamp: '2 days ago',
        isMe: false,
      },
    ],
  },
];

const QUICK_REPLIES = [
  'Thank you for listening! 🙏',
  'I understand how you feel 💚',
  'Taking it one step at a time 🌿',
  'Could you share more about that?',
];

type MessagesScreenProps = {
  onNavigateToAuth?: () => void;
};

export default function MessagesScreen({ onNavigateToAuth }: MessagesScreenProps) {
  const currentUserId = getAuthUserId();
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.peerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenConversation = (conv: Conversation) => {
    // Clear unread count when opening
    setConversations(prev =>
      prev.map(c => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
    );
    setSelectedConv({ ...conv, unreadCount: 0 });
  };

  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = (textToSend || inputText).trim();
    if (!finalMsg || !selectedConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId || 'me',
      senderName: 'Me',
      text: finalMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    const updatedMessages = [...selectedConv.messages, newMsg];
    const updatedConv = {
      ...selectedConv,
      lastMessage: finalMsg,
      time: 'Just now',
      messages: updatedMessages,
    };

    setSelectedConv(updatedConv);
    setConversations(prev => prev.map(c => (c.id === selectedConv.id ? updatedConv : c)));
    setInputText('');
  };

  if (!currentUserId) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <Text style={styles.guestIconText}>💬</Text>
          </View>
          <Text style={styles.guestTitle}>Peer Messages & Connections</Text>
          <Text style={styles.guestSubtitle}>
            Log in to chat privately with Peer Support Volunteers, connect with empathetic community members, and share in a safe space.
          </Text>
          {onNavigateToAuth ? (
            <Pressable
              accessibilityRole="button"
              style={styles.loginButton}
              onPress={onNavigateToAuth}
            >
              <Text style={styles.loginButtonText}>Log In / Sign Up to Chat</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Safe & Supportive Space</Text>
          <Text style={styles.title}>Peer Messages</Text>
        </View>
        <View style={styles.safetyBadge}>
          <Text style={styles.safetyBadgeText}>🔒 Encrypted & Private</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search peers or messages..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.convCard, pressed && styles.convCardPressed]}
            onPress={() => handleOpenConversation(item)}
          >
            <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
              <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
              {item.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.convMain}>
              <View style={styles.convTopRow}>
                <Text style={styles.peerName} numberOfLines={1}>
                  {item.peerName}
                </Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <Text style={styles.peerRole}>{item.peerRole}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>

            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversation found matching "{searchQuery}".</Text>
          </View>
        }
      />

      {/* Interactive Chat Modal */}
      <Modal
        visible={!!selectedConv}
        animationType="slide"
        onRequestClose={() => setSelectedConv(null)}
      >
        <SafeAreaView style={styles.modalScreen}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable style={styles.backBtn} onPress={() => setSelectedConv(null)}>
              <Text style={styles.backBtnText}>← Back</Text>
            </Pressable>

            {selectedConv && (
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalPeerName}>{selectedConv.peerName}</Text>
                <Text style={styles.modalPeerRole}>{selectedConv.peerRole}</Text>
              </View>
            )}

            <View style={{ width: 44 }} />
          </View>

          {/* Safety Notice Banner */}
          <View style={styles.safetyBanner}>
            <Text style={styles.safetyBannerText}>
              🤝 Peer Support Space: Listen with empathy. For urgent crises, tap Emergency Support.
            </Text>
          </View>

          {/* Chat Messages */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.chatScrollContent}
              ref={ref => ref?.scrollToEnd({ animated: true })}
            >
              {selectedConv?.messages.map(msg => (
                <View
                  key={msg.id}
                  style={[
                    styles.msgBubble,
                    msg.isMe ? styles.msgBubbleMe : styles.msgBubblePeer,
                  ]}
                >
                  {!msg.isMe && <Text style={styles.msgSenderName}>{msg.senderName}</Text>}
                  <Text style={[styles.msgText, msg.isMe && styles.msgTextMe]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.msgTime, msg.isMe && styles.msgTimeMe]}>
                    {msg.timestamp}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Quick Replies */}
            <View style={styles.quickReplyContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {QUICK_REPLIES.map((reply, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.quickChip}
                    onPress={() => handleSendMessage(reply)}
                  >
                    <Text style={styles.quickChipText}>{reply}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Message Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your supportive message..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <Pressable
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  safetyBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  safetyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  convCardPressed: {
    backgroundColor: '#F1F5F9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  convMain: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  peerRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },

  /* Guest View */
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8FAFC',
  },
  guestIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestIconText: {
    fontSize: 34,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* Modal Screen */
  modalScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 14,
  },
  modalHeaderInfo: {
    alignItems: 'center',
  },
  modalPeerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalPeerRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
  },
  safetyBanner: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#DBEAFE',
  },
  safetyBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  msgBubblePeer: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  msgBubbleMe: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
  },
  msgSenderName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
  },
  msgTextMe: {
    color: '#FFFFFF',
  },
  msgTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeMe: {
    color: '#93C5FD',
  },
  quickReplyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
    color: '#0F172A',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});
