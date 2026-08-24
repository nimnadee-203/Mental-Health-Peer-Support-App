import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EMERGENCY_CONTACTS } from '../constants/emergencyContacts';
import {
  createEmergencyRequest,
  getTrustedContact,
  createTrustedContact,
  deleteTrustedContact,
  notifyTrustedContact,
} from '../api/emergencyApi';
import { EmergencyType, TrustedContact } from '../types/emergency';
import { getAuthUserId } from '../api/authStore';

type EmergencySupportScreenProps = {
  onBack: () => void;
};

export function EmergencySupportScreen({
  onBack,
}: EmergencySupportScreenProps) {
  const isLoggedIn = !!getAuthUserId();

  // Trusted Contact State
  const [trustedContact, setTrustedContact] = useState<TrustedContact | null>(null);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  const [isNotifyingContact, setIsNotifyingContact] = useState(false);

  // Form State for adding a Trusted Contact
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('');

  // Professional Support State
  const [isRequestingSupport, setIsRequestingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // General Notification / Error messages
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchContact();
    }
  }, [isLoggedIn]);

  const fetchContact = async () => {
    setIsContactLoading(true);
    setGeneralError(null);
    try {
      const contact = await getTrustedContact();
      setTrustedContact(contact);
    } catch (err: any) {
      console.warn('Failed to load trusted contact:', err.message);
    } finally {
      setIsContactLoading(false);
    }
  };

  // Immediate Danger Call Handler
  const handleCallEmergency = (name: string, number: string) => {
    Alert.alert(
      `Call ${name}?`,
      `Do you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          style: 'destructive',
          onPress: async () => {
            const url = `tel:${number}`;
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert(
                  'Dialer Unavailable',
                  `Making calls is not supported on this device. You can dial ${number} manually.`
                );
              }
            } catch (err) {
              Alert.alert('Error', 'An error occurred while opening the dialer.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Save Trusted Contact
  const handleSaveContact = async () => {
    if (!formName.trim() || !formPhone.trim() || !formRelationship.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    setIsSavingContact(true);
    setGeneralError(null);
    try {
      const newContact = await createTrustedContact({
        name: formName.trim(),
        phone: formPhone.trim(),
        relationship: formRelationship.trim(),
      });
      setTrustedContact(newContact);
      setIsAddingContact(false);
      setFormName('');
      setFormPhone('');
      setFormRelationship('');
      Alert.alert('Success', 'Trusted contact saved successfully.');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save trusted contact.');
    } finally {
      setIsSavingContact(false);
    }
  };

  // Delete Trusted Contact
  const handleDeleteContact = () => {
    Alert.alert(
      'Remove Contact?',
      'Are you sure you want to remove this trusted contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingContact(true);
            setGeneralError(null);
            try {
              await deleteTrustedContact();
              setTrustedContact(null);
              Alert.alert('Success', 'Trusted contact removed.');
            } catch (err: any) {
              setGeneralError(err.message || 'Failed to remove contact.');
            } finally {
              setIsDeletingContact(false);
            }
          },
        },
      ]
    );
  };

  // Notify Trusted Contact
  const handleNotifyContact = async () => {
    if (!trustedContact) return;

    setIsNotifyingContact(true);
    setGeneralError(null);
    setGeneralSuccess(null);
    try {
      // First create a request for notification tracking if needed, or directly call notify
      // The backend expects an emergency request ID to notify.
      // We will create a request of type TRUSTED_CONTACT first to get an ID!
      const reqResult = await createEmergencyRequest(
        EmergencyType.TRUSTED_CONTACT,
        `Notified trusted contact ${trustedContact.name}`
      );

      const notifyResult = await notifyTrustedContact(reqResult.requestId);
      setGeneralSuccess(notifyResult.message || 'Trusted contact notified successfully.');
      Alert.alert('Notification Sent', notifyResult.message || 'Trusted contact has been notified.');
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to notify trusted contact.');
    } finally {
      setIsNotifyingContact(false);
    }
  };

  // Professional Support Request
  const handleRequestSupport = async () => {
    if (isRequestingSupport || supportSuccess) return;

    setIsRequestingSupport(true);
    setGeneralError(null);
    try {
      await createEmergencyRequest(
        EmergencyType.MENTAL_HEALTH,
        'User requested emergency mental health support'
      );
      setSupportSuccess(true);
      Alert.alert(
        'Support Requested',
        'Your request for professional support has been submitted. A counselor will review it shortly.'
      );
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to submit support request.');
    } finally {
      setIsRequestingSupport(false);
    }
  };

  // Private Phone Number Format Masking (e.g. *******1234)
  const formatPrivatePhone = (phone: string) => {
    if (!phone) return '';
    const cleanPhone = phone.trim();
    if (cleanPhone.length <= 4) return cleanPhone;
    return '*'.repeat(cleanPhone.length - 4) + cleanPhone.slice(-4);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Emergency Support</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Introduction */}
        <Text style={styles.mainTitle}>Need urgent help?</Text>

        <Text style={styles.descriptionText}>
          If you or someone else is in immediate danger, please seek help from
          an appropriate emergency service or a trusted person straight away.
        </Text>

        {/* IMMEDIATE DANGER */}
        <View style={styles.dangerCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.dangerIconBadge}>
              <Text style={styles.badgeIconText}>🚨</Text>
            </View>

            <Text style={styles.dangerTitle}>Immediate danger</Text>
          </View>

          <Text style={styles.dangerText}>
            If there is an immediate risk of harm, contact your local emergency service
            or go to the nearest emergency department.
          </Text>

          <View style={styles.emergencyActionsList}>
            <Pressable
              style={styles.dangerCallButton}
              onPress={() => handleCallEmergency('Police Emergency', EMERGENCY_CONTACTS.POLICE)}
              accessibilityRole="button"
              accessibilityLabel={`Call Police — ${EMERGENCY_CONTACTS.POLICE}`}
            >
              <Text style={styles.dangerCallButtonText}>
                📞 Call Police — {EMERGENCY_CONTACTS.POLICE}
              </Text>
            </Pressable>

            <Pressable
              style={styles.dangerCallButton}
              onPress={() => handleCallEmergency('Suwa Seriya Ambulance', EMERGENCY_CONTACTS.AMBULANCE)}
              accessibilityRole="button"
              accessibilityLabel={`Call Ambulance — ${EMERGENCY_CONTACTS.AMBULANCE}`}
            >
              <Text style={styles.dangerCallButtonText}>
                📞 Call Ambulance — {EMERGENCY_CONTACTS.AMBULANCE}
              </Text>
            </Pressable>

            <Pressable
              style={styles.dangerCallButton}
              onPress={() => handleCallEmergency('Emergency & Rescue', EMERGENCY_CONTACTS.RESCUE)}
              accessibilityRole="button"
              accessibilityLabel={`Call Emergency & Rescue — ${EMERGENCY_CONTACTS.RESCUE}`}
            >
              <Text style={styles.dangerCallButtonText}>
                📞 Call Emergency & Rescue — {EMERGENCY_CONTACTS.RESCUE}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Talk to someone */}
        <Text style={styles.sectionHeading}>Talk to someone</Text>

        <Text style={styles.sectionSubheading}>
          If you are going through a difficult moment, consider reaching out to
          someone you trust or an appropriate support service.
        </Text>

        {/* TRUSTED PERSON */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.avatarBadge, { backgroundColor: '#E0EEFF' }]}>
              <Text style={styles.badgeIconText}>👤</Text>
            </View>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>A trusted person</Text>
              <Text style={styles.cardBodyText}>
                Reach out to a friend, family member, or someone you trust. Letting someone know
                how you feel is a meaningful step.
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {!isLoggedIn ? (
            <Text style={styles.infoText}>Please log in to configure a trusted contact.</Text>
          ) : isContactLoading ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 10 }} />
          ) : trustedContact ? (
            <View style={styles.contactDetailsContainer}>
              <View style={styles.contactMeta}>
                <Text style={styles.contactName}>{trustedContact.name}</Text>
                <Text style={styles.contactSub}>
                  {trustedContact.relationship} • {formatPrivatePhone(trustedContact.phone)}
                </Text>
              </View>

              <View style={styles.contactActionsRow}>
                <Pressable
                  style={styles.actionPill}
                  onPress={() => handleCallEmergency(trustedContact.name, trustedContact.phone)}
                  accessibilityRole="button"
                  accessibilityLabel="Call Trusted Person"
                >
                  <Text style={styles.actionPillText}>📞 Call Trusted Person</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionPill, styles.actionPillPrimary]}
                  onPress={handleNotifyContact}
                  disabled={isNotifyingContact}
                  accessibilityRole="button"
                  accessibilityLabel="Notify Trusted Person"
                >
                  {isNotifyingContact ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.actionPillTextPrimary}>🔔 Notify Trusted Person</Text>
                  )}
                </Pressable>
              </View>

              <Pressable
                style={styles.deleteContactButton}
                onPress={handleDeleteContact}
                disabled={isDeletingContact}
                accessibilityRole="button"
                accessibilityLabel="Remove Trusted Contact"
              >
                {isDeletingContact ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Text style={styles.deleteContactButtonText}>Remove Contact</Text>
                )}
              </Pressable>
            </View>
          ) : isAddingContact ? (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Add Trusted Contact</Text>
              
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={formName}
                onChangeText={setFormName}
                testID="trusted-contact-name-input"
              />

              <TextInput
                style={styles.textInput}
                placeholder="Relationship (e.g. Spouse, Parent)"
                placeholderTextColor="#9CA3AF"
                value={formRelationship}
                onChangeText={setFormRelationship}
                testID="trusted-contact-relationship-input"
              />

              <TextInput
                style={styles.textInput}
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={formPhone}
                onChangeText={setFormPhone}
                testID="trusted-contact-phone-input"
              />

              <View style={styles.formButtonsRow}>
                <Pressable
                  style={styles.cancelFormButton}
                  onPress={() => setIsAddingContact(false)}
                >
                  <Text style={styles.cancelFormButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.saveFormButton}
                  onPress={handleSaveContact}
                  disabled={isSavingContact}
                >
                  {isSavingContact ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveFormButtonText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.noContactContainer}>
              <Text style={styles.noContactText}>No trusted contact added yet.</Text>
              <Pressable
                style={styles.actionPill}
                onPress={() => setIsAddingContact(true)}
                accessibilityRole="button"
                accessibilityLabel="Add Trusted Contact"
              >
                <Text style={styles.actionPillText}>+ Add Trusted Contact</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* PROFESSIONAL SERVICE */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.avatarBadge, { backgroundColor: '#FCE8E6' }]}>
              <Text style={styles.badgeIconText}>🏥</Text>
            </View>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Professional mental health service</Text>
              <Text style={styles.cardBodyText}>
                A qualified mental health professional can provide appropriate support.
                MindConnect can help you request support immediately.
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Pressable
            style={[
              styles.actionPill,
              supportSuccess && styles.successButton,
              !isLoggedIn && styles.disabledButton,
            ]}
            onPress={handleRequestSupport}
            disabled={isRequestingSupport || supportSuccess || !isLoggedIn}
            accessibilityRole="button"
            accessibilityLabel="Request Professional Support"
            testID="request-support-button"
          >
            {isRequestingSupport ? (
              <View style={styles.buttonRow}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={[styles.actionPillText, { marginLeft: 6 }]}>Sending...</Text>
              </View>
            ) : supportSuccess ? (
              <Text style={styles.successButtonText}>Support Requested ✓</Text>
            ) : (
              <Text style={styles.actionPillText}>Request Professional Support →</Text>
            )}
          </Pressable>
        </View>

        {/* General status messages */}
        {generalError && (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>⚠️ {generalError}</Text>
          </View>
        )}

        {/* Right Now */}
        <Text style={styles.sectionHeading}>Right now, try to...</Text>

        <Text style={styles.sectionSubheading}>
          These steps may help you feel a little steadier until you are able to get further support.
        </Text>

        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Text style={styles.listIcon}>🏡</Text>
            <Text style={styles.listText}>Move to a safer place if you can.</Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listIcon}>🤝</Text>
            <Text style={styles.listText}>Stay with someone you trust.</Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listIcon}>🛑</Text>
            <Text style={styles.listText}>
              Put distance between yourself and anything that could cause harm.
            </Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listIcon}>📞</Text>
            <Text style={styles.listText}>
              <Text style={{ fontWeight: '700' }}>
                Seek immediate professional or emergency assistance if needed.
              </Text>
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            MindConnect provides information only. This app does not provide emergency response,
            crisis counseling, or professional therapy. Always contact emergency services if there is
            an immediate risk to life.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <Text style={styles.affirmationTitle}>You are not alone.</Text>
          <Text style={styles.affirmationSub}>Reaching out for support is an important step.</Text>

          <Pressable onPress={onBack} style={styles.backHomeButton}>
            <Text style={styles.backHomeButtonText}>Back to Resources</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1F2A37',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2A37',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  dangerCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeIconText: {
    fontSize: 14,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
  },
  dangerText: {
    fontSize: 12,
    color: '#C2410C',
    lineHeight: 17,
    marginBottom: 12,
  },
  emergencyActionsList: {
    gap: 8,
  },
  dangerCallButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerCallButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginBottom: 14,
  },
  supportCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 14,
    marginBottom: 12,
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2A37',
    marginBottom: 2,
  },
  cardBodyText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  actionPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  actionPillPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  actionPillTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successButton: {
    backgroundColor: '#DEF7EC',
    borderColor: '#DEF7EC',
  },
  successButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#03543F',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  noContactContainer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  noContactText: {
    fontSize: 13,
    color: '#6B7280',
  },
  contactDetailsContainer: {
    paddingVertical: 4,
  },
  contactMeta: {
    marginBottom: 10,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  contactSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  deleteContactButton: {
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  deleteContactButtonText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#111827',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelFormButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelFormButtonText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '700',
  },
  saveFormButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveFormButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorAlert: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '700',
  },
  listContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  listText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  disclaimerBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  disclaimerIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
    flex: 1,
  },
  footerWrap: {
    alignItems: 'center',
  },
  affirmationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  affirmationSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  backHomeButton: {
    backgroundColor: '#D1EBE2',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  backHomeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
});

export default EmergencySupportScreen;