import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken, clearAuthSession } from '../api/authStore';
import { saveFeelingEntry } from '../api/feelingsStore';
import type { Community } from './GroupDiscussionScreen';

// ─── Moods ────────────────────────────────────────────────────────────────────
const MOODS: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}[] = [
  { icon: 'smile',         label: 'Happy',        bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', iconColor: '#F59E0B' },
  { icon: 'wind',          label: 'Calm',          bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46', iconColor: '#10B981' },
  { icon: 'cloud-rain',    label: 'Sad',           bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', iconColor: '#3B82F6' },
  { icon: 'alert-octagon', label: 'Frustrated',    bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', iconColor: '#EF4444' },
  { icon: 'activity',      label: 'Anxious',       bg: '#FFF7ED', border: '#FDBA74', text: '#9A3412', iconColor: '#F97316' },
  { icon: 'heart',         label: 'Grateful',      bg: '#FDF4FF', border: '#D8B4FE', text: '#6B21A8', iconColor: '#A855F7' },
  { icon: 'moon',          label: 'Tired',         bg: '#EFF6FF', border: '#BAE6FD', text: '#075985', iconColor: '#38BDF8' },
  { icon: 'zap',           label: 'Excited',       bg: '#FEFCE8', border: '#FDE047', text: '#713F12', iconColor: '#EAB308' },
  { icon: 'minus-circle',  label: 'Numb',          bg: '#F9FAFB', border: '#D1D5DB', text: '#4B5563', iconColor: '#9CA3AF' },
  { icon: 'shield',        label: 'Strong',        bg: '#F0FDF4', border: '#86EFAC', text: '#14532D', iconColor: '#22C55E' },
  { icon: 'users',         label: 'Need support',  bg: '#F5F3FF', border: '#C4B5FD', text: '#4C1D95', iconColor: '#8B5CF6' },
  { icon: 'feather',       label: 'At peace',      bg: '#F0F9FF', border: '#7DD3FC', text: '#0C4A6E', iconColor: '#0EA5E9' },
];

const FACTORS = [
  'General Life',
  'Studies & Exams',
  'Relationships',
  'Sleep & Rest',
  'Physical Health',
  'Work & Career',
];

function getMoodAffirmation(moodLabel: string): string {
  switch (moodLabel.toLowerCase()) {
    case 'happy':
    case 'excited':
      return 'Savor this positive energy and share your joy with others! ✨';
    case 'calm':
    case 'at peace':
      return 'Enjoy this balanced state of tranquility and centeredness. 🌿';
    case 'grateful':
      return 'Gratitude nurtures a resilient, grounded heart. 💖';
    case 'strong':
      return 'Your resilience and inner courage will carry you through anything. 💪';
    case 'anxious':
      return 'Take three slow, gentle breaths. You are safe in this present moment. 🌊';
    case 'frustrated':
      return 'It is completely valid to feel upset. Give yourself space to decompress. 🕯️';
    case 'sad':
    case 'numb':
      return 'It is okay not to be okay. Take things one small step at a time. 💙';
    case 'tired':
      return 'Rest is not a reward—it is a necessity. Be gentle with your body. 🌙';
    case 'need support':
      return 'Reaching out is a sign of strength. Your peer community is here for you. 🤝';
    default:
      return 'Honoring how you feel is the first step toward true well-being. 🌱';
  }
}

interface FeelingPickerScreenProps {
  community: Community;
  onBack: () => void;
  onPostCreated: () => void;
}

const REQUEST_TIMEOUT_MS = 10000;

export default function FeelingPickerScreen({ community, onBack, onPostCreated }: FeelingPickerScreenProps) {
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<string>('General Life');
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleMoodSelect = (mood: typeof MOODS[0]) => {
    setSelectedMood(mood);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!selectedMood || isSubmitting) return;
    setIsSubmitting(true);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      // 1. Save to user's persistent profile feeling history
      await saveFeelingEntry({
        mood: selectedMood.label,
        icon: selectedMood.icon,
        bg: selectedMood.bg,
        border: selectedMood.border,
        text: selectedMood.text,
        iconColor: selectedMood.iconColor,
        note: note.trim(),
        tag: selectedFactor,
        communityName: community.name,
      });

      // 2. Share post to the community
      const content = note.trim()
        ? `I'm feeling ${selectedMood.label} (${selectedFactor})\n\n${note.trim()}`
        : `I'm feeling ${selectedMood.label} (${selectedFactor})`;

      const res = await fetch(`${COMMUNITY_API_BASE}/posts/group/${encodeURIComponent(community._id)}`, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ content, topic: 'Sharing', contentNote: 'None', isAnonymous }),
      });
      if (!res.ok) {
        const err = new Error(((await res.json().catch(() => null))?.error) || 'Failed') as any;
        err.status = res.status; throw err;
      }
      onPostCreated();
    } catch (error: any) {
      if (error?.status === 401) { clearAuthSession(); Alert.alert('Session expired', 'Please log in again.'); return; }
      Alert.alert('Could not post', error?.name === 'AbortError' ? 'Server timeout.' : error?.message || 'Something went wrong.');
    } finally { clearTimeout(tid); setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── HEADER ─────────────────────────────────────── */}
        <View style={s.header}>
          <Pressable style={s.backBtn} onPress={onBack} hitSlop={10}>
            <Feather name="x" size={20} color="#4A4A65" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>How are you feeling?</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Feather name="users" size={11} color="#A0A0B8" />
              <Text style={s.headerSub} numberOfLines={1}>{community.name}</Text>
            </View>
          </View>
          <Pressable
            style={[s.postBtn, !selectedMood && s.postBtnOff]}
            onPress={handleSubmit}
            disabled={!selectedMood || isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="#FFF" />
              : <>
                  <Feather name="send" size={14} color={selectedMood ? '#FFF' : '#C0C0D8'} />
                  <Text style={[s.postBtnText, !selectedMood && s.postBtnTextOff]}>Share</Text>
                </>
            }
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* ── PREVIEW ────────────────────────────────────── */}
          {selectedMood ? (
            <View style={{ marginBottom: 20 }}>
              <Animated.View style={[s.previewCard, { backgroundColor: selectedMood.bg, borderColor: selectedMood.border, transform: [{ scale: scaleAnim }] }]}>
                <View style={[s.previewIconBox, { backgroundColor: selectedMood.border + '50' }]}>
                  <Feather name={selectedMood.icon} size={28} color={selectedMood.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.previewTopLabel}>Currently feeling</Text>
                  <Text style={[s.previewMoodLabel, { color: selectedMood.text }]}>{selectedMood.label}</Text>
                </View>
                <Pressable style={s.clearBtn} onPress={() => setSelectedMood(null)}>
                  <Feather name="x" size={14} color="#888" />
                </Pressable>
              </Animated.View>

              {/* Affirmation / Insight Pill */}
              <View style={s.affirmationBox}>
                <Feather name="heart" size={13} color="#5A5AD8" style={{ marginTop: 2 }} />
                <Text style={s.affirmationText}>{getMoodAffirmation(selectedMood.label)}</Text>
              </View>
            </View>
          ) : (
            <View style={s.placeholderCard}>
              <View style={s.placeholderIconBox}>
                <Feather name="help-circle" size={28} color="#C0C0D4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.placeholderTitle}>Choose a feeling</Text>
                <Text style={s.placeholderText}>Select an emotion below to reflect and log your check-in</Text>
              </View>
            </View>
          )}

          {/* ── MOOD GRID ──────────────────────────────────── */}
          <View style={s.gridHeader}>
            <Feather name="smile" size={12} color="#5A5AD8" />
            <Text style={s.gridLabel}>CHOOSE YOUR FEELING</Text>
          </View>

          <View style={s.grid}>
            {MOODS.map(mood => {
              const isSel = selectedMood?.label === mood.label;
              return (
                <Pressable
                  key={mood.label}
                  style={[s.moodChip, isSel && { backgroundColor: mood.bg, borderColor: mood.border }]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <Feather name={mood.icon} size={16} color={isSel ? mood.iconColor : '#9CA3AF'} />
                  <Text style={[s.moodLabel, isSel && { color: mood.text, fontWeight: '700' }]}>{mood.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── CONTRIBUTING FACTORS ────────────────────────── */}
          <View style={s.sectionBlock}>
            <View style={s.gridHeader}>
              <Feather name="tag" size={12} color="#5A5AD8" />
              <Text style={s.gridLabel}>WHAT'S INFLUENCING THIS?</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.factorRow}>
              {FACTORS.map(factor => {
                const isSel = selectedFactor === factor;
                return (
                  <Pressable
                    key={factor}
                    style={[s.factorPill, isSel && s.factorPillSel]}
                    onPress={() => setSelectedFactor(factor)}
                  >
                    <Text style={[s.factorText, isSel && s.factorTextSel]}>{factor}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── NOTE ───────────────────────────────────────── */}
          <View style={s.noteSection}>
            <View style={s.noteLabelRow}>
              <Feather name="edit-2" size={12} color="#6B6B80" />
              <Text style={s.noteLabel}>Add a reflection note (optional)</Text>
            </View>
            <TextInput
              style={s.noteInput}
              placeholder="What thoughts or experiences are on your mind?"
              placeholderTextColor="#C0C0D4"
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              maxLength={300}
            />
            <Text style={s.charCount}>{note.length}/300</Text>
          </View>

          {/* ── PROFILE SYNC BANNER ────────────────────────── */}
          <View style={s.historySyncBanner}>
            <Feather name="bookmark" size={14} color="#059669" />
            <Text style={s.historySyncText}>
              This check-in will be automatically saved to your <Text style={{ fontWeight: '700' }}>Profile Mood Journey</Text>.
            </Text>
          </View>

          {/* ── ANONYMOUS TOGGLE ───────────────────────────── */}
          <Pressable style={s.anonCard} onPress={() => setIsAnonymous(v => !v)}>
            <View style={[s.anonIconBox, { backgroundColor: isAnonymous ? '#EDE8FF' : '#F2F3F8' }]}>
              <Feather name={isAnonymous ? 'eye-off' : 'eye'} size={18} color={isAnonymous ? '#7C67D6' : '#9CA3AF'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.anonTitle}>{isAnonymous ? 'Share in circle anonymously' : 'Share in circle as yourself'}</Text>
              <Text style={s.anonSub}>{isAnonymous ? 'Other members will see Anonymous Member' : 'Your name will be visible to peers'}</Text>
            </View>
            <View style={[s.toggle, isAnonymous && s.toggleOn]}>
              <View style={[s.toggleThumb, isAnonymous && s.toggleThumbOn]} />
            </View>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FD' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F1F8', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F3F8', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500' },
  postBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#5A5AD8', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  postBtnOff: { backgroundColor: '#ECEEF8' },
  postBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  postBtnTextOff: { color: '#C0C0D8' },

  scroll: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 32 },

  // Preview
  previewCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  previewIconBox: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  previewTopLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  previewMoodLabel: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  clearBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.07)', alignItems: 'center', justifyContent: 'center' },
  
  affirmationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F3F0FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  affirmationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#4338CA',
    fontWeight: '600',
  },

  placeholderCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#E8EAEF', borderStyle: 'dashed', paddingVertical: 20, paddingHorizontal: 18, marginBottom: 22 },
  placeholderIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5F5FA', alignItems: 'center', justifyContent: 'center' },
  placeholderTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  placeholderText: { fontSize: 12, color: '#94A3B8', fontWeight: '500', lineHeight: 17 },

  // Grid
  gridHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  gridLabel: { fontSize: 11, fontWeight: '900', color: '#64748B', letterSpacing: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, backgroundColor: '#FFFFFF', borderColor: '#E8EAEF' },
  moodLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  // Factors
  sectionBlock: { marginBottom: 20 },
  factorRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  factorPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  factorPillSel: {
    backgroundColor: '#5A5AD8',
    borderColor: '#5A5AD8',
  },
  factorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  factorTextSel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Note
  noteSection: { marginBottom: 14 },
  noteLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  noteLabel: { fontSize: 12, fontWeight: '700', color: '#4A4A65', letterSpacing: 0.1 },
  noteInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E8EAEF', padding: 14, minHeight: 90, fontSize: 14, color: '#2D2D3A', lineHeight: 22 },
  charCount: { fontSize: 11, color: '#C0C0D4', fontWeight: '500', textAlign: 'right', marginTop: 6 },

  // Sync banner
  historySyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 16,
  },
  historySyncText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },

  // Anonymous
  anonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#ECEEF8', gap: 12 },
  anonIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  anonTitle: { fontSize: 13, fontWeight: '700', color: '#0D0D1A' },
  anonSub: { fontSize: 11, color: '#A0A0B8', fontWeight: '500', marginTop: 2 },
  toggle: { width: 46, height: 25, borderRadius: 13, backgroundColor: '#E0E1EC', justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: '#5A5AD8' },
  toggleThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },
});

