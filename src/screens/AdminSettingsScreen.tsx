import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

type AdminSettingsScreenProps = {
  onBack: () => void;
};

export default function AdminSettingsScreen({ onBack }: AdminSettingsScreenProps) {
  // Mock settings state for demonstration
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  
  const handleSave = () => {
    Alert.alert('Settings Saved', 'System settings have been successfully updated.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0D0D1A" />
        </Pressable>
        <Text style={styles.headerTitle}>System Settings</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Core System Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Configuration</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Maintenance Mode</Text>
              <Text style={styles.settingDesc}>
                Restrict app access to administrators only while performing upgrades.
              </Text>
            </View>
            <Pressable
              style={[styles.toggleBtn, maintenanceMode ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setMaintenanceMode(!maintenanceMode)}
            >
              <Text style={[styles.toggleText, maintenanceMode ? styles.toggleTextOn : styles.toggleTextOff]}>
                {maintenanceMode ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* User Registration Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Registration</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Allow New Registrations</Text>
              <Text style={styles.settingDesc}>
                Let new users sign up for the platform.
              </Text>
            </View>
            <Pressable
              style={[styles.toggleBtn, allowRegistration ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setAllowRegistration(!allowRegistration)}
            >
              <Text style={[styles.toggleText, allowRegistration ? styles.toggleTextOn : styles.toggleTextOff]}>
                {allowRegistration ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Require Email Verification</Text>
              <Text style={styles.settingDesc}>
                Users must verify their email address before accessing communities.
              </Text>
            </View>
            <Pressable
              style={[styles.toggleBtn, requireEmailVerification ? styles.toggleOn : styles.toggleOff]}
              onPress={() => setRequireEmailVerification(!requireEmailVerification)}
            >
              <Text style={[styles.toggleText, requireEmailVerification ? styles.toggleTextOn : styles.toggleTextOff]}>
                {requireEmailVerification ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>
        </View>
        
        {/* Danger Zone */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
          <View style={[styles.settingCard, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reset System Statistics</Text>
              <Text style={styles.settingDesc}>
                Clear all aggregated metrics and data. This action cannot be undone.
              </Text>
            </View>
            <Pressable style={styles.dangerBtn} onPress={() => Alert.alert('Confirm', 'Are you sure?')}>
              <Text style={styles.dangerBtnText}>Reset</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 14, 
    borderBottomWidth: 1, borderBottomColor: '#F0F1F8' 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A' },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#5A5AD8', borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  content: { padding: 20, paddingBottom: 100 },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0D0D1A', marginBottom: 16 },
  
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#ECEEF8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: { flex: 1, paddingRight: 16 },
  settingTitle: { fontSize: 15, fontWeight: '800', color: '#0D0D1A', marginBottom: 4 },
  settingDesc: { fontSize: 13, color: '#8A8A9E', lineHeight: 18 },
  
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleOn: { backgroundColor: '#E6F4EA', borderColor: '#34D399' },
  toggleOff: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  toggleText: { fontSize: 13, fontWeight: '800' },
  toggleTextOn: { color: '#059669' },
  toggleTextOff: { color: '#6B7280' },
  
  dangerBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dangerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
