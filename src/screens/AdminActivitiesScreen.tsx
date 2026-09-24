import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_BASE } from '../config/api';
import { getAuthToken } from '../api/authStore';

type AdminActivitiesScreenProps = {
  onBack: () => void;
};

type Activity = {
  _id: string;
  type: 'EMERGENCY' | 'REPORT' | 'LOGIN' | 'ROLE_CHANGE' | 'USER_CREATED' | 'USER_DELETED';
  description: string;
  status: string;
  user: string;
  createdAt: string;
};

export default function AdminActivitiesScreen({ onBack }: AdminActivitiesScreenProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/admin/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredActivities = activities.filter(a => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Emergencies' && a.type === 'EMERGENCY') return true;
    if (activeFilter === 'Reports' && a.type === 'REPORT') return true;
    if (activeFilter === 'Users' && (a.type === 'USER_CREATED' || a.type === 'USER_DELETED' || a.type === 'ROLE_CHANGE')) return true;
    if (activeFilter === 'Auth' && a.type === 'LOGIN') return true;
    return false;
  });

  const FILTERS = ['All', 'Emergencies', 'Reports', 'Users', 'Auth'];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0D0D1A" />
        </Pressable>
        <Text style={styles.headerTitle}>System Activities</Text>
        <Pressable style={styles.refreshBtn} onPress={fetchActivities}>
          <Feather name="refresh-cw" size={18} color="#5A5AD8" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#5A5AD8" />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#EF4444' }}>{error}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {FILTERS.map(f => (
                <Pressable
                  key={f}
                  style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            <View style={styles.fullWidthContainer}>
              {filteredActivities.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No activities match the selected filter.</Text>
                </View>
              ) : (
                filteredActivities.map(a => {
                  let badgeStyle = styles.badgeLog;
                  let iconName = 'activity';
                  let iconColor = '#6B7280';
                  
                  if (a.type === 'EMERGENCY') {
                    badgeStyle = styles.badgeEm; iconName = 'alert-triangle'; iconColor = '#EF4444';
                  } else if (a.type === 'REPORT') {
                    badgeStyle = styles.badgeRep; iconName = 'flag'; iconColor = '#F59E0B';
                  } else if (a.type === 'LOGIN') {
                    badgeStyle = styles.badgeLog; iconName = 'log-in'; iconColor = '#2673FF';
                  } else if (a.type === 'ROLE_CHANGE') {
                    badgeStyle = styles.badgeRole; iconName = 'shield'; iconColor = '#7C67D6';
                  } else if (a.type === 'USER_CREATED' || a.type === 'USER_DELETED') {
                    badgeStyle = styles.badgeUser; iconName = a.type === 'USER_CREATED' ? 'user-plus' : 'user-minus'; iconColor = '#10B981';
                  }

                  return (
                    <View key={a._id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={[styles.typeBadge, badgeStyle]}>
                          <Feather name={iconName as any} size={12} color={iconColor} />
                          <Text style={[styles.typeText, {color: iconColor}]}>
                            {a.type.replace('_', ' ')}
                          </Text>
                        </View>
                        <Text style={styles.date}>{formatDate(a.createdAt)}</Text>
                      </View>
                      
                      <Text style={styles.desc}>{a.description}</Text>
                      
                      <View style={styles.cardFooter}>
                        <Text style={styles.user}><Feather name="user" size={12}/> {a.user}</Text>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>{a.status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  refreshBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  
  filterContainer: { borderBottomWidth: 1, borderBottomColor: '#F0F1F8', backgroundColor: '#FAFBFC' },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECEEF8' },
  filterBtnActive: { backgroundColor: '#0D0D1A', borderColor: '#0D0D1A' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#8A8A9E' },
  filterTextActive: { color: '#FFFFFF' },

  list: { padding: 20, paddingBottom: 100 },
  fullWidthContainer: { width: '100%' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#8A8A9E', fontSize: 15 },
  
  card: { backgroundColor: '#F8F9FC', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ECEEF8' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeEm: { backgroundColor: '#FEE2E2' },
  badgeRep: { backgroundColor: '#FEF3C7' },
  badgeLog: { backgroundColor: '#E8F0FF' },
  badgeRole: { backgroundColor: '#EDE8FA' },
  badgeUser: { backgroundColor: '#ECFDF5' },
  typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  date: { fontSize: 12, color: '#A0A0B8', fontWeight: '600' },
  
  desc: { fontSize: 15, color: '#0D0D1A', lineHeight: 22, marginBottom: 16 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ECEEF8', paddingTop: 12 },
  user: { fontSize: 13, color: '#6B6B80', fontWeight: '600' },
  statusBadge: { backgroundColor: '#E8F0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, color: '#2673FF', fontWeight: '800' },
});
