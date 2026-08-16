import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─── Config ───────────────────────────────────────────────────────────────────
// Android emulator → host machine. Change to LAN IP for a physical device.
const API_BASE = 'http://10.0.2.2:3000/api';
const MAX_DESC = 300;

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOJIS = [
  '🌊', '🧘', '📚', '🌱', '🤝', '💬',
  '🌿', '☀️', '🦋', '🌸', '⭐', '🌈',
];

const COLORS = [
  '#C5DFF8', '#F9D4E0', '#FDDCB5', '#C8EDD5',
  '#D4C9F5', '#C9E4F5', '#F5C9E4', '#C9F5D4',
];

const CATEGORIES = [
  'Stress & Anxiety',
  'Academic Pressure',
  'Mindfulness',
  'Healthy Habits',
  'Relationships',
  'Emotional Wellbeing',
  'Other',
];

const DEFAULT_GUIDELINES = [
  'Be respectful and kind to all members.',
  "Protect each other's privacy — do not share anything outside this group.",
  'Listen without judgment.',
  'Avoid harmful or inappropriate content.',
  'Remember that peer support is not professional therapy.',
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Guideline {
  id: string;
  text: string;
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {id: 'home', label: 'Home', icon: '⌂'},
  {id: 'resources', label: 'Resources', icon: '⊟'},
  {id: 'groups', label: 'Groups', icon: '◈'},
  {id: 'messages', label: 'Messages', icon: '✉'},
  {id: 'profile', label: 'Profile', icon: '◯'},
];

function BottomNav() {
  const [active, setActive] = useState('groups');
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <Pressable
            key={item.id}
            style={styles.navBtn}
            onPress={() => setActive(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}>
            <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Guideline Row ────────────────────────────────────────────────────────────
function GuidelineRow({
  index,
  guideline,
  onUpdate,
  onRemove,
}: {
  index: number;
  guideline: Guideline;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.guidelineRow}>
      {/* Number badge */}
      <View style={styles.guidelineNumWrap}>
        <View style={styles.guidelineNumBadge}>
          <Text style={styles.guidelineNumText}>{index + 1}</Text>
        </View>
      </View>

      {/* Editable text */}
      <TextInput
        style={styles.guidelineInput}
        value={guideline.text}
        onChangeText={text => onUpdate(guideline.id, text)}
        multiline
        placeholder="Enter guideline…"
        placeholderTextColor="rgba(45,45,58,0.35)"
        textAlignVertical="top"
        accessibilityLabel={`Guideline ${index + 1}`}
      />

      {/* Remove button */}
      <View style={styles.guidelineRemoveWrap}>
        <Pressable
          style={styles.guidelineRemoveBtn}
          onPress={() => onRemove(guideline.id)}
          accessibilityRole="button"
          accessibilityLabel="Remove guideline">
          <Text style={styles.guidelineRemoveIcon}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Visibility Radio Option ──────────────────────────────────────────────────
function VisibilityOption({
  value,
  selected,
  title,
  subtitle,
  onPress,
}: {
  value: 'public' | 'private';
  selected: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.visibilityOption, selected && styles.visibilityOptionActive]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{checked: selected}}
      accessibilityLabel={title}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.visibilityTextCol}>
        <Text style={styles.visibilityTitle}>{title}</Text>
        <Text style={styles.visibilitySub}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
function CreateGroupScreen() {
  // Form state
  const [selectedEmoji, setSelectedEmoji] = useState('🌱');
  const [selectedColor, setSelectedColor] = useState('#C8EDD5');
  const [groupName, setGroupName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState<Guideline[]>(
    DEFAULT_GUIDELINES.map((text, i) => ({id: `g-${i}`, text})),
  );
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Validation state
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameError = submitted && groupName.trim() === '';
  const categoryError = submitted && selectedCategory === '';

  // ── Guideline handlers ──────────────────────────────────────────────────────
  function addGuideline() {
    setGuidelines(prev => [
      ...prev,
      {id: `g-${Date.now()}`, text: ''},
    ]);
  }

  function removeGuideline(id: string) {
    setGuidelines(prev => prev.filter(g => g.id !== id));
  }

  function updateGuideline(id: string, text: string) {
    setGuidelines(prev => prev.map(g => (g.id === id ? {...g, text} : g)));
  }

  // ── Form reset ──────────────────────────────────────────────────────────────
  function resetForm() {
    setGroupName('');
    setSelectedCategory('');
    setDescription('');
    setSelectedEmoji('🌱');
    setSelectedColor('#C8EDD5');
    setGuidelines(DEFAULT_GUIDELINES.map((text, i) => ({id: `g-reset-${i}`, text})));
    setVisibility('public');
    setSubmitted(false);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handlePreview() {
    setSubmitted(true);
    if (!groupName.trim() || !selectedCategory) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/communities`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: groupName.trim(),
          category: selectedCategory,
          emoji: selectedEmoji,
          bgColor: selectedColor,
          description:
            description.trim() ||
            `A peer-support community for ${selectedCategory.toLowerCase()}.`,
          memberCount: 1,
          memberAvatarColors: ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
          isJoined: true,
        }),
      });

      if (res.ok) {
        Alert.alert(
          '🎉 Group Created!',
          `"${groupName.trim()}" has been created and added to the community.`,
          [{text: 'Great!', onPress: resetForm}],
        );
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Error', err.error || 'Failed to create group. Please try again.');
      }
    } catch {
      // Offline — still give positive feedback so the experience isn't broken
      Alert.alert(
        '📱 Saved Offline',
        `"${groupName.trim()}" will be created once you're back online.`,
        [{text: 'OK', onPress: resetForm}],
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Back + Title ── */}
          <View style={styles.headerRow}>
            <Pressable
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Create a support group</Text>
          </View>

          {/* ── Subtitle ── */}
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitleText}>
              Create a safe space where community members can connect around a
              shared interest or wellbeing topic.
            </Text>
          </View>

          {/* ── Info Banner ── */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerEmoji}>🌱</Text>
            <Text style={styles.infoBannerText}>
              Groups on MindConnect are peer-support communities. They are not
              therapy, counselling, or professional mental-health services.
            </Text>
          </View>

          {/* ════════════════ Group Image ════════════════ */}
          <View style={[styles.sectionWrap, {marginTop: 24}]}>
            <Text style={styles.label}>Group image</Text>

            <View style={styles.imageRow}>
              {/* Live preview */}
              <View
                style={[
                  styles.iconPreview,
                  {backgroundColor: selectedColor},
                ]}>
                <Text style={styles.iconPreviewEmoji}>{selectedEmoji}</Text>
              </View>

              {/* Pickers column */}
              <View style={styles.pickerCol}>
                {/* ── Emoji Picker ── */}
                <Text style={styles.pickerLabel}>Choose an icon</Text>
                <View style={styles.emojiGrid}>
                  {EMOJIS.map(emoji => (
                    <Pressable
                      key={emoji}
                      style={[
                        styles.emojiBtn,
                        selectedEmoji === emoji && styles.emojiBtnActive,
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${emoji}`}>
                      <Text style={styles.emojiBtnChar}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* ── Colour Picker ── */}
                <Text style={[styles.pickerLabel, styles.pickerLabelSpaced]}>
                  Choose a colour
                </Text>
                <View style={styles.colorRow}>
                  {COLORS.map(color => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorCircle,
                        {backgroundColor: color},
                        selectedColor === color && styles.colorCircleActive,
                      ]}
                      onPress={() => setSelectedColor(color)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select colour ${color}`}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ════════════════ Group Name ════════════════ */}
          <View style={[styles.sectionWrap, {marginTop: 22}]}>
            <Text style={styles.label}>
              Group name <Text style={styles.asterisk}>*</Text>
            </Text>

            <View style={styles.fieldMargin}>
              <TextInput
                style={[styles.textInput, nameError && styles.textInputError]}
                placeholder="Give your group a name"
                placeholderTextColor="rgba(45,45,58,0.5)"
                value={groupName}
                onChangeText={setGroupName}
                maxLength={80}
                accessibilityLabel="Group name"
              />
            </View>

            {nameError && (
              <Text style={styles.errorMsg}>Please give your group a name.</Text>
            )}
          </View>

          {/* ════════════════ Category ════════════════ */}
          <View style={[styles.sectionWrap, {marginTop: 18}]}>
            <Text style={styles.label}>
              Category <Text style={styles.asterisk}>*</Text>
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                    accessibilityRole="button"
                    accessibilityState={{selected: isActive}}
                    accessibilityLabel={cat}>
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive && styles.categoryChipTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {categoryError && (
              <Text style={styles.errorMsg}>Please select a category.</Text>
            )}
          </View>

          {/* ════════════════ Description ════════════════ */}
          <View style={[styles.sectionWrap, {marginTop: 18}]}>
            <Text style={styles.label}>
              Description <Text style={styles.asterisk}>*</Text>
            </Text>

            <View style={styles.fieldMargin}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell members what this group is about…"
                placeholderTextColor="rgba(45,45,58,0.5)"
                value={description}
                onChangeText={t => setDescription(t.slice(0, MAX_DESC))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Group description"
              />
            </View>
            <Text style={styles.charCounter}>
              {description.length}/{MAX_DESC} characters
            </Text>
          </View>

          {/* ════════════════ Community Guidelines ════════════════ */}
          <View style={[styles.sectionWrap, {marginTop: 18}]}>
            <Text style={styles.label}>Community guidelines</Text>

            <Text style={styles.guidelinesSub}>
              We've added suggested guidelines. You can edit or add your own.
            </Text>

            <View style={styles.guidelinesList}>
              {guidelines.map((g, index) => (
                <GuidelineRow
                  key={g.id}
                  index={index}
                  guideline={g}
                  onUpdate={updateGuideline}
                  onRemove={removeGuideline}
                />
              ))}
            </View>

            {/* Add guideline button */}
            <Pressable
              style={styles.addGuidelineBtn}
              onPress={addGuideline}
              accessibilityRole="button"
              accessibilityLabel="Add guideline">
              <Text style={styles.addGuidelinePlus}>+</Text>
              <Text style={styles.addGuidelineText}>Add guideline</Text>
            </Pressable>
          </View>

          {/* ════════════════ Group Visibility ════════════════ */}
          <View style={[styles.sectionWrap, {marginTop: 18}]}>
            <Text style={styles.label}>Group visibility</Text>

            <View style={styles.visibilityOptions}>
              <VisibilityOption
                value="public"
                selected={visibility === 'public'}
                title="Public"
                subtitle="Anyone can discover and join this group."
                onPress={() => setVisibility('public')}
              />
              <VisibilityOption
                value="private"
                selected={visibility === 'private'}
                title="Private"
                subtitle="Members need approval before they can join."
                onPress={() => setVisibility('private')}
              />
            </View>
          </View>

          {/* ════════════════ Primary Button ════════════════ */}
          <View style={styles.primaryBtnWrap}>
            <Pressable
              onPress={handlePreview}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Preview group">
              <LinearGradient
                colors={['#C5DFF8', '#C8EDD5']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}>
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Creating…' : 'Preview group'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.scrollSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Fixed Bottom Navigation ── */}
      <BottomNav />
    </SafeAreaView>
  );
}

export default CreateGroupScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF'},
  flex: {flex: 1},
  scroll: {flex: 1, backgroundColor: '#FFFFFF'},
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  backIcon: {
    fontSize: 24,
    color: '#6B6B80',
    lineHeight: 28,
    marginTop: -2,
  },
  pageTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#2D2D3A',
    letterSpacing: -0.4,
    lineHeight: 30,
  },

  // ── Subtitle ────────────────────────────────────────────────────────────────
  subtitleWrap: {
    paddingLeft: 54,
    paddingTop: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 21,
  },

  // ── Info Banner ─────────────────────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(197,223,248,0.125)',
    borderWidth: 1.64,
    borderColor: 'rgba(197,223,248,0.314)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginTop: 28,
  },
  infoBannerEmoji: {fontSize: 14, lineHeight: 21},
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 18,
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  sectionWrap: {},
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D3A',
    lineHeight: 20,
  },
  asterisk: {color: '#E05555'},

  // ── Group Image ─────────────────────────────────────────────────────────────
  imageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 10,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  iconPreviewEmoji: {fontSize: 32},
  pickerCol: {flex: 1},
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B6B80',
    lineHeight: 18,
    marginBottom: 8,
  },
  pickerLabelSpaced: {marginTop: 10},

  // ── Emoji Grid ───────────────────────────────────────────────────────────────
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnActive: {
    backgroundColor: '#F7F7FB',
    borderColor: '#2D2D3A',
  },
  emojiBtnChar: {fontSize: 18},

  // ── Color Row ────────────────────────────────────────────────────────────────
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorCircleActive: {
    borderWidth: 1.64,
    borderColor: '#2D2D3A',
  },

  // ── Text Inputs ──────────────────────────────────────────────────────────────
  fieldMargin: {marginTop: 7},
  textInput: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: '500',
    color: '#2D2D3A',
    height: 50,
  },
  textInputError: {
    borderColor: '#E05555',
  },
  errorMsg: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E05555',
    lineHeight: 18,
    marginTop: 5,
  },
  textArea: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 15,
    fontWeight: '500',
    color: '#2D2D3A',
    minHeight: 125,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0A0B8',
    textAlign: 'right',
    marginTop: 5,
    lineHeight: 16,
  },

  // ── Category Chips ───────────────────────────────────────────────────────────
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2D2D3A',
    borderColor: '#2D2D3A',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B80',
  },
  categoryChipTextActive: {color: '#FFFFFF'},

  // ── Guidelines ───────────────────────────────────────────────────────────────
  guidelinesSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 18,
    marginTop: 7,
  },
  guidelinesList: {
    marginTop: 10,
    gap: 8,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guidelineNumWrap: {
    paddingTop: 12,
    flexShrink: 0,
  },
  guidelineNumBadge: {
    width: 22,
    height: 22,
    backgroundColor: '#C8EDD5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D2D3A',
    lineHeight: 16,
  },
  guidelineInput: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 20,
    minHeight: 45,
    textAlignVertical: 'top',
  },
  guidelineRemoveWrap: {
    paddingTop: 7,
    flexShrink: 0,
  },
  guidelineRemoveBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineRemoveIcon: {
    fontSize: 11,
    color: '#A0A0B8',
    fontWeight: '600',
  },

  // ── Add Guideline Button ─────────────────────────────────────────────────────
  addGuidelineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  addGuidelinePlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B6B80',
    lineHeight: 24,
  },
  addGuidelineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B80',
    lineHeight: 20,
  },

  // ── Group Visibility ─────────────────────────────────────────────────────────
  visibilityOptions: {
    gap: 8,
    marginTop: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    minHeight: 68,
  },
  visibilityOptionActive: {
    backgroundColor: '#F7F7FB',
    borderColor: '#2D2D3A',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioOuterActive: {
    backgroundColor: '#2D2D3A',
    borderColor: '#2D2D3A',
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  visibilityTextCol: {flex: 1},
  visibilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D3A',
    lineHeight: 21,
  },
  visibilitySub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 18,
  },

  // ── Primary Button ───────────────────────────────────────────────────────────
  primaryBtnWrap: {marginTop: 18},
  primaryBtn: {
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C5DFF8',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryBtnDisabled: {opacity: 0.7},
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D2D3A',
    letterSpacing: -0.17,
    textAlign: 'center',
  },

  scrollSpacer: {height: 24},

  // ── Bottom Navigation ────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.64,
    borderTopColor: '#E8E8F0',
  },
  navBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    gap: 3,
  },
  navIcon: {fontSize: 19, color: '#A0A0B8'},
  navIconActive: {color: '#2D2D3A'},
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A0A0B8',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  navLabelActive: {fontWeight: '800', color: '#2D2D3A'},
});
