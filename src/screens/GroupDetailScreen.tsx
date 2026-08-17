import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─── Config ───────────────────────────────────────────────────────────────────
// Physical Android device → your PC's LAN IP (from ipconfig).
const API_BASE = 'http://192.168.8.158:3000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Community {
  _id: string;
  name: string;
  category: string;
  emoji: string;
  bgColor: string;
  description: string;
  memberCount: number;
  memberAvatarColors: string[];
  isJoined: boolean;
}

export interface GroupDetailScreenProps {
  /** Pass a full community object (e.g. from navigation params). */
  community?: Community;
  /** Alternatively, pass just an ID — the screen fetches from the API. */
  communityId?: string;
  /** Called when the back button is pressed. */
  onBack?: () => void;
}

// ─── Fallback community (matches the Figma design) ───────────────────────────
const FALLBACK_COMMUNITY: Community = {
  _id: '6a821ff182406ec93dee1497',
  name: 'Mindfulness & Healthy Habits',
  category: 'Mindfulness',
  emoji: '🧘',
  bgColor: '#D4C9F5',
  description:
    'A supportive community focused on building healthier everyday habits.',
  memberCount: 96,
  memberAvatarColors: ['#FDDCB5', '#C5DFF8', '#F9D4E0'],
  isJoined: false,
};

// ─── Community guidelines (5 default guidelines) ─────────────────────────────
const GUIDELINES = [
  'Be respectful and kind to everyone in the community.',
  "Protect each other's privacy — do not share others' posts outside this group.",
  "Listen without judgment. Everyone's experience is valid.",
  'Do not share harmful, triggering, or graphic content.',
  'Remember that peer support is not professional therapy.',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Member Avatars ───────────────────────────────────────────────────────────
function MemberAvatars({colors}: {colors: string[]}) {
  return (
    <View style={styles.avatarGroup}>
      {colors.map((color, i) => (
        <View
          key={i}
          style={[
            styles.avatarCircle,
            {backgroundColor: color, marginLeft: i === 0 ? 0 : -8},
          ]}
        />
      ))}
    </View>
  );
}

// ─── Guideline Card ───────────────────────────────────────────────────────────
function GuidelineCard({
  index,
  text,
  badgeColor,
}: {
  index: number;
  text: string;
  badgeColor: string;
}) {
  return (
    <View style={styles.guidelineCard}>
      <View style={[styles.guidelineBadge, {backgroundColor: badgeColor}]}>
        <Text style={styles.guidelineBadgeNum}>{index + 1}</Text>
      </View>
      <Text style={styles.guidelineText}>{text}</Text>
    </View>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {id: 'home', label: 'Home', icon: '⌂'},
  {id: 'resources', label: 'Resources', icon: '⊟'},
  {id: 'groups', label: 'Groups', icon: '◈'},
  {id: 'messages', label: 'Messages', icon: '✉'},
  {id: 'profile', label: 'Profile', icon: '◯'},
];

function BottomNav() {
  const [active, setActive] = useState('groups');
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <Pressable
            key={item.id}
            style={styles.navBtn}
            onPress={() => setActive(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}>
            <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
function GroupDetailScreen({
  community: communityProp,
  communityId,
  onBack,
}: GroupDetailScreenProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [community, setCommunity] = useState<Community>(
    communityProp ?? FALLBACK_COMMUNITY,
  );
  const [fetching, setFetching] = useState(false);
  const [joining, setJoining] = useState(false);

  // ── Fetch by ID if only an ID was provided ─────────────────────────────────
  useEffect(() => {
    if (communityProp) {
      setCommunity(communityProp);
      return;
    }
    const id = communityId ?? FALLBACK_COMMUNITY._id;
    fetchCommunity(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, communityProp]);

  async function fetchCommunity(id: string) {
    try {
      setFetching(true);
      const res = await fetch(`${API_BASE}/communities/${id}`);
      if (!res.ok) throw new Error('not found');
      const data: Community = await res.json();
      setCommunity(data);
    } catch {
      // Stay with fallback / prop value
    } finally {
      setFetching(false);
    }
  }

  // ── Join / Leave toggle ────────────────────────────────────────────────────
  async function handleJoin() {
    // Optimistic update
    const wasJoined = community.isJoined;
    setCommunity(prev => ({
      ...prev,
      isJoined: !prev.isJoined,
      memberCount: prev.isJoined
        ? prev.memberCount - 1
        : prev.memberCount + 1,
    }));

    try {
      setJoining(true);
      const res = await fetch(
        `${API_BASE}/communities/${community._id}/join`,
        {method: 'POST'},
      );
      if (res.ok) {
        const updated: Community = await res.json();
        setCommunity(updated);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Revert optimistic update
      setCommunity(prev => ({
        ...prev,
        isJoined: wasJoined,
        memberCount: wasJoined ? prev.memberCount + 1 : prev.memberCount - 1,
      }));
    } finally {
      setJoining(false);
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const heroGradStart = hexToRgba(community.bgColor, 0.5);
  const heroGradEnd = hexToRgba(community.bgColor, 0.208);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ══ Back Button ══ */}
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        {/* ══ Hero Banner ══ */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[heroGradStart, heroGradEnd]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroBanner}>
            {/* Soft glow orb (approximates CSS blur) */}
            <View
              style={[
                styles.heroGlow,
                {backgroundColor: community.bgColor},
              ]}
            />
            {/* Centered emoji */}
            <Text style={styles.heroEmoji}>{community.emoji}</Text>
          </LinearGradient>

          {/* ── Category pill ── */}
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryPill,
                {backgroundColor: community.bgColor},
              ]}>
              <Text style={styles.categoryPillText}>{community.category}</Text>
            </View>
          </View>

          {/* ── Title ── */}
          <View style={styles.titleWrap}>
            <Text style={styles.groupName}>{community.name}</Text>
          </View>

          {/* ── Description ── */}
          <View style={styles.descWrap}>
            <Text style={styles.descText}>{community.description}</Text>
          </View>

          {/* ── Members row ── */}
          <View style={styles.membersRow}>
            <MemberAvatars colors={community.memberAvatarColors} />
            <Text style={styles.memberCount}>
              {community.memberCount} members
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.activeText}>Active today</Text>
          </View>
        </View>

        {/* ══ Join / Leave Button ══ */}
        <View style={styles.joinBtnWrap}>
          {fetching ? (
            <ActivityIndicator color="#2D2D3A" />
          ) : community.isJoined ? (
            /* Leave Group — white bg, dark border */
            <Pressable
              style={styles.leaveBtnPressable}
              onPress={handleJoin}
              disabled={joining}
              accessibilityRole="button"
              accessibilityLabel="Leave Group">
              <View style={styles.leaveBtn}>
                <Text style={styles.leaveBtnText}>
                  {joining ? 'Leaving…' : 'Leave Group'}
                </Text>
              </View>
            </Pressable>
          ) : (
            /* Join Group — gradient */
            <Pressable
              onPress={handleJoin}
              disabled={joining}
              accessibilityRole="button"
              accessibilityLabel="Join Group">
              <LinearGradient
                colors={['#C5DFF8', '#C8EDD5']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>
                  {joining ? 'Joining…' : 'Join Group'}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {/* ══ Divider ══ */}
        <View style={styles.divider} />

        {/* ══ Community Guidelines ══ */}
        <View style={styles.guidelinesSection}>
          {/* Section header */}
          <Text style={styles.sectionHeader}>COMMUNITY GUIDELINES</Text>

          {/* Guideline cards */}
          <View style={styles.guidelinesList}>
            {GUIDELINES.map((text, i) => (
              <GuidelineCard
                key={i}
                index={i}
                text={text}
                badgeColor={community.bgColor}
              />
            ))}
          </View>
        </View>

        {/* ══ Disclaimer Banner ══ */}
        <View style={styles.disclaimerWrap}>
          <View style={styles.disclaimerBanner}>
            <Text style={styles.disclaimerEmoji}>🌱</Text>
            <Text style={styles.disclaimerText}>
              This is a peer-support community, not a professional service. If
              you need clinical support, please visit the{' '}
              <Text style={styles.disclaimerBold}>Professional Support</Text>
              {' '}section.
            </Text>
          </View>
        </View>

        <View style={styles.scrollSpacer} />
      </ScrollView>

      {/* ══ Fixed Bottom Navigation ══ */}
      <BottomNav />
    </SafeAreaView>
  );
}

export default GroupDetailScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF'},
  scroll: {flex: 1, backgroundColor: '#FFFFFF'},
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // ── Back button ──────────────────────────────────────────────────────────────
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.51,
    borderColor: '#E8E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  backIcon: {
    fontSize: 24,
    color: '#6B6B80',
    lineHeight: 28,
    marginTop: -2,
  },

  // ── Hero section ─────────────────────────────────────────────────────────────
  heroWrap: {marginTop: 20},
  heroBanner: {
    width: '100%',
    height: 130,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -20,
    right: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.45,
  },
  heroEmoji: {
    fontSize: 58,
    lineHeight: 70,
    zIndex: 2,
  },

  // ── Category pill ─────────────────────────────────────────────────────────────
  categoryRow: {marginTop: 24},
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D2D3A',
    letterSpacing: 0.44,
    lineHeight: 16,
  },

  // ── Title & description ───────────────────────────────────────────────────────
  titleWrap: {marginTop: 10},
  groupName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D2D3A',
    letterSpacing: -0.44,
    lineHeight: 26,
  },
  descWrap: {marginTop: 8},
  descText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 22,
  },

  // ── Members row ───────────────────────────────────────────────────────────────
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.51,
    borderColor: '#FFFFFF',
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6B80',
    lineHeight: 20,
  },
  dot: {
    fontSize: 16,
    color: '#E8E8F0',
    lineHeight: 24,
    fontWeight: '400',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A0B8',
    lineHeight: 18,
  },

  // ── Join / Leave button ───────────────────────────────────────────────────────
  joinBtnWrap: {marginTop: 24},
  joinBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C5DFF8',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  joinBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D2D3A',
    lineHeight: 22,
    textAlign: 'center',
  },
  leaveBtnPressable: {width: '100%'},
  leaveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.51,
    borderColor: '#2D2D3A',
  },
  leaveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D2D3A',
    lineHeight: 22,
    textAlign: 'center',
  },

  // ── Divider ───────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: '#E8E8F0',
    marginTop: 28,
  },

  // ── Guidelines section ────────────────────────────────────────────────────────
  guidelinesSection: {marginTop: 24},
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B80',
    letterSpacing: 0.65,
    textTransform: 'uppercase',
    lineHeight: 20,
  },
  guidelinesList: {
    marginTop: 14,
    gap: 8,
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.51,
    borderColor: '#E8E8F0',
    borderRadius: 13,
  },
  guidelineBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  guidelineBadgeNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D3A',
    lineHeight: 18,
  },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 20,
  },

  // ── Disclaimer banner ─────────────────────────────────────────────────────────
  disclaimerWrap: {marginTop: 32},
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.51,
    borderColor: '#E8E8F0',
    borderRadius: 14,
  },
  disclaimerEmoji: {fontSize: 16, lineHeight: 24, flexShrink: 0},
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: '#2D2D3A',
  },

  scrollSpacer: {height: 24},

  // ── Bottom Navigation ─────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.51,
    borderTopColor: '#E8E8F0',
  },
  navBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    gap: 3,
  },
  navIcon: {fontSize: 19, color: '#A0A0B8'},
  navIconActive: {color: '#2D2D3A'},
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A0A0B8',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  navLabelActive: {fontWeight: '800', color: '#2D2D3A'},
});
