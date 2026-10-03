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
import {
  applyForVolunteer,
  getVolunteerStatus,
  VolunteerApplication,
} from '../api/volunteerApi';
import { MessagingOption, UserProfile, VisibilityOption } from '../types/user';

type ProfileScreenProps = {
  onBack: () => void;
  onNavigateToAuth?: () => void;
  onLogout?: () => void;
  onOpenModeration?: () => void;
};

const DEFAULT_INTERESTS = ['Anxiety support', 'Mindfulness', 'Daily journaling'];

function ProfileScreen({ onBack, onNavigateToAuth, onLogout, onOpenModeration }: ProfileScreenProps) {
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

  // Privacy Settings state
  const [profileVisibility, setProfileVisibility] =
    useState<VisibilityOption>('Group Members');
  const [anonymousSharing, setAnonymousSharing] = useState<boolean>(true);
  const [whoCanMessageMe, setWhoCanMessageMe] =
    useState<MessagingOption>('Group Members');
  const [showInterestsOnProfile, setShowInterestsOnProfile] =
    useState<boolean>(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacySaveSuccess, setPrivacySaveSuccess] = useState(false);

  // Volunteer Application state
  const [volunteerApp, setVolunteerApp] = useState<VolunteerApplication | null>(null);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [volunteerStep, setVolunteerStep] = useState<1 | 2>(1);
  const [volunteerReason, setVolunteerReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmittingVolunteer, setIsSubmittingVolunteer] = useState(false);
  const [volunteerError, setVolunteerError] = useState<string | null>(null);

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
      try {
        const appStatus = await getVolunteerStatus();
        setVolunteerApp(appStatus);
      } catch {
        // Ignore if volunteer status fetch fails
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApplyVolunteer = async () => {
    if (!volunteerReason.trim()) {
      setVolunteerError('Please describe why you would like to become a Peer Support Volunteer.');
      return;
    }
    if (!agreedToTerms) {
      setVolunteerError('Please accept the Peer Supporter Code of Conduct to submit.');
      return;
    }

    setIsSubmittingVolunteer(true);
    setVolunteerError(null);

    try {
      const newApp = await applyForVolunteer(volunteerReason.trim());
      setVolunteerApp(newApp);
      setIsVolunteerModalOpen(false);
      setVolunteerStep(1);
      setVolunteerReason('');
      setAgreedToTerms(false);
      Alert.alert('Application Submitted', 'Your Peer Support Volunteer application has been submitted for review!');
    } catch (err: any) {
      setVolunteerError(err?.message || 'Failed to submit application.');
    } finally {
      setIsSubmittingVolunteer(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      if (profile.privacySettings) {
        setProfileVisibility(
          profile.privacySettings.profileVisibility || 'Group Members',
        );
        setAnonymousSharing(profile.privacySettings.anonymousSharing ?? true);
        setWhoCanMessageMe(
          profile.privacySettings.whoCanMessageMe || 'Group Members',
        );
        setShowInterestsOnProfile(
          profile.privacySettings.showInterestsOnProfile ?? false,
        );
      } else {
        setShowInterestsOnProfile(true);
      }
    }
  }, [profile]);

  const handleSavePrivacySettings = async () => {
    if (!userId || !profile) return;

    setIsSavingPrivacy(true);
    setPrivacySaveSuccess(false);

    try {
      const updated = await updateUserProfile(userId, {
        privacySettings: {
          profileVisibility,
          anonymousSharing,
          whoCanMessageMe,
          showInterestsOnProfile,
        },
      });
      setProfile(updated);
      setPrivacySaveSuccess(true);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save privacy settings.');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

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

        {onOpenModeration ? (
          <Pressable style={styles.moderationButton} onPress={onOpenModeration}>
            <Text style={styles.moderationButtonText}>Open Moderation</Text>
          </Pressable>
        ) : null}

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
              <View style={styles.roleBadgeContainer}>
                <Text style={styles.roleBadgeText}>
                  {profile.role === 'peer_volunteer'
                    ? 'Peer Support Volunteer 🌱'
                    : profile.role === 'moderator'
                    ? 'Moderator 🛡️'
                    : profile.role === 'admin'
                    ? 'Admin 👑'
                    : 'Community Member'}
                </Text>
              </View>
              <Text style={styles.email}>{profile.email}</Text>
              <Text style={styles.bio}>
                {profile.bio || 'Sharing small steps, honest updates, and support with the community.'}
              </Text>

              {(profile.role === 'moderator' || profile.role === 'admin' || onOpenModeration) && (
                <Pressable
                  accessibilityRole="button"
                  testID="open-moderator-dashboard-button"
                  style={[styles.editButton, { backgroundColor: '#2563EB', marginTop: 14, minWidth: 200 }]}
                  onPress={onOpenModeration}
                >
                  <Text style={[styles.editButtonText, { color: '#FFFFFF', fontWeight: '800' }]}>
                    🛡️ Open Moderator / Admin Dashboard
                  </Text>
                </Pressable>
              )}
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

            {/* Volunteer Application Section */}
            <View style={styles.section} testID="volunteer-application-section">
              <Text style={styles.sectionTitle}>Peer Support Volunteer Status</Text>
              {profile.role === 'peer_volunteer' ? (
                <View style={styles.volunteerActiveBox}>
                  <Text style={styles.volunteerActiveTitle}>Active Peer Support Volunteer 🌱</Text>
                  <Text style={styles.volunteerActiveText}>
                    You have active peer supporter permissions! You can facilitate peer support discussions, respond to community members, and create support groups.
                  </Text>
                </View>
              ) : volunteerApp ? (
                <View style={styles.volunteerStatusBox}>
                  <Text style={styles.volunteerStatusLabel}>Application Status:</Text>
                  <Text
                    style={[
                      styles.volunteerStatusValue,
                      volunteerApp.status === 'pending' && styles.statusPending,
                      volunteerApp.status === 'approved' && styles.statusApproved,
                      volunteerApp.status === 'rejected' && styles.statusRejected,
                    ]}
                  >
                    {volunteerApp.status === 'pending'
                      ? 'Pending Approval ⏳'
                      : volunteerApp.status === 'approved'
                      ? 'Approved ✓'
                      : 'Rejected ❌'}
                  </Text>
                  <Text style={styles.volunteerReasonText}>"{volunteerApp.reason}"</Text>
                  {volunteerApp.status === 'rejected' && (
                    <Pressable
                      style={styles.reapplyButton}
                      onPress={() => setIsVolunteerModalOpen(true)}
                    >
                      <Text style={styles.reapplyButtonText}>Re-apply for Peer Support Volunteer</Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={styles.volunteerApplyBox}>
                  <Text style={styles.volunteerApplyText}>
                    Community Members can apply to become a Peer Support Volunteer. Once approved, you gain additional peer supporter features and group creation privileges.
                  </Text>
                  <Pressable
                    style={styles.applyVolunteerButton}
                    onPress={() => {
                      setVolunteerStep(1);
                      setIsVolunteerModalOpen(true);
                    }}
                    testID="become-volunteer-button"
                  >
                    <Text style={styles.applyVolunteerButtonText}>
                      Become a Peer Support Volunteer
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Support Interests */}
            {showInterestsOnProfile ? (
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
            ) : null}

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

            {/* Privacy Settings Section */}
            <View style={styles.section} testID="privacy-settings-section">
              <Text style={styles.sectionTitle}>Privacy Settings</Text>

              {/* Profile Visibility */}
              <View style={styles.privacySubGroup}>
                <Text style={styles.privacySubTitle}>Profile Visibility</Text>
                <View style={styles.radioGroup}>
                  {(['Everyone', 'Group Members', 'Only Me'] as const).map(option => {
                    const isSelected = profileVisibility === option;
                    return (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() => setProfileVisibility(option)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        testID={`radio-visibility-${option.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.radioText,
                            isSelected && styles.radioTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Anonymous Sharing */}
              <View style={styles.toggleRow}>
                <Text style={styles.privacySubTitle}>Anonymous Sharing</Text>
                <Pressable
                  style={[
                    styles.toggleButton,
                    anonymousSharing ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() => setAnonymousSharing(prev => !prev)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: anonymousSharing }}
                  testID="toggle-anonymous-sharing"
                >
                  <Text
                    style={[
                      styles.toggleText,
                      anonymousSharing ? styles.toggleTextOn : styles.toggleTextOff,
                    ]}
                  >
                    {anonymousSharing ? '[ ON ]' : '[ OFF ]'}
                  </Text>
                </Pressable>
              </View>

              {/* Who can message me? */}
              <View style={styles.privacySubGroup}>
                <Text style={styles.privacySubTitle}>Who can message me?</Text>
                <View style={styles.radioGroup}>
                  {(['Everyone', 'Group Members', 'Nobody'] as const).map(option => {
                    const isSelected = whoCanMessageMe === option;
                    return (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() => setWhoCanMessageMe(option)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        testID={`radio-messaging-${option.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.radioText,
                            isSelected && styles.radioTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Show my interests on profile */}
              <View style={styles.toggleRow}>
                <Text style={styles.privacySubTitle}>Show my interests on profile</Text>
                <Pressable
                  style={[
                    styles.toggleButton,
                    showInterestsOnProfile ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() => setShowInterestsOnProfile(prev => !prev)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: showInterestsOnProfile }}
                  testID="toggle-show-interests"
                >
                  <Text
                    style={[
                      styles.toggleText,
                      showInterestsOnProfile ? styles.toggleTextOn : styles.toggleTextOff,
                    ]}
                  >
                    {showInterestsOnProfile ? '[ ON ]' : '[ OFF ]'}
                  </Text>
                </Pressable>
              </View>

              {/* Save Changes Button */}
              <View style={styles.savePrivacyRow}>
                <Pressable
                  accessibilityRole="button"
                  testID="save-privacy-settings-button"
                  style={styles.savePrivacyButton}
                  onPress={handleSavePrivacySettings}
                  disabled={isSavingPrivacy}
                >
                  {isSavingPrivacy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.savePrivacyButtonText}>Save Changes</Text>
                  )}
                </Pressable>
                {privacySaveSuccess ? (
                  <Text style={styles.saveSuccessText}>Changes saved successfully!</Text>
                ) : null}
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

      {/* Volunteer Application Modal */}
      <Modal visible={isVolunteerModalOpen} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {volunteerStep === 1 ? (
              /* Step 1: Role Information & Requirements */
              <View testID="volunteer-step-1">
                <Text style={styles.modalTitle}>Become a Peer Support Volunteer 🌱</Text>
                <Text style={styles.volunteerModalSubtitle}>
                  Peer Support Volunteers help create a safe, compassionate environment for community members.
                </Text>

                <View style={styles.infoCard}>
                  <Text style={styles.infoCardHeading}>Role & Responsibilities</Text>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>✓</Text>
                    <Text style={styles.infoBulletText}>Provide peer-to-peer emotional encouragement and support.</Text>
                  </View>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>✓</Text>
                    <Text style={styles.infoBulletText}>Create and facilitate topic-focused peer support groups.</Text>
                  </View>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>✓</Text>
                    <Text style={styles.infoBulletText}>Respond to community members seeking guidance.</Text>
                  </View>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>✓</Text>
                    <Text style={styles.infoBulletText}>Display the official Peer Support Volunteer 🌱 badge on your profile.</Text>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoCardHeading}>Requirements</Text>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>•</Text>
                    <Text style={styles.infoBulletText}>Active account in good community standing.</Text>
                  </View>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>•</Text>
                    <Text style={styles.infoBulletText}>Commitment to empathetic, safe, and respectful peer support.</Text>
                  </View>
                  <View style={styles.infoBulletRow}>
                    <Text style={styles.infoBulletIcon}>•</Text>
                    <Text style={styles.infoBulletText}>Agreement to escalate acute crisis or self-harm risks to Emergency Support.</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsVolunteerModalOpen(false);
                      setVolunteerError(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.saveButton}
                    onPress={() => {
                      setVolunteerStep(2);
                      setVolunteerError(null);
                    }}
                    testID="continue-volunteer-step-2"
                  >
                    <Text style={styles.saveButtonText}>Continue to Application →</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* Step 2: Application Form */
              <View testID="volunteer-step-2">
                <Text style={styles.modalTitle}>Volunteer Application</Text>
                <Text style={styles.volunteerModalSubtitle}>
                  Please share why you would like to become a Peer Support Volunteer.
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Application Reason / Motivation</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={volunteerReason}
                    onChangeText={setVolunteerReason}
                    placeholder="I want to contribute by offering empathetic listening and supporting peer members..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    testID="volunteer-reason-input"
                  />
                </View>

                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => setAgreedToTerms(prev => !prev)}
                  testID="agree-terms-checkbox"
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the Peer Supporter Code of Conduct and community guidelines.
                  </Text>
                </Pressable>

                {volunteerError ? <Text style={styles.errorText}>{volunteerError}</Text> : null}

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setVolunteerStep(1);
                      setVolunteerError(null);
                    }}
                    disabled={isSubmittingVolunteer}
                  >
                    <Text style={styles.cancelButtonText}>← Back</Text>
                  </Pressable>
                  <Pressable
                    style={styles.saveButton}
                    onPress={handleApplyVolunteer}
                    disabled={isSubmittingVolunteer}
                    testID="submit-volunteer-button"
                  >
                    {isSubmittingVolunteer ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Submit Application</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
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
  moderationButton: {
    backgroundColor: '#E6F4EA',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  moderationButtonText: {
    color: '#276A5A',
    fontWeight: '800',
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
  privacySubGroup: {
    marginTop: 14,
  },
  privacySubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 8,
  },
  radioGroup: {
    gap: 8,
    paddingLeft: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: '#2563EB',
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  radioText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
  },
  radioTextSelected: {
    color: '#111827',
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  toggleOff: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '900',
  },
  toggleTextOn: {
    color: '#15803D',
  },
  toggleTextOff: {
    color: '#6B7280',
  },
  savePrivacyRow: {
    alignItems: 'center',
    marginTop: 22,
  },
  savePrivacyButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  savePrivacyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  saveSuccessText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
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
  roleBadgeContainer: {
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
  roleBadgeText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },
  volunteerActiveBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  volunteerActiveTitle: {
    color: '#065F46',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  volunteerActiveText: {
    color: '#047857',
    fontSize: 13,
    lineHeight: 18,
  },
  volunteerStatusBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  volunteerStatusLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  volunteerStatusValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 8,
  },
  statusPending: {
    color: '#D97706',
  },
  statusApproved: {
    color: '#059669',
  },
  statusRejected: {
    color: '#DC2626',
  },
  volunteerReasonText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
  },
  reapplyButton: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reapplyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  volunteerApplyBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  volunteerApplyText: {
    color: '#0369A1',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  applyVolunteerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  applyVolunteerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  volunteerModalSubtitle: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  infoCardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  infoBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  infoBulletIcon: {
    color: '#2563EB',
    fontWeight: '900',
    fontSize: 14,
  },
  infoBulletText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  checkboxLabel: {
    color: '#475569',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});

export default ProfileScreen;
