import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ProfileScreenProps = {
  onBack: () => void;
};

const interests = ['Anxiety support', 'Mindfulness', 'Daily journaling'];

function ProfileScreen({ onBack }: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <Text style={styles.name}>Patient User</Text>
          <Text style={styles.email}>patient@example.com</Text>
          <Text style={styles.bio}>
            Sharing small steps, honest updates, and support with the community.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>84</Text>
            <Text style={styles.statLabel}>Supports</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Replies</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Interests</Text>
          <View style={styles.chipRow}>
            {interests.map(interest => (
              <View key={interest} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityTitle}>Shared a story</Text>
            <Text style={styles.activityText}>A small win today</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityTitle}>Supported a post</Text>
            <Text style={styles.activityText}>Breathing through a difficult morning</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  topBarTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  topBarSpacer: {
    width: 66,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  name: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 14,
  },
  email: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  bio: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
  },
  activityItem: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 12,
  },
  activityTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  activityText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  editButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default ProfileScreen;
