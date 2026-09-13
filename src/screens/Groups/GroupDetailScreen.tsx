import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import type { Community } from '../GroupDiscussionScreen';

// ─── Guidelines per community (fallback to defaults) ─────────────────────────

interface GroupDetailScreenProps {
  community: Community;
  isJoined: boolean;
  onBack: () => void;
  onJoin: (communityId: string) => void;
  onEnter: (community: Community) => void;
}

export default function GroupDetailScreen({
  community,
  isJoined,
  onBack,
  onJoin,
  onEnter,
}: GroupDetailScreenProps) {
  const [joined, setJoined] = useState(isJoined);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  
const handleJoinToggle = () => {
  const next = !joined;
  setJoined(next);

  if (next) {
    onJoin(community._id);

    Alert.alert(
      'You’re a member! 🎉',
      `You have joined ${community.name}.`,
      [
        {
          text: 'Continue',
          style: 'default',
        },
      ],
    );
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={community.bgColor} />

      {/* BANNER */}
      <View style={[styles.banner, { backgroundColor: community.bgColor }]}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>◀</Text>
        </Pressable>
        <Text style={styles.bannerEmoji}>{community.emoji}</Text>
      </View>

<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={true}
>

        {/* CATEGORY BADGE */}
        <View style={[styles.categoryBadge, { backgroundColor: community.bgColor }]}>
          <Text style={styles.categoryBadgeText}>{community.category}</Text>
        </View>

        {/* NAME & DESCRIPTION */}
        <Text style={styles.groupName}>{community.name}</Text>
        <Text style={styles.groupDescription}>{community.description}</Text>

        {/* MEMBERS ROW */}
        <View style={styles.membersRow}>
          <View style={styles.avatarStack}>
            {community.memberAvatarColors.slice(0, 3).map((color, i) => (
              <View
                key={i}
                style={[
                  styles.memberAvatar,
                  { backgroundColor: color, marginLeft: i === 0 ? 0 : -10 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.memberCount}>{community.memberCount} members</Text>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Active today</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.joinButton, joined && styles.joinButtonJoined]}
            onPress={handleJoinToggle}>
            <Text style={[styles.joinButtonText, joined && styles.joinButtonTextJoined]}>
              {joined ? 'Joined ✓' : 'Join'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.enterButton, !joined && styles.enterButtonDisabled]}
            onPress={() => joined && onEnter(community)}
            disabled={!joined}>
            <Text style={[styles.enterButtonText, !joined && styles.enterButtonTextDisabled]}>
              Enter Community
            </Text>
          </Pressable>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* COMMUNITY GUIDELINES */}
        <Text style={styles.guidelinesHeading}>COMMUNITY GUIDELINES</Text>

        {community.guidelines
  ? community.guidelines
      .split('\n')
      .filter(g => g.trim())
      .map((g, i) => (
        <View
  key={i}
  style={[
    styles.guidelineItem,
    { backgroundColor: community.bgColor },
  ]}
>
          <View style={styles.guidelineNumber}>
            <Text style={styles.guidelineNumberText}>{i + 1}</Text>
          </View>

          <Text style={styles.guidelineText}>
            {g.trim()}
          </Text>
        </View>
      ))
  : (
      <Text style={styles.guidelineText}>
        No guidelines added for this community.
      </Text>
    )}

       
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
backButton: {
  position: 'absolute',
  top: 35,
  left: 12,
  width: 52,
  height: 52,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10, 
},
backIcon: {
  fontSize: 40,
  color: '#1F2937',
  fontWeight: '500',
  textAlign: 'center',
  textAlignVertical: 'center',
  lineHeight: 36,
  includeFontPadding: false,
},
bannerEmoji: {
    fontSize: 72,
  },
  scroll: {
    flex: 1,
  },
scrollContent: {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 100,
},

  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  groupName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 34,
  },
  groupDescription: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 22,
    marginTop: 8,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeText: {
    fontSize: 12,
    color: '#667085',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  joinButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#2673FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonJoined: {
    borderColor: '#2673FF',
    backgroundColor: '#EEF4FF',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  joinButtonTextJoined: {
    color: '#2673FF',
  },
  enterButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  enterButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  enterButtonTextDisabled: {
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginTop: 24,
    marginBottom: 20,
  },
  guidelinesHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  guidelineNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },
});
