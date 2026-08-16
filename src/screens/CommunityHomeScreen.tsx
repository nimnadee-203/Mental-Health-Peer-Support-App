import React, {useState} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STORIES = [
  {id: '1', name: 'You', initial: '+', color: '#A78BFA', isAdd: true},
  {id: '2', name: 'Priya', initial: 'P', color: '#8B5CF6'},
  {id: '3', name: 'Alex', initial: 'A', color: '#6366F1'},
  {id: '4', name: 'Sam', initial: 'S', color: '#EC4899'},
  {id: '5', name: 'Jordan', initial: 'J', color: '#14B8A6'},
  {id: '6', name: 'River', initial: 'R', color: '#F59E0B'},
];

const CATEGORIES = [
  {id: 'all', label: 'All'},
  {id: 'anxiety', label: 'Anxiety'},
  {id: 'depression', label: 'Depression'},
  {id: 'recovery', label: 'Recovery'},
  {id: 'mindfulness', label: 'Mindfulness'},
  {id: 'grief', label: 'Grief'},
  {id: 'ptsd', label: 'PTSD'},
];

const ONLINE_MEMBERS = [
  {id: '1', name: 'Mia', initial: 'M', color: '#8B5CF6'},
  {id: '2', name: 'Leo', initial: 'L', color: '#6366F1'},
  {id: '3', name: 'Zara', initial: 'Z', color: '#EC4899'},
  {id: '4', name: 'Dev', initial: 'D', color: '#14B8A6'},
  {id: '5', name: 'Nina', initial: 'N', color: '#F59E0B'},
];

const TRENDING = [
  {id: '1', tag: '#AnxietyTips', posts: '1.2k posts'},
  {id: '2', tag: '#MorningMindset', posts: '890 posts'},
  {id: '3', tag: '#HealingJourney', posts: '654 posts'},
];

const FEED_POSTS = [
  {
    id: '1',
    author: 'Maya R.',
    initial: 'M',
    color: '#8B5CF6',
    time: '12 min ago',
    category: 'Recovery',
    categoryColor: '#10B981',
    title: 'A small win today 🌱',
    body: 'I went for a short walk after a really hard morning. It was not perfect, but it helped me breathe a little easier. Progress over perfection.',
    supports: 48,
    replies: 12,
    supported: false,
  },
  {
    id: '2',
    author: 'Alex K.',
    initial: 'A',
    color: '#6366F1',
    time: '1 hr ago',
    category: 'Anxiety',
    categoryColor: '#F59E0B',
    title: 'How I manage panic attacks at work',
    body: 'I have been dealing with workplace anxiety for 2 years. Here are the 3 techniques that genuinely helped me stay grounded during high-pressure moments...',
    supports: 127,
    replies: 34,
    supported: true,
  },
  {
    id: '3',
    author: 'Sam T.',
    initial: 'S',
    color: '#EC4899',
    time: '3 hr ago',
    category: 'Mindfulness',
    categoryColor: '#6366F1',
    title: 'Daily gratitude changed my perspective',
    body: 'Three months of writing just three things I am grateful for each morning. The shift in how I see my days has been incredible. Would love to hear your experience.',
    supports: 89,
    replies: 21,
    supported: false,
  },
  {
    id: '4',
    author: 'Jordan M.',
    initial: 'J',
    color: '#14B8A6',
    time: '5 hr ago',
    category: 'Depression',
    categoryColor: '#EC4899',
    title: 'Some days just getting out of bed is enough',
    body: 'Reminder to anyone who needs it: surviving a hard day is an achievement. Be gentle with yourself. You are doing better than you think.',
    supports: 214,
    replies: 56,
    supported: false,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StoryItem({item}: {item: (typeof STORIES)[0]}) {
  return (
    <Pressable style={styles.storyItem}>
      <View
        style={[
          styles.storyRing,
          item.isAdd ? styles.storyRingAdd : styles.storyRingActive,
        ]}>
        <View style={[styles.storyAvatar, {backgroundColor: item.color}]}>
          <Text style={styles.storyInitial}>{item.initial}</Text>
        </View>
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  );
}

function CategoryChip({
  item,
  isSelected,
  onPress,
}: {
  item: (typeof CATEGORIES)[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}>
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function OnlineMember({item}: {item: (typeof ONLINE_MEMBERS)[0]}) {
  return (
    <View style={styles.onlineMember}>
      <View style={[styles.onlineAvatar, {backgroundColor: item.color}]}>
        <Text style={styles.onlineInitial}>{item.initial}</Text>
      </View>
      <View style={styles.onlineDot} />
    </View>
  );
}

function PostCard({
  post,
  onSupport,
}: {
  post: (typeof FEED_POSTS)[0];
  onSupport: () => void;
}) {
  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={[styles.postAvatar, {backgroundColor: post.color}]}>
          <Text style={styles.postAvatarText}>{post.initial}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
        <View
          style={[
            styles.categoryBadge,
            {backgroundColor: post.categoryColor + '22'},
          ]}>
          <Text style={[styles.categoryBadgeText, {color: post.categoryColor}]}>
            {post.category}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postBody} numberOfLines={3}>
        {post.body}
      </Text>

      {/* Post Footer */}
      <View style={styles.postFooter}>
        <Pressable
          onPress={onSupport}
          style={[styles.actionBtn, post.supported && styles.actionBtnActive]}>
          <Text style={[styles.actionIcon, post.supported && {color: '#8B5CF6'}]}>
            💜
          </Text>
          <Text
            style={[
              styles.actionText,
              post.supported && styles.actionTextActive,
            ]}>
            {post.supports} Support
          </Text>
        </Pressable>

        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{post.replies} Reply</Text>
        </Pressable>

        <Pressable style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

function CommunityHomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState(FEED_POSTS);

  const filteredPosts =
    selectedCategory === 'all'
      ? posts
      : posts.filter(
          p => p.category.toLowerCase() === selectedCategory.toLowerCase(),
        );

  const handleSupport = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              supported: !p.supported,
              supports: p.supported ? p.supports - 1 : p.supports + 1,
            }
          : p,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1E0A3C" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Welcome back 👋</Text>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge} />
          </Pressable>
          <View style={styles.myAvatar}>
            <Text style={styles.myAvatarText}>P</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Search Bar ── */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions, topics…"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── Stories Strip ── */}
        <Text style={styles.sectionLabel}>Stories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesScroll}
          contentContainerStyle={styles.storiesContent}>
          {STORIES.map(item => (
            <StoryItem key={item.id} item={item} />
          ))}
        </ScrollView>

        {/* ── Category Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}>
          {CATEGORIES.map(item => (
            <CategoryChip
              key={item.id}
              item={item}
              isSelected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
            />
          ))}
        </ScrollView>

        {/* ── Featured / Pinned Post ── */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>📌 Featured</Text>
          </View>
          <Text style={styles.featuredTitle}>
            You are not alone in this journey
          </Text>
          <Text style={styles.featuredBody}>
            This community is a safe space built by people who understand what
            you are going through. Share freely, listen kindly.
          </Text>
          <Pressable style={styles.featuredBtn}>
            <Text style={styles.featuredBtnText}>Read Community Guidelines →</Text>
          </Pressable>
        </View>

        {/* ── Online Members ── */}
        <View style={styles.onlineSection}>
          <View style={styles.onlineHeader}>
            <View style={styles.onlineLiveDot} />
            <Text style={styles.onlineTitle}>Online Now</Text>
            <Text style={styles.onlineCount}>• {ONLINE_MEMBERS.length} members</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.onlineList}>
            {ONLINE_MEMBERS.map(m => (
              <OnlineMember key={m.id} item={m} />
            ))}
            <Pressable style={styles.onlineMore}>
              <Text style={styles.onlineMoreText}>+12</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* ── Trending Topics ── */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionLabel}>🔥 Trending Topics</Text>
          <View style={styles.trendingList}>
            {TRENDING.map((t, idx) => (
              <Pressable key={t.id} style={styles.trendingItem}>
                <Text style={styles.trendingRank}>{idx + 1}</Text>
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingTag}>{t.tag}</Text>
                  <Text style={styles.trendingPosts}>{t.posts}</Text>
                </View>
                <Text style={styles.trendingArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Discussion Feed ── */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.sectionLabel}>💬 Discussion Feed</Text>
            <Text style={styles.feedCount}>{filteredPosts.length} posts</Text>
          </View>

          {filteredPosts.length === 0 ? (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyEmoji}>🌿</Text>
              <Text style={styles.emptyText}>
                No posts in this category yet.{'\n'}Be the first to share!
              </Text>
            </View>
          ) : (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onSupport={() => handleSupport(post.id)}
              />
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Floating Action Button ── */}
      <Pressable style={styles.fab}>
        <Text style={styles.fabIcon}>✏️</Text>
        <Text style={styles.fabText}>Post</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F0520',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#1E0A3C',
  },
  headerSub: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    fontSize: 18,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899',
    borderWidth: 1.5,
    borderColor: '#2D1B4E',
  },
  myAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  myAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  searchClear: {
    color: '#9CA3AF',
    fontSize: 14,
    paddingLeft: 8,
  },

  // Section label
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Stories
  storiesScroll: {
    marginBottom: 20,
  },
  storiesContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 62,
  },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  storyRingActive: {
    borderWidth: 2.5,
    borderColor: '#7C3AED',
  },
  storyRingAdd: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  storyName: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: 60,
  },

  // Category chips
  chipsScroll: {
    marginBottom: 20,
  },
  chipsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },

  // Featured card
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#1E0A3C',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredBadge: {
    backgroundColor: '#7C3AED33',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  featuredBody: {
    color: '#C4B5FD',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  featuredBtn: {
    alignSelf: 'flex-start',
  },
  featuredBtnText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '700',
  },

  // Online members
  onlineSection: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  onlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  onlineLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  onlineCount: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  onlineList: {
    gap: 10,
    alignItems: 'center',
  },
  onlineMember: {
    position: 'relative',
  },
  onlineAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineMore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineMoreText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '800',
  },

  // Trending
  trendingSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  trendingList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  trendingRank: {
    width: 24,
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
    marginRight: 12,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTag: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  trendingPosts: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  trendingArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },

  // Feed
  feedSection: {
    marginHorizontal: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  feedCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginRight: 20,
    marginBottom: 12,
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Post card
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  postAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  postMeta: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  categoryBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  postBody: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    marginBottom: 14,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  actionBtnActive: {
    backgroundColor: '#EDE9FE',
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  actionTextActive: {
    color: '#7C3AED',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 18,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  bottomSpacer: {
    height: 20,
  },
});

export default CommunityHomeScreen;
