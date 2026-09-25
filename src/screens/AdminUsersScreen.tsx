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

type CreationMode = 'member' | 'staff' | null;
type EditMode = UserProfile | null;

export default function AdminUsersScreen({ onBack }: AdminUsersScreenProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'members' | 'staff'>('members');

  // Modals
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [editUser, setEditUser] = useState<EditMode>(null);
  
  const [submitting, setSubmitting] = useState(false);

  // Form State
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

  const openCreateModal = (mode: 'member' | 'staff') => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole(mode === 'member' ? 'user' : 'professional');
    setMedicalExperience('');
    setCreationMode(mode);
  };

  const openEditModal = (user: UserProfile) => {
    setRole(user.role || 'user');
    setMedicalExperience(user.medicalExperience || '');
    setEditUser(user);
  };

  const handleCreateUser = async () => {
    if (!fullName || !email || !password || !role) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
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

      setCreationMode(null);
      fetchUsers();
      Alert.alert('Success', 'Account created successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${AUTH_BASE}/auth/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          medicalExperience: role === 'professional' ? medicalExperience : undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update user');
      }

      setEditUser(null);
      fetchUsers();
      Alert.alert('Success', 'User updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (typeof window !== 'undefined' && (window as any).confirm) {
      if (!(window as any).confirm(`Are you sure you want to delete ${name}?`)) return;
    } else {
      // For native, we'd use Alert.alert with callbacks. For simplicity, we just proceed if window.confirm isn't there (or we can add Alert later).
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${AUTH_BASE}/auth/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setLoading(false);
    }
  };

  const roleColors: Record<string, { bg: string, text: string, border: string }> = {
    admin: { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' },
    moderator: { bg: '#EDE8FA', text: '#7C67D6', border: '#C4B5FD' },
    professional: { bg: '#FEF9C3', text: '#CA8A04', border: '#FDE047' }, // Premium Gold
    user: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'members') return u.role === 'user';
    return u.role !== 'user';
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0D0D1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'members' && styles.tabActive]} 
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>Members</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'staff' && styles.tabActive]} 
          onPress={() => setActiveTab('staff')}
        >
          <Text style={[styles.tabText, activeTab === 'staff' && styles.tabTextActive]}>Staff & Professionals</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'members' ? 'Platform Members' : 'Team & Providers'}
        </Text>
        {activeTab === 'members' ? (
          <Pressable style={styles.createBtn} onPress={() => openCreateModal('member')}>
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Add Member</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.createBtn, { backgroundColor: '#CA8A04' }]} onPress={() => openCreateModal('staff')}>
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Add Staff</Text>
          </Pressable>
        )}
      </View>

      {loading && !users.length ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#5A5AD8" />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#EF4444' }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filteredUsers.length === 0 && (
            <Text style={styles.emptyText}>No users found in this category.</Text>
          )}
          {filteredUsers.map(u => {
            const userRole = u.role || 'user';
            const colors = roleColors[userRole] || roleColors['user'];
            const isPro = u.role === 'professional';

            return (
              <View key={u.id} style={[styles.userCard, isPro && styles.userCardGold]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{u.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.userName}>{u.fullName}</Text>
                    {isPro && (
                      <Feather name="award" size={14} color="#CA8A04" style={{ marginLeft: 6 }} />
                    )}
                  </View>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  {isPro && u.medicalExperience && (
                    <Text style={styles.medicalExp} numberOfLines={1}>{u.medicalExperience}</Text>
                  )}
                  <View style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                    <View style={[styles.roleBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Text style={[styles.roleText, { color: colors.text }]}>{userRole.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.actions}>
                  <Pressable style={styles.actionBtn} onPress={() => openEditModal(u)}>
                    <Feather name="edit-2" size={18} color="#5A5AD8" />
                  </Pressable>
                  <Pressable style={styles.actionBtn} onPress={() => handleDeleteUser(u.id, u.fullName)}>
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Create User Modal */}
      <Modal visible={creationMode !== null} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setCreationMode(null)} style={styles.modalClose}>
                <Feather name="x" size={24} color="#0D0D1A" />
              </Pressable>
              <Text style={styles.modalTitle}>
                {creationMode === 'staff' ? 'Add Staff / Professional' : 'Add New Member'}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Enter name" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Temporary Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="******" secureTextEntry />
            </View>

            {creationMode === 'staff' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Role</Text>
                <View style={styles.roleGrid}>
                  {['professional', 'moderator', 'admin'].map(r => {
                    const isSelected = role === r;
                    const c = roleColors[r];
                    return (
                      <Pressable
                        key={r}
                        style={[styles.roleCard, isSelected && { borderColor: c.text, backgroundColor: c.bg }]}
                        onPress={() => setRole(r as any)}
                      >
                        <Text style={[styles.roleCardText, isSelected && { color: c.text }]}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

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

            <Pressable style={styles.submitBtn} onPress={handleCreateUser} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Role Modal */}
      <Modal visible={editUser !== null} animationType="fade" transparent>
        <View style={styles.modalOverlayDark}>
          <View style={styles.editModalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {editUser?.fullName}</Text>
              <Pressable onPress={() => setEditUser(null)} style={styles.modalClose}>
                <Feather name="x" size={24} color="#0D0D1A" />
              </Pressable>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Update Role</Text>
              <View style={styles.roleGrid}>
                {['user', 'professional', 'moderator', 'admin'].map(r => {
                  const isSelected = role === r;
                  const c = roleColors[r];
                  return (
                    <Pressable
                      key={r}
                      style={[styles.roleCard, isSelected && { borderColor: c.text, backgroundColor: c.bg }]}
                      onPress={() => setRole(r as any)}
                    >
                      <Text style={[styles.roleCardText, isSelected && { color: c.text }]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {role === 'professional' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Medical Experience</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={medicalExperience} 
                  onChangeText={setMedicalExperience} 
                  placeholder="Update credentials..." 
                  multiline
                />
              </View>
            )}

            <Pressable style={styles.submitBtn} onPress={handleEditUser} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#5A5AD8' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#8A8A9E' },
  tabTextActive: { color: '#5A5AD8', fontWeight: '800' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5A5AD8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  createBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  list: { padding: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#8A8A9E', marginTop: 40, fontSize: 15 },
  
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ECEEF8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  userCardGold: { borderColor: '#FDE047', backgroundColor: '#FFFEF5' }, // Premium tint for professionals
  
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E2E2EA', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#6B6B80' },
  
  userInfo: { flex: 1, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: '800', color: '#0D0D1A' },
  userEmail: { fontSize: 13, color: '#8A8A9E', marginTop: 2 },
  medicalExp: { fontSize: 12, color: '#CA8A04', marginTop: 4, fontWeight: '700' },
  
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5FA', justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: '#FFFFFF' },
  modalOverlayDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  editModalBox: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  
  modalContent: { padding: 20, paddingBottom: 100 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalClose: { padding: 4 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0D0D1A' },
  
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '800', color: '#0D0D1A', marginBottom: 8 },
  input: { backgroundColor: '#F5F5FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0D0D1A', borderWidth: 1, borderColor: '#E5E5F0' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard: { flex: 1, minWidth: '45%', backgroundColor: '#F5F5FA', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5F0' },
  roleCardText: { fontSize: 14, fontWeight: '700', color: '#6B6B80' },

  submitBtn: { backgroundColor: '#5A5AD8', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
