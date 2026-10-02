import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  createSession,
  deleteSession,
  getSessions,
  OnlineSession,
  SessionPayload,
  updateSession,
} from '../api/sessionsApi';
import type { Community } from './GroupDiscussionScreen';

export type ScheduleRole = 'user' | 'moderator' | 'admin' | 'professional';

type ScheduleScreenProps = {
  role: ScheduleRole;
  communities: Community[];
  onBack: () => void;
};

type SessionForm = Omit<SessionPayload, 'group'> & { group: string };

const emptyForm = (): SessionForm => ({
  title: '',
  description: '',
  group: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '19:00',
  endTime: '20:00',
  meetingLink: '',
});

const formatDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const isStarted = (session: OnlineSession) => {
  const start = new Date(`${session.date}T${session.startTime}`);
  return !Number.isNaN(start.getTime()) && Date.now() >= start.getTime();
};

const confirmAction = (title: string, message: string): Promise<boolean> => {
  const browserConfirm = (globalThis as { confirm?: (value: string) => boolean }).confirm;
  if (typeof browserConfirm === 'function') {
    return Promise.resolve(browserConfirm(`${title}\n\n${message}`));
  }
  return new Promise(resolve => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
};

export default function ScheduleScreen({ role, communities, onBack }: ScheduleScreenProps) {
  const [sessions, setSessions] = useState<OnlineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState<OnlineSession | null>(null);
  const [editingSession, setEditingSession] = useState<OnlineSession | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [showGroups, setShowGroups] = useState(false);

  const canManage = role === 'admin' || role === 'moderator';

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSessions(await getSessions());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load online sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const openCreate = () => {
    setEditingSession(null);
    setFormVisible(true);
    setError('');
    setForm({ ...emptyForm(), group: communities[0]?._id || '' });
    setShowGroups(false);
  };

  const openEdit = (session: OnlineSession) => {
    setEditingSession(session);
    setFormVisible(true);
    setError('');
    setForm({
      title: session.title,
      description: session.description,
      group: session.group._id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      meetingLink: session.meetingLink,
    });
    setShowGroups(false);
    setSelectedSession(null);
  };

  const saveSession = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.group || !form.date || !form.startTime || !form.endTime || !form.meetingLink.trim()) {
      Alert.alert('Missing information', 'Please complete every session field.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        meetingLink: form.meetingLink.trim(),
      };
      if (editingSession) {
        await updateSession(editingSession._id, payload);
      } else {
        await createSession(payload);
      }
      setEditingSession(null);
      setFormVisible(false);
      await loadSessions();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save the session.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session: OnlineSession) => {
    const confirmed = await confirmAction('Delete session', `Cancel "${session.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setSaving(true);
    try {
      await deleteSession(session._id);
      setSelectedSession(null);
      await loadSessions();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete the session.');
    } finally {
      setSaving(false);
    }
  };

  const selectedGroupName = useMemo(
    () => communities.find(community => community._id === form.group)?.name || 'Select group',
    [communities, form.group],
  );

  const updateField = (field: keyof SessionForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Schedule</Text>
        {canManage ? (
          <Pressable accessibilityLabel="Add session" onPress={openCreate} style={styles.addButton}>
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Session</Text>
          </Pressable>
        ) : <View style={styles.headerSpacer} />}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionHeader}>
          <Text style={styles.pageTitle}>Upcoming Sessions</Text>
          <Text style={styles.onlineLabel}>Online peer support</Text>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator accessibilityLabel="Loading sessions" color="#2673FF" size="large" /> : null}
        {!loading && sessions.length === 0 ? <Text style={styles.empty}>No upcoming online sessions yet.</Text> : null}

        {!loading && sessions.map(session => (
          <View key={session._id} style={styles.sessionCard}>
            <View style={styles.sessionCardHeader}>
              <View style={styles.onlineIcon}><Feather name="video" size={18} color="#2673FF" /></View>
              <View style={styles.sessionHeading}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.groupName}>{session.group.name}</Text>
              </View>
            </View>
            <Text style={styles.dateText}>{formatDate(session.date)}</Text>
            <Text style={styles.timeText}>{session.startTime} - {session.endTime}</Text>
            <Text style={styles.description} numberOfLines={2}>{session.description}</Text>
            <Text style={styles.host}>Host: {session.hostName || session.host?.fullName || 'Moderator'}</Text>
            <Pressable accessibilityLabel={`View details for ${session.title}`} onPress={() => setSelectedSession(session)} style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>View Details</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setSelectedSession(null)} visible={!!selectedSession}>
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Session Details</Text>
            <Pressable accessibilityLabel="Close session details" onPress={() => setSelectedSession(null)}>
              <Feather name="x" size={24} color="#111827" />
            </Pressable>
          </View>
          {selectedSession ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.detailTitle}>{selectedSession.title}</Text>
              <Text style={styles.detailGroup}>{selectedSession.group.name}</Text>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(selectedSession.date)}</Text>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{selectedSession.startTime} - {selectedSession.endTime}</Text>
              <Text style={styles.detailLabel}>Host</Text>
              <Text style={styles.detailValue}>{selectedSession.hostName || selectedSession.host?.fullName || 'Moderator'}</Text>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{selectedSession.description}</Text>
              <Text style={styles.onlineBadge}>Online Session</Text>
              {isStarted(selectedSession) ? (
                <Pressable accessibilityLabel="Join online session" onPress={() => Linking.openURL(selectedSession.meetingLink)} style={styles.joinButton}>
                  <Feather name="video" size={17} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Join Online Session</Text>
                </Pressable>
              ) : (
                <Text style={styles.waitingText}>The join link will be available when the session starts.</Text>
              )}
              {canManage ? (
                <View style={styles.managementActions}>
                  <Pressable onPress={() => openEdit(selectedSession)} style={styles.editButton}><Text style={styles.editButtonText}>Edit Session</Text></Pressable>
                  <Pressable disabled={saving} onPress={() => handleDelete(selectedSession)} style={styles.deleteButton}><Text style={styles.deleteButtonText}>Delete Session</Text></Pressable>
                </View>
              ) : null}
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

      <Modal animationType="slide" onRequestClose={() => setFormVisible(false)} visible={canManage && formVisible}>
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingSession ? 'Edit Session' : 'Add Session'}</Text>
            <Pressable accessibilityLabel="Close session form" onPress={() => setFormVisible(false)}><Feather name="x" size={24} color="#111827" /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>Session Title</Text>
            <TextInput value={form.title} onChangeText={value => updateField('title', value)} placeholder="Managing Academic Stress" style={styles.input} />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput multiline value={form.description} onChangeText={value => updateField('description', value)} placeholder="What will the group discuss?" style={[styles.input, styles.textArea]} />
            <Text style={styles.inputLabel}>Select Group</Text>
            <Pressable onPress={() => setShowGroups(value => !value)} style={styles.selectInput}><Text style={form.group ? styles.selectText : styles.placeholderText}>{selectedGroupName}</Text><Feather name="chevron-down" size={18} color="#667085" /></Pressable>
            {showGroups ? <View style={styles.groupOptions}>{communities.map(community => <Pressable key={community._id} onPress={() => { updateField('group', community._id); setShowGroups(false); }} style={styles.groupOption}><Text style={styles.groupOptionText}>{community.name}</Text></Pressable>)}</View> : null}
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput value={form.date} onChangeText={value => updateField('date', value)} placeholder="2026-10-10" style={styles.input} />
            <Text style={styles.inputHint}>Use YYYY-MM-DD</Text>
            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput value={form.startTime} onChangeText={value => updateField('startTime', value)} placeholder="19:00" style={styles.input} />
            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput value={form.endTime} onChangeText={value => updateField('endTime', value)} placeholder="20:00" style={styles.input} />
            <Text style={styles.inputLabel}>Meeting Link</Text>
            <TextInput autoCapitalize="none" value={form.meetingLink} onChangeText={value => updateField('meetingLink', value)} placeholder="https://meet.example.com/session" style={styles.input} />
            {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}
            <Pressable disabled={saving} onPress={saveSession} style={styles.saveButton}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{editingSession ? 'Save Changes' : 'Create Session'}</Text>}</Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5F7FA', flex: 1 },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backButton: { minHeight: 44, justifyContent: 'center', padding: 8 },
  headerTitle: { color: '#111827', fontSize: 20, fontWeight: '900' },
  headerSpacer: { width: 40 },
  addButton: { alignItems: 'center', backgroundColor: '#2673FF', borderRadius: 10, flexDirection: 'row', gap: 5, minHeight: 42, paddingHorizontal: 11 },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 40 },
  sectionHeader: { alignItems: 'flex-start', marginBottom: 14 },
  pageTitle: { color: '#111827', fontSize: 24, fontWeight: '900' },
  onlineLabel: { color: '#276A5A', fontSize: 12, fontWeight: '800', marginTop: 4 },
  error: { backgroundColor: '#FFF0EF', borderRadius: 10, color: '#A94442', marginBottom: 12, padding: 12 },
  empty: { color: '#6B7280', paddingVertical: 28, textAlign: 'center' },
  sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, padding: 16 },
  sessionCardHeader: { alignItems: 'center', flexDirection: 'row' },
  onlineIcon: { alignItems: 'center', backgroundColor: '#E8F0FF', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  sessionHeading: { flex: 1, marginLeft: 12 },
  sessionTitle: { color: '#111827', fontSize: 17, fontWeight: '900' },
  groupName: { color: '#2673FF', fontSize: 13, fontWeight: '800', marginTop: 4 },
  dateText: { color: '#374151', fontSize: 14, fontWeight: '800', marginTop: 16 },
  timeText: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  description: { color: '#4B5563', lineHeight: 20, marginTop: 12 },
  host: { color: '#6B7280', fontSize: 13, marginTop: 10 },
  detailsButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 8 },
  detailsButtonText: { color: '#2673FF', fontWeight: '900' },
  modalScreen: { backgroundColor: '#F5F7FA', flex: 1 },
  modalHeader: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  modalTitle: { color: '#111827', fontSize: 20, fontWeight: '900' },
  modalContent: { padding: 24, paddingBottom: 40 },
  detailTitle: { color: '#111827', fontSize: 26, fontWeight: '900' },
  detailGroup: { color: '#2673FF', fontSize: 15, fontWeight: '800', marginTop: 6 },
  detailLabel: { color: '#6B7280', fontSize: 12, fontWeight: '800', marginTop: 20, textTransform: 'uppercase' },
  detailValue: { color: '#263238', fontSize: 16, lineHeight: 23, marginTop: 5 },
  onlineBadge: { alignSelf: 'flex-start', backgroundColor: '#E6F4EA', borderRadius: 8, color: '#276A5A', fontSize: 12, fontWeight: '900', marginTop: 20, paddingHorizontal: 10, paddingVertical: 7 },
  joinButton: { alignItems: 'center', backgroundColor: '#2673FF', borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 50, marginTop: 22 },
  joinButtonText: { color: '#FFFFFF', fontWeight: '900' },
  waitingText: { color: '#6B7280', lineHeight: 21, marginTop: 22 },
  managementActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  editButton: { borderColor: '#2673FF', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 16 },
  editButtonText: { color: '#2673FF', fontWeight: '900' },
  deleteButton: { borderColor: '#B42318', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 16 },
  deleteButtonText: { color: '#B42318', fontWeight: '900' },
  formContent: { padding: 24, paddingBottom: 50 },
  inputLabel: { color: '#374151', fontSize: 13, fontWeight: '900', marginBottom: 7, marginTop: 15 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, color: '#111827', minHeight: 48, paddingHorizontal: 14 },
  textArea: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
  inputHint: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  formError: { backgroundColor: '#FFF0EF', borderRadius: 8, color: '#A94442', marginTop: 14, padding: 10 },
  selectInput: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 14 },
  selectText: { color: '#111827' },
  placeholderText: { color: '#788493' },
  groupOptions: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, marginTop: 5 },
  groupOption: { borderBottomColor: '#E5E7EB', borderBottomWidth: 1, minHeight: 46, justifyContent: 'center', paddingHorizontal: 14 },
  groupOptionText: { color: '#374151', fontWeight: '700' },
  saveButton: { alignItems: 'center', backgroundColor: '#2673FF', borderRadius: 10, justifyContent: 'center', minHeight: 50, marginTop: 28 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '900' },
});
