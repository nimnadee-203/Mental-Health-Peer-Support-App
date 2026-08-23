import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import type { Post } from './GroupDiscussionScreen';

import { API_BASE } from '../config/api';
import ReportModal from '../components/ReportModal';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Comment {
  _id: string;
  postId: string;
  content: string;
  authorName: string;
  likes: number;
  createdAt: string;
}

interface PostDetailScreenProps {
  post: Post;
  onBack: () => void;
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
  const diffInHours = Math.floor(diffInSeconds / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostDetailScreen({
  post,
  onBack,
  onOpenEmergencySupport,
}: PostDetailScreenProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reporting and moderation state
  const [reportingTarget, setReportingTarget] = useState<{
    type: 'Post' | 'Comment';
    id: string;
    authorName: string;
    content: string;
  } | null>(null);
  const [isPostHidden, setIsPostHidden] = useState(false);
  const [hiddenCommentIds, setHiddenCommentIds] = useState<string[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const fetchComments = async () => {
    try {
      const encodedPostId = encodeURIComponent(post._id);
      const response = await fetch(`${API_BASE}/comments/post/${encodedPostId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const encodedPostId = encodeURIComponent(post._id);
      const response = await fetch(`${API_BASE}/comments/post/${encodedPostId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          isAnonymous: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      const data = await response.json();
      
      // Add the new comment directly to the list
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch (error) {
      console.error(error);
      // Fallback for demo mode if backend is unreachable
      setComments(prev => [
        ...prev,
        {
          _id: Math.random().toString(),
          postId: post._id,
          content: newComment.trim(),
          authorName: 'Anonymous Member',
          likes: 0,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setComments(prev =>
      prev.map(c => (c._id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
    try {
      await fetch(`${API_BASE}/comments/${commentId}/like`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReportAction = (
    action: 'hide' | 'block' | 'none',
    target: { type: 'Post' | 'Comment'; id: string; authorName: string }
  ) => {
    if (action === 'hide') {
      if (target.type === 'Post') {
        setIsPostHidden(true);
      } else {
        setHiddenCommentIds(prev => [...prev, target.id]);
      }
    } else if (action === 'block') {
      if (target.type === 'Post') {
        setIsPostHidden(true);
      } else {
        setHiddenCommentIds(prev => [...prev, target.id]);
      }
      if (target.authorName && !blockedAuthors.includes(target.authorName)) {
        setBlockedAuthors(prev => [...prev, target.authorName]);
      }
    }
  };

  const unhideComment = (commentId: string) => {
    setHiddenCommentIds(prev => prev.filter(id => id !== commentId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Discussion</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* THE HERO POST */}
          {isPostHidden ? (
            <View style={styles.hiddenHeroPost}>
              <Text style={styles.hiddenPostEmoji}>🙈</Text>
              <Text style={styles.hiddenHeroText}>You hid this post.</Text>
              <Pressable
                style={styles.unhideHeroButton}
                onPress={() => setIsPostHidden(false)}>
                <Text style={styles.unhideHeroButtonText}>Undo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.heroPost}>
              <View style={styles.postHeader}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>🙂</Text>
                </View>
                <View style={styles.postMetaInfo}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Text style={styles.timeAgo}>{timeAgo(post.createdAt)}</Text>
                </View>
                <View style={styles.topicBadge}>
                  <Text style={styles.topicBadgeText}>{post.topic}</Text>
                </View>
              </View>

              <View style={styles.postContentContainer}>
                <Text style={styles.postContent}>{post.content}</Text>
              </View>

              <View style={styles.postActions}>
                <View style={styles.actionButtonStatic}>
                  <Text style={styles.actionEmoji}>💛</Text>
                  <Text style={styles.actionCount}>{post.likes}</Text>
                </View>
                <View style={styles.actionButtonStatic}>
                  <Text style={styles.actionEmoji}>🤝</Text>
                  <Text style={styles.actionCount}>{post.commentsCount + comments.length}</Text>
                </View>
                <View style={styles.flexSpacer} />
                <Pressable
                  style={styles.reportIconButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() =>
                    setReportingTarget({
                      type: 'Post',
                      id: post._id,
                      authorName: post.authorName,
                      content: post.content,
                    })
                  }>
                  <Text style={styles.reportIcon}>🚩</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* COMMENTS LIST */}
          <Text style={styles.commentsHeading}>Comments</Text>
          
          <View style={styles.commentsContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#D4C9F5" style={{ marginTop: 20 }} />
            ) : comments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Be the first to share your thoughts!</Text>
              </View>
            ) : (
              comments
                .filter(comment => !blockedAuthors.includes(comment.authorName))
                .map(comment => {
                  if (hiddenCommentIds.includes(comment._id)) {
                    return (
                      <View key={comment._id} style={styles.hiddenCommentCard}>
                        <Text style={styles.hiddenCommentText}>🙈 Comment hidden</Text>
                        <Pressable
                          style={styles.unhideCommentButton}
                          onPress={() => unhideComment(comment._id)}>
                          <Text style={styles.unhideCommentText}>Undo</Text>
                        </Pressable>
                      </View>
                    );
                  }

                  return (
                    <View key={comment._id} style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <View style={[styles.avatarPlaceholder, styles.smallAvatar]}>
                          <Text style={styles.smallAvatarEmoji}>🙂</Text>
                        </View>
                        <View style={styles.postMetaInfo}>
                          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                          <Text style={styles.timeAgo}>{timeAgo(comment.createdAt)}</Text>
                        </View>
                        <Pressable
                          style={styles.commentReportBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() =>
                            setReportingTarget({
                              type: 'Comment',
                              id: comment._id,
                              authorName: comment.authorName,
                              content: comment.content,
                            })
                          }>
                          <Text style={styles.commentReportIcon}>🚩</Text>
                        </Pressable>
                      </View>
                      
                      <Text style={styles.commentContent}>{comment.content}</Text>
                      
                      <View style={styles.commentActions}>
                        <Pressable
                          style={styles.likeButton}
                          onPress={() => handleLikeComment(comment._id)}>
                          <Text style={styles.actionEmoji}>💛</Text>
                          <Text style={styles.likeCountText}>{comment.likes}</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
            )}
          </View>

        </ScrollView>

        {/* BOTTOM INPUT BAR */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a supportive comment..."
            placeholderTextColor="#A0A0B8"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={300}
          />
          <Pressable 
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handlePostComment}
            disabled={!newComment.trim() || isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendIcon}>↗</Text>
            )}
          </Pressable>
        </View>

        {/* REPORT MODAL */}
        {reportingTarget && (
          <ReportModal
            visible={!!reportingTarget}
            targetType={reportingTarget.type}
            targetId={reportingTarget.id}
            targetAuthorName={reportingTarget.authorName}
            targetContentSnippet={reportingTarget.content}
            groupId={post.groupId}
            onClose={() => setReportingTarget(null)}
            onReportSuccess={(action) => handleReportAction(action, reportingTarget)}
            onOpenEmergencySupport={onOpenEmergencySupport}
          />
        )}

      </KeyboardAvoidingView>
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
    backgroundColor: '#F7F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F0',
    gap: 16,
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
  headerTitle: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 18,
    color: '#2D2D3A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroPost: {
    backgroundColor: '#FFF',
    paddingTop: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C5DFF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  smallAvatarEmoji: {
    fontSize: 15,
  },
  postMetaInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 20,
    color: '#2D2D3A',
  },
  timeAgo: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#A0A0B8',
  },
  topicBadge: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  topicBadgeText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 15,
    color: '#6B6B80',
  },
  postContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  postContent: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 26,
    color: '#2D2D3A',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1.5,
    borderColor: '#E8E8F0',
  },
  actionButtonStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F7F7FB',
    borderRadius: 15,
    gap: 6,
  },
  actionEmoji: {
    fontSize: 14,
  },
  actionCount: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    color: '#6B6B80',
  },
  divider: {
    height: 12,
    backgroundColor: '#F7F7FB',
  },
  commentsHeading: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 16,
    color: '#2D2D3A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  commentsContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  commentCard: {
    marginBottom: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  commentAuthor: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 14,
    color: '#2D2D3A',
  },
  commentContent: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 22,
    color: '#6B6B80',
    paddingLeft: 40, 
  },
  commentActions: {
    flexDirection: 'row',
    paddingLeft: 40,
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCountText: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 12,
    color: '#A0A0B8',
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 14,
    color: '#A0A0B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E8E8F0',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#2D2D3A',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D2D3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E8E8F0',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginLeft: -2,
  },
  flexSpacer: {
    flex: 1,
  },
  reportIconButton: {
    padding: 6,
  },
  reportIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
  hiddenHeroPost: {
    backgroundColor: '#F8F8FC',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    padding: 16,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hiddenPostEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  hiddenHeroText: {
    flex: 1,
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 13,
    color: '#8A8A9E',
  },
  unhideHeroButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C9F5',
    borderRadius: 8,
  },
  unhideHeroButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12,
    color: '#7C67D6',
  },
  hiddenCommentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  hiddenCommentText: {
    fontFamily: 'Nunito',
    fontWeight: '600',
    fontSize: 12,
    color: '#8A8A9E',
  },
  unhideCommentButton: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4C9F5',
    borderRadius: 6,
  },
  unhideCommentText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11,
    color: '#7C67D6',
  },
  commentReportBtn: {
    padding: 4,
    marginLeft: 8,
  },
  commentReportIcon: {
    fontSize: 12,
    opacity: 0.5,
  },
});
