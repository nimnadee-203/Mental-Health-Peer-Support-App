import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
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
import { API_BASE } from '../config/api';
import type { Conversation } from './MessagesScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Message {
  _id: string;
  conversationId: string;
  senderName: string;
  text: string;
  isOwn: boolean;
  sentAt: string;
}

interface ChatScreenProps {
  conversation: Conversation;
  onBack: () => void;
}

// ─── Seed messages per conversation ──────────────────────────────────────────
function getSeedMessages(convId: string): Message[] {
  const base = (
    id: string,
    sender: string,
    text: string,
    isOwn: boolean,
    minsAgo: number
  ): Message => ({
    _id: `${id}_${minsAgo}`,
    conversationId: convId,
    senderName: sender,
    text,
    isOwn,
    sentAt: new Date(Date.now() - minsAgo * 60 * 1000).toISOString(),
  });

  if (convId === 'seed_alex') {
    return [
      base('m', 'Alex', "Hey, I saw your post about feeling overwhelmed with assignments. I've been through something similar.", false, 80),
      base('m', 'You', "Yeah, it's been difficult to balance everything lately.", true, 76),
      base('m', 'Alex', "I understand. Taking short breaks has helped me a little. Hope things feel a bit easier soon.", false, 72),
      base('m', 'You', "That's a good idea. I'll try the breathing activity in the app.", true, 70),
      base('m', 'Alex', "Thanks for sharing that. I found the breathing activity helpful too.", false, 18),
    ];
  }
  if (convId === 'seed_mindfulness') {
    return [
      base('mg', 'Sarah', "Has anyone tried the new mindfulness activity in the app?", false, 26 * 60),
      base('mg', 'You', "Yes! The body scan one is really calming 🌿", true, 25 * 60),
      base('mg', 'Mike', "I liked the breathing exercise. Did it before bed last night.", false, 24 * 60),
    ];
  }
  if (convId === 'seed_academic') {
    return [
      base('ma', 'Emma', "Anyone else struggling with the mid-term load?", false, 35 * 60),
      base('ma', 'You', "Definitely. Trying to break it into smaller chunks.", true, 34 * 60),
      base('ma', 'Daniel', "Thanks everyone for the support!", false, 30 * 60),
    ];
  }
  if (convId === 'seed_jamie') {
    return [
      base('mj', 'You', "Feeling a bit overwhelmed today honestly.", true, 3 * 24 * 60),
      base('mj', 'Jamie', "I completely understand how you're feeling.", false, 2 * 24 * 60),
    ];
  }
  if (convId === 'seed_sam') {
    return [
      base('ms', 'You', "Had a rough week but trying to stay positive.", true, 4 * 24 * 60),
      base('ms', 'Sam', "Hope things feel a little easier soon 💙", false, 3 * 24 * 60),
    ];
  }
  return [];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSectionDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
interface BubbleProps {
  message: Message;
  showSender: boolean;
  senderEmoji: string;
  senderBg: string;
}

function MessageBubble({ message, showSender, senderEmoji, senderBg }: BubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (message.isOwn) {
    // ── Own message: right-aligned teal bubble ──────────────────────────────
    return (
      <Animated.View
        style={[
          styles.ownRow,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
        <View style={styles.ownBubble}>
          <Text style={styles.ownText}>{message.text}</Text>
        </View>
        <Text style={styles.ownTime}>{formatTime(message.sentAt)}</Text>
      </Animated.View>
    );
  }

  // ── Peer message: left-aligned white bubble with avatar ────────────────────
  return (
    <Animated.View
      style={[
        styles.peerRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}>
      {/* Avatar column */}
      <View style={styles.peerAvatarCol}>
        {showSender ? (
          <View style={[styles.peerAvatar, { backgroundColor: senderBg }]}>
            <Text style={styles.peerAvatarEmoji}>{senderEmoji}</Text>
          </View>
        ) : (
          <View style={styles.peerAvatarPlaceholder} />
        )}
      </View>

      {/* Bubble + name + time */}
      <View style={styles.peerContent}>
        {showSender && (
          <Text style={styles.peerName}>{message.senderName}</Text>
        )}
        <View style={styles.peerBubble}>
          <Text style={styles.peerText}>{message.text}</Text>
        </View>
        <Text style={styles.peerTime}>{formatTime(message.sentAt)}</Text>
      </View>
    </Animated.View>
  );
}

// ─── ChatScreen ───────────────────────────────────────────────────────────────
export default function ChatScreen({ conversation, onBack }: ChatScreenProps) {
  const displayName =
    conversation.type === 'group'
      ? conversation.groupName
      : conversation.peerName;
  const avatarEmoji =
    conversation.type === 'group'
      ? conversation.groupEmoji
      : conversation.avatarEmoji;
  const avatarBg = conversation.avatarBgColor;
  const avatarIsCircle = conversation.avatarIsCircle;

  const [messages, setMessages] = useState<Message[]>(
    getSeedMessages(conversation._id)
  );
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // ── Fetch messages from backend ────────────────────────────────────────────
  useEffect(() => {
    const fetchMessages = async () => {
      // Don't try to fetch seed IDs from the real backend
      if (conversation._id.startsWith('seed_')) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/conversations/${conversation._id}/messages`
        );
        if (res.ok) {
          const data: Message[] = await res.json();
          if (data.length > 0) setMessages(data);
        }
      } catch {
        // Offline — seed messages already shown
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    const optimistic: Message = {
      _id: `local_${Date.now()}`,
      conversationId: conversation._id,
      senderName: 'You',
      text,
      isOwn: true,
      sentAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    setSending(true);

    // Skip real API for seed conversations
    if (!conversation._id.startsWith('seed_')) {
      try {
        await fetch(
          `${API_BASE}/conversations/${conversation._id}/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderName: 'You', text, isOwn: true }),
          }
        );
      } catch {
        // Optimistic message already displayed
      }
    }

    setSending(false);
  }, [inputText, sending, conversation._id]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          {/* Avatar */}
          <View
            style={[
              avatarIsCircle ? styles.headerAvatarCircle : styles.headerAvatarSquare,
              { backgroundColor: avatarBg },
            ]}>
            <Text style={styles.headerAvatarEmoji}>{avatarEmoji}</Text>
          </View>

          {/* Name + subtitle */}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.headerSub}>
              {conversation.type === 'group'
                ? `${conversation.participants.length} members`
                : 'Community member'}
            </Text>
          </View>

          {/* Options button */}
          <Pressable
            style={styles.optionsBtn}
            accessibilityRole="button"
            accessibilityLabel="More options">
            <Text style={styles.optionsDots}>⋮</Text>
          </Pressable>
        </View>

        {/* ── Message list ─────────────────────────────────────────────────── */}
        {loading ? (
          <ActivityIndicator style={styles.loader} color="#2D2D3A" />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive">
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showDateSep =
                !prev || !isSameDay(prev.sentAt, msg.sentAt);
              const showSender =
                !msg.isOwn &&
                (!prev ||
                  prev.senderName !== msg.senderName ||
                  !isSameDay(prev.sentAt, msg.sentAt));

              return (
                <React.Fragment key={msg._id}>
                  {showDateSep && (
                    <View style={styles.dateSepRow}>
                      <View style={styles.dateSepLine} />
                      <Text style={styles.dateSepText}>
                        {formatSectionDate(msg.sentAt)}
                      </Text>
                      <View style={styles.dateSepLine} />
                    </View>
                  )}
                  <MessageBubble
                    message={msg}
                    showSender={showSender}
                    senderEmoji={avatarEmoji}
                    senderBg={avatarBg}
                  />
                </React.Fragment>
              );
            })}
          </ScrollView>
        )}

        {/* ── Input bar ────────────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <Pressable
            style={styles.attachBtn}
            accessibilityRole="button"
            accessibilityLabel="Attach file">
            <Text style={styles.attachIcon}>📎</Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Write a message…"
            placeholderTextColor="rgba(45,45,58,0.45)"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            accessibilityLabel="Message input"
          />

          <Pressable
            style={[
              styles.sendBtn,
              (!inputText.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send message">
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  kav: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E8E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#2D2D3A',
    lineHeight: 22,
  },
  headerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarEmoji: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: 'Nunito-ExtraBold',
    fontWeight: '800',
    fontSize: 15,
    color: '#2D2D3A',
    lineHeight: 22,
  },
  headerSub: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 12,
    color: '#6B6B80',
    lineHeight: 18,
  },
  optionsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsDots: {
    fontSize: 18,
    color: '#2D2D3A',
    letterSpacing: 1,
  },

  // ── Message list ─────────────────────────────────────────────────────────────
  messageList: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messageListContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 2,
  },
  loader: {
    flex: 1,
    alignSelf: 'center',
  },

  // Date separator
  dateSepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  dateSepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8F0',
  },
  dateSepText: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 11,
    color: '#A0A0B8',
    letterSpacing: 0.3,
  },

  // ── Own bubble (right) ───────────────────────────────────────────────────────
  ownRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  ownBubble: {
    backgroundColor: '#C5DFF8',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '78%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  ownText: {
    fontFamily: 'Nunito-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A2B3C',
  },
  ownTime: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 10,
    color: '#A0A0B8',
    marginTop: 4,
    marginRight: 4,
  },

  // ── Peer bubble (left) ───────────────────────────────────────────────────────
  peerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  peerAvatarCol: {
    width: 34,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  peerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peerAvatarEmoji: {
    fontSize: 16,
  },
  peerAvatarPlaceholder: {
    width: 32,
    height: 32,
  },
  peerContent: {
    maxWidth: '78%',
  },
  peerName: {
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    fontSize: 12,
    color: '#6B6B80',
    marginBottom: 4,
    marginLeft: 4,
  },
  peerBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  peerText: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#2D2D3A',
  },
  peerTime: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 10,
    color: '#A0A0B8',
    marginTop: 4,
    marginLeft: 4,
  },

  // ── Input bar ─────────────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    borderTopWidth: 1.5,
    borderTopColor: '#E8E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  attachIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: 'Nunito-Medium',
    fontWeight: '500',
    fontSize: 14,
    color: '#2D2D3A',
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2D2D3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  sendBtnDisabled: {
    backgroundColor: '#D4D4E0',
  },
  sendIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
