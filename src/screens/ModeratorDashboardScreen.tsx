import React, { useCallback, useEffect, useState } from 'react';
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
import {
  getModerationHistory,
  getModerationReports,
  getModerationStats,
  moderatePost,
  ModerationHistoryEntry,
  ModerationReport,
  ModerationStats,
  updateModerationReport,
  warnUser,
} from '../api/moderationApi';

type ModeratorDashboardScreenProps = { role: 'moderator'; onBack: () => void };
const FILTERS = ['all', 'pending', 'under_review', 'resolved', 'dismissed'] as const;
type Filter = (typeof FILTERS)[number];
type Action = 'start_review' | 'hide' | 'restore' | 'warn' | 'resolve' | 'dismiss';
const actionLabels: Record<Action, string> = {
  start_review: 'Start Review', hide: 'Hide Post', restore: 'Restore Post',
  warn: 'Warn User', resolve: 'Resolve Report', dismiss: 'Dismiss Report',
};

function ModeratorDashboardScreen({ role, onBack }: ModeratorDashboardScreenProps) {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [history, setHistory] = useState<ModerationHistoryEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState<ModerationHistoryEntry[]>([]);
  const [pendingAction, setPendingAction] = useState<{ report: ModerationReport; action: Action } | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [statsResult, reportsResult, historyResult] = await Promise.all([
        getModerationStats(),
        getModerationReports(filter, search),
        getModerationHistory(),
      ]);
      setStats(statsResult.stats);
      setReports(reportsResult.reports);
      setRecentActivity(historyResult.history.slice(0, 5));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load moderation data.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const openDetails = async (report: ModerationReport) => {
    setSelectedReport(report);
    try {
      const result = await getModerationHistory(report._id);
      setHistory(result.history);
    } catch (requestError) {
      setHistory([]);
      setError(requestError instanceof Error ? requestError.message : 'Could not load moderation history.');
    }
  };

  const requestAction = (report: ModerationReport, action: Action) => {
    if (action === 'warn' && !report.targetAuthorId) {
      Alert.alert('Warning unavailable', 'This legacy post has no linked author account to warn.');
      return;
    }
    setNote('');
    setPendingAction({ report, action });
  };

  const performAction = async () => {
    if (!pendingAction) return;
    const { report, action } = pendingAction;
    setIsSaving(true);
    try {
      if (action === 'start_review') await updateModerationReport(report._id, 'under_review', note);
      if (action === 'resolve') await updateModerationReport(report._id, 'resolved', note);
      if (action === 'dismiss') await updateModerationReport(report._id, 'dismissed', note);
      if (action === 'hide' || action === 'restore') await moderatePost(report.targetId, action, report._id, note);
      if (action === 'warn') await warnUser(report.targetAuthorId!, note || `Reported content: ${report.category}`);
      setPendingAction(null);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Moderation action failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>Back</Text></Pressable>
        <View><Text style={styles.eyebrow}>Community care</Text><Text style={styles.title}>Moderation</Text></View>
        <View accessible accessibilityLabel="Moderator account" style={styles.roleBadge}><Text style={styles.roleText}>{role}</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {isLoading && !stats ? <ActivityIndicator accessibilityLabel="Loading moderation data" color="#2673FF" size="large" /> : null}
        <View style={styles.statsGrid}>
          {[
            ['Pending Reports', stats?.pending], ['Under Review', stats?.under_review],
            ['Resolved Reports', stats?.resolved], ['Dismissed Reports', stats?.dismissed], ['Hidden Posts', stats?.hiddenPosts],
          ].map(([label, value]) => <View key={String(label)} style={styles.statCard}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value ?? 0}</Text></View>)}
        </View>
        {recentActivity.length ? <>
          <Text style={styles.sectionTitle}>Recent moderation activity</Text>
          {recentActivity.map(item => <View key={item._id} style={styles.activityRow}><Text style={styles.historyAction}>{item.action.replace(/_/g, ' ')}</Text><Text style={styles.historyMeta}>{new Date(item.createdAt).toLocaleString()} | {item.moderator?.fullName || 'Moderator'}</Text></View>)}
        </> : null}
        <Text style={styles.sectionTitle}>Reported community posts</Text>
        <TextInput accessibilityLabel="Search reports" onChangeText={setSearch} placeholder="Search content, author, category, or report ID" placeholderTextColor="#788493" style={styles.searchInput} value={search} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {FILTERS.map(item => <Pressable accessibilityLabel={`Filter ${item.replace('_', ' ')}`} accessibilityRole="button" key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item.replace('_', ' ')}</Text></Pressable>)}
        </ScrollView>
        {reports.map(report => <View key={report._id} style={styles.reportCard}>
          <View style={styles.reportHeader}><Text style={styles.reportCategory}>{report.category}</Text><Text style={styles.status}>{report.status.replace('_', ' ')}</Text></View>
          <Text style={styles.reportPreview}>{report.targetContentPreview || 'No post preview available.'}</Text>
          {report.targetAuthor ? <Text style={styles.reportMeta}>Author: {report.targetAuthor}</Text> : null}
          <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleString()} | ID: {report._id}</Text>
          <Pressable accessibilityLabel={`View details for report ${report._id}`} accessibilityRole="button" onPress={() => openDetails(report)} style={styles.detailsButton}><Text style={styles.detailsText}>View Details</Text></Pressable>
          <View style={styles.actions}>
            {report.status === 'pending' ? <Pressable accessibilityRole="button" onPress={() => requestAction(report, 'start_review')} style={styles.action}><Text style={styles.actionText}>Start Review</Text></Pressable> : null}
            {report.status === 'under_review' ? <>
              {report.targetType === 'Post' && report.currentPostStatus !== 'hidden' ? <Pressable accessibilityRole="button" onPress={() => requestAction(report, 'hide')} style={styles.action}><Text style={styles.actionText}>Hide Post</Text></Pressable> : null}
              {report.targetType === 'Post' && report.currentPostStatus === 'hidden' ? <Pressable accessibilityRole="button" onPress={() => requestAction(report, 'restore')} style={styles.action}><Text style={styles.actionText}>Restore Post</Text></Pressable> : null}
              <Pressable accessibilityRole="button" onPress={() => requestAction(report, 'warn')} style={styles.action}><Text style={styles.actionText}>Warn User</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => requestAction(report, 'resolve')} style={styles.action}><Text style={styles.actionText}>Resolve Report</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => requestAction(report, 'dismiss')} style={styles.action}><Text style={styles.actionText}>Dismiss Report</Text></Pressable>
            </> : null}
          </View>
        </View>)}
        {reports.length === 0 && !isLoading ? <Text style={styles.empty}>No reports in this view.</Text> : null}
      </ScrollView>
      <Modal animationType="slide" onRequestClose={() => setSelectedReport(null)} visible={!!selectedReport}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Report details</Text>
          {selectedReport ? <>
            <Text style={styles.detailLabel}>Category</Text><Text style={styles.detailValue}>{selectedReport.category}</Text>
            <Text style={styles.detailLabel}>Reason</Text><Text style={styles.detailValue}>{selectedReport.reasonNote || 'No reason provided.'}</Text>
            <Text style={styles.detailLabel}>Status</Text><Text style={styles.detailValue}>{selectedReport.status.replace('_', ' ')}</Text>
            <Text style={styles.detailLabel}>Reported post</Text><Text style={styles.detailValue}>{selectedReport.targetContentPreview || 'No content available.'}</Text>
            <Text style={styles.detailLabel}>Author</Text><Text style={styles.detailValue}>{selectedReport.targetAuthor || 'Unavailable'}</Text>
            <Text style={styles.detailLabel}>Current post status</Text><Text style={styles.detailValue}>{selectedReport.currentPostStatus || 'Unavailable'}</Text>
            <Text style={styles.detailLabel}>Moderation note</Text><Text style={styles.detailValue}>{selectedReport.moderationNote || 'No moderation note.'}</Text>
            <Text style={styles.detailLabel}>Moderation history</Text>
            {history.length ? history.map(item => <View key={item._id} style={styles.historyRow}><Text style={styles.historyAction}>{item.action.replace(/_/g, ' ')}</Text><Text style={styles.historyMeta}>{new Date(item.createdAt).toLocaleString()} | {item.moderator?.fullName || 'Moderator'}</Text>{item.reason ? <Text style={styles.historyReason}>{item.reason}</Text> : null}</View>) : <Text style={styles.detailValue}>No moderation history available.</Text>}
          </> : null}
          <Pressable accessibilityRole="button" onPress={() => setSelectedReport(null)} style={styles.closeButton}><Text style={styles.closeText}>Close</Text></Pressable>
        </ScrollView>
      </Modal>
      <Modal animationType="fade" transparent onRequestClose={() => setPendingAction(null)} visible={!!pendingAction}>
        <View style={styles.overlay}><View style={styles.confirmBox}>
          <Text style={styles.modalTitle}>{pendingAction ? actionLabels[pendingAction.action] : ''}</Text>
          <Text style={styles.confirmText}>Confirm this moderation action. Add a short reason for the record.</Text>
          <TextInput accessibilityLabel="Moderation note" maxLength={500} multiline onChangeText={setNote} placeholder="Moderation note (optional)" placeholderTextColor="#788493" style={styles.noteInput} value={note} />
          <View style={styles.confirmActions}><Pressable accessibilityRole="button" disabled={isSaving} onPress={() => setPendingAction(null)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" disabled={isSaving} onPress={performAction} style={styles.confirmButton}>{isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmTextButton}>Confirm</Text>}</Pressable></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF' }, backButton: { minHeight: 44, justifyContent: 'center', padding: 8 }, backText: { color: '#2673FF', fontWeight: '800' }, eyebrow: { color: '#6B7280', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }, title: { color: '#111827', fontSize: 25, fontWeight: '900', marginTop: 4 }, roleBadge: { backgroundColor: '#E6F4EA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 }, roleText: { color: '#276A5A', fontWeight: '800', textTransform: 'capitalize' }, content: { padding: 20, paddingBottom: 40 }, error: { color: '#A94442', backgroundColor: '#FFF0EF', padding: 12, borderRadius: 10, marginBottom: 14 }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }, statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, minWidth: '30%', flexGrow: 1 }, statLabel: { color: '#6B7280', fontSize: 12, fontWeight: '700' }, statValue: { color: '#111827', fontSize: 25, fontWeight: '900', marginTop: 8 }, sectionTitle: { color: '#111827', fontSize: 20, fontWeight: '900', marginBottom: 10, marginTop: 8 }, activityRow: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 8 }, searchInput: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, color: '#111827', minHeight: 48, paddingHorizontal: 14, marginBottom: 12 }, filters: { marginBottom: 12 }, filter: { backgroundColor: '#FFFFFF', borderRadius: 10, minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, marginRight: 8 }, filterActive: { backgroundColor: '#2673FF' }, filterText: { color: '#4B5563', fontWeight: '700', textTransform: 'capitalize' }, filterTextActive: { color: '#FFFFFF' }, reportCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 }, reportHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, reportCategory: { color: '#111827', fontWeight: '900', flex: 1 }, status: { color: '#276A5A', backgroundColor: '#E9F4EF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' }, reportPreview: { color: '#374151', lineHeight: 21, marginTop: 12 }, reportMeta: { color: '#4B5563', fontSize: 12, marginTop: 8 }, reportDate: { color: '#6B7280', fontSize: 11, marginTop: 8 }, detailsButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 8 }, detailsText: { color: '#2673FF', fontWeight: '800' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }, action: { borderColor: '#CBD5E1', borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 }, actionText: { color: '#31564B', fontWeight: '800' }, empty: { color: '#6B7280', textAlign: 'center', paddingVertical: 24 }, modalContent: { padding: 24, paddingTop: 56, backgroundColor: '#F5F7FA', flexGrow: 1 }, modalTitle: { color: '#111827', fontSize: 23, fontWeight: '900', marginBottom: 18 }, detailLabel: { color: '#6B7280', fontSize: 12, fontWeight: '800', marginTop: 14, textTransform: 'uppercase' }, detailValue: { color: '#263238', fontSize: 16, lineHeight: 23, marginTop: 4 }, historyRow: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginTop: 8 }, historyAction: { color: '#31564B', fontWeight: '900' }, historyMeta: { color: '#6B7280', fontSize: 12, marginTop: 4 }, historyReason: { color: '#374151', marginTop: 5 }, closeButton: { alignItems: 'center', backgroundColor: '#2673FF', borderRadius: 10, minHeight: 48, justifyContent: 'center', marginTop: 24 }, closeText: { color: '#FFFFFF', fontWeight: '900' }, overlay: { alignItems: 'center', backgroundColor: 'rgba(17,24,39,0.45)', flex: 1, justifyContent: 'center', padding: 20 }, confirmBox: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, width: '100%' }, confirmText: { color: '#4B5563', lineHeight: 21 }, noteInput: { borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, color: '#111827', minHeight: 86, marginTop: 14, padding: 12, textAlignVertical: 'top' }, confirmActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 16 }, cancelButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }, cancelText: { color: '#4B5563', fontWeight: '800' }, confirmButton: { alignItems: 'center', backgroundColor: '#2673FF', borderRadius: 8, justifyContent: 'center', minHeight: 44, minWidth: 90, paddingHorizontal: 14 }, confirmTextButton: { color: '#FFFFFF', fontWeight: '900' },
});

export default ModeratorDashboardScreen;
