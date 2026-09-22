import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

import { COMMUNITY_API_BASE } from '../config/api';
import { clearAuthSession, getAuthToken } from '../api/authStore';
import type { Community } from './GroupDiscussionScreen';

const REQUEST_TIMEOUT_MS = 10000;

const TOPICS: { label: string; emoji: string }[] = [
  { label: 'General', emoji: '💬' },
  { label: 'Study & Focus', emoji: '📚' },
  { label: 'Sleep', emoji: '🌙' },
  { label: 'Breaks & Rest', emoji: '☕' },
  { label: 'Sharing', emoji: '🤝' },
  { label: 'Asking for support', emoji: '🫂' },
];

const CONTENT_NOTES: { label: string; emoji: string }[] = [
  { label: 'None', emoji: '—' },
  { label: 'Anxiety / stress', emoji: '😰' },
  { label: 'Grief / loss', emoji: '🌧️' },
  { label: 'Academic pressure', emoji: '📝' },
  { label: 'Sensitive topic', emoji: '⚠️' },
];

interface CreatePostScreenProps {
  community: Community;
  onBack: () => void;
  onPostCreated: () => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <View style={[dotStyles.dot, active && dotStyles.dotActive, done && dotStyles.dotDone]}>
      {done && <Text style={dotStyles.check}>✓</Text>}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E1EC' },
  dotActive: { width: 22, backgroundColor: '#5A5AD8', borderRadius: 4 },
  dotDone: { backgroundColor: '#22C55E' },
  check: { display: 'none' },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CreatePostScreen({ community, onBack, onPostCreated }: CreatePostScreenProps) {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('General');
  const [contentNote, setContentNote] = useState('None');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [charFocus, setCharFocus] = useState(false);

  const progressWidth = useRef(new Animated.Value(0)).current;

  const isFormValid = content.trim().length >= 3 && !!topic;

  // Animate character counter bar
  const updateProgress = (text: string) => {
    setContent(text);
    Animated.timing(progressWidth, {
      toValue: Math.min(text.length / 500, 1),
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let uploadedImageUrl: string | null = null;

      if (selectedImage) {
        const formData = new FormData();
        if (Platform.OS === 'web') {
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          const actualMime = blob.type || 'image/jpeg';
          let ext = actualMime.split('/')[1] || 'jpg';
          if (ext === 'quicktime') ext = 'mov';
          formData.append('media', new File([blob], `upload.${ext}`, { type: actualMime }));
        } else {
          const filename = selectedImage.split('/').pop() || 'upload.jpg';
          let ext = (filename.split('.').pop() || 'jpg').toLowerCase();
          if (!ext || ext === filename.toLowerCase()) ext = 'jpg';
          const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext);
          const mimeType = isVideo ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          formData.append('media', { uri: selectedImage, name: filename, type: mimeType } as any);
        }

        const uploadRes = await fetch(`${COMMUNITY_API_BASE}/upload`, { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error(`Upload failed: ${await uploadRes.text()}`);
        const uploadData = await uploadRes.json();
        uploadedImageUrl = `${COMMUNITY_API_BASE.replace('/api', '')}${uploadData.url}`;
      }

      const encodedGroupId = encodeURIComponent(community._id);
      const response = await fetch(`${COMMUNITY_API_BASE}/posts/group/${encodedGroupId}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify({ content: content.trim(), topic, contentNote, isAnonymous, imageUrl: uploadedImageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const err = new Error(errorData?.error || 'Failed to create post') as any;
        err.status = response.status;
        throw err;
      }

      onPostCreated();
    } catch (error: any) {
      if (error?.status === 401) {
        clearAuthSession();
        Alert.alert('Session expired', 'Please log in again before creating a post.');
        return;
      }
      const message = error?.name === 'AbortError'
        ? 'The server took too long to respond. Please try again.'
        : error?.message || 'Something went wrong while submitting your post.';
      Alert.alert('Could not post', message);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const charPercent = Math.min(content.length / 500, 1);
  const progressColor = charPercent > 0.8 ? '#EF4444' : charPercent > 0.5 ? '#F59E0B' : '#5A5AD8';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>New Post</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {community.emoji} {community.name}
            </Text>
          </View>
          <Pressable
            style={[styles.postBtn, !isFormValid && styles.postBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={[styles.postBtnText, !isFormValid && styles.postBtnTextDisabled]}>Post</Text>
            }
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── PRIVACY BANNER ─────────────────────────────────────────────── */}
          <View style={styles.privacyBanner}>
            <Text style={styles.privacyEmoji}>🔒</Text>
            <Text style={styles.privacyText}>
              Never share personal contact info. Be kind — this is a safe space.
            </Text>
          </View>

          {/* ── COMPOSER ───────────────────────────────────────────────────── */}
          <View style={styles.composerCard}>
            {/* User row */}
            <View style={styles.composerUserRow}>
              <View style={styles.composerAvatar}><Text style={{ fontSize: 20 }}>😊</Text></View>
              <View>
                <Text style={styles.composerName}>
                  {isAnonymous ? 'Anonymous Member' : 'You'}
                </Text>
                <View style={[styles.audiencePill]}>
                  <Text style={styles.audienceEmoji}>🌐</Text>
                  <Text style={styles.audienceText}>Community</Text>
                </View>
              </View>
            </View>

            {/* Text input */}
            <TextInput
              style={styles.composerInput}
              placeholder="What's on your mind? Share something with the community…"
              placeholderTextColor="#C0C0D8"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={updateProgress}
              onFocus={() => setCharFocus(true)}
              onBlur={() => setCharFocus(false)}
              autoFocus
            />

            {/* Media preview */}
            {selectedImage && (
              <View style={styles.mediaPreview}>
                {selectedImage.match(/\.(mp4|mov|webm)$/i) ? (
                  <Video source={{ uri: selectedImage }} style={styles.mediaImg} useNativeControls resizeMode={ResizeMode.COVER} isLooping />
                ) : (
                  <Image source={{ uri: selectedImage }} style={styles.mediaImg} resizeMode="cover" />
                )}
                <Pressable style={styles.mediaRemove} onPress={() => setSelectedImage(null)}>
                  <Text style={styles.mediaRemoveText}>✕</Text>
                </Pressable>
              </View>
            )}

            {/* Character progress */}
            <View style={styles.composerFooter}>
              <Pressable style={styles.mediaBtn} onPress={pickImage}>
                <Text style={styles.mediaBtnIcon}>🖼️</Text>
                <Text style={styles.mediaBtnText}>Media</Text>
              </Pressable>
              <View style={styles.charSection}>
                <View style={styles.charBar}>
                  <Animated.View
                    style={[
                      styles.charBarFill,
                      {
                        width: progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                        backgroundColor: progressColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.charCount, { color: charPercent > 0.8 ? '#EF4444' : '#B0B0C8' }]}>
                  {content.length}/500
                </Text>
              </View>
            </View>
          </View>

          {/* ── TOPIC ──────────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Topic</Text>
              <Text style={styles.sectionRequired}>required</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {TOPICS.map(t => {
                const isSelected = topic === t.label;
                return (
                  <Pressable
                    key={t.label}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => setTopic(t.label)}
                  >
                    <Text style={styles.pillEmoji}>{t.emoji}</Text>
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── CONTENT NOTE ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Content note</Text>
              <Text style={styles.sectionOptional}>optional</Text>
            </View>
            <Text style={styles.sectionHint}>Let others know if this post touches a sensitive topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {CONTENT_NOTES.map(n => {
                const isSelected = contentNote === n.label;
                return (
                  <Pressable
                    key={n.label}
                    style={[styles.pill, isSelected && styles.pillNoteSelected]}
                    onPress={() => setContentNote(n.label)}
                  >
                    <Text style={styles.pillEmoji}>{n.emoji}</Text>
                    <Text style={[styles.pillText, isSelected && styles.pillNoteTextSelected]}>{n.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── ANONYMOUS TOGGLE ───────────────────────────────────────────── */}
          <Pressable style={styles.anonCard} onPress={() => setIsAnonymous(v => !v)}>
            <View style={styles.anonLeft}>
              <View style={[styles.anonIconWrap, { backgroundColor: isAnonymous ? '#EEEEFF' : '#F2F3F8' }]}>
                <Text style={{ fontSize: 18 }}>{isAnonymous ? '🎭' : '😊'}</Text>
              </View>
              <View>
                <Text style={styles.anonTitle}>
                  {isAnonymous ? 'Posting anonymously' : 'Posting with your name'}
                </Text>
                <Text style={styles.anonSub}>
                  {isAnonymous ? 'Your identity is hidden from others' : 'Community members will see your name'}
                </Text>
              </View>
            </View>
            <View style={[styles.toggle, isAnonymous && styles.toggleOn]}>
              <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbOn]} />
            </View>
          </Pressable>

          {/* ── POST BUTTON (bottom) ────────────────────────────────────────── */}
          <Pressable
            style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={isFormValid ? '#FFFFFF' : '#B0B0C8'} />
            ) : (
              <Text style={[styles.submitBtnText, !isFormValid && styles.submitBtnTextDisabled]}>
                {content.trim().length > 0 ? '✓ Share with Community' : 'Write something first…'}
              </Text>
            )}
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5FA' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F8',
    gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F3F8', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: '#1A1A2E', fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginTop: 1 },
  postBtn: { backgroundColor: '#5A5AD8', paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  postBtnDisabled: { backgroundColor: '#E8EAEF' },
  postBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  postBtnTextDisabled: { color: '#B0B0C8' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },

  // Privacy banner
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4DAFF',
  },
  privacyEmoji: { fontSize: 15 },
  privacyText: { flex: 1, fontSize: 12, color: '#5A3A9A', fontWeight: '500', lineHeight: 18 },

  // Composer card
  composerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEEF8',
    shadowColor: '#5A5AD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  composerUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  composerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#C8E6FA', alignItems: 'center', justifyContent: 'center' },
  composerName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  audiencePill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, backgroundColor: '#EEEEFF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  audienceEmoji: { fontSize: 10 },
  audienceText: { fontSize: 10, fontWeight: '700', color: '#5A5AD8' },
  composerInput: {
    minHeight: 130,
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 14,
  },
  mediaPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  mediaImg: { width: '100%', height: 200, borderRadius: 12 },
  mediaRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRemoveText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  composerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mediaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F2F3F8', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  mediaBtnIcon: { fontSize: 14 },
  mediaBtnText: { fontSize: 12, fontWeight: '700', color: '#6B6B80' },
  charSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  charBar: { width: 72, height: 4, borderRadius: 2, backgroundColor: '#F0F1F8', overflow: 'hidden' },
  charBarFill: { height: '100%', borderRadius: 2 },
  charCount: { fontSize: 11, fontWeight: '600' },

  // Section
  section: { marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.1 },
  sectionRequired: { fontSize: 10, fontWeight: '700', color: '#EF4444', backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sectionOptional: { fontSize: 10, fontWeight: '700', color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sectionHint: { fontSize: 12, color: '#A0A0B8', fontWeight: '500', marginBottom: 10 },
  pillRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingRight: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8EAEF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillSelected: { backgroundColor: '#1A1A2E', borderColor: '#1A1A2E' },
  pillNoteSelected: { backgroundColor: '#FFF7ED', borderColor: '#F59E0B' },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 13, fontWeight: '600', color: '#6B6B80' },
  pillTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  pillNoteTextSelected: { color: '#92400E', fontWeight: '700' },

  // Anonymous card
  anonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEEF8',
  },
  anonLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  anonIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  anonTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  anonSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginTop: 2 },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: '#E0E1EC', justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: '#5A5AD8' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Submit button
  submitBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#5A5AD8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A5AD8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnDisabled: { backgroundColor: '#E8EAEF', shadowOpacity: 0, elevation: 0 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  submitBtnTextDisabled: { color: '#B0B0C8' },
});
