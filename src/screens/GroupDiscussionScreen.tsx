import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';

import { COMMUNITY_API_BASE } from '../config/api';
import ReportModal from '../components/ReportModal';

const REQUEST_TIMEOUT_MS = 10000;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Community {
  _id: string;
  name: string;
  category: string;
  emoji: string;
  bgColor: string;
  description: string;
  guidelines: string;
  memberCount: number;
  memberAvatarColors: string[];
  isJoined: boolean;
}

export interface Post {
  _id: string;
  groupId: string;
  content: string;
  topic: string;
  contentNote: string;
  isAnonymous: boolean;
  authorName: string;
  authorId?: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
  imageUrl?: string;
}

interface TeamMember {
  _id: string;
  fullName: string;
  role: string;
}

interface CommunityTeam {
  moderators: TeamMember[];
  professionals: TeamMember[];
}

interface GroupDiscussionScreenProps {
  community: Community;
  onBack: () => void;
  onCreatePost: (community: Community) => void;
  onSelectFeeling: (community: Community) => void;
  onPostPress: (post: Post) => void;
  onOpenEmergencySupport?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

const AVATAR_PALETTE = [
  ['#E8D5F5', '#9B59B6'],
  ['#D5E8F5', '#2980B9'],
  ['#D5F5E3', '#27AE60'],
  ['#F5E8D5', '#E67E22'],
  ['#F5D5D5', '#E74C3C'],
  ['#D5F5F5', '#16A085'],
];

function getInitials(name: string) {
  return (name || 'AN')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColors(name: string): [string, string] {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx] as [string, string];
}

// ─── MemberAvatar ─────────────────────────────────────────────────────────────
function MemberAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const [bg, fg] = getAvatarColors(name);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.34, fontWeight: '800', color: fg }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

// ─── TeamMemberCard ───────────────────────────────────────────────────────────
function TeamMemberCard({ member, type }: { member: TeamMember; type: 'moderator' | 'professional' }) {
  const isMod = type === 'moderator';
  return (
    <View style={teamStyles.card}>
      <View style={teamStyles.avatarWrap}>
        <MemberAvatar name={member.fullName} size={46} />
        <View style={[teamStyles.badge, isMod ? teamStyles.badgeMod : teamStyles.badgePro]}>
          <Text style={{ fontSize: 9 }}>{isMod ? '🛡️' : '⭐'}</Text>
        </View>
      </View>
      <View style={teamStyles.info}>
        <Text style={teamStyles.name} numberOfLines={1}>{member.fullName}</Text>
        <Text style={[teamStyles.role, isMod ? teamStyles.roleMod : teamStyles.rolePro]}>
          {isMod ? 'Moderator' : 'Professional'}
        </Text>
      </View>
      <View style={[teamStyles.tag, isMod ? teamStyles.tagMod : teamStyles.tagPro]}>
        <Text style={[teamStyles.tagText, isMod ? teamStyles.tagTextMod : teamStyles.tagTextPro]}>
          {isMod ? 'Mod' : 'Pro'}
        </Text>
      </View>
    </View>
  );
}

const teamStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEEF8',
    gap: 12,
    shadowColor: '#7C67D6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FAFBFF',
  },
  badgeMod: { backgroundColor: '#EEE8FA' },
  badgePro: { backgroundColor: '#EEF4FF' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  role: { fontSize: 11, fontWeight: '600' },
  roleMod: { color: '#7C67D6' },
  rolePro: { color: '#2673FF' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagMod: { backgroundColor: '#EEE8FA' },
  tagPro: { backgroundColor: '#EEF4FF' },
  tagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  tagTextMod: { color: '#7C67D6' },
  tagTextPro: { color: '#2673FF' },
});

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({
  post,
  isLiked,
  onLike,
  onPress,
  onReport,
}: {
  post: Post;
  isLiked: boolean;
  onLike: () => void;
  onPress: () => void;
  onReport: () => void;
}) {
  const [bg, fg] = getAvatarColors(post.authorName);
  return (
    <Pressable style={postStyles.card} onPress={onPress}>
      <View style={postStyles.header}>
        <View style={[postStyles.avatar, { backgroundColor: bg }]}>
          <Text style={[postStyles.avatarText, { color: fg }]}>{getInitials(post.authorName)}</Text>
        </View>
        <View style={postStyles.meta}>
          <Text style={postStyles.author}>{post.authorName}</Text>
          <View style={postStyles.metaRow}>
            <Text style={postStyles.time}>{timeAgo(post.createdAt)}</Text>
            {post.topic ? (
              <>
                <View style={postStyles.metaDot} />
                <View style={postStyles.topicPill}>
                  <Text style={postStyles.topicText}>{post.topic}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
        <Pressable
          style={postStyles.menuBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={e => { e?.stopPropagation?.(); onReport(); }}
        >
          <View style={postStyles.menuDot} />
          <View style={postStyles.menuDot} />
          <View style={postStyles.menuDot} />
        </Pressable>
      </View>
      <View style={postStyles.body}>
        <Text style={postStyles.content}>{post.content}</Text>
        {post.imageUrl && (
          post.imageUrl.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? (
            <Video source={{ uri: post.imageUrl }} style={postStyles.media} useNativeControls resizeMode={ResizeMode.COVER} isLooping />
          ) : (
            <Image source={{ uri: post.imageUrl }} style={postStyles.media} resizeMode="cover" />
          )
        )}
      </View>
      {(post.likes > 0 || post.commentsCount > 0) && (
        <View style={postStyles.engagement}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {post.likes > 0 && <Text style={{ fontSize: 13 }}>💛</Text>}
            {post.commentsCount > 0 && <Text style={{ fontSize: 13 }}>💬</Text>}
            {post.likes > 0 && (
              <Text style={postStyles.engagementText}>{post.likes} {post.likes === 1 ? 'support' : 'supports'}</Text>
            )}
          </View>
          {post.commentsCount > 0 && (
            <Text style={postStyles.engagementText}>{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</Text>
          )}
        </View>
      )}
      <View style={postStyles.actions}>
        <Pressable
          style={[postStyles.actionBtn, isLiked && postStyles.actionBtnActive]}
          onPress={e => { e?.stopPropagation?.(); onLike(); }}
        >
          <Text style={postStyles.actionEmoji}>{isLiked ? '💛' : '🤍'}</Text>
          <Text style={[postStyles.actionLabel, isLiked && postStyles.actionLabelActive]}>{isLiked ? 'Supported' : 'Support'}</Text>
        </Pressable>
        <View style={postStyles.actionSep} />
        <Pressable style={postStyles.actionBtn} onPress={onPress}>
          <Text style={postStyles.actionEmoji}>💬</Text>
          <Text style={postStyles.actionLabel}>Comment</Text>
        </Pressable>
        <View style={postStyles.actionSep} />
        <Pressable style={postStyles.actionBtn}>
          <Text style={postStyles.actionEmoji}>🔗</Text>
          <Text style={postStyles.actionLabel}>Share</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const postStyles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', marginBottom: 10, shadowColor: '#0A0A1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  meta: { flex: 1 },
  author: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { fontSize: 11, color: '#A0A0B8', fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D0D0E0' },
  topicPill: { backgroundColor: '#F0F1F8', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  topicText: { fontSize: 10, fontWeight: '700', color: '#7878A0', letterSpacing: 0.2 },
  menuBtn: { flexDirection: 'column', alignItems: 'center', gap: 3, padding: 6 },
  menuDot: { width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: '#ACACC0' },
  body: { paddingHorizontal: 16, paddingBottom: 12 },
  content: { fontSize: 15, lineHeight: 24, color: '#2D2D3A', fontWeight: '400' },
  media: { width: '100%', height: 220, borderRadius: 14, marginTop: 12 },
  engagement: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  engagementText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#F2F3F8', paddingHorizontal: 4, paddingVertical: 2 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  actionBtnActive: { backgroundColor: '#FFFBEB' },
  actionEmoji: { fontSize: 16 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  actionLabelActive: { color: '#D97706' },
  actionSep: { width: 1, height: 24, backgroundColor: '#F0F1F8', alignSelf: 'center' },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GroupDiscussionScreen({
  community,
  onBack,
  onCreatePost,
  onSelectFeeling,
  onPostPress,
  onOpenEmergencySupport,
}: GroupDiscussionScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [team, setTeam] = useState<CommunityTeam>({ moderators: [], professionals: [] });
  const [teamLoading, setTeamLoading] = useState(true);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [showFullAbout, setShowFullAbout] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const encodedGroupId = encodeURIComponent(community._id);
      const response = await fetch(`${COMMUNITY_API_BASE}/posts/group/${encodedGroupId}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setLoadError('Could not load posts. Check the backend and try again.');
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [community._id]);

  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const res = await fetch(`${COMMUNITY_API_BASE}/communities/team`);
      if (!res.ok) throw new Error('Failed to fetch team');
      const data: CommunityTeam = await res.json();
      setTeam(data);
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTeam();
  }, [fetchPosts, fetchTeam]);

  const handleLike = async (postId: string) => {
    const alreadyLiked = likedPostIds.includes(postId);
    setLikedPostIds(prev => alreadyLiked ? prev.filter(id => id !== postId) : [...prev, postId]);
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: alreadyLiked ? Math.max(0, p.likes - 1) : p.likes + 1 } : p));
    try {
      const res = await fetch(`${COMMUNITY_API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'mock-user-1' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(prev => prev.map(p => (p._id === postId ? { ...p, likes: updated.likes } : p)));
      }
    } catch {
      setLikedPostIds(prev => alreadyLiked ? [...prev, postId] : prev.filter(id => id !== postId));
    }
  };

  const handleReportAction = (action: 'hide' | 'block' | 'none', post: Post) => {
    if (action === 'hide') setHiddenPostIds(prev => [...prev, post._id]);
    else if (action === 'block') {
      setHiddenPostIds(prev => [...prev, post._id]);
      if (post.authorName && !blockedAuthors.includes(post.authorName))
        setBlockedAuthors(prev => [...prev, post.authorName]);
    }
  };

  const unhidePost = (postId: string) => setHiddenPostIds(prev => prev.filter(id => id !== postId));

  const visiblePosts = posts.filter(p => !blockedAuthors.includes(p.authorName));
  const bannerColor = community.bgColor || '#E8F4FD';
  const hasTeam = !teamLoading && (team.moderators.length > 0 || team.professionals.length > 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={bannerColor} />

      {/* STICKY HEADER */}
      <View style={[styles.stickyHeader, { backgroundColor: bannerColor }]}>
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.stickyTitle} numberOfLines={1}>{community.name}</Text>
        <View style={styles.stickyEmoji}><Text style={{ fontSize: 18 }}>{community.emoji}</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* COVER */}
        <View style={[styles.cover, { backgroundColor: bannerColor }]}>
          <View style={styles.coverCircle1} /><View style={styles.coverCircle2} /><View style={styles.coverCircle3} />
          <View style={styles.coverEmojiRing}><Text style={styles.coverEmoji}>{community.emoji}</Text></View>
        </View>

        {/* GROUP IDENTITY */}
        <View style={styles.identityBlock}>
          <View style={styles.categoryPill}><Text style={styles.categoryText}>{community.category.toUpperCase()}</Text></View>
          <Text style={styles.groupName}>{community.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.avatarStack}>
              {community.memberAvatarColors.slice(0, 4).map((color, i) => (
                <View key={i} style={[styles.stackAvatar, { backgroundColor: color, marginLeft: i === 0 ? 0 : -10 }]} />
              ))}
            </View>
            <Text style={styles.memberCount}>{community.memberCount.toLocaleString()} members</Text>
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activeLabel}>Active today</Text>
            </View>
          </View>
        </View>

        {/* ABOUT */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: '#EEF4FF' }]}><Text style={styles.cardIcon}>ℹ️</Text></View>
            <Text style={styles.cardTitle}>About</Text>
          </View>
          <Text style={styles.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
            {community.description || 'A supportive community for people who want to share and grow together.'}
          </Text>
          <Pressable onPress={() => setShowFullAbout(v => !v)}>
            <Text style={styles.seeMoreBtn}>{showFullAbout ? 'See less ▲' : 'See more ▼'}</Text>
          </Pressable>
          <View style={styles.pinnedRule}>
            <Text style={{ fontSize: 16 }}>📌</Text>
            <Text style={styles.pinnedRuleText}>Be kind and respectful. All posts here are anonymous by default.</Text>
          </View>
        </View>

        {/* COMMUNITY TEAM */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: '#F0EBF8' }]}><Text style={styles.cardIcon}>👥</Text></View>
            <Text style={styles.cardTitle}>Community Team</Text>
          </View>
          {teamLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
              <ActivityIndicator size="small" color="#AA96DA" />
              <Text style={{ fontSize: 13, color: '#A0A0B8', fontWeight: '500' }}>Loading team…</Text>
            </View>
          ) : !hasTeam ? (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#A0A0B8', fontWeight: '500' }}>No team members assigned yet.</Text>
            </View>
          ) : (
            <>
              {team.moderators.length > 0 && (
                <>
                  <View style={styles.teamSectionLabel}>
                    <View style={[styles.teamLabelDot, { backgroundColor: '#7C67D6' }]} />
                    <Text style={[styles.teamLabelText, { color: '#7C67D6' }]}>MODERATORS</Text>
                  </View>
                  {team.moderators.map(m => <TeamMemberCard key={m._id} member={m} type="moderator" />)}
                </>
              )}
              {team.professionals.length > 0 && (
                <>
                  <View style={[styles.teamSectionLabel, team.moderators.length > 0 && { marginTop: 8 }]}>
                    <View style={[styles.teamLabelDot, { backgroundColor: '#2673FF' }]} />
                    <Text style={[styles.teamLabelText, { color: '#2673FF' }]}>PROFESSIONALS</Text>
                  </View>
                  {team.professionals.map(m => <TeamMemberCard key={m._id} member={m} type="professional" />)}
                </>
              )}
            </>
          )}
        </View>

        {/* CREATE A POST — updated: no Photo, Feeling → mood picker */}
        <View style={styles.createCard}>
          <View style={styles.createTop}>
            <View style={styles.createAvatar}><Text style={{ fontSize: 20 }}>😊</Text></View>
            <Pressable style={styles.createInputArea} onPress={() => onCreatePost(community)}>
              <Text style={styles.createPlaceholder}>Share something with the group…</Text>
            </Pressable>
          </View>
          <View style={styles.createDivider} />
          <View style={styles.createActions}>
            {/* Feeling → opens mood picker */}
            <Pressable style={styles.createAction} onPress={() => onSelectFeeling(community)}>
              <Text style={styles.createActionIcon}>🎭</Text>
              <Text style={styles.createActionLabel}>Feeling</Text>
            </Pressable>
            {/* Write Post → opens post form */}
            <Pressable style={[styles.createAction, styles.createActionPrimary]} onPress={() => onCreatePost(community)}>
              <Text style={styles.createActionIcon}>✏️</Text>
              <Text style={[styles.createActionLabel, styles.createActionLabelPrimary]}>Write Post</Text>
            </Pressable>
          </View>
        </View>

        {/* POSTS FEED */}
        <View style={styles.feedDivider}>
          <View style={styles.feedDividerLine} />
          <Text style={styles.feedDividerText}>POSTS</Text>
          <View style={styles.feedDividerLine} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#AA96DA" />
            <Text style={styles.centeredText}>Loading posts…</Text>
          </View>
        ) : loadError ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxEmoji}>📡</Text>
            <Text style={styles.emptyBoxTitle}>Connection Issue</Text>
            <Text style={styles.emptyBoxBody}>{loadError}</Text>
            <Pressable style={styles.emptyBoxBtn} onPress={fetchPosts}>
              <Text style={styles.emptyBoxBtnText}>Try Again</Text>
            </Pressable>
          </View>
        ) : visiblePosts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxEmoji}>🌱</Text>
            <Text style={styles.emptyBoxTitle}>Be the first to post!</Text>
            <Text style={styles.emptyBoxBody}>This community is just getting started. Share something kind.</Text>
            <Pressable style={styles.emptyBoxBtn} onPress={() => onCreatePost(community)}>
              <Text style={styles.emptyBoxBtnText}>+ Write a Post</Text>
            </Pressable>
          </View>
        ) : (
          visiblePosts.map(post => {
            if (hiddenPostIds.includes(post._id)) {
              return (
                <View key={post._id} style={styles.hiddenCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>🙈</Text>
                    <Text style={styles.hiddenText}>Post hidden</Text>
                  </View>
                  <Pressable style={styles.undoBtn} onPress={() => unhidePost(post._id)}>
                    <Text style={styles.undoBtnText}>Undo</Text>
                  </Pressable>
                </View>
              );
            }
            return (
              <PostCard
                key={post._id}
                post={post}
                isLiked={likedPostIds.includes(post._id)}
                onLike={() => handleLike(post._id)}
                onPress={() => onPostPress(post)}
                onReport={() => setReportingPost(post)}
              />
            );
          })
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {reportingPost && (
        <ReportModal
          visible={!!reportingPost}
          targetType="Post"
          targetId={reportingPost._id}
          targetAuthorName={reportingPost.authorName}
          targetContentSnippet={reportingPost.content}
          groupId={community._id}
          onClose={() => setReportingPost(null)}
          onReportSuccess={action => handleReportAction(action, reportingPost)}
          onOpenEmergencySupport={onOpenEmergencySupport}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F1F8' },
  stickyHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: '#1A1A2E', fontWeight: '700' },
  stickyTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
  stickyEmoji: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  cover: { height: 170, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coverCircle1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.16)', top: -80, right: -60 },
  coverCircle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.12)', bottom: -50, left: -40 },
  coverCircle3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.10)', top: 20, left: 40 },
  coverEmojiRing: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.60)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6 },
  coverEmoji: { fontSize: 50 },
  identityBlock: { backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 20, paddingBottom: 18, marginBottom: 10 },
  categoryPill: { alignSelf: 'flex-start', backgroundColor: '#EEEEFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  categoryText: { fontSize: 10, fontWeight: '800', color: '#5A5AD8', letterSpacing: 0.8 },
  groupName: { fontSize: 24, fontWeight: '900', color: '#0D0D1A', lineHeight: 32, marginBottom: 14, letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#FFFFFF' },
  memberCount: { fontSize: 13, fontWeight: '600', color: '#5A5A72' },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ECFDF5', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  activeLabel: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  card: { backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 18, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconBg: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.2 },
  aboutText: { fontSize: 14, lineHeight: 23, color: '#4A4A65', fontWeight: '400' },
  seeMoreBtn: { fontSize: 13, fontWeight: '700', color: '#5A5AD8', marginTop: 8 },
  pinnedRule: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8F5FF', borderRadius: 12, padding: 14, gap: 10, marginTop: 16, borderWidth: 1, borderColor: '#E4DAFF' },
  pinnedRuleText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '500', color: '#5A3A9A' },
  teamSectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  teamLabelDot: { width: 6, height: 6, borderRadius: 3 },
  teamLabelText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  // Create post — 2 actions only
  createCard: { backgroundColor: '#FFFFFF', paddingTop: 16, marginBottom: 10 },
  createTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, marginBottom: 14 },
  createAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C8E6FA', alignItems: 'center', justifyContent: 'center' },
  createInputArea: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#F2F3F8', paddingHorizontal: 18, justifyContent: 'center', borderWidth: 1.5, borderColor: '#E8EAEF' },
  createPlaceholder: { fontSize: 14, color: '#ACACC0', fontWeight: '500' },
  createDivider: { height: 1, backgroundColor: '#F2F3F8' },
  createActions: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8, gap: 4 },
  createAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  createActionPrimary: { backgroundColor: '#EEEEFF' },
  createActionIcon: { fontSize: 15 },
  createActionLabel: { fontSize: 12, fontWeight: '600', color: '#6B6B80' },
  createActionLabelPrimary: { color: '#5A5AD8', fontWeight: '700' },
  feedDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  feedDividerLine: { flex: 1, height: 1, backgroundColor: '#E0E1EC' },
  feedDividerText: { fontSize: 11, fontWeight: '800', color: '#A0A0B8', letterSpacing: 1.2 },
  centered: { alignItems: 'center', paddingVertical: 48, gap: 12, backgroundColor: '#FFFFFF', marginBottom: 10 },
  centeredText: { fontSize: 14, color: '#A0A0B8', fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, backgroundColor: '#FFFFFF', marginBottom: 10 },
  emptyBoxEmoji: { fontSize: 52, marginBottom: 14 },
  emptyBoxTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 8, textAlign: 'center', letterSpacing: -0.2 },
  emptyBoxBody: { fontSize: 14, color: '#8A8A9E', lineHeight: 21, textAlign: 'center', marginBottom: 24 },
  emptyBoxBtn: { backgroundColor: '#EEEEFF', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 28 },
  emptyBoxBtnText: { color: '#5A5AD8', fontSize: 14, fontWeight: '800' },
  hiddenCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FB', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10 },
  hiddenText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  undoBtn: { paddingVertical: 5, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4C9F5', borderRadius: 20 },
  undoBtnText: { fontSize: 12, fontWeight: '700', color: '#7C67D6' },
});
