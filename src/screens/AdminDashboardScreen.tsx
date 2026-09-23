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

import AdminUsersScreen from './AdminUsersScreen';
import AdminActivitiesScreen from './AdminActivitiesScreen';
import AdminSettingsScreen from './AdminSettingsScreen';

type AdminDashboardScreenProps = {
  onBack: () => void;
};

type AdminView = 'home' | 'users' | 'activities' | 'settings';

type AdminStats = {
  totalCommunities: number;
  activeEmergencies: number;
  totalReports: number;
  totalUsers: number;
};

export default function AdminDashboardScreen({ onBack }: AdminDashboardScreenProps) {
  const [view, setView] = useState<AdminView>('home');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'home') {
      fetchStats();
    }
  }, [view, fetchStats]);

  if (view === 'users') {
    return <AdminUsersScreen onBack={() => setView('home')} />;
  }

  if (view === 'activities') {
    return <AdminActivitiesScreen onBack={() => setView('home')} />;
  }

  if (view === 'settings') {
    return <AdminSettingsScreen onBack={() => setView('home')} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0D0D1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        
        {loading && !stats ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#5A5AD8" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F0FF' }]}>
                <Feather name="users" size={20} color="#2673FF" />
              </View>
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E6F4EA' }]}>
                <Feather name="grid" size={20} color="#34D399" />
              </View>
              <Text style={styles.statValue}>{stats?.totalCommunities || 0}</Text>
              <Text style={styles.statLabel}>Communities</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="alert-triangle" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{stats?.activeEmergencies || 0}</Text>
              <Text style={styles.statLabel}>Active Emergencies</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="flag" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{stats?.totalReports || 0}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Management</Text>
        
        <Pressable style={styles.navCard} onPress={() => setView('users')}>
          <View style={[styles.navIcon, { backgroundColor: '#E8F0FF' }]}>
            <Feather name="users" size={20} color="#2673FF" />
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Manage Users</Text>
            <Text style={styles.navDesc}>Create and manage users, professionals, and moderators.</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#A0A0B8" />
        </Pressable>

        <Pressable style={styles.navCard} onPress={() => setView('activities')}>
          <View style={[styles.navIcon, { backgroundColor: '#EDE8FA' }]}>
            <Feather name="activity" size={20} color="#7C67D6" />
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>System Activities</Text>
            <Text style={styles.navDesc}>Monitor emergency requests and content reports.</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#A0A0B8" />
        </Pressable>

        <Pressable style={styles.navCard} onPress={() => setView('settings')}>
          <View style={[styles.navIcon, { backgroundColor: '#FEE2E2' }]}>
            <Feather name="settings" size={20} color="#EF4444" />
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>System Settings</Text>
            <Text style={styles.navDesc}>Configure app behavior, maintenance, and rules.</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#A0A0B8" />
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F1F8' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0D0D1A', marginBottom: 16 },
  errorText: { color: '#EF4444', marginTop: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%', backgroundColor: '#F8F9FC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ECEEF8' },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0D0D1A' },
  statLabel: { fontSize: 13, fontWeight: '600', color: '#8A8A9E', marginTop: 4 },
  
  navCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8F9FC', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ECEEF8' },
  navIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  navContent: { flex: 1 },
  navTitle: { fontSize: 16, fontWeight: '800', color: '#0D0D1A', marginBottom: 4 },
  navDesc: { fontSize: 13, color: '#8A8A9E', lineHeight: 18, paddingRight: 10 },
});
