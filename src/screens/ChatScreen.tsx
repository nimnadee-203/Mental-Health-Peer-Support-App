import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
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
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ResizeMode, Video } from 'expo-av';
import { API_BASE, COMMUNITY_API_BASE } from '../config/api';
import type { Conversation } from './MessagesScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Message {
  _id: string;
  conversationId: string;
  senderName: string;
  text: string;
  mediaUrl: string | null;
  isOwn: boolean;
  sentAt: string;
}

interface ChatScreenProps {
  conversation: Conversation;
  onBack: () => void;
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
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const renderMedia = () => {
    if (!message.mediaUrl) return null;
    const isVideo = message.mediaUrl.match(/\.(mp4|mov|webm|avi|mkv)$/i);
    if (isVideo) {
      return (
        <Video
          source={{ uri: message.mediaUrl }}
          style={styles.mediaAttachment}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          isLooping
        />
      );
    }
    return (
      <Image
        source={{ uri: message.mediaUrl }}
        style={styles.mediaAttachment}
        resizeMode="cover"
      />
    );
  };

  if (message.isOwn) {
    return (
      <Animated.View style={[styles.ownRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.ownBubble}>
          {renderMedia()}
          {!!message.text && <Text style={styles.ownText}>{message.text}</Text>}
        </View>
        <Text style={styles.ownTime}>{formatTime(message.sentAt)}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.peerRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.peerAvatarCol}>
        {showSender ? (
          <View style={[styles.peerAvatar, { backgroundColor: senderBg }]}>
            <Text style={styles.peerAvatarEmoji}>{senderEmoji}</Text>
          </View>
        ) : (
          <View style={styles.peerAvatarPlaceholder} />
        )}
      </View>

      <View style={styles.peerContent}>
        {showSender && <Text style={styles.peerName}>{message.senderName}</Text>}
        <View style={styles.peerBubble}>
          {renderMedia()}
          {!!message.text && <Text style={styles.peerText}>{message.text}</Text>}
        </View>
        <Text style={styles.peerTime}>{formatTime(message.sentAt)}</Text>
      </View>
    </Animated.View>
  );
}

// ─── ChatScreen ───────────────────────────────────────────────────────────────
export default function ChatScreen({ conversation, onBack }: ChatScreenProps) {
  const displayName = conversation.type === 'group' ? conversation.groupName : conversation.peerName;
  const avatarEmoji = conversation.type === 'group' ? conversation.groupEmoji : conversation.avatarEmoji;
  const avatarBg = conversation.avatarBgColor;
  const avatarIsCircle = conversation.avatarIsCircle;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/conversations/${conversation._id}/messages`);
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(data);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversation._id]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handlePickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!res.canceled) {
      setSelectedImage(res.assets[0].uri);
    }
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if ((!text && !selectedImage) || sending) return;

    setSending(true);

    let uploadedImageUrl: string | null = null;
    if (selectedImage) {
      try {
        const ext = selectedImage.split('.').pop() || 'jpg';
        const formData = new FormData();
        if (Platform.OS === 'web') {
          const blob = await (await fetch(selectedImage)).blob();
          formData.append('media', new File([blob], `upload.${ext}`, { type: blob.type }));
        } else {
          const fname = selectedImage.split('/').pop() || 'upload.jpg';
          formData.append('media', {
            uri: selectedImage,
            name: fname,
            type: `image/${ext}`
          } as any);
        }
        
        const up = await fetch(`${COMMUNITY_API_BASE}/upload`, { method: 'POST', body: formData });
        if (up.ok) {
          const upd = await up.json();
          uploadedImageUrl = `${COMMUNITY_API_BASE.replace('/api', '')}${upd.url}`;
        }
      } catch (err) {
        console.warn('Upload failed:', err);
      }
    }

    const optimistic: Message = {
      _id: `local_${Date.now()}`,
      conversationId: conversation._id,
      senderName: 'You',
      text,
      mediaUrl: uploadedImageUrl,
      isOwn: true,
      sentAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    setSelectedImage(null);

    try {
      await fetch(`${API_BASE}/conversations/${conversation._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName: 'You', text, mediaUrl: uploadedImageUrl, isOwn: true }),
      });
    } catch (e) {
      console.warn(e);
    } finally {
      setSending(false);
    }
  }, [inputText, selectedImage, sending, conversation._id]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={18} color="#0D0D1A" />
          </Pressable>
          <View style={[avatarIsCircle ? styles.headerAvatarCircle : styles.headerAvatarSquare, { backgroundColor: avatarBg }]}>
            <Text style={styles.headerAvatarEmoji}>{avatarEmoji}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.headerSub}>
              {conversation.type === 'group' ? `${conversation.participants.length} members` : 'Community member'}
            </Text>
          </View>
          <Pressable style={styles.optionsBtn}>
            <Feather name="more-vertical" size={18} color="#0D0D1A" />
          </Pressable>
        </View>

        {/* Message list */}
        {loading ? (
          <ActivityIndicator style={styles.loader} color="#5A5AD8" />
        ) : (
          <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={styles.messageListContent} showsVerticalScrollIndicator={false} keyboardDismissMode="interactive">
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showDateSep = !prev || !isSameDay(prev.sentAt, msg.sentAt);
              const showSender = !msg.isOwn && (!prev || prev.senderName !== msg.senderName || !isSameDay(prev.sentAt, msg.sentAt));

              return (
                <React.Fragment key={msg._id}>
                  {showDateSep && (
                    <View style={styles.dateSepRow}>
                      <View style={styles.dateSepLine} />
                      <Text style={styles.dateSepText}>{formatSectionDate(msg.sentAt)}</Text>
                      <View style={styles.dateSepLine} />
                    </View>
                  )}
                  <MessageBubble message={msg} showSender={showSender} senderEmoji={avatarEmoji} senderBg={avatarBg} />
                </React.Fragment>
              );
            })}
            
            {sending && (
              <View style={[styles.ownRow, { opacity: 0.5 }]}>
                <View style={styles.ownBubble}>
                  <ActivityIndicator size="small" color="#5A5AD8" />
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.previewContainer}>
            <View style={styles.previewImageWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Pressable style={styles.previewRemoveBtn} onPress={() => setSelectedImage(null)}>
                <Feather name="x" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <Pressable style={styles.attachBtn} onPress={handlePickImage} disabled={sending}>
              <Feather name="paperclip" size={20} color="#8A8A9E" />
            </Pressable>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#A0A0B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              blurOnSubmit={false}
            />
            <Pressable
              style={[styles.sendBtn, (!inputText.trim() && !selectedImage || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedImage) || sending}>
              <Feather name="arrow-up" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  kav: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F1F8', backgroundColor: '#FFFFFF', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8F9FC', justifyContent: 'center', alignItems: 'center' },
  headerAvatarCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerAvatarSquare: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerAvatarEmoji: { fontSize: 20 },
  headerInfo: { flex: 1 },
  headerName: { fontWeight: '800', fontSize: 15, color: '#0D0D1A', lineHeight: 22 },
  headerSub: { fontWeight: '500', fontSize: 12, color: '#8A8A9E', lineHeight: 18 },
  optionsBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8F9FC', justifyContent: 'center', alignItems: 'center' },
  messageList: { flex: 1, backgroundColor: '#F8F9FC' },
  messageListContent: { paddingVertical: 16, paddingHorizontal: 16, gap: 2 },
  loader: { flex: 1, alignSelf: 'center' },
  dateSepRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateSepLine: { flex: 1, height: 1, backgroundColor: '#ECEEF8' },
  dateSepText: { fontWeight: '600', fontSize: 11, color: '#8A8A9E', letterSpacing: 0.3 },
  ownRow: { alignItems: 'flex-end', marginBottom: 10 },
  ownBubble: { backgroundColor: '#5A5AD8', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%' },
  ownText: { fontWeight: '600', fontSize: 14, lineHeight: 20, color: '#FFFFFF' },
  ownTime: { fontWeight: '600', fontSize: 10, color: '#C0C0D8', marginTop: 4, marginRight: 4 },
  peerRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  peerAvatarCol: { width: 34, marginRight: 8, alignItems: 'center', justifyContent: 'flex-end' },
  peerAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  peerAvatarEmoji: { fontSize: 16 },
  peerAvatarPlaceholder: { width: 32, height: 32 },
  peerContent: { maxWidth: '78%' },
  peerName: { fontWeight: '700', fontSize: 12, color: '#6B6B80', marginBottom: 4, marginLeft: 4 },
  peerBubble: { backgroundColor: '#FFFFFF', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#ECEEF8' },
  peerText: { fontWeight: '500', fontSize: 14, lineHeight: 20, color: '#0D0D1A' },
  peerTime: { fontWeight: '600', fontSize: 10, color: '#C0C0D8', marginTop: 4, marginLeft: 4 },
  
  mediaAttachment: { width: 220, height: 150, borderRadius: 12, marginBottom: 8, backgroundColor: '#E0E0E0' },
  
  previewContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F1F8' },
  previewImageWrapper: { position: 'relative', width: 60, height: 60 },
  previewImage: { width: 60, height: 60, borderRadius: 8 },
  previewRemoveBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF3B30', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  
  inputBar: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F7F7FA', borderRadius: 24, paddingHorizontal: 6, paddingVertical: 6, borderWidth: 1, borderColor: '#EFEFF4' },
  attachBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  input: { flex: 1, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: '#0D0D1A', maxHeight: 120, minHeight: 40 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#5A5AD8', justifyContent: 'center', alignItems: 'center', marginBottom: 2, shadowColor: '#5A5AD8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  sendBtnDisabled: { backgroundColor: '#D1D1E0', shadowOpacity: 0, elevation: 0 },
});
