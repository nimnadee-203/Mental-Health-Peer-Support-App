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
import { AUTH_BASE } from '../config/api';
import { getAuthToken } from '../api/authStore';
import { UserProfile } from '../types/user';

type AdminUsersScreenProps = {
  onBack: () => void;
};

export default function AdminUsersScreen({ onBack }: AdminUsersScreenProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'professional' | 'moderator' | 'admin'>('user');
  const [medicalExperience, setMedicalExperience] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${AUTH_BASE}/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async () => {
    if (!fullName || !email || !password || !role) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setCreating(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${AUTH_BASE}/auth/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          medicalExperience: role === 'professional' ? medicalExperience : undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to create user');
      }

      setModalVisible(false);
      
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setMedicalExperience('');
      
      // Refresh list
      fetchUsers();
      Alert.alert('Success', 'Account created successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const roleColors: Record<string, { bg: string, text: string }> = {
    admin: { bg: '#FEE2E2', text: '#EF4444' },
    moderator: { bg: '#EDE8FA', text: '#7C67D6' },
    professional: { bg: '#E8F0FF', text: '#2673FF' },
    user: { bg: '#F3F4F6', text: '#6B7280' },
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0D0D1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Users</Text>
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
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {users.map(u => {
            const colors = roleColors[u.role] || roleColors['user'];
            return (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{u.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.fullName}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  {u.role === 'professional' && u.medicalExperience && (
                    <Text style={styles.medicalExp} numberOfLines={1}>{u.medicalExperience}</Text>
                  )}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.roleText, { color: colors.text }]}>{u.role.toUpperCase()}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Create User Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <Feather name="x" size={24} color="#0D0D1A" />
              </Pressable>
              <Text style={styles.modalTitle}>Create Account</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Enter name" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="admin@example.com" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Temporary Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="******" secureTextEntry />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Role</Text>
              <View style={styles.roleGrid}>
                {['user', 'professional', 'moderator', 'admin'].map(r => {
                  const isSelected = role === r;
                  return (
                    <Pressable
                      key={r}
                      style={[styles.roleCard, isSelected && styles.roleCardActive]}
                      onPress={() => setRole(r as any)}
                    >
                      <Text style={[styles.roleCardText, isSelected && styles.roleCardTextActive]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {role === 'professional' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Medical Experience / Credentials</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={medicalExperience} 
                  onChangeText={setMedicalExperience} 
                  placeholder="e.g. Licensed Clinical Psychologist (10 years experience)" 
                  multiline
                />
              </View>
            )}

            <Pressable style={styles.submitBtn} onPress={handleCreateUser} disabled={creating}>
              {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  fab: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#5A5AD8', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 100 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FC', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ECEEF8' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C0C0D8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  userInfo: { flex: 1, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: '800', color: '#0D0D1A' },
  userEmail: { fontSize: 13, color: '#8A8A9E', marginTop: 2 },
  medicalExp: { fontSize: 12, color: '#5A5AD8', marginTop: 4, fontWeight: '600' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: '#FFFFFF' },
  modalContent: { padding: 20, paddingBottom: 100 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  modalClose: { paddingRight: 16 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0D0D1A' },
  
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '800', color: '#0D0D1A', marginBottom: 8 },
  input: { backgroundColor: '#F5F5FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0D0D1A', borderWidth: 1, borderColor: '#E5E5F0' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: { flex: 1, minWidth: '45%', backgroundColor: '#F5F5FA', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5F0' },
  roleCardActive: { backgroundColor: '#EDE8FA', borderColor: '#7C67D6' },
  roleCardText: { fontSize: 14, fontWeight: '700', color: '#6B6B80' },
  roleCardTextActive: { color: '#7C67D6' },

  submitBtn: { backgroundColor: '#5A5AD8', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
