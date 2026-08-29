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
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthUserId, setAuthUserId } from '../api/authStore';
import { getUserProfile, updateUserProfile } from '../api/profileApi';
import { UserProfile } from '../types/user';

type ProfileScreenProps = {
  onBack: () => void;
  onNavigateToAuth?: () => void;
  onLogout?: () => void;
};

const DEFAULT_INTERESTS = ['Anxiety support', 'Mindfulness', 'Daily journaling'];

function ProfileScreen({ onBack, onNavigateToAuth, onLogout }: ProfileScreenProps) {
  const [userId, setUserId] = useState<string | null>(getAuthUserId());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const currentUserId = getAuthUserId();
    setUserId(currentUserId);

    if (!currentUserId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserProfile(currentUserId);
      setProfile(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditFullName(profile.fullName);
    setEditBio(profile.bio || '');
    setEditInterests(profile.interests || DEFAULT_INTERESTS);
    setNewInterestInput('');
    setSaveError(null);
    setIsEditing(true);
  };

  const handleAddInterest = () => {
    const trimmed = newInterestInput.trim();
    if (trimmed && !editInterests.includes(trimmed)) {
      setEditInterests([...editInterests, trimmed]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setEditInterests(editInterests.filter(i => i !== interestToRemove));
  };

  const handleSaveProfile = async () => {
    if (!userId || !profile) return;

    if (!editFullName.trim()) {
      setSaveError('Full name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updated = await updateUserProfile(userId, {
        fullName: editFullName.trim(),
        bio: editBio.trim(),
        interests: editInterests,
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          setAuthUserId(null);
          setProfile(null);
          setUserId(null);
          if (onLogout) {
            onLogout();
          } else if (onNavigateToAuth) {
            onNavigateToAuth();
          }
        },
      },
    ]);
  };

  // Avatar initial
  const avatarLetter = (profile?.fullName || 'P').trim().charAt(0).toUpperCase() || 'P';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            testID="profile-back-button"
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : !userId ? (
          /* Guest Mode Layout */
          <View style={styles.guestContainer}>
            <View style={styles.guestAvatar}>
              <Text style={styles.avatarText}>G</Text>
            </View>
            <Text style={styles.name}>Guest User</Text>
            <Text style={styles.email}>Log in to sync your profile</Text>
            <Text style={styles.bio}>
              Join the Mental Health Peer Support community to save your preferences, connect with groups, and personalize your experience.
            </Text>
            {onNavigateToAuth ? (
              <Pressable
                accessibilityRole="button"
                testID="profile-login-button"
                style={styles.editButton}
                onPress={onNavigateToAuth}
              >
                <Text style={styles.editButtonText}>Log In / Sign Up</Text>
              </Pressable>
            ) : null}
          </View>
        ) : error ? (
          /* Error State */
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : profile ? (
          /* Logged-In User Profile Layout */
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
              <Text style={styles.name}>{profile.fullName}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <Text style={styles.bio}>
                {profile.bio || 'Sharing small steps, honest updates, and support with the community.'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats?.posts ?? 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats?.supports ?? 0}</Text>
                <Text style={styles.statLabel}>Supports</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats?.replies ?? 0}</Text>
                <Text style={styles.statLabel}>Replies</Text>
              </View>
            </View>

            {/* Support Interests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support Interests</Text>
              <View style={styles.chipRow}>
                {(profile.interests && profile.interests.length > 0
                  ? profile.interests
                  : DEFAULT_INTERESTS
                ).map(interest => (
                  <View key={interest} style={styles.chip}>
                    <Text style={styles.chipText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Activity */}
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

            {/* Action Buttons: Edit Profile & Log Out */}
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                testID="edit-profile-button"
                style={styles.editButton}
                onPress={handleOpenEdit}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                testID="logout-button"
                style={styles.logoutButton}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
                testID="edit-name-input"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell us a bit about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                testID="edit-bio-input"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Interests</Text>
              <View style={styles.chipRow}>
                {editInterests.map(interest => (
                  <Pressable
                    key={interest}
                    style={styles.editableChip}
                    onPress={() => handleRemoveInterest(interest)}
                  >
                    <Text style={styles.editableChipText}>{interest} ✕</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.addInterestRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newInterestInput}
                  onChangeText={setNewInterestInput}
                  placeholder="Add interest"
                  placeholderTextColor="#9CA3AF"
                  testID="add-interest-input"
                />
                <Pressable
                  style={styles.addInterestButton}
                  onPress={handleAddInterest}
                  testID="add-interest-button"
                >
                  <Text style={styles.addInterestButtonText}>Add</Text>
                </Pressable>
              </View>
            </View>

            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isSaving}
                testID="save-profile-button"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingBottom: 100,
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
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    padding: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  guestContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  guestAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
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
  actionRow: {
    gap: 12,
    marginTop: 18,
  },
  editButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  logoutButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editableChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editableChipText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 13,
  },
  addInterestRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addInterestButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addInterestButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default ProfileScreen;
