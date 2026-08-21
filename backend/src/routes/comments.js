const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * GET /api/comments/post/:postId
 * Get all comments for a specific post
 */
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    // Fetch comments ascending by created date (oldest first, like a conversation)
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * POST /api/comments/post/:postId
 * Create a new comment on a specific post
 */
router.post('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, isAnonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = new Comment({
      postId,
      content: content.trim(),
      authorName: isAnonymous !== false ? 'Anonymous Member' : 'Member',
      likes: 0,
    });

    await comment.save();

    // Increment comment count on the post
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/comments/:commentId/like
 * Increment likes on a comment
 */
router.post('/:commentId/like', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
  } catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

module.exports = router;
