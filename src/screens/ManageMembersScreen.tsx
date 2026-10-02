import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  approveMemberRequest,
  getManagedMembers,
  ManagedMember,
  makeModerator,
  rejectMemberRequest,
  removeMember,
  MemberStats,
} from '../api/memberManagementApi';

export type ManageMembersRole = 'admin' | 'moderator';

type ManageMembersScreenProps = {
  role: ManageMembersRole;
  onBack: () => void;
};

type MemberTab = 'all' | 'moderators';

const EMPTY_STATS: MemberStats = {
  totalMembers: 0,
  moderators: 0,
  pendingRequests: 0,
};

const confirmAction = (title: string, message: string): Promise<boolean> => {
  const browserConfirm = (globalThis as { confirm?: (value: string) => boolean }).confirm;
  if (typeof browserConfirm === 'function') {
    return Promise.resolve(browserConfirm(`${title}\n\n${message}`));
  }

  return new Promise(resolve => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirm', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
};

export default function ManageMembersScreen({ role, onBack }: ManageMembersScreenProps) {
  const [members, setMembers] = useState<ManagedMember[]>([]);
  const [stats, setStats] = useState<MemberStats>(EMPTY_STATS);
  const [activeTab, setActiveTab] = useState<MemberTab>('all');
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<ManagedMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getManagedMembers();
      setMembers(result.members);
      setStats(result.stats);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return members.filter(member => {
      const matchesTab = activeTab === 'all' || member.role === 'moderator';
      const matchesSearch = !normalizedSearch || [
        member.fullName,
        member.email,
        member.communityName,
        member.role,
        member.status,
      ].some(value => value.toLowerCase().includes(normalizedSearch));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, members, search]);

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setActionId(id);
    setError('');
    try {
      await action();
      await loadMembers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Action failed.');
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (member: ManagedMember) => {
    const confirmed = await confirmAction(
      'Remove member',
      `Remove ${member.fullName} from ${member.communityName}?`,
    );
    if (!confirmed) return;
    await runAction(member.id, () => removeMember(member.communityId, member.userId));
  };

  const handlePromote = async (member: ManagedMember) => {
    const confirmed = await confirmAction(
      'Make moderator',
      `Give ${member.fullName} moderator permissions?`,
    );
    if (!confirmed) return;
    await runAction(member.id, () => makeModerator(member.userId));
  };

  const handleRequest = async (member: ManagedMember, approve: boolean) => {
    const confirmed = approve
      ? true
      : await confirmAction('Reject request', `Reject ${member.fullName}'s request to join ${member.communityName}?`);
    if (!confirmed) return;
    await runAction(member.id, () => (
      approve
        ? approveMemberRequest(member.communityId, member.userId)
        : rejectMemberRequest(member.communityId, member.userId)
    ));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Members</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total members</Text>
            <Text style={styles.statValue}>{stats.totalMembers}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Moderators</Text>
            <Text style={styles.statValue}>{stats.moderators}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending requests</Text>
            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          </View>
        </View>

        <TextInput
          accessibilityLabel="Search members"
          onChangeText={setSearch}
          placeholder="Search members..."
          placeholderTextColor="#788493"
          style={styles.searchInput}
          value={search}
        />

        <View style={styles.tabs}>
          {([
            ['all', 'All Members'],
            ['moderators', 'Moderators'],
          ] as const).map(([tab, label]) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator accessibilityLabel="Loading members" color="#2673FF" size="large" /> : null}
        {!loading && filteredMembers.length === 0 ? <Text style={styles.empty}>No members found.</Text> : null}

        {!loading && filteredMembers.map(member => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.fullName}</Text>
              <Text style={styles.memberCommunity}>{member.communityName}</Text>
              <Text style={styles.memberJoinDate}>{new Date(member.joinDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.memberMeta}>
              <Text style={[styles.roleBadge, member.role === 'moderator' && styles.moderatorBadge]}>{member.role}</Text>
              <Text style={[styles.status, member.status === 'pending' && styles.pendingStatus]}>{member.status}</Text>
            </View>
            <View style={styles.actions}>
              {member.status === 'pending' ? (
                <>
                  <Pressable disabled={actionId === member.id} onPress={() => handleRequest(member, true)} style={styles.actionButton}>
                    <Text style={styles.approveText}>Approve Request</Text>
                  </Pressable>
                  <Pressable disabled={actionId === member.id} onPress={() => handleRequest(member, false)} style={styles.actionButton}>
                    <Text style={styles.rejectText}>Reject Request</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable accessibilityLabel={`View profile for ${member.fullName}`} onPress={() => setSelectedMember(member)} style={styles.actionButton}>
                    <Feather name="user" size={15} color="#2673FF" />
                    <Text style={styles.linkText}>View Profile</Text>
                  </Pressable>
                  {role === 'admin' && member.role === 'user' ? (
                    <Pressable disabled={actionId === member.id} onPress={() => handlePromote(member)} style={styles.actionButton}>
                      <Feather name="shield" size={15} color="#7C67D6" />
                      <Text style={styles.promoteText}>Make Moderator</Text>
                    </Pressable>
                  ) : null}
                  <Pressable disabled={actionId === member.id} onPress={() => handleRemove(member)} style={styles.actionButton}>
                    <Feather name="user-minus" size={15} color="#B42318" />
                    <Text style={styles.removeText}>Remove Member</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setSelectedMember(null)} visible={!!selectedMember}>
        <SafeAreaView style={styles.profileModal}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Member Profile</Text>
            <Pressable accessibilityLabel="Close profile" onPress={() => setSelectedMember(null)}>
              <Feather name="x" size={24} color="#111827" />
            </Pressable>
          </View>
          {selectedMember ? (
            <View style={styles.profileContent}>
              <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{selectedMember.fullName.charAt(0).toUpperCase()}</Text></View>
              <Text style={styles.profileName}>{selectedMember.fullName}</Text>
              <Text style={styles.profileEmail}>{selectedMember.email}</Text>
              <Text style={styles.profileDetail}>Role: {selectedMember.role}</Text>
              <Text style={styles.profileDetail}>Community: {selectedMember.communityName}</Text>
              <Text style={styles.profileDetail}>Joined: {new Date(selectedMember.joinDate).toLocaleDateString()}</Text>
              <Text style={styles.profileDetail}>Status: {selectedMember.status}</Text>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backButton: { minHeight: 44, justifyContent: 'center', padding: 8 },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, flexGrow: 1, minWidth: 120, padding: 14 },
  statLabel: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  statValue: { color: '#111827', fontSize: 25, fontWeight: '900', marginTop: 6 },
  searchInput: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, color: '#111827', minHeight: 48, paddingHorizontal: 14 },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  tab: { backgroundColor: '#FFFFFF', borderRadius: 10, minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  activeTab: { backgroundColor: '#2673FF' },
  tabText: { color: '#4B5563', fontWeight: '800' },
  activeTabText: { color: '#FFFFFF' },
  error: { backgroundColor: '#FFF0EF', borderRadius: 10, color: '#A94442', marginBottom: 12, padding: 12 },
  empty: { color: '#6B7280', paddingVertical: 24, textAlign: 'center' },
  memberRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10, padding: 14 },
  avatar: { alignItems: 'center', backgroundColor: '#E8F0FF', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: '#2673FF', fontSize: 18, fontWeight: '900' },
  memberInfo: { flex: 1, minWidth: 150 },
  memberName: { color: '#111827', fontSize: 15, fontWeight: '900' },
  memberCommunity: { color: '#4B5563', fontSize: 12, marginTop: 3 },
  memberJoinDate: { color: '#6B7280', fontSize: 12, marginTop: 3 },
  memberMeta: { alignItems: 'flex-end', gap: 5 },
  roleBadge: { backgroundColor: '#F3F4F6', borderRadius: 8, color: '#4B5563', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, textTransform: 'capitalize' },
  moderatorBadge: { backgroundColor: '#EDE8FA', color: '#7C67D6' },
  status: { color: '#276A5A', fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  pendingStatus: { color: '#B45309' },
  actions: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  actionButton: { alignItems: 'center', flexDirection: 'row', gap: 5, minHeight: 40, paddingHorizontal: 4 },
  linkText: { color: '#2673FF', fontSize: 12, fontWeight: '800' },
  promoteText: { color: '#7C67D6', fontSize: 12, fontWeight: '800' },
  removeText: { color: '#B42318', fontSize: 12, fontWeight: '800' },
  approveText: { color: '#276A5A', fontSize: 12, fontWeight: '800' },
  rejectText: { color: '#B42318', fontSize: 12, fontWeight: '800' },
  profileModal: { backgroundColor: '#F5F7FA', flex: 1 },
  profileHeader: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  profileTitle: { color: '#111827', fontSize: 20, fontWeight: '900' },
  profileContent: { alignItems: 'center', padding: 24 },
  largeAvatar: { alignItems: 'center', backgroundColor: '#E8F0FF', borderRadius: 44, height: 88, justifyContent: 'center', width: 88 },
  largeAvatarText: { color: '#2673FF', fontSize: 34, fontWeight: '900' },
  profileName: { color: '#111827', fontSize: 22, fontWeight: '900', marginTop: 16 },
  profileEmail: { color: '#6B7280', marginTop: 4 },
  profileDetail: { alignSelf: 'stretch', backgroundColor: '#FFFFFF', borderRadius: 10, color: '#374151', marginTop: 10, padding: 14 },
});
