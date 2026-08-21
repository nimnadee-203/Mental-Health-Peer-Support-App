const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * GET /api/comments/post/:postId
 * Get all comments for a post, sorted oldest first (conversation order).
 */
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('GET /comments/post/:postId —', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * POST /api/comments/post/:postId
 * Create a new comment on a post. Atomically increments the post's commentsCount.
 */
router.post('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, isAnonymous } = req.body;

    // ── Input validation ─────────────────────────────────────────────────────
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    // ── Verify post exists ───────────────────────────────────────────────────
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = new Comment({
      postId,
      content: content.trim(),
      authorName: isAnonymous !== false ? 'Anonymous Member' : 'Member',
    });

    await comment.save();

    // ── Atomically increment commentsCount on the post ───────────────────────
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /comments/post/:postId —', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/comments/:commentId/like
 * Atomically increment likes on a comment.
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
    console.error('POST /comments/:commentId/like —', err.message);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

module.exports = router;
