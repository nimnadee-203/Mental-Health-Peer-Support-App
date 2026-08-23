import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EmergencySupportScreenProps = {
  onBack: () => void;
};

export function EmergencySupportScreen({
  onBack,
}: EmergencySupportScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            ‹
          </Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Emergency Support
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Introduction */}
        <Text style={styles.mainTitle}>
          Need urgent help?
        </Text>

        <Text style={styles.descriptionText}>
          If you or someone else is in immediate danger,
          please seek help from an appropriate emergency
          service or a trusted person straight away.
        </Text>

        {/* Immediate Danger */}
        <View style={styles.dangerCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.dangerIconBadge}>
              <Text style={styles.badgeIconText}>
                🚨
              </Text>
            </View>

            <Text style={styles.dangerTitle}>
              Immediate danger
            </Text>
          </View>

          <Text style={styles.dangerText}>
            If there is an immediate risk of harm,
            contact your local emergency service or go
            to the nearest emergency department.
          </Text>

          <Pressable style={styles.whitePillButton}>
            <Text style={styles.whitePillButtonText}>
              🕒 Emergency information
            </Text>
          </Pressable>
        </View>

        {/* Talk to someone */}
        <Text style={styles.sectionHeading}>
          Talk to someone
        </Text>

        <Text style={styles.sectionSubheading}>
          If you are going through a difficult moment,
          consider reaching out to someone you trust or
          an appropriate support service.
        </Text>

        {/* Trusted Person */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: '#E0EEFF',
                },
              ]}
            >
              <Text style={styles.badgeIconText}>
                👤
              </Text>
            </View>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>
                A trusted person
              </Text>

              <Text style={styles.cardBodyText}>
                Reach out to a friend, family member, or
                someone you trust. Letting someone know
                how you feel is a meaningful step.
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Pressable style={styles.actionPill}>
            <Text style={styles.actionPillText}>
              Who can I call? →
            </Text>
          </Pressable>
        </View>

        {/* Professional Service */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: '#FCE8E6',
                },
              ]}
            >
              <Text style={styles.badgeIconText}>
                🏥
              </Text>
            </View>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>
                Professional mental health service
              </Text>

              <Text style={styles.cardBodyText}>
                A qualified mental health professional can
                provide appropriate support. MindConnect can
                help you find information about services.
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Pressable style={styles.actionPill}>
            <Text style={styles.actionPillText}>
              Find support →
            </Text>
          </Pressable>
        </View>

        {/* Local Support */}
        <View style={styles.supportCard}>
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: '#E6F4EA',
                },
              ]}
            >
              <Text style={styles.badgeIconText}>
                🌐
              </Text>
            </View>

            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>
                Local support service
              </Text>

              <Text style={styles.cardBodyText}>
                Community organizations and helplines exist
                in most areas. Search for services in your
                location for guidance.
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Pressable style={styles.actionPill}>
            <Text style={styles.actionPillText}>
              Learn more →
            </Text>
          </Pressable>
        </View>

        {/* Right Now */}
        <Text style={styles.sectionHeading}>
          Right now, try to...
        </Text>

        <Text style={styles.sectionSubheading}>
          These steps may help you feel a little steadier
          until you are able to get further support.
        </Text>

        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <Text style={styles.listIcon}>
              🏡
            </Text>

            <Text style={styles.listText}>
              Move to a safer place if you can.
            </Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listIcon}>
              🤝
            </Text>

            <Text style={styles.listText}>
              Stay with someone you trust.
            </Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listIcon}>
              🛑
            </Text>

            <Text style={styles.listText}>
              Put distance between yourself and anything
              that could cause harm.
            </Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listIcon}>
              📞
            </Text>

            <Text style={styles.listText}>
              <Text style={{ fontWeight: '700' }}>
                Seek immediate professional or emergency
                assistance if needed.
              </Text>
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>
            ℹ️
          </Text>

          <Text style={styles.disclaimerText}>
            MindConnect provides information only. This app
            does not provide emergency response, crisis
            counseling, or professional therapy. Always
            contact emergency services if there is an
            immediate risk to life.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <Text style={styles.affirmationTitle}>
            You are not alone.
          </Text>

          <Text style={styles.affirmationSub}>
            Reaching out for support is an important step.
          </Text>

          <Pressable
            onPress={onBack}
            style={styles.backHomeButton}
          >
            <Text style={styles.backHomeButtonText}>
              Back to Resources
            </Text>
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

  whitePillButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  whitePillButtonText: {
    fontSize: 12,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
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