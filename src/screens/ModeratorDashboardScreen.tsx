import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getModerationReports,
  getModerationStats,
  getModerationUsers,
  moderatePost,
  ModerationReport,
  ModerationStats,
  ModerationUser,
  updateModerationReport,
  updateUserRole,
  warnUser,
} from '../api/moderationApi';

type ModeratorDashboardScreenProps = {
  role: 'moderator' | 'admin';
  onBack: () => void;
};

const FILTERS = ['all', 'pending', 'under_review', 'resolved', 'dismissed'] as const;

function ModeratorDashboardScreen({ role, onBack }: ModeratorDashboardScreenProps) {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [statsResult, reportsResult] = await Promise.all([
        getModerationStats(),
        getModerationReports(filter),
      ]);
      setStats(statsResult.stats);
      setReports(reportsResult.reports);
      if (role === 'admin') {
        const usersResult = await getModerationUsers();
        setUsers(usersResult.users);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load moderation data.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, role]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmAction = (message: string, action: () => Promise<void>) => {
    Alert.alert('Confirm moderation action', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: action },
    ]);
  };

  const dismissReport = (report: ModerationReport) =>
    confirmAction('Dismiss this report?', async () => {
      try {
        await updateModerationReport(report._id, 'dismissed');
        await load();
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Action failed.');
      }
    });

  const changePost = (report: ModerationReport, action: 'hide' | 'restore') =>
    confirmAction(`${action === 'hide' ? 'Hide' : 'Restore'} this post?`, async () => {
      try {
        await moderatePost(report.targetId, action, report._id);
        await load();
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Action failed.');
      }
    });

  const warnAuthor = (report: ModerationReport) => {
    if (!report.targetAuthorId) {
      setError('This legacy post has no linked author account to warn.');
      return;
    }
    confirmAction('Warn the author of this post?', async () => {
      try {
        await warnUser(report.targetAuthorId!, `Reported content: ${report.category}`);
        await load();
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Warning failed.');
      }
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>Community care</Text>
          <Text style={styles.title}>{role === 'admin' ? 'Admin moderation' : 'Moderation'}</Text>
        </View>
        <View style={styles.roleBadge}><Text style={styles.roleText}>{role}</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {isLoading && !stats ? <ActivityIndicator color="#2673FF" size="large" /> : null}

        <View style={styles.statsGrid}>
          {[
            ['Pending', stats?.pending],
            ['Under review', stats?.under_review],
            ['Resolved', stats?.resolved],
            ['Dismissed', stats?.dismissed],
            ['Hidden posts', stats?.hiddenPosts],
          ].map(([label, value]) => (
            <View key={String(label)} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value ?? 0}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Reports</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map(item => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item.replace('_', ' ')}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {reports.map(report => (
          <View key={report._id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportCategory}>{report.category}</Text>
              <Text style={styles.status}>{report.status.replace('_', ' ')}</Text>
            </View>
            <Text style={styles.reportPreview}>{report.targetContentPreview || 'No post preview available.'}</Text>
            <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString()}</Text>
            <View style={styles.actions}>
              {report.status !== 'dismissed' ? <Pressable style={styles.action} onPress={() => dismissReport(report)}><Text style={styles.actionText}>Dismiss</Text></Pressable> : null}
              <Pressable style={styles.action} onPress={() => changePost(report, 'hide')}><Text style={styles.actionText}>Hide post</Text></Pressable>
              <Pressable style={styles.action} onPress={() => changePost(report, 'restore')}><Text style={styles.actionText}>Restore</Text></Pressable>
              <Pressable style={styles.action} onPress={() => warnAuthor(report)}><Text style={styles.actionText}>Warn user</Text></Pressable>
            </View>
          </View>
        ))}

        {reports.length === 0 && !isLoading ? <Text style={styles.empty}>No reports in this view.</Text> : null}

        {role === 'admin' ? (
          <>
            <Text style={styles.sectionTitle}>User management</Text>
            {users.map(user => (
              <View key={user._id} style={styles.userRow}>
                <View style={styles.userInfo}><Text style={styles.userName}>{user.fullName}</Text><Text style={styles.userEmail}>{user.email}</Text></View>
                <View style={styles.userActions}>
                  {(['user', 'moderator', 'admin'] as const).map(nextRole => (
                    <Pressable key={nextRole} onPress={async () => { try { await updateUserRole(user._id, nextRole); await load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Role update failed.'); } }} style={[styles.roleOption, user.role === nextRole && styles.roleOptionActive]}>
                      <Text style={styles.roleOptionText}>{nextRole}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF' },
  backButton: { padding: 8 },
  backText: { color: '#2673FF', fontWeight: '800' },
  eyebrow: { color: '#6B7280', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: '#111827', fontSize: 25, fontWeight: '900', marginTop: 4 },
  roleBadge: { backgroundColor: '#E6F4EA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  roleText: { color: '#276A5A', fontWeight: '800', textTransform: 'capitalize' },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: '#A94442', backgroundColor: '#FFF0EF', padding: 12, borderRadius: 10, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, minWidth: '30%', flexGrow: 1 },
  statLabel: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  statValue: { color: '#111827', fontSize: 25, fontWeight: '900', marginTop: 8 },
  sectionTitle: { color: '#111827', fontSize: 20, fontWeight: '900', marginBottom: 10, marginTop: 8 },
  filters: { marginBottom: 12 },
  filter: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginRight: 8 },
  filterActive: { backgroundColor: '#2673FF' },
  filterText: { color: '#4B5563', fontWeight: '700', textTransform: 'capitalize' },
  filterTextActive: { color: '#FFFFFF' },
  reportCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  reportCategory: { color: '#111827', fontWeight: '900', flex: 1 },
  status: { color: '#276A5A', backgroundColor: '#E9F4EF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  reportPreview: { color: '#374151', lineHeight: 21, marginTop: 12 },
  reportDate: { color: '#9CA3AF', fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  action: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  actionText: { color: '#31564B', fontWeight: '800' },
  empty: { color: '#6B7280', textAlign: 'center', paddingVertical: 24 },
  userRow: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10 },
  userInfo: { marginBottom: 10 },
  userName: { color: '#111827', fontWeight: '900' },
  userEmail: { color: '#6B7280', marginTop: 3 },
  userActions: { flexDirection: 'row', gap: 6 },
  roleOption: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6 },
  roleOptionActive: { backgroundColor: '#E6F4EA', borderColor: '#276A5A' },
  roleOptionText: { color: '#31564B', fontSize: 12, fontWeight: '700' },
});

export default ModeratorDashboardScreen;