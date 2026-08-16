import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─── Config ───────────────────────────────────────────────────────────────────
// Android emulator → host machine localhost.
// Change to your machine's LAN IP (e.g. 192.168.1.x) for a physical device.
const API_BASE = 'http://10.0.2.2:3000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Community {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Fallback mock data (used when backend is unreachable) ────────────────────
const MOCK_COMMUNITIES: Community[] = [
  {
    _id: '1',
    name: 'Managing Academic Stress',
    category: 'Academic Pressure',
    emoji: '📚',
    bgColor: '#FDDCB5',
    description:
      'Share experiences and discover ways to manage academic pressure together.',
    memberCount: 128,
    memberAvatarColors: ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
    isJoined: false,
  },
  {
    _id: '2',
    name: 'Mindfulness & Healthy Habits',
    category: 'Mindfulness',
    emoji: '🧘',
    bgColor: '#D4C9F5',
    description:
      'A supportive community focused on building healthier everyday habits.',
    memberCount: 96,
    memberAvatarColors: ['#FDDCB5', '#C5DFF8', '#F9D4E0'],
    isJoined: false,
  },
  {
    _id: '3',
    name: 'Anxiety Support Circle',
    category: 'Stress & Anxiety',
    emoji: '🌊',
    bgColor: '#C5DFF8',
    description:
      'A safe space for people to share experiences and support one another.',
    memberCount: 154,
    memberAvatarColors: ['#C8EDD5', '#D4C9F5', '#FDDCB5'],
    isJoined: false,
  },
  {
    _id: '4',
    name: 'Grief & Loss',
    category: 'General Wellbeing',
    emoji: '🕊️',
    bgColor: '#F9D4E0',
    description:
      'Gentle, supportive conversations about loss, grief, and healing at your pace.',
    memberCount: 112,
    memberAvatarColors: ['#C5DFF8', '#C8EDD5', '#FDDCB5'],
    isJoined: false,
  },
  {
    _id: '5',
    name: 'Recovery & Growth',
    category: 'General Wellbeing',
    emoji: '🌱',
    bgColor: '#C8EDD5',
    description:
      'Celebrating progress together — big milestones and small everyday wins.',
    memberCount: 87,
    memberAvatarColors: ['#F9D4E0', '#D4C9F5', '#C5DFF8'],
    isJoined: false,
  },
  {
    _id: '6',
    name: 'Relationships & Connection',
    category: 'Relationships',
    emoji: '🤝',
    bgColor: '#F9D4E0',
    description:
      'A space to talk about friendship, connection, and the challenges they bring.',
    memberCount: 73,
    memberAvatarColors: ['#FDDCB5', '#C8EDD5', '#C5DFF8'],
    isJoined: false,
  },
  {
    _id: '7',
    name: 'Emotional Wellbeing',
    category: 'General Wellbeing',
    emoji: '💛',
    bgColor: '#FDDCB5',
    description:
      "Share what's on your mind and find support from people who understand.",
    memberCount: 141,
    memberAvatarColors: ['#F9D4E0', '#C5DFF8', '#D4C9F5'],
    isJoined: false,
  },
];

const CATEGORIES = [
  {id: 'all', label: 'All'},
  {id: 'Stress & Anxiety', label: 'Stress & Anxiety'},
  {id: 'Academic Pressure', label: 'Academic Pressure'},
  {id: 'Mindfulness', label: 'Mindfulness'},
  {id: 'Healthy Habits', label: 'Healthy Habits'},
  {id: 'Relationships', label: 'Relationships'},
  {id: 'General Wellbeing', label: 'General Wellbeing'},
];

// ─── Member Avatars (overlapping circles) ────────────────────────────────────
function MemberAvatars({colors}: {colors: string[]}) {
  return (
    <View style={styles.avatarGroup}>
      {colors.map((color, i) => (
        <View
          key={i}
          style={[
            styles.avatarCircle,
            {backgroundColor: color, marginLeft: i === 0 ? 0 : -7},
          ]}
        />
      ))}
    </View>
  );
}

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({
  community,
  onJoin,
}: {
  community: Community;
  onJoin: () => void;
}) {
  const gradStart = hexToRgba(community.bgColor, 0.376);
  const gradEnd = hexToRgba(community.bgColor, 0.125);

  return (
    <View style={styles.card}>
      {/* Gradient header */}
      <LinearGradient
        colors={[gradStart, gradEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardHeader}>
        {/* Emoji icon */}
        <View style={[styles.emojiBox, {backgroundColor: community.bgColor}]}>
          <Text style={styles.emojiText}>{community.emoji}</Text>
        </View>

        {/* Text info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardCategory}>{community.category}</Text>
          <Text style={styles.cardName} numberOfLines={1}>
            {community.name}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {community.description}
          </Text>
        </View>
      </LinearGradient>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.memberRow}>
          <MemberAvatars colors={community.memberAvatarColors} />
          <Text style={styles.memberCount}>{community.memberCount} members</Text>
        </View>

        <Pressable onPress={onJoin} accessibilityRole="button">
          <LinearGradient
            colors={
              community.isJoined ? ['#E8E8F0', '#E8E8F0'] : ['#C5DFF8', '#C8EDD5']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>
              {community.isJoined ? 'Leave' : 'Join'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
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
function CommunityHomeScreen() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function fetchCommunities() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/communities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Community[] = await res.json();
      setCommunities(data);
    } catch {
      // Graceful fallback to mock data when backend is unavailable
      setCommunities(MOCK_COMMUNITIES);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(id: string) {
    // Optimistic update
    setCommunities(prev =>
      prev.map(c =>
        c._id === id
          ? {
              ...c,
              isJoined: !c.isJoined,
              memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1,
            }
          : c,
      ),
    );

    try {
      await fetch(`${API_BASE}/communities/${id}/join`, {method: 'POST'});
    } catch {
      // Revert optimistic update on network failure
      setCommunities(prev =>
        prev.map(c =>
          c._id === id
            ? {
                ...c,
                isJoined: !c.isJoined,
                memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1,
              }
            : c,
        ),
      );
    }
  }

  const filtered = communities
    .filter(
      c => selectedCategory === 'all' || c.category === selectedCategory,
    )
    .filter(
      c =>
        searchText.trim() === '' ||
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.category.toLowerCase().includes(searchText.toLowerCase()),
    );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header Row ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.heading}>Find your community</Text>
            <Text style={styles.headingSub}>
              Connect with people who understand what you're going through.
            </Text>
          </View>

          <View style={styles.createBtnWrap}>
            <Pressable accessibilityRole="button" accessibilityLabel="Create a community">
              <LinearGradient
                colors={['#C5DFF8', '#C8EDD5']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.createBtn}>
                <Text style={styles.createBtnText}>+ Create</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIconChar}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups"
            placeholderTextColor="rgba(45,45,58,0.5)"
            value={searchText}
            onChangeText={setSearchText}
            accessibilityLabel="Search groups"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── Category Filter Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}>
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.chip, isActive && styles.chipActive]}
                accessibilityRole="button"
                accessibilityLabel={cat.label}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── All Communities ── */}
        <View style={styles.communitiesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderText}>ALL COMMUNITIES</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              color="#2D2D3A"
              size="large"
              style={styles.loader}
            />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No communities found.</Text>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {filtered.map(community => (
                <CommunityCard
                  key={community._id}
                  community={community}
                  onJoin={() => handleJoin(community._id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Info Banner ── */}
        <View style={styles.infoBannerWrap}>
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerEmoji}>🌱</Text>
            <Text style={styles.infoBannerText}>
              MindConnect communities are peer-support spaces. They are not a
              substitute for professional mental health care.
            </Text>
          </View>
        </View>

        {/* Bottom spacer for nav bar */}
        <View style={styles.scrollSpacer} />
      </ScrollView>

      {/* ── Fixed Bottom Navigation ── */}
      <BottomNav />
    </SafeAreaView>
  );
}

export default CommunityHomeScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D2D3A',
    letterSpacing: -0.48,
    lineHeight: 36,
  },
  headingSub: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 21,
    marginTop: 4,
  },
  createBtnWrap: {
    paddingTop: 2,
  },
  createBtn: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#C5DFF8',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D3A',
  },

  // ── Search Bar ──────────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7FB',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 0,
  },
  searchIconChar: {
    fontSize: 15,
    marginRight: 8,
    color: '#A0A0B8',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#2D2D3A',
    padding: 0,
  },
  searchClear: {
    fontSize: 13,
    color: '#A0A0B8',
    paddingLeft: 8,
  },

  // ── Category Chips ──────────────────────────────────────────────────────────
  chipsScroll: {
    // Negative margins to break out of parent 20px padding
    marginHorizontal: -20,
    marginTop: 20,
    marginBottom: 0,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
  },
  chipActive: {
    backgroundColor: '#2D2D3A',
    borderColor: '#2D2D3A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B80',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // ── Communities Section ──────────────────────────────────────────────────────
  communitiesSection: {
    paddingTop: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B80',
    letterSpacing: 0.65,
  },
  loader: {
    marginTop: 40,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B6B80',
    fontWeight: '500',
  },
  cardsList: {
    gap: 14,
  },

  // ── Community Card ───────────────────────────────────────────────────────────
  card: {
    borderRadius: 20,
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
    gap: 12,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  emojiText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B6B80',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D2D3A',
    lineHeight: 18,
    marginTop: 3,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 17,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1.64,
    borderTopColor: '#E8E8F0',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.64,
    borderColor: '#FFFFFF',
  },
  memberCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A0B8',
    marginLeft: 6,
  },
  joinBtn: {
    borderRadius: 17,
    paddingHorizontal: 16,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 59,
    shadowColor: '#C5DFF8',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 2,
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D3A',
    textAlign: 'center',
  },

  // ── Info Banner ──────────────────────────────────────────────────────────────
  infoBannerWrap: {
    paddingTop: 32,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F7F7FB',
    borderWidth: 1.64,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  infoBannerEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B80',
    lineHeight: 18,
  },
  scrollSpacer: {
    height: 24,
  },

  // ── Bottom Navigation ────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.64,
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
  navIcon: {
    fontSize: 19,
    color: '#A0A0B8',
  },
  navIconActive: {
    color: '#2D2D3A',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A0A0B8',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  navLabelActive: {
    fontWeight: '800',
    color: '#2D2D3A',
  },
});
