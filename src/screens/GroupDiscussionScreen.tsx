import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { COMMUNITY_API_BASE } from '../config/api';
import ReportModal from '../components/ReportModal';
import SharePostModal from '../components/SharePostModal';
import { getAuthUserId } from '../api/authStore';

const REQUEST_TIMEOUT_MS = 10000;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Community {
  _id: string;
  name: string;
  category: string;
  topics?: string[];
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
  likedBy?: string[];
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
  return `${Math.floor(diffInHours / 24)}d ago`;
}

const AVATAR_PALETTE: [string, string][] = [
  ['#E8D5F5', '#7B2D8B'],
  ['#D5E8F5', '#1A6FAE'],
  ['#D5F5E3', '#1A7A3C'],
  ['#F5E8D5', '#B8621A'],
  ['#F5D5D5', '#B81A1A'],
  ['#D5F5F5', '#0E6E6E'],
];

function getInitials(name: string) {
  return (name || 'AN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColors(name: string): [string, string] {
  return AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const [bg, fg] = getAvatarColors(name);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35, fontWeight: '800', color: fg }}>{getInitials(name)}</Text>
    </View>
  );
}

// ─── TeamMemberCard ───────────────────────────────────────────────────────────
function TeamMemberCard({ member, type }: { member: TeamMember; type: 'moderator' | 'professional' }) {
  const isMod = type === 'moderator';
  return (
    <View style={teamSt.card}>
      <View style={teamSt.avatarWrap}>
        <Avatar name={member.fullName} size={44} />
        <View style={[teamSt.roleBadge, isMod ? teamSt.roleBadgeMod : teamSt.roleBadgePro]}>
          {isMod
            ? <Feather name="shield" size={9} color="#7C67D6" />
            : <Feather name="star" size={9} color="#2673FF" />
          }
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={teamSt.name} numberOfLines={1}>{member.fullName}</Text>
        <Text style={[teamSt.role, isMod ? teamSt.roleMod : teamSt.rolePro]}>
          {isMod ? 'Moderator' : 'Professional'}
        </Text>
      </View>
      <View style={[teamSt.tag, isMod ? teamSt.tagMod : teamSt.tagPro]}>
        <Text style={[teamSt.tagText, isMod ? teamSt.tagTxtMod : teamSt.tagTxtPro]}>
          {isMod ? 'MOD' : 'PRO'}
        </Text>
      </View>
    </View>
  );
}

const teamSt = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFBFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: '#ECEEF8', gap: 12 },
  avatarWrap: { position: 'relative' },
  roleBadge: { position: 'absolute', bottom: -2, right: -2, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FAFBFF' },
  roleBadgeMod: { backgroundColor: '#EDE8FA' },
  roleBadgePro: { backgroundColor: '#E8F0FF' },
  name: { fontSize: 13, fontWeight: '700', color: '#0D0D1A', marginBottom: 2 },
  role: { fontSize: 11, fontWeight: '600' },
  roleMod: { color: '#7C67D6' },
  rolePro: { color: '#2673FF' },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 16 },
  tagMod: { backgroundColor: '#EDE8FA' },
  tagPro: { backgroundColor: '#E8F0FF' },
  tagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  tagTxtMod: { color: '#7C67D6' },
  tagTxtPro: { color: '#2673FF' },
});

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, isLiked, onLike, onPress, onReport, onShare }: {
  post: Post; isLiked: boolean; onLike: () => void; onPress: () => void; onReport: () => void; onShare: () => void;
}) {
  const [bg, fg] = getAvatarColors(post.authorName);
  // Show real name only when NOT anonymous, else show 'Anonymous'
  const displayName = post.isAnonymous ? 'Anonymous' : post.authorName;
  const showRealName = !post.isAnonymous && post.authorName && post.authorName !== 'Member';

  return (
    <Pressable style={postSt.card} onPress={onPress}>
      {/* Header */}
      <View style={postSt.header}>
        <View style={postSt.avatarCol}>
          {showRealName
            ? <Avatar name={post.authorName} size={40} />
            : (
              <View style={[postSt.anonAvatar]}>
                <Feather name="user" size={18} color="#9CA3AF" />
              </View>
            )
          }
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={postSt.authorName}>{displayName}</Text>
            {post.isAnonymous && (
              <View style={postSt.anonBadge}>
                <Feather name="eye-off" size={9} color="#9CA3AF" />
                <Text style={postSt.anonBadgeText}>Anonymous</Text>
              </View>
            )}
          </View>
          <View style={postSt.metaRow}>
            <Feather name="clock" size={10} color="#C0C0D4" />
            <Text style={postSt.time}>{timeAgo(post.createdAt)}</Text>
            {post.topic ? (
              <>
                <View style={postSt.metaDot} />
                <View style={postSt.topicPill}>
                  <Text style={postSt.topicText}>{post.topic}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
        <Pressable style={postSt.menuBtn} hitSlop={12} onPress={e => { e?.stopPropagation?.(); onReport(); }}>
          <Feather name="more-horizontal" size={18} color="#C0C0D4" />
        </Pressable>
      </View>

      {/* Content note warning */}
      {post.contentNote && post.contentNote !== 'None' && (
        <View style={postSt.contentNoteBar}>
          <Feather name="alert-circle" size={12} color="#D97706" />
          <Text style={postSt.contentNoteText}>{post.contentNote}</Text>
        </View>
      )}

      {/* Body */}
      <View style={postSt.body}>
        <Text style={postSt.content}>{post.content}</Text>
        {post.imageUrl && (
          post.imageUrl.match(/\.(mp4|mov|webm|avi|mkv)$/i)
            ? <Video source={{ uri: post.imageUrl }} style={postSt.media} useNativeControls resizeMode={ResizeMode.COVER} isLooping />
            : <Image source={{ uri: post.imageUrl }} style={postSt.media} resizeMode="cover" />
        )}
      </View>

      {/* Engagement summary */}
      {(post.likes > 0 || post.commentsCount > 0) && (
        <View style={postSt.engRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {post.likes > 0 && (
              <View style={postSt.engChip}>
                <Feather name="heart" size={11} color="#D97706" />
                <Text style={postSt.engText}>{post.likes}</Text>
              </View>
            )}
          </View>
          {post.commentsCount > 0 && (
            <Text style={postSt.engComments}>{post.commentsCount} comment{post.commentsCount !== 1 ? 's' : ''}</Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={postSt.actions}>
        <Pressable style={[postSt.actionBtn, isLiked && postSt.actionActive]} onPress={e => { e?.stopPropagation?.(); onLike(); }}>
          <Feather name="heart" size={16} color={isLiked ? '#D97706' : '#9CA3AF'} />
          <Text style={[postSt.actionLabel, isLiked && postSt.actionLabelActive]}>{isLiked ? 'Supported' : 'Support'}</Text>
        </Pressable>
        <View style={postSt.actionSep} />
        <Pressable style={postSt.actionBtn} onPress={onPress}>
          <Feather name="message-circle" size={16} color="#9CA3AF" />
          <Text style={postSt.actionLabel}>Comment</Text>
        </Pressable>
        <View style={postSt.actionSep} />
        <Pressable style={postSt.actionBtn} onPress={e => { e?.stopPropagation?.(); onShare(); }}>
          <Feather name="share-2" size={16} color="#9CA3AF" />
          <Text style={postSt.actionLabel}>Share</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const postSt = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', marginBottom: 10, borderRadius: 0, shadowColor: '#0A0A1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, gap: 10 },
  avatarCol: { paddingTop: 2 },
  anonAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F3F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E8EAEF', borderStyle: 'dashed' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#0D0D1A' },
  anonBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  anonBadgeText: { fontSize: 9, fontWeight: '700', color: '#9CA3AF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  time: { fontSize: 11, color: '#B0B0C8', fontWeight: '500' },
  metaDot: { width: 2.5, height: 2.5, borderRadius: 1.5, backgroundColor: '#D8D8E8' },
  topicPill: { backgroundColor: '#F0F1F8', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1.5 },
  topicText: { fontSize: 10, fontWeight: '700', color: '#8080A0', letterSpacing: 0.2 },
  menuBtn: { padding: 4, marginTop: -2 },
  contentNoteBar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FFFBEB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#FDE68A' },
  contentNoteText: { fontSize: 11, fontWeight: '600', color: '#92400E' },
  body: { paddingHorizontal: 16, paddingBottom: 12 },
  content: { fontSize: 15, lineHeight: 24, color: '#2D2D3A', fontWeight: '400' },
  media: { width: '100%', height: 220, borderRadius: 12, marginTop: 12 },
  engRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  engChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  engText: { fontSize: 12, color: '#D97706', fontWeight: '700' },
  engComments: { fontSize: 12, color: '#B0B0C8', fontWeight: '500' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#F2F3F8', paddingHorizontal: 4, paddingVertical: 2 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  actionActive: { backgroundColor: '#FFFBEB' },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  actionLabelActive: { color: '#D97706' },
  actionSep: { width: 1, height: 24, backgroundColor: '#F2F3F8', alignSelf: 'center' },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GroupDiscussionScreen({
  community, onBack, onCreatePost, onSelectFeeling, onPostPress, onOpenEmergencySupport,
}: GroupDiscussionScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [team, setTeam] = useState<CommunityTeam>({ moderators: [], professionals: [] });
  const [teamLoading, setTeamLoading] = useState(true);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [showFullAbout, setShowFullAbout] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true); setLoadError(null);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${COMMUNITY_API_BASE}/posts/group/${encodeURIComponent(community._id)}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const fetchedPosts: Post[] = await res.json();
      setPosts(fetchedPosts);
      
      const currentUserId = getAuthUserId() || 'mock-user-1';
      const initialLiked = fetchedPosts
        .filter(p => p.likedBy && p.likedBy.includes(currentUserId))
        .map(p => p._id);
      setLikedPostIds(initialLiked);
    } catch (e) {
      setLoadError('Could not load posts. Check the backend and try again.');
    } finally {
      clearTimeout(tid); setIsLoading(false);
    }
  }, [community._id]);

  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const res = await fetch(`${COMMUNITY_API_BASE}/communities/team`);
      if (res.ok) setTeam(await res.json());
    } catch { /* silent */ } finally { setTeamLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); fetchTeam(); }, [fetchPosts, fetchTeam]);

  const handleLike = async (postId: string) => {
    const liked = likedPostIds.includes(postId);
    setLikedPostIds(p => liked ? p.filter(i => i !== postId) : [...p, postId]);
    setPosts(p => p.map(x => x._id === postId ? { ...x, likes: liked ? Math.max(0, x.likes - 1) : x.likes + 1 } : x));
    try {
      const currentUserId = getAuthUserId() || 'mock-user-1';
      const r = await fetch(`${COMMUNITY_API_BASE}/posts/${postId}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUserId }) });
      if (r.ok) { const u = await r.json(); setPosts(p => p.map(x => x._id === postId ? { ...x, likes: u.likes } : x)); }
    } catch { setLikedPostIds(p => liked ? [...p, postId] : p.filter(i => i !== postId)); }
  };

  const handleReportAction = (action: 'hide' | 'block' | 'none', post: Post) => {
    if (action === 'hide') setHiddenPostIds(p => [...p, post._id]);
    else if (action === 'block') { setHiddenPostIds(p => [...p, post._id]); if (!blockedAuthors.includes(post.authorName)) setBlockedAuthors(p => [...p, post.authorName]); }
  };

  const visiblePosts = posts.filter(p => !blockedAuthors.includes(p.authorName));
  const bannerColor = community.bgColor || '#E8F4FD';
  const hasTeam = !teamLoading && (team.moderators.length > 0 || team.professionals.length > 0);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={bannerColor} />

      {/* ── STICKY HEADER ─────────────────────────────── */}
      <View style={[s.header, { backgroundColor: bannerColor }]}>
        <Pressable style={s.headerBtn} onPress={onBack} hitSlop={10}>
          <Feather name="arrow-left" size={20} color="#1A1A2E" />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{community.name}</Text>
        <View style={s.headerEmojiWrap}><Text style={{ fontSize: 18 }}>{community.emoji}</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── COVER ─────────────────────────────────────── */}
        <View style={[s.cover, { backgroundColor: bannerColor }]}>
          <View style={s.coverRing1} /><View style={s.coverRing2} />
          <View style={s.coverCircle}><Text style={{ fontSize: 48 }}>{community.emoji}</Text></View>
        </View>

        {/* ── GROUP IDENTITY ────────────────────────────── */}
        <View style={s.identityCard}>
          <View style={s.categoryBadge}>
            <Feather name="tag" size={9} color="#5A5AD8" />
            <Text style={s.categoryBadgeText}>{community.category.toUpperCase()}</Text>
          </View>
          <Text style={s.groupName}>{community.name}</Text>
          <View style={s.statsRow}>
            <View style={s.avatarStack}>
              {community.memberAvatarColors.slice(0, 4).map((c, i) => (
                <View key={i} style={[s.stackDot, { backgroundColor: c, marginLeft: i === 0 ? 0 : -8 }]} />
              ))}
            </View>
            <Text style={s.memberCount}>{community.memberCount.toLocaleString()} members</Text>
            <View style={s.activeChip}>
              <View style={s.activeDot} />
              <Text style={s.activeLabel}>Active today</Text>
            </View>
          </View>
        </View>

        {/* ── ABOUT ─────────────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#EEF4FF' }]}>
              <Feather name="info" size={15} color="#2673FF" />
            </View>
            <Text style={s.cardTitle}>About</Text>
          </View>
          <Text style={s.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
            {community.description || 'A supportive community for people who want to share and grow together.'}
          </Text>
          <Pressable onPress={() => setShowFullAbout(v => !v)}>
            <Text style={s.seeMore}>{showFullAbout ? 'See less' : 'See more'}</Text>
          </Pressable>
          <View style={s.pinnedCard}>
            <Feather name="map-pin" size={12} color="#7C3FB8" />
            <Text style={s.pinnedText}>Be kind and respectful. All posts are anonymous by default.</Text>
          </View>
        </View>

        {/* ── COMMUNITY TEAM ────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#F0EBF8' }]}>
              <Feather name="users" size={15} color="#7C67D6" />
            </View>
            <Text style={s.cardTitle}>Community Team</Text>
          </View>
          {teamLoading ? (
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color="#AA96DA" />
              <Text style={{ fontSize: 13, color: '#A0A0B8' }}>Loading…</Text>
            </View>
          ) : !hasTeam ? (
            <Text style={{ fontSize: 13, color: '#A0A0B8', paddingVertical: 8 }}>No team members assigned yet.</Text>
          ) : (
            <>
              {team.moderators.length > 0 && (
                <>
                  <View style={s.teamLabel}>
                    <Feather name="shield" size={10} color="#7C67D6" />
                    <Text style={[s.teamLabelText, { color: '#7C67D6' }]}>MODERATORS</Text>
                  </View>
                  {team.moderators.map(m => <TeamMemberCard key={m._id} member={m} type="moderator" />)}
                </>
              )}
              {team.professionals.length > 0 && (
                <>
                  <View style={[s.teamLabel, team.moderators.length > 0 && { marginTop: 10 }]}>
                    <Feather name="star" size={10} color="#2673FF" />
                    <Text style={[s.teamLabelText, { color: '#2673FF' }]}>PROFESSIONALS</Text>
                  </View>
                  {team.professionals.map(m => <TeamMemberCard key={m._id} member={m} type="professional" />)}
                </>
              )}
            </>
          )}
        </View>

        {/* ── CREATE POST BAR ───────────────────────────── */}
        <View style={s.createBar}>
          <View style={s.createAvatarWrap}>
            <Feather name="user" size={20} color="#9CA3AF" />
          </View>
          <Pressable style={s.createInputFake} onPress={() => onCreatePost(community)}>
            <Text style={s.createInputPlaceholder}>Share something…</Text>
          </Pressable>
          <Pressable style={s.createIconBtn} onPress={() => onCreatePost(community)}>
            <Feather name="edit-3" size={16} color="#5A5AD8" />
          </Pressable>
        </View>

        {/* Action chips under the bar */}
        <View style={s.createActions}>
          <Pressable style={s.actionChip} onPress={() => onSelectFeeling(community)}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#7C67D6" />
            <Text style={[s.actionChipText, { color: '#7C67D6' }]}>Feeling</Text>
          </Pressable>
          <Pressable style={[s.actionChip, s.actionChipPrimary]} onPress={() => onCreatePost(community)}>
            <Feather name="edit-2" size={16} color="#FFFFFF" />
            <Text style={[s.actionChipText, { color: '#FFFFFF' }]}>Write Post</Text>
          </Pressable>
        </View>

        {/* ── FEED DIVIDER ──────────────────────────────── */}
        <View style={s.feedDivider}>
          <View style={s.feedLine} />
          <View style={s.feedLabelChip}>
            <Feather name="list" size={11} color="#A0A0B8" />
            <Text style={s.feedLabelText}>POSTS</Text>
          </View>
          <View style={s.feedLine} />
        </View>

        {/* ── POSTS ─────────────────────────────────────── */}
        {isLoading ? (
          <View style={s.centered}>
            <ActivityIndicator size="large" color="#AA96DA" />
            <Text style={s.centeredText}>Loading posts…</Text>
          </View>
        ) : loadError ? (
          <View style={s.emptyBox}>
            <View style={[s.emptyIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="wifi-off" size={32} color="#D97706" />
            </View>
            <Text style={s.emptyTitle}>Connection Issue</Text>
            <Text style={s.emptyBody}>{loadError}</Text>
            <Pressable style={s.emptyBtn} onPress={fetchPosts}>
              <Feather name="refresh-cw" size={14} color="#5A5AD8" />
              <Text style={s.emptyBtnText}>Try Again</Text>
            </Pressable>
          </View>
        ) : visiblePosts.length === 0 ? (
          <View style={s.emptyBox}>
            <View style={[s.emptyIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="sun" size={32} color="#10B981" />
            </View>
            <Text style={s.emptyTitle}>Be the first to post!</Text>
            <Text style={s.emptyBody}>This community is just getting started. Share something kind.</Text>
            <Pressable style={s.emptyBtn} onPress={() => onCreatePost(community)}>
              <Feather name="plus" size={14} color="#5A5AD8" />
              <Text style={s.emptyBtnText}>Write a Post</Text>
            </Pressable>
          </View>
        ) : (
          visiblePosts.map(post => {
            if (hiddenPostIds.includes(post._id)) {
              return (
                <View key={post._id} style={s.hiddenCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="eye-off" size={14} color="#9CA3AF" />
                    <Text style={s.hiddenText}>Post hidden</Text>
                  </View>
                  <Pressable style={s.undoBtn} onPress={() => setHiddenPostIds(p => p.filter(i => i !== post._id))}>
                    <Text style={s.undoBtnText}>Undo</Text>
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
                onShare={() => setSharingPost(post)}
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

      {sharingPost && (
        <SharePostModal
          visible={!!sharingPost}
          post={sharingPost}
          groupId={community._id}
          onClose={() => setSharingPost(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F1F8' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 12 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.3 },
  headerEmojiWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },

  // Cover
  cover: { height: 160, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coverRing1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.14)', top: -80, right: -60 },
  coverRing2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.10)', bottom: -50, left: -40 },
  coverCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 5 },

  // Identity
  identityCard: { backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16, marginBottom: 10 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#EEEEFF', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4, marginBottom: 10 },
  categoryBadgeText: { fontSize: 9, fontWeight: '900', color: '#5A5AD8', letterSpacing: 0.7 },
  groupName: { fontSize: 22, fontWeight: '900', color: '#0D0D1A', lineHeight: 30, marginBottom: 12, letterSpacing: -0.4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#FFFFFF' },
  memberCount: { fontSize: 13, fontWeight: '600', color: '#5A5A72' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ECFDF5', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  activeLabel: { fontSize: 11, fontWeight: '700', color: '#16A34A' },

  // Cards
  card: { backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 18, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0D0D1A', letterSpacing: -0.2 },

  // About
  aboutText: { fontSize: 14, lineHeight: 23, color: '#4A4A65' },
  seeMore: { fontSize: 13, fontWeight: '700', color: '#5A5AD8', marginTop: 8 },
  pinnedCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8F4FF', borderRadius: 10, padding: 12, gap: 8, marginTop: 14, borderWidth: 1, borderColor: '#E4D8FF' },
  pinnedText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500', color: '#5A3A9A' },

  // Team
  teamLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  teamLabelText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },

  // Create bar
  createBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 10 },
  createAvatarWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F3F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E8EAEF', borderStyle: 'dashed' },
  createInputFake: { flex: 1, height: 40, borderRadius: 20, backgroundColor: '#F5F5FA', borderWidth: 1.5, borderColor: '#E8EAEF', paddingHorizontal: 16, justifyContent: 'center' },
  createInputPlaceholder: { fontSize: 14, color: '#C0C0D8', fontWeight: '500' },
  createIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEEEFF', alignItems: 'center', justifyContent: 'center' },

  // Action chips
  createActions: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  actionChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#F5F0FF', paddingVertical: 10, borderRadius: 10 },
  actionChipPrimary: { backgroundColor: '#5A5AD8' },
  actionChipText: { fontSize: 13, fontWeight: '700' },

  // Feed divider
  feedDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  feedLine: { flex: 1, height: 1, backgroundColor: '#E4E5EE' },
  feedLabelChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEEEFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  feedLabelText: { fontSize: 10, fontWeight: '900', color: '#7878C0', letterSpacing: 1 },

  // Loading / Empty
  centered: { alignItems: 'center', paddingVertical: 48, gap: 12, backgroundColor: '#FFFFFF', marginBottom: 10 },
  centeredText: { fontSize: 14, color: '#A0A0B8', fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, backgroundColor: '#FFFFFF', marginBottom: 10 },
  emptyIconBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#0D0D1A', marginBottom: 8, textAlign: 'center', letterSpacing: -0.2 },
  emptyBody: { fontSize: 13, color: '#8A8A9E', lineHeight: 20, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#EEEEFF', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { color: '#5A5AD8', fontSize: 14, fontWeight: '800' },

  // Hidden post
  hiddenCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FB', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10 },
  hiddenText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  undoBtn: { paddingVertical: 5, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4C9F5', borderRadius: 20 },
  undoBtnText: { fontSize: 12, fontWeight: '700', color: '#7C67D6' },
});
