import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
  Alert,
} from 'react-native';
import { COMMUNITY_API_BASE } from '../../config/api';
import { getAuthToken } from '../../api/authStore';
import * as ImagePicker from 'expo-image-picker';
import type { Community } from '../GroupDiscussionScreen';

// ─── Guidelines per community (fallback to defaults) ─────────────────────────

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
      'You’re a member! 🎉',
      `You have joined ${community.name}.`,
      [
        {
          text: 'Continue',
          style: 'default',
        },
      ],
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
    const response = await fetch(`${COMMUNITY_API_BASE}${isAdmin ? `/admin/communities/${community._id}` : `/communities/${community._id}`}`, {
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
    });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={community.bgColor} />

      {/* BANNER */}
      <View style={[styles.banner, { backgroundColor: community.bgColor }]}>
        {groupImageUrl ? (
          <ImageBackground
            source={{ uri: groupImageUrl }}
            style={styles.bannerImage}
            imageStyle={styles.bannerImageStyle}
          />
        ) : (
          <Text style={styles.bannerEmoji}>{community.emoji}</Text>
        )}
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      </View>

<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={true}
>

        {/* CATEGORY BADGE */}
        <View style={[styles.categoryBadge, { backgroundColor: community.bgColor }]}>
          <Text style={styles.categoryBadgeText}>{community.category}</Text>
        </View>

        {/* NAME & DESCRIPTION */}
        <Text style={styles.groupName}>{community.name}</Text>
        <Text style={styles.groupDescription}>{community.description}</Text>

        {/* MEMBERS ROW */}
        <View style={styles.membersRow}>
          <View style={styles.avatarStack}>
            {community.memberAvatarColors.slice(0, 3).map((color, i) => (
              <View
                key={i}
                style={[
                  styles.memberAvatar,
                  { backgroundColor: color, marginLeft: i === 0 ? 0 : -10 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.memberCount}>{community.memberCount} members</Text>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Active today</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsRow}>
          {isAdmin ? (
            <>
              <Pressable
                accessibilityLabel="Enter Community"
                accessibilityRole="button"
                style={styles.enterButton}
                onPress={() => onEnter(community)}>
                <Text style={styles.enterButtonText}>Enter Community</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Edit Group Details"
                accessibilityRole="button"
                style={styles.editGroupButton}
                onPress={openEdit}>
                <Text style={styles.editGroupButtonText}>Edit Group Details</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.joinButton, joined && styles.joinButtonJoined]}
                onPress={handleJoinToggle}>
                <Text style={[styles.joinButtonText, joined && styles.joinButtonTextJoined]}>
                  {joined ? 'Joined ✓' : 'Join'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.enterButton, !joined && styles.enterButtonDisabled]}
                onPress={() => joined && onEnter(community)}
                disabled={!joined}>
                <Text style={[styles.enterButtonText, !joined && styles.enterButtonTextDisabled]}>
                  Enter Community
                </Text>
              </Pressable>
              {canManage && (
                <Pressable
                  accessibilityLabel="Edit Group Details"
                  accessibilityRole="button"
                  style={styles.editGroupButton}
                  onPress={openEdit}>
                  <Text style={styles.editGroupButtonText}>Edit Group Details</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* COMMUNITY GUIDELINES */}
        <Text style={styles.guidelinesHeading}>COMMUNITY GUIDELINES</Text>

        {community.guidelines
  ? community.guidelines
      .split('\n')
      .filter(g => g.trim())
      .map((g, i) => (
        <View
  key={i}
  style={[
    styles.guidelineItem,
    { backgroundColor: community.bgColor },
  ]}
>
          <View style={styles.guidelineNumber}>
            <Text style={styles.guidelineNumberText}>{i + 1}</Text>
          </View>

          <Text style={styles.guidelineText}>
            {g.trim()}
          </Text>
        </View>
      ))
  : (
      <Text style={styles.guidelineText}>
        No guidelines added for this community.
      </Text>
    )}

       
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={editVisible}
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.editOverlay}>
          <ScrollView contentContainerStyle={styles.editModal} keyboardShouldPersistTaps="handled">
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit Group Details</Text>
              <Pressable accessibilityLabel="Close edit group details" onPress={() => setEditVisible(false)}>
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>
            <Text style={styles.editLabel}>Group Name</Text>
            <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} />
            <Text style={styles.editLabel}>Category</Text>
            <TextInput style={styles.editInput} value={editCategory} onChangeText={setEditCategory} />
            <Text style={styles.editLabel}>Description</Text>
            <TextInput style={[styles.editInput, styles.editTextArea]} multiline value={editDescription} onChangeText={setEditDescription} />
            <Text style={styles.editLabel}>Guidelines</Text>
            <TextInput style={[styles.editInput, styles.editTextArea]} multiline value={editGuidelines} onChangeText={setEditGuidelines} />
            <Text style={styles.editLabel}>Group Background Image</Text>
            <Pressable style={styles.editImagePicker} onPress={pickEditImage}>
              {editImage || groupImageUrl ? (
                <Image source={{ uri: editImage || groupImageUrl }} style={styles.editImagePreview} />
              ) : (
                <Text style={styles.editImageText}>Choose an image</Text>
              )}
            </Pressable>
            <Pressable disabled={savingEdit} style={styles.saveEditButton} onPress={handleSaveEdit}>
              {savingEdit ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveEditText}>Save Changes</Text>}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bannerImageStyle: {
    opacity: 0.9,
  },
backButton: {
  position: 'absolute',
  top: 35,
  left: 12,
  width: 52,
  height: 52,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10, 
},
backIcon: {
  fontSize: 40,
  color: '#1F2937',
  fontWeight: '500',
  textAlign: 'center',
  textAlignVertical: 'center',
  lineHeight: 36,
  includeFontPadding: false,
},
bannerEmoji: {
    fontSize: 72,
  },
  scroll: {
    flex: 1,
  },
scrollContent: {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 100,
},

  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  groupName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 34,
  },
  groupDescription: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 22,
    marginTop: 8,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeText: {
    fontSize: 12,
    color: '#667085',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  joinButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#2673FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonJoined: {
    borderColor: '#2673FF',
    backgroundColor: '#EEF4FF',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  joinButtonTextJoined: {
    color: '#2673FF',
  },
  enterButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  enterButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  enterButtonTextDisabled: {
    color: '#9CA3AF',
  },
  editGroupButton: {
    alignItems: 'center',
    borderColor: '#2673FF',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  editGroupButtonText: {
    color: '#2673FF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  editOverlay: {
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: 36,
  },
  editHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '800',
  },
  closeText: {
    color: '#667085',
    fontSize: 24,
    fontWeight: '800',
  },
  editLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 14,
  },
  editInput: {
    borderColor: '#D0D5DD',
    borderRadius: 10,
    borderWidth: 1,
    color: '#1F2937',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  editTextArea: {
    minHeight: 84,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  editImagePicker: {
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderColor: '#D8DDF5',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 120,
    overflow: 'hidden',
  },
  editImagePreview: {
    height: 160,
    width: '100%',
  },
  editImageText: {
    color: '#2673FF',
    fontWeight: '700',
  },
  saveEditButton: {
    alignItems: 'center',
    backgroundColor: '#2673FF',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 24,
  },
  saveEditText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginTop: 24,
    marginBottom: 20,
  },
  guidelinesHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  guidelineNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },
});
