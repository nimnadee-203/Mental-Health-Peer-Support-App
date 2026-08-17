const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Community = require('../models/Community');

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
    console.error(err);
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

    // Optional: verify the community exists
    const community = await Community.findById(groupId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const post = new Post({
      groupId,
      content,
      topic,
      contentNote: contentNote || 'None',
      isAnonymous,
      authorName: isAnonymous ? 'Anonymous Member' : 'Member',
      likes: Math.floor(Math.random() * 20), // Seed with random likes for realistic UI
      commentsCount: Math.floor(Math.random() * 10), // Seed with random comments count
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
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
    res.status(500).json({ error: 'Failed to like post' });
  }
});

module.exports = router;
