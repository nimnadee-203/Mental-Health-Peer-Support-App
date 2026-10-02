import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COMMUNITY_API_BASE } from '../config/api';
import { getAuthToken } from '../api/authStore';

type AdminCommunitiesScreenProps = {
  onBack: () => void;
};

type Community = {
  _id: string;
  name: string;
  category: string;
  emoji: string;
  bgColor: string;
  imageUrl?: string;
  description: string;
  guidelines: string;
  isPrivate: boolean;
  memberCount: number;
  moderatorIds?: string[];
};

type Moderator = { _id: string; fullName: string; email: string };

export default function AdminCommunitiesScreen({ onBack }: AdminCommunitiesScreenProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [emoji, setEmoji] = useState('🌐');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [assignmentCommunity, setAssignmentCommunity] = useState<Community | null>(null);
  const [selectedModeratorIds, setSelectedModeratorIds] = useState<string[]>([]);
  const [savingModerators, setSavingModerators] = useState(false);

  const pickCommunityImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const communitiesResponse = await fetch(`${COMMUNITY_API_BASE}/admin/communities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const communitiesData = await communitiesResponse.json().catch(() => ({}));
      if (!communitiesResponse.ok) {
        throw new Error(communitiesData.error || `Failed to fetch communities (${communitiesResponse.status})`);
      }
      setCommunities(communitiesData);

      // Moderator assignment is supplementary; it must not hide communities if its
      // endpoint is unavailable while the backend is being restarted or updated.
      try {
        const moderatorsResponse = await fetch(`${COMMUNITY_API_BASE}/admin/moderators`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (moderatorsResponse.ok) {
          const moderatorData = await moderatorsResponse.json();
          setModerators(moderatorData.moderators || []);
        } else {
          setModerators([]);
        }
      } catch {
        setModerators([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const openModeratorAssignment = (community: Community) => {
    setAssignmentCommunity(community);
    setSelectedModeratorIds(community.moderatorIds || []);
  };

  const saveModeratorAssignment = async () => {
    if (!assignmentCommunity) return;
    setSavingModerators(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${COMMUNITY_API_BASE}/admin/communities/${assignmentCommunity._id}/moderators`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ moderatorIds: selectedModeratorIds }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to assign moderators.');
      setCommunities(current => current.map(community => (
        community._id === data._id ? data : community
      )));
      setAssignmentCommunity(null);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingModerators(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleCreateCommunity = async () => {
    if (!name || !category || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setCreating(true);
    try {
      const token = await getAuthToken();
      let imageUrl = '';
      if (selectedImage) {
        const formData = new FormData();
        const filename = selectedImage.split('/').pop() || 'group.jpg';
        const extension = (filename.split('.').pop() || 'jpg').toLowerCase();
        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        const sourceBlob = await (await fetch(selectedImage)).blob();
        const mediaBlob = new Blob([sourceBlob], { type: mimeType });
        formData.append('media', mediaBlob, filename);
        const uploadResponse = await fetch(`${COMMUNITY_API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || 'Failed to upload group image.');
        imageUrl = `${COMMUNITY_API_BASE.replace('/api', '')}${uploadData.url}`;
      }
      const res = await fetch(`${COMMUNITY_API_BASE}/admin/communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          emoji,
          imageUrl,
          description,
          guidelines,
          isPrivate,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create community');
      }

      setModalVisible(false);
      
      // Reset form
      setName('');
      setCategory('');
      setEmoji('🌐');
      setDescription('');
      setGuidelines('');
      setIsPrivate(false);
      setSelectedImage(null);
      
      // Refresh list
      fetchCommunities();
      Alert.alert('Success', 'Community created successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, commName: string) => {
    if (typeof window !== 'undefined' && (window as any).confirm) {
      if (!(window as any).confirm(`Are you sure you want to delete "${commName}"? This action cannot be undone.`)) return;
    }
    try {
      const token = await getAuthToken();
      const res = await fetch(`${COMMUNITY_API_BASE}/admin/communities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete community');
      fetchCommunities();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0D0D1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Communities</Text>
        <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#5A5AD8" />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#EF4444' }}>{error}</Text>
        </View>
      ) : communities.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Feather name="grid" size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#6B6B80', marginBottom: 8 }}>No Communities Yet</Text>
          <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>Click the + button at the top right to create the first community.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {communities.map(comm => (
            <View key={comm._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: comm.bgColor || '#E6F4EA' }]}>
                  <Text style={styles.avatarText}>{comm.emoji}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{comm.name}</Text>
                  <Text style={styles.category}>{comm.category}</Text>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(comm._id, comm.name)}
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                </Pressable>
              </View>
              <Text style={styles.desc} numberOfLines={2}>{comm.description}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Feather name="users" size={12} color="#6B6B80" style={{ marginRight: 4 }} />
                  <Text style={styles.statText}>{comm.memberCount} Members</Text>
                </View>
                {comm.isPrivate && (
                  <View style={[styles.statPill, { backgroundColor: '#FEF3C7' }]}>
                    <Feather name="lock" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                    <Text style={[styles.statText, { color: '#B45309' }]}>Private</Text>
                  </View>
                )}
                <Pressable style={styles.assignButton} onPress={() => openModeratorAssignment(comm)}>
                  <Feather name="shield" size={12} color="#2673FF" style={{ marginRight: 4 }} />
                  <Text style={styles.assignText}>{comm.moderatorIds?.length || 0} Moderators</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!assignmentCommunity} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.assignmentContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Moderators</Text>
              <Pressable onPress={() => setAssignmentCommunity(null)} style={styles.closeBtn}>
                <Feather name="x" size={24} color="#6B6B80" />
              </Pressable>
            </View>
            <Text style={styles.assignmentSubtitle}>{assignmentCommunity?.name}</Text>
            {moderators.length === 0 ? (
              <Text style={styles.emptyModerators}>No moderator accounts available.</Text>
            ) : moderators.map(moderator => {
              const selected = selectedModeratorIds.includes(moderator._id);
              return (
                <Pressable
                  key={moderator._id}
                  style={styles.moderatorOption}
                  onPress={() => setSelectedModeratorIds(current => (
                    selected
                      ? current.filter(id => id !== moderator._id)
                      : [...current, moderator._id]
                  ))}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                    {selected && <Feather name="check" size={14} color="#FFF" />}
                  </View>
                  <View>
                    <Text style={styles.moderatorName}>{moderator.fullName}</Text>
                    <Text style={styles.moderatorEmail}>{moderator.email}</Text>
                  </View>
                </Pressable>
              );
            })}
            <Pressable style={styles.submitBtn} onPress={saveModeratorAssignment} disabled={savingModerators}>
              <Text style={styles.submitBtnText}>{savingModerators ? 'Saving...' : 'Save Moderators'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Community</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={24} color="#6B6B80" />
              </Pressable>
            </View>

            <Text style={styles.label}>Community Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Anxiety Support"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Stress & Anxiety"
              value={category}
              onChangeText={setCategory}
            />

            <Text style={styles.label}>Emoji Icon</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 🌿"
              value={emoji}
              onChangeText={setEmoji}
            />

            <Text style={styles.label}>Group Background Image</Text>
            <Pressable style={styles.imagePicker} onPress={pickCommunityImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              ) : (
                <>
                  <Feather name="image" size={22} color="#5A5AD8" />
                  <Text style={styles.imagePickerText}>Choose image</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What is this community about?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Guidelines</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Rules for the community..."
              value={guidelines}
              onChangeText={setGuidelines}
              multiline
              numberOfLines={3}
            />

            <Pressable
              style={styles.toggleRow}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View style={[styles.checkbox, isPrivate && styles.checkboxChecked]}>
                {isPrivate && <Feather name="check" size={14} color="#FFF" />}
              </View>
              <Text style={styles.toggleLabel}>Make this community private</Text>
            </Pressable>

            <Pressable
              style={[styles.submitBtn, creating && styles.submitBtnDisabled]}
              onPress={handleCreateCommunity}
              disabled={creating}
            >
              <Text style={styles.submitBtnText}>
                {creating ? 'Creating...' : 'Create Community'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F8',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0D0D1A', textAlign: 'center' },
  fab: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#5A5AD8',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#5A5AD8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEEF8',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#0D0D1A', marginBottom: 2 },
  category: { fontSize: 13, color: '#5A5AD8', fontWeight: '600' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  desc: { fontSize: 14, color: '#6B6B80', lineHeight: 20, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  assignButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  assignText: { fontSize: 12, fontWeight: '700', color: '#2673FF' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 13, 26, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 60 },
  assignmentContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  assignmentSubtitle: { color: '#6B6B80', fontSize: 15, marginBottom: 12 },
  moderatorOption: { alignItems: 'center', flexDirection: 'row', paddingVertical: 12, gap: 12 },
  moderatorName: { color: '#0D0D1A', fontSize: 15, fontWeight: '700' },
  moderatorEmail: { color: '#6B6B80', fontSize: 12, marginTop: 2 },
  emptyModerators: { color: '#6B6B80', paddingVertical: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0D0D1A' },
  closeBtn: { padding: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#6B6B80', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#F8F9FC', borderWidth: 1, borderColor: '#ECEEF8', borderRadius: 12, padding: 14, fontSize: 15, color: '#0D0D1A' },
  textArea: { height: 100, textAlignVertical: 'top' },
  imagePicker: { alignItems: 'center', backgroundColor: '#F8F9FC', borderColor: '#D8DDF5', borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 120, overflow: 'hidden' },
  imagePreview: { height: 160, width: '100%' },
  imagePickerText: { color: '#5A5AD8', fontWeight: '700', marginTop: 8 },
  
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#5A5AD8', borderColor: '#5A5AD8' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#0D0D1A' },
  
  submitBtn: { backgroundColor: '#5A5AD8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
