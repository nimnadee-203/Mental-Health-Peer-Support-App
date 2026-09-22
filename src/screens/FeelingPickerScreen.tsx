import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken, clearAuthSession } from '../api/authStore';
import type { Community } from './GroupDiscussionScreen';

// ─── Moods ────────────────────────────────────────────────────────────────────
const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#FFF3CD', border: '#F5C842', text: '#92680D' },
  { emoji: '😌', label: 'Calm', color: '#D4EFDF', border: '#52BE80', text: '#1A6B37' },
  { emoji: '😔', label: 'Sad', color: '#D6EAF8', border: '#5DADE2', text: '#1A5276' },
  { emoji: '😤', label: 'Frustrated', color: '#FADBD8', border: '#E74C3C', text: '#922B21' },
  { emoji: '😰', label: 'Anxious', color: '#F9EBEA', border: '#F1948A', text: '#922B21' },
  { emoji: '🥹', label: 'Grateful', color: '#FDEEF8', border: '#AF7AC5', text: '#6C3483' },
  { emoji: '😴', label: 'Tired', color: '#EBF5FB', border: '#7FB3D3', text: '#1B4F72' },
  { emoji: '🤩', label: 'Excited', color: '#FEF9E7', border: '#F7DC6F', text: '#9A7D0A' },
  { emoji: '😶', label: 'Numb', color: '#F2F3F4', border: '#ABB2B9', text: '#4D5656' },
  { emoji: '💪', label: 'Strong', color: '#EAFAF1', border: '#58D68D', text: '#1D8348' },
  { emoji: '🫂', label: 'Need support', color: '#F5EEF8', border: '#C39BD3', text: '#6C3483' },
  { emoji: '🕊️', label: 'At peace', color: '#EAF2F8', border: '#7FB3D3', text: '#154360' },
];

interface FeelingPickerScreenProps {
  community: Community;
  onBack: () => void;
  onPostCreated: () => void;
}

const REQUEST_TIMEOUT_MS = 10000;

export default function FeelingPickerScreen({ community, onBack, onPostCreated }: FeelingPickerScreenProps) {
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleMoodSelect = (mood: typeof MOODS[0]) => {
    setSelectedMood(mood);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!selectedMood || isSubmitting) return;
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const content = note.trim()
        ? `I'm feeling ${selectedMood.label} ${selectedMood.emoji}\n\n${note.trim()}`
        : `I'm feeling ${selectedMood.label} ${selectedMood.emoji}`;

      const encodedGroupId = encodeURIComponent(community._id);
      const response = await fetch(`${COMMUNITY_API_BASE}/posts/group/${encodedGroupId}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify({
          content,
          topic: 'Sharing',
          contentNote: 'None',
          isAnonymous,
        }),
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
        Alert.alert('Session expired', 'Please log in again before posting.');
        return;
      }
      const message = error?.name === 'AbortError'
        ? 'The server took too long. Please try again.'
        : error?.message || 'Something went wrong. Please try again.';
      Alert.alert('Could not post', message);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const canPost = !!selectedMood;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>How are you feeling?</Text>
            <Text style={styles.headerSub}>Share your mood with the community</Text>
          </View>
          <Pressable
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canPost || isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>Post</Text>
            }
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* PREVIEW CARD */}
          {selectedMood ? (
            <Animated.View style={[styles.previewCard, { backgroundColor: selectedMood.color, borderColor: selectedMood.border, transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.previewEmoji}>{selectedMood.emoji}</Text>
              <View style={styles.previewText}>
                <Text style={styles.previewLabel}>I'm feeling</Text>
                <Text style={[styles.previewMood, { color: selectedMood.text }]}>{selectedMood.label}</Text>
              </View>
              <Pressable style={styles.clearBtn} onPress={() => setSelectedMood(null)}>
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderEmoji}>🤔</Text>
              <Text style={styles.placeholderText}>Pick a mood below</Text>
            </View>
          )}

          {/* MOOD GRID */}
          <Text style={styles.gridLabel}>SELECT YOUR MOOD</Text>
          <View style={styles.moodGrid}>
            {MOODS.map(mood => {
              const isSelected = selectedMood?.label === mood.label;
              return (
                <Pressable
                  key={mood.label}
                  style={[
                    styles.moodChip,
                    { backgroundColor: isSelected ? mood.color : '#F8F9FC', borderColor: isSelected ? mood.border : '#E8EAEF' },
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodLabel, isSelected && { color: mood.text, fontWeight: '700' }]}>{mood.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* OPTIONAL NOTE */}
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Add a note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Want to say more about how you're feeling?"
              placeholderTextColor="#B0B0C8"
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              maxLength={300}
            />
            <Text style={styles.charCount}>{note.length}/300</Text>
          </View>

          {/* ANONYMOUS TOGGLE */}
          <Pressable style={styles.anonRow} onPress={() => setIsAnonymous(v => !v)}>
            <View style={styles.anonLeft}>
              <Text style={styles.anonIcon}>🔒</Text>
              <View>
                <Text style={styles.anonTitle}>Post anonymously</Text>
                <Text style={styles.anonSub}>Your name won't be visible</Text>
              </View>
            </View>
            <View style={[styles.toggle, isAnonymous && styles.toggleOn]}>
              <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbOn]} />
            </View>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#1A1A2E', fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.2 },
  headerSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginTop: 1 },
  postBtn: {
    backgroundColor: '#5A5AD8',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnDisabled: { backgroundColor: '#E8EAEF' },
  postBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  postBtnTextDisabled: { color: '#B0B0C8' },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },

  // Preview
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewEmoji: { fontSize: 42 },
  previewText: { flex: 1 },
  previewLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
  previewMood: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3, marginTop: 2 },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: { fontSize: 12, color: '#666', fontWeight: '700' },
  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E8EAEF',
    borderStyle: 'dashed',
    paddingVertical: 28,
    marginBottom: 24,
    gap: 8,
  },
  placeholderEmoji: { fontSize: 36 },
  placeholderText: { fontSize: 14, color: '#B0B0C8', fontWeight: '600' },

  // Grid
  gridLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0A0B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  moodEmoji: { fontSize: 18 },
  moodLabel: { fontSize: 13, fontWeight: '600', color: '#6B6B80' },

  // Note
  noteSection: { marginBottom: 20 },
  noteLabel: { fontSize: 12, fontWeight: '700', color: '#4A4A65', marginBottom: 8, letterSpacing: 0.2 },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EAEF',
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    color: '#2D2D3A',
    lineHeight: 22,
  },
  charCount: { fontSize: 11, color: '#B0B0C8', fontWeight: '500', textAlign: 'right', marginTop: 6 },

  // Anonymous toggle
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF8',
  },
  anonLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  anonIcon: { fontSize: 20 },
  anonTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  anonSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginTop: 2 },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0E1EC',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: '#5A5AD8' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },
});
