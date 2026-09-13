import React, { useCallback, useEffect, useState } from 'react';
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
}

interface GroupDiscussionScreenProps {
  community: Community;
  onBack: () => void;
  onCreatePost: (community: Community) => void;
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GroupDiscussionScreen({
  community,
  onBack,
  onCreatePost,
  onPostPress,
  onOpenEmergencySupport,
}: GroupDiscussionScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const encodedGroupId = encodeURIComponent(community._id);
      const response = await fetch(
        `${COMMUNITY_API_BASE}/posts/group/${encodedGroupId}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setLoadError(
        'Could not load posts. Check the backend connection and try again.',
      );
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [community._id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => (p._id === postId ? { ...p, likes: p.likes + 1 } : p)),
    );
    try {
      await fetch(`${COMMUNITY_API_BASE}/posts/${postId}/like`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleReportAction = (
    action: 'hide' | 'block' | 'none',
    post: Post,
  ) => {
    if (action === 'hide') {
      setHiddenPostIds(prev => [...prev, post._id]);
    } else if (action === 'block') {
      setHiddenPostIds(prev => [...prev, post._id]);
      if (post.authorName && !blockedAuthors.includes(post.authorName)) {
        setBlockedAuthors(prev => [...prev, post.authorName]);
      }
    }
  };

  const unhidePost = (postId: string) => {
    setHiddenPostIds(prev => prev.filter(id => id !== postId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerCategory}>{community.category}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {community.name}
            </Text>
          </View>
          <View
            style={[styles.headerEmoji, { backgroundColor: community.bgColor }]}
          >
            <Text style={styles.emojiText}>{community.emoji}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* PINNED GUIDELINE */}
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineEmoji}>📌</Text>
            <Text style={styles.guidelineText}>
              Be kind and respectful. All posts here are anonymous by default.
            </Text>
          </View>

          {/* POSTS LIST */}
          <View style={styles.postsContainer}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#D4C9F5"
                style={styles.loadingIndicator}
              />
            ) : loadError ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>{loadError}</Text>
                <Pressable style={styles.retryButton} onPress={fetchPosts}>
                  <Text style={styles.retryButtonText}>Try again</Text>
                </Pressable>
              </View>
            ) : posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No posts yet. Be the first to share!
                </Text>
              </View>
            ) : (
              posts
                .filter(post => !blockedAuthors.includes(post.authorName))
                .map(post => {
                  if (hiddenPostIds.includes(post._id)) {
                    return (
                      <View key={post._id} style={styles.hiddenPostCard}>
                        <View style={styles.hiddenPostInfo}>
                          <Text style={styles.hiddenPostEmoji}>🙈</Text>
                          <Text style={styles.hiddenPostText}>Post hidden</Text>
                        </View>
                        <Pressable
                          style={styles.unhideButton}
                          onPress={() => unhidePost(post._id)}
                        >
                          <Text style={styles.unhideButtonText}>Undo</Text>
                        </Pressable>
                      </View>
                    );
                  }

                  return (
                    <Pressable
                      key={post._id}
                      style={styles.postCard}
                      onPress={() => onPostPress(post)}
                    >
                      <View style={styles.postHeader}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarEmoji}>🙂</Text>
                        </View>
                        <View style={styles.postMetaInfo}>
                          <Text style={styles.authorName}>
                            {post.authorName}
                          </Text>
                          <Text style={styles.timeAgo}>
                            {timeAgo(post.createdAt)}
                          </Text>
                        </View>
                        <View style={styles.topicBadge}>
                          <Text style={styles.topicBadgeText}>
                            {post.topic}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.postContentContainer}>
                        <Text style={styles.postContent}>{post.content}</Text>
                      </View>

                      <View style={styles.postActions}>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => handleLike(post._id)}
                        >
                          <Text style={styles.actionEmoji}>💛</Text>
                          <Text style={styles.actionCount}>{post.likes}</Text>
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                          <Text style={styles.actionEmoji}>🤝</Text>
                          <Text style={styles.actionCount}>
                            {post.commentsCount}
                          </Text>
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                          <Text style={styles.actionIcon}>🔗</Text>
                          <Text style={styles.actionCount}>Share</Text>
                        </Pressable>
                        <View style={styles.flexSpacer} />
                        <Pressable
                          style={styles.reportButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          onPress={e => {
                            e?.stopPropagation?.();
                            setReportingPost(post);
                          }}
                        >
                          <Text style={styles.reportIcon}>🚩</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
            )}
          </View>
        </ScrollView>

        {/* FLOATING ACTION BUTTON */}
        <Pressable
          style={styles.fabContainer}
          onPress={() => onCreatePost(community)}
        >
          <LinearGradient
            colors={['#C5DFF8', '#C8EDD5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={styles.fabIcon}>✏️</Text>
            <Text style={styles.fabText}>Share something</Text>
          </LinearGradient>
        </Pressable>

        {/* REPORT MODAL */}
        {reportingPost && (
          <ReportModal
            visible={!!reportingPost}
            targetType="Post"
            targetId={reportingPost._id}
            targetAuthorName={reportingPost.authorName}
            targetContentSnippet={reportingPost.content}
            groupId={community._id}
            onClose={() => setReportingPost(null)}
            onReportSuccess={action =>
              handleReportAction(action, reportingPost)
            }
            onOpenEmergencySupport={onOpenEmergencySupport}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#6B6B80',
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerCategory: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    color: '#6B6B80',
  },
  headerTitle: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 24,
    color: '#2D2D3A',
  },
  headerEmoji: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 168,
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
    backgroundColor: 'rgba(212, 201, 245, 0.2)',
    borderWidth: 1.5,
    borderColor: '#D4C9F5',
    borderRadius: 14,
    marginBottom: 24,
  },
  guidelineEmoji: {
    fontSize: 14,
  },
  guidelineText: {
    flex: 1,
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 18,
    color: '#2D2D3A',
    opacity: 0.85,
  },
  postsContainer: {
    gap: 14,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  postCard: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 18,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C5DFF8', // Will vary in real implementation
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  postMetaInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 20,
    color: '#2D2D3A',
  },
  timeAgo: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 16,
    color: '#A0A0B8',
  },
  topicBadge: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  topicBadgeText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.3,
    color: '#6B6B80',
  },
  postContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postContent: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 24,
    color: '#6B6B80',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderTopWidth: 1.5,
    borderColor: '#E8E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 15,
    gap: 4,
  },
  actionEmoji: {
    fontSize: 13,
  },
  actionIcon: {
    fontSize: 12,
    color: '#A0A0B8',
  },
  actionCount: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B6B80',
  },
  flexSpacer: {
    flex: 1,
  },
  reportButton: {
    padding: 4,
  },
  reportIcon: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 14,
    color: '#A0A0B8',
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#2D2D3A',
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90, // Above bottom nav
    alignSelf: 'center',
    shadowColor: '#C5DFF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 8,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
  },
  fabIcon: {
    fontSize: 16,
  },
  fabText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 22,
    color: '#2D2D3A',
  },
  hiddenPostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FC',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hiddenPostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hiddenPostEmoji: {
    fontSize: 16,
  },
  hiddenPostText: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 13,
    color: '#8A8A9E',
  },
  unhideButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C9F5',
    borderRadius: 8,
  },
  unhideButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12,
    color: '#7C67D6',
  },
});
