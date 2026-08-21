const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET /api/posts/group/:groupId
 * Get all posts for a specific community/group
 */
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    // Fetch posts descending by created date
    const posts = await Post.find({ groupId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * POST /api/posts/group/:groupId
 * Create a new post in a specific community
 */
router.post('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, topic, contentNote, isAnonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const post = new Post({
      groupId,
      content: content.trim(),
      topic: topic || 'General',
      contentNote: contentNote || 'None',
      isAnonymous: Boolean(isAnonymous),
      authorName: isAnonymous ? 'Anonymous Member' : 'Member',
      likes: 0,
      commentsCount: 0,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/posts/:postId/like
 * Increment likes on a post
 */
router.post('/:postId/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

module.exports = router;
