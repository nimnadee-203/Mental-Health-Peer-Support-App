import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { COMMUNITY_API_BASE } from '../config/api';
import { clearAuthSession, getAuthToken } from '../api/authStore';
import type { Community } from './GroupDiscussionScreen';

const REQUEST_TIMEOUT_MS = 10000;

const TOPICS = [
  { label: 'General', icon: 'message-square' as const },
  { label: 'Study & Focus', icon: 'book-open' as const },
  { label: 'Sleep', icon: 'moon' as const },
  { label: 'Breaks & Rest', icon: 'coffee' as const },
  { label: 'Sharing', icon: 'share-2' as const },
  { label: 'Asking for support', icon: 'help-circle' as const },
];

const CONTENT_NOTES = [
  { label: 'None', icon: 'minus-circle' as const },
  { label: 'Anxiety / stress', icon: 'wind' as const },
  { label: 'Grief / loss', icon: 'cloud-rain' as const },
  { label: 'Academic pressure', icon: 'file-text' as const },
  { label: 'Sensitive topic', icon: 'alert-triangle' as const },
];

interface CreatePostScreenProps {
  community: Community;
  onBack: () => void;
  onPostCreated: () => void;
}

export default function CreatePostScreen({ community, onBack, onPostCreated }: CreatePostScreenProps) {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('General');
  const [contentNote, setContentNote] = useState('None');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const MAX_CHARS = 500;

  const handleTextChange = (text: string) => {
    setContent(text);
    Animated.timing(progressAnim, {
      toValue: Math.min(text.length / MAX_CHARS, 1),
      duration: 80,
      useNativeDriver: false,
    }).start();
  };

  const charRatio = content.length / MAX_CHARS;
  const progressColor = charRatio > 0.8 ? '#EF4444' : charRatio > 0.5 ? '#F59E0B' : '#5A5AD8';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets?.length > 0) setSelectedImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 3 || isSubmitting) return;
    setIsSubmitting(true);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      let uploadedImageUrl: string | null = null;
      if (selectedImage) {
        const formData = new FormData();
        if (Platform.OS === 'web') {
          const blob = await (await fetch(selectedImage)).blob();
          const ext = (blob.type.split('/')[1] || 'jpg').replace('quicktime', 'mov');
          formData.append('media', new File([blob], `upload.${ext}`, { type: blob.type }));
        } else {
          const fname = selectedImage.split('/').pop() || 'upload.jpg';
          const ext = (fname.split('.').pop() || 'jpg').toLowerCase();
          const isVid = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext);
          formData.append('media', { uri: selectedImage, name: fname, type: isVid ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext === 'jpg' ? 'jpeg' : ext}` } as any);
        }
        const up = await fetch(`${COMMUNITY_API_BASE}/upload`, { method: 'POST', body: formData });
        if (!up.ok) throw new Error(`Upload failed: ${await up.text()}`);
        const upd = await up.json();
        uploadedImageUrl = `${COMMUNITY_API_BASE.replace('/api', '')}${upd.url}`;
      }

      const res = await fetch(`${COMMUNITY_API_BASE}/posts/group/${encodeURIComponent(community._id)}`, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ content: content.trim(), topic, contentNote, isAnonymous, imageUrl: uploadedImageUrl }),
      });
      if (!res.ok) {
        const err = new Error(((await res.json().catch(() => null))?.error) || 'Failed') as any;
        err.status = res.status; throw err;
      }
      onPostCreated();
    } catch (error: any) {
      if (error?.status === 401) { clearAuthSession(); Alert.alert('Session expired', 'Please log in again.'); return; }
      Alert.alert('Could not post', error?.name === 'AbortError' ? 'Server timeout. Try again.' : error?.message || 'Something went wrong.');
    } finally { clearTimeout(tid); setIsSubmitting(false); }
  };

  const isValid = content.trim().length >= 3;

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <View style={s.header}>
          <Pressable style={s.headerBackBtn} onPress={onBack} hitSlop={10}>
            <Feather name="x" size={20} color="#4A4A65" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>New Post</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Feather name="users" size={11} color="#A0A0B8" />
              <Text style={s.headerSub} numberOfLines={1}>{community.name}</Text>
            </View>
          </View>
          <Pressable style={[s.postBtn, !isValid && s.postBtnOff]} onPress={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting
              ? <ActivityIndicator size="small" color="#FFF" />
              : <><Feather name="send" size={14} color={isValid ? '#FFF' : '#C0C0D8'} /><Text style={[s.postBtnText, !isValid && s.postBtnTextOff]}>Post</Text></>
            }
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── PRIVACY NOTE ────────────────────────────────── */}
          <View style={s.privacyRow}>
            <Feather name="lock" size={12} color="#7C3FB8" />
            <Text style={s.privacyText}>Never share personal contact info. This is a safe space.</Text>
          </View>

          {/* ── COMPOSER ────────────────────────────────────── */}
          <View style={s.composer}>
            <View style={s.composerTop}>
              <View style={s.composerAvatar}>
                {isAnonymous
                  ? <Feather name="user" size={20} color="#9CA3AF" />
                  : <Feather name="smile" size={20} color="#5A5AD8" />
                }
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.composerName}>{isAnonymous ? 'Anonymous Member' : 'You'}</Text>
                <View style={s.audiencePill}>
                  <Feather name="globe" size={9} color="#5A5AD8" />
                  <Text style={s.audiencePillText}>Community</Text>
                </View>
              </View>
            </View>
            <TextInput
              style={s.composerInput}
              placeholder="What's on your mind? Share something with the community…"
              placeholderTextColor="#C8C8E0"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={handleTextChange}
              autoFocus
            />
            {selectedImage && (
              <View style={s.mediaPreview}>
                {selectedImage.match(/\.(mp4|mov|webm)$/i)
                  ? <Video source={{ uri: selectedImage }} style={s.mediaImg} useNativeControls resizeMode={ResizeMode.COVER} isLooping />
                  : <Image source={{ uri: selectedImage }} style={s.mediaImg} resizeMode="cover" />
                }
                <Pressable style={s.mediaRemove} onPress={() => setSelectedImage(null)}>
                  <Feather name="x" size={12} color="#FFF" />
                </Pressable>
              </View>
            )}
            <View style={s.composerFooter}>
              <Pressable style={s.mediaBtn} onPress={pickImage}>
                <Feather name="image" size={15} color="#7878A0" />
                <Text style={s.mediaBtnText}>Add Photo</Text>
              </Pressable>
              <View style={s.charTrack}>
                <View style={s.charBar}>
                  <Animated.View style={[s.charFill, {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: progressColor,
                  }]} />
                </View>
                <Text style={[s.charCount, { color: charRatio > 0.8 ? '#EF4444' : '#C0C0D8' }]}>
                  {content.length}/{MAX_CHARS}
                </Text>
              </View>
            </View>
          </View>

          {/* ── TOPIC ───────────────────────────────────────── */}
          <View style={s.section}>
            <View style={s.sectionTitleRow}>
              <Feather name="tag" size={13} color="#0D0D1A" />
              <Text style={s.sectionTitle}>Topic</Text>
              <View style={s.requiredBadge}><Text style={s.requiredText}>required</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
              {TOPICS.map(t => {
                const sel = topic === t.label;
                return (
                  <Pressable key={t.label} style={[s.pill, sel && s.pillSel]} onPress={() => setTopic(t.label)}>
                    <Feather name={t.icon} size={13} color={sel ? '#FFFFFF' : '#8080A0'} />
                    <Text style={[s.pillText, sel && s.pillTextSel]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── CONTENT NOTE ────────────────────────────────── */}
          <View style={s.section}>
            <View style={s.sectionTitleRow}>
              <Feather name="alert-circle" size={13} color="#0D0D1A" />
              <Text style={s.sectionTitle}>Content note</Text>
              <View style={s.optionalBadge}><Text style={s.optionalText}>optional</Text></View>
            </View>
            <Text style={s.sectionHint}>Heads up if your post may touch a sensitive topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
              {CONTENT_NOTES.map(n => {
                const sel = contentNote === n.label;
                return (
                  <Pressable key={n.label} style={[s.pill, sel && s.pillNote]} onPress={() => setContentNote(n.label)}>
                    <Feather name={n.icon} size={13} color={sel ? '#92400E' : '#8080A0'} />
                    <Text style={[s.pillText, sel && s.pillNoteText]}>{n.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── ANONYMOUS TOGGLE ────────────────────────────── */}
          <Pressable style={s.anonCard} onPress={() => setIsAnonymous(v => !v)}>
            <View style={[s.anonIconBox, { backgroundColor: isAnonymous ? '#EDE8FF' : '#F2F3F8' }]}>
              <Feather name={isAnonymous ? 'eye-off' : 'eye'} size={18} color={isAnonymous ? '#7C67D6' : '#9CA3AF'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.anonTitle}>{isAnonymous ? 'Posting anonymously' : 'Posting as yourself'}</Text>
              <Text style={s.anonSub}>{isAnonymous ? 'Your identity is hidden from others' : 'Community members will see your name'}</Text>
            </View>
            <View style={[s.toggle, isAnonymous && s.toggleOn]}>
              <View style={[s.toggleThumb, isAnonymous && s.toggleThumbOn]} />
            </View>
          </Pressable>

          {/* ── SUBMIT ──────────────────────────────────────── */}
          <Pressable style={[s.submitBtn, !isValid && s.submitBtnOff]} onPress={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting
              ? <ActivityIndicator color={isValid ? '#FFF' : '#B0B0C8'} />
              : <>
                  <Feather name="send" size={16} color={isValid ? '#FFF' : '#B0B0C8'} />
                  <Text style={[s.submitText, !isValid && s.submitTextOff]}>
                    {isValid ? 'Share with Community' : 'Write something first…'}
                  </Text>
                </>
            }
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5FA' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F1F8', gap: 12 },
  headerBackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F3F8', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500' },
  postBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#5A5AD8', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  postBtnOff: { backgroundColor: '#ECEEF8' },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  postBtnTextOff: { color: '#C0C0D8' },

  scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },

  // Privacy
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8F4FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 14, borderWidth: 1, borderColor: '#E4D8FF' },
  privacyText: { flex: 1, fontSize: 12, color: '#5A3A9A', fontWeight: '500', lineHeight: 17 },

  // Composer
  composer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#ECEEF8', shadowColor: '#5A5AD8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  composerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  composerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F2F3F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E8EAEF', borderStyle: 'dashed' },
  composerName: { fontSize: 14, fontWeight: '700', color: '#0D0D1A' },
  audiencePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEEEFF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  audiencePillText: { fontSize: 10, fontWeight: '700', color: '#5A5AD8' },
  composerInput: { minHeight: 120, fontSize: 15, color: '#1A1A2E', lineHeight: 24, marginBottom: 14 },
  mediaPreview: { borderRadius: 12, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  mediaImg: { width: '100%', height: 200, borderRadius: 12 },
  mediaRemove: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  composerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mediaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F5F5FA', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E8EAEF' },
  mediaBtnText: { fontSize: 12, fontWeight: '600', color: '#7878A0' },
  charTrack: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  charBar: { width: 64, height: 4, borderRadius: 2, backgroundColor: '#F0F1F8', overflow: 'hidden' },
  charFill: { height: '100%', borderRadius: 2 },
  charCount: { fontSize: 11, fontWeight: '600' },

  // Section
  section: { marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0D0D1A', flex: 1, letterSpacing: -0.1 },
  requiredBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  requiredText: { fontSize: 9, fontWeight: '800', color: '#EF4444' },
  optionalBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  optionalText: { fontSize: 9, fontWeight: '800', color: '#9CA3AF' },
  sectionHint: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginBottom: 10 },
  pillRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingRight: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E8EAEF', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  pillSel: { backgroundColor: '#1A1A2E', borderColor: '#1A1A2E' },
  pillNote: { backgroundColor: '#FFF7ED', borderColor: '#F59E0B' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#7878A0' },
  pillTextSel: { color: '#FFFFFF', fontWeight: '700' },
  pillNoteText: { color: '#92400E', fontWeight: '700' },

  // Anonymous
  anonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#ECEEF8', gap: 12 },
  anonIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  anonTitle: { fontSize: 13, fontWeight: '700', color: '#0D0D1A' },
  anonSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginTop: 2 },
  toggle: { width: 46, height: 25, borderRadius: 13, backgroundColor: '#E0E1EC', justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: '#5A5AD8' },
  toggleThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Submit
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 26, backgroundColor: '#5A5AD8', shadowColor: '#5A5AD8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 7 },
  submitBtnOff: { backgroundColor: '#ECEEF8', shadowOpacity: 0, elevation: 0 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  submitTextOff: { color: '#C0C0D8' },
});
