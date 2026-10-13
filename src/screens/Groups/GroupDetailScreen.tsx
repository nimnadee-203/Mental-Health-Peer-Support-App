import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
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
import { Feather } from '@expo/vector-icons';
import { COMMUNITY_API_BASE } from '../../config/api';
import { getAuthToken } from '../../api/authStore';
import * as ImagePicker from 'expo-image-picker';
import type { Community } from '../GroupDiscussionScreen';

interface GroupDetailScreenProps {
  community: Community;
  isJoined: boolean;
  onBack: () => void;
  onJoin: (communityId: string) => void;
  onEnter: (community: Community) => void;
  isAdmin?: boolean;
  canManage?: boolean;
  onGroupUpdated?: (community: Community) => void;
}

const DEFAULT_GUIDELINES = [
  'Be respectful and empathetic to every member\'s unique health journey.',
  'Protect community privacy — what is shared here stays here.',
  'Share lived experiences rather than clinical or medical prescriptions.',
  'Encourage healthy self-care habits over burnout and exhaustion.',
];

export default function GroupDetailScreen({
  community,
  isJoined,
  onBack,
  onJoin,
  onEnter,
  isAdmin = false,
  canManage = false,
  onGroupUpdated,
}: GroupDetailScreenProps) {
  const [joined, setJoined] = useState(isJoined);
  const [editVisible, setEditVisible] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editName, setEditName] = useState(community.name);
  const [editCategory, setEditCategory] = useState(community.category);
  const [editDescription, setEditDescription] = useState(community.description);
  const [editGuidelines, setEditGuidelines] = useState(community.guidelines);
  const [editImage, setEditImage] = useState<string | null>(null);

  const handleJoinToggle = () => {
    if (isAdmin) return;
    const next = !joined;
    setJoined(next);

    if (next) {
      onJoin(community._id);
      Alert.alert(
        'Welcome to the Circle! 🎉',
        `You have joined ${community.name}. Feel free to participate in discussions.`,
        [{ text: 'Continue', style: 'default' }],
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editCategory.trim() || !editDescription.trim()) {
      Alert.alert('Missing Information', 'Name, category, and description are required.');
      return;
    }

    setSavingEdit(true);
    try {
      let imageUrl = community.imageUrl || '';
      if (editImage) {
        const formData = new FormData();
        if (Platform.OS === 'web') {
          const blob = await (await fetch(editImage)).blob();
          const extension = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
          formData.append('media', new File([blob], `group.${extension}`, { type: blob.type }));
        } else {
          const filename = editImage.split('/').pop() || 'group.jpg';
          const extension = (filename.split('.').pop() || 'jpg').toLowerCase();
          formData.append('media', {
            uri: editImage,
            name: filename,
            type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
          } as any);
        }
        const uploadResponse = await fetch(`${COMMUNITY_API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'Failed to upload group image.');
        imageUrl = `${COMMUNITY_API_BASE.replace('/api', '')}${uploadData.url}`;
      }

      const response = await fetch(
        `${COMMUNITY_API_BASE}${isAdmin ? `/admin/communities/${community._id}` : `/communities/${community._id}`}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken() || ''}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            category: editCategory.trim(),
            description: editDescription.trim(),
            guidelines: editGuidelines.trim(),
            imageUrl,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update group details.');
      onGroupUpdated?.(data);
      setEditVisible(false);
      Alert.alert('Group Updated', 'The group details were updated successfully.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update group details.');
    } finally {
      setSavingEdit(false);
    }
  };

  const pickEditImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setEditImage(result.assets[0].uri);
  };

  const openEdit = () => {
    setEditImage(null);
    setEditVisible(true);
  };

  const groupImageUrl = community.imageUrl
    ? community.imageUrl.startsWith('http')
      ? community.imageUrl
      : `${COMMUNITY_API_BASE.replace('/api', '')}${community.imageUrl}`
    : '';

  // Guidelines parser with rich fallbacks
  const guidelinesList = community.guidelines && community.guidelines.trim().length > 0
    ? community.guidelines.split('\n').filter(g => g.trim().length > 0)
    : DEFAULT_GUIDELINES;

  const displayMemberCount = community.memberCount && community.memberCount > 0
    ? community.memberCount
    : 1420;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Main Centered Container for Responsive Web & Mobile */}
      <View style={styles.pageCenterWrapper}>
        <View style={styles.contentFrame}>

          {/* ─── HERO BANNER ────────────────────────────────────────────── */}
          <View style={[styles.bannerContainer, { backgroundColor: community.bgColor || '#EEF2FF' }]}>
            {groupImageUrl ? (
              <ImageBackground
                source={{ uri: groupImageUrl }}
                style={styles.bannerImage}
                imageStyle={styles.bannerImageStyle}
              >
                <View style={styles.bannerOverlay} />
              </ImageBackground>
            ) : (
              <View style={styles.ambientDecor}>
                <View style={styles.ambientCircleOne} />
                <View style={styles.ambientCircleTwo} />
              </View>
            )}

            {/* Top Navigation Row */}
            <View style={styles.bannerTopNav}>
              <Pressable
                style={styles.navRoundButton}
                onPress={onBack}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Feather name="arrow-left" size={20} color="#1E293B" />
              </Pressable>

              <View style={styles.navRightGroup}>
                {canManage && (
                  <Pressable
                    style={styles.navRoundButton}
                    onPress={openEdit}
                    accessibilityLabel="Edit Community"
                  >
                    <Feather name="edit-2" size={17} color="#1E293B" />
                  </Pressable>
                )}

                <Pressable
                  style={styles.navRoundButton}
                  onPress={() => Alert.alert('Share Community', `Invite peers to ${community.name}`)}
                  accessibilityLabel="Share Community"
                >
                  <Feather name="share-2" size={17} color="#1E293B" />
                </Pressable>
              </View>
            </View>

            {/* Floating Central Icon Badge */}
            <View style={styles.badgeWrapper}>
              <View style={styles.emojiCard}>
                <Text style={styles.emojiText}>{community.emoji || '💬'}</Text>
              </View>
            </View>
          </View>

          {/* ─── SCROLLABLE COMMUNITY BODY ─────────────────────────────── */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Pill */}
            <View style={styles.categoryPillRow}>
              <View style={styles.categoryPill}>
                <Feather name="tag" size={12} color="#5A5AD8" style={{ marginRight: 5 }} />
                <Text style={styles.categoryPillText}>{community.category || 'Support Group'}</Text>
              </View>
              <View style={styles.safeSpaceTag}>
                <Feather name="shield" size={12} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.safeSpaceTagText}>Moderated & Confidential</Text>
              </View>
            </View>

            {/* Community Title & Description */}
            <Text style={styles.communityTitle}>{community.name}</Text>
            <Text style={styles.communityDescription}>
              {community.description || 'A safe and supportive space to connect, share your journey, and listen to peers who truly understand.'}
            </Text>

            {/* ─── STATS & PULSE CARD ────────────────────────────────────── */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={styles.avatarStack}>
                  {(community.memberAvatarColors || ['#3B82F6', '#60A5FA', '#93C5FD'])
                    .slice(0, 3)
                    .map((color, i) => (
                      <View
                        key={i}
                        style={[
                          styles.memberAvatar,
                          { backgroundColor: color, marginLeft: i === 0 ? 0 : -8 },
                        ]}
                      />
                    ))}
                </View>
                <Text style={styles.statValue}>{displayMemberCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Peers</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.activePulseRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.statValue}>Active</Text>
                </View>
                <Text style={styles.statLabel}>Today</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Feather name="heart" size={16} color="#EC4899" />
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>Safe Space</Text>
              </View>
            </View>

            {/* ─── ACTION BUTTONS ────────────────────────────────────────── */}
            <View style={styles.actionSection}>
              {isAdmin ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.primaryActionButton}
                    onPress={() => onEnter(community)}
                  >
                    <Text style={styles.primaryActionText}>Enter Discussion</Text>
                    <Feather name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </Pressable>
                  <Pressable style={styles.secondaryOutlineButton} onPress={openEdit}>
                    <Feather name="settings" size={16} color="#5A5AD8" style={{ marginRight: 6 }} />
                    <Text style={styles.secondaryOutlineText}>Edit Group</Text>
                  </Pressable>
                </View>
              ) : !joined ? (
                <Pressable
                  style={styles.joinPrimaryButton}
                  onPress={handleJoinToggle}
                >
                  <Feather name="user-plus" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.joinPrimaryText}>Join This Community</Text>
                </Pressable>
              ) : (
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.joinedStatusButton}
                    onPress={handleJoinToggle}
                  >
                    <Feather name="check" size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.joinedStatusText}>Joined</Text>
                  </Pressable>

                  <Pressable
                    style={styles.enterPrimaryButton}
                    onPress={() => onEnter(community)}
                  >
                    <Text style={styles.enterPrimaryText}>Enter Discussion</Text>
                    <Feather name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </Pressable>
                </View>
              )}

              {canManage && !isAdmin && (
                <Pressable style={styles.manageLinkButton} onPress={openEdit}>
                  <Feather name="settings" size={14} color="#5A5AD8" style={{ marginRight: 6 }} />
                  <Text style={styles.manageLinkText}>Manage Community Settings</Text>
                </Pressable>
              )}
            </View>

            {/* ─── WHAT TO EXPECT / COMMUNITY PILLARS ─────────────────────── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>WHAT TO EXPECT IN THIS SPACE</Text>
            </View>

            <View style={styles.pillarsContainer}>
              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Feather name="eye-off" size={18} color="#2563EB" />
                </View>
                <View style={styles.pillarContent}>
                  <Text style={styles.pillarTitle}>Anonymous Sharing</Text>
                  <Text style={styles.pillarSubtitle}>
                    You can post anonymously whenever you need privacy and discretion.
                  </Text>
                </View>
              </View>

              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Feather name="users" size={18} color="#059669" />
                </View>
                <View style={styles.pillarContent}>
                  <Text style={styles.pillarTitle}>Mutual Peer Empathy</Text>
                  <Text style={styles.pillarSubtitle}>
                    Share practical study, stress, and wellbeing strategies that work.
                  </Text>
                </View>
              </View>
            </View>

            {/* ─── COMMUNITY GUIDELINES ──────────────────────────────────── */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>COMMUNITY GUIDELINES</Text>
            </View>

            <View style={styles.guidelinesList}>
              {guidelinesList.map((guideline, index) => (
                <View key={index} style={styles.guidelineRow}>
                  <View style={styles.guidelineNumberBadge}>
                    <Text style={styles.guidelineNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.guidelineBodyText}>{guideline.trim()}</Text>
                </View>
              ))}
            </View>

            {/* ─── CRISIS ASSISTANCE NOTICE ──────────────────────────────── */}
            <View style={styles.crisisCard}>
              <View style={styles.crisisIconCircle}>
                <Feather name="life-buoy" size={18} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.crisisTitle}>Need Urgent Support?</Text>
                <Text style={styles.crisisSubtitle}>
                  This is a peer group. If you are experiencing a crisis, 24/7 dedicated hotlines are here for you.
                </Text>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>

      {/* ─── EDIT COMMUNITY MODAL ────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={editVisible}
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.editOverlay}>
          <ScrollView contentContainerStyle={styles.editModal} keyboardShouldPersistTaps="handled">
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit Community</Text>
              <Pressable
                accessibilityLabel="Close edit"
                style={styles.modalCloseButton}
                onPress={() => setEditVisible(false)}
              >
                <Feather name="x" size={20} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.editLabel}>Group Name</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Student Stress Support"
            />

            <Text style={styles.editLabel}>Category</Text>
            <TextInput
              style={styles.editInput}
              value={editCategory}
              onChangeText={setEditCategory}
              placeholder="e.g. Academic Pressure"
            />

            <Text style={styles.editLabel}>Description</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              multiline
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Explain the purpose of this community..."
            />

            <Text style={styles.editLabel}>Guidelines (one per line)</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              multiline
              value={editGuidelines}
              onChangeText={setEditGuidelines}
              placeholder="Enter guidelines..."
            />

            <Text style={styles.editLabel}>Cover Image</Text>
            <Pressable style={styles.editImagePicker} onPress={pickEditImage}>
              {editImage || groupImageUrl ? (
                <Image source={{ uri: editImage || groupImageUrl }} style={styles.editImagePreview} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Feather name="image" size={24} color="#5A5AD8" />
                  <Text style={styles.editImageText}>Choose cover image</Text>
                </View>
              )}
            </Pressable>

            <Pressable disabled={savingEdit} style={styles.saveEditButton} onPress={handleSaveEdit}>
              {savingEdit ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveEditText}>Save Changes</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  pageCenterWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
  },
  contentFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },

  // ── Hero Banner
  bannerContainer: {
    height: 190,
    position: 'relative',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'visible',
    zIndex: 10,
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  bannerImageStyle: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  ambientDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  ambientCircleOne: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  ambientCircleTwo: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bannerTopNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  navRightGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  navRoundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Central floating icon card
  badgeWrapper: {
    position: 'absolute',
    bottom: -36,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  emojiCard: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  emojiText: {
    fontSize: 40,
  },

  // ── Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 110,
  },

  // ── Category & Identity
  categoryPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5AD8',
  },
  safeSpaceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  safeSpaceTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  communityTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  communityDescription: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    paddingHorizontal: 10,
  },

  // ── Stats Trio Card
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  // ── Action Buttons
  actionSection: {
    marginTop: 22,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  joinPrimaryButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#5A5AD8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A5AD8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  joinPrimaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  joinedStatusButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedStatusText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  enterPrimaryButton: {
    flex: 2,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#5A5AD8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A5AD8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  enterPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  primaryActionButton: {
    flex: 2,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#5A5AD8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryOutlineButton: {
    flex: 1.2,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A5AD8',
  },
  manageLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  manageLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A5AD8',
  },

  // ── Section Headers
  sectionHeaderRow: {
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },

  // ── Pillars Cards
  pillarsContainer: {
    gap: 10,
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 14,
  },
  pillarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  pillarSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 2,
  },

  // ── Guidelines
  guidelinesList: {
    gap: 10,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  guidelineNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  guidelineNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5A5AD8',
  },
  guidelineBodyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '500',
  },

  // ── Crisis Card
  crisisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 16,
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 14,
  },
  crisisIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  crisisSubtitle: {
    fontSize: 11.5,
    color: '#B91C1C',
    lineHeight: 17,
    marginTop: 2,
  },

  // ── Edit Modal
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 6,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  editTextArea: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  editImagePicker: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  editImagePreview: {
    width: '100%',
    height: 140,
  },
  editImageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A5AD8',
  },
  saveEditButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#5A5AD8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveEditText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
