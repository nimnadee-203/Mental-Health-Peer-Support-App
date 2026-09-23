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
  type: 'EMERGENCY' | 'REPORT';
  description: string;
  status: string;
  user: string;
  createdAt: string;
};

export default function AdminActivitiesScreen({ onBack }: AdminActivitiesScreenProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
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
        <ScrollView contentContainerStyle={styles.list}>
          {activities.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No recent activities found.</Text>
            </View>
          ) : (
            activities.map(a => (
              <View key={a._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, a.type === 'EMERGENCY' ? styles.badgeEm : styles.badgeRep]}>
                    <Feather name={a.type === 'EMERGENCY' ? 'alert-triangle' : 'flag'} size={12} color={a.type === 'EMERGENCY' ? '#EF4444' : '#F59E0B'} />
                    <Text style={[styles.typeText, a.type === 'EMERGENCY' ? {color: '#EF4444'} : {color: '#F59E0B'}]}>
                      {a.type}
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
            ))
          )}
        </ScrollView>
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
  list: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#8A8A9E', fontSize: 15 },
  
  card: { backgroundColor: '#F8F9FC', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ECEEF8' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeEm: { backgroundColor: '#FEE2E2' },
  badgeRep: { backgroundColor: '#FEF3C7' },
  typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  date: { fontSize: 12, color: '#A0A0B8', fontWeight: '600' },
  
  desc: { fontSize: 15, color: '#0D0D1A', lineHeight: 22, marginBottom: 16 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ECEEF8', paddingTop: 12 },
  user: { fontSize: 13, color: '#6B6B80', fontWeight: '600' },
  statusBadge: { backgroundColor: '#E8F0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, color: '#2673FF', fontWeight: '800' },
});
