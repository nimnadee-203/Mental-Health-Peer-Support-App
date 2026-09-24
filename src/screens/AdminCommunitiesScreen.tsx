import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_BASE } from '../config/api';
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
  description: string;
  guidelines: string;
  isPrivate: boolean;
  memberCount: number;
};

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

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/admin/communities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch communities');
      const data = await res.json();
      setCommunities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
      const res = await fetch(`${API_BASE}/admin/communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          emoji,
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
      const res = await fetch(`${API_BASE}/admin/communities/${id}`, {
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
              </View>
            </View>
          ))}
        </ScrollView>
      )}

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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(13, 13, 26, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0D0D1A' },
  closeBtn: { padding: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#6B6B80', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#F8F9FC', borderWidth: 1, borderColor: '#ECEEF8', borderRadius: 12, padding: 14, fontSize: 15, color: '#0D0D1A' },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#5A5AD8', borderColor: '#5A5AD8' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#0D0D1A' },
  
  submitBtn: { backgroundColor: '#5A5AD8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
