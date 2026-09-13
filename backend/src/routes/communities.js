const express = require('express');
const router = express.Router();
const Community = require('../models/Community');

/**
 * GET /api/communities
 * Get all communities
 */
router.get('/', async (_req, res) => {
  try {
    const communities = await Community.find().sort({ createdAt: -1 });
    res.json(communities);
  } catch (err) {
    console.error('Error fetching communities:', err);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

/**
 * POST /api/communities
 * Create a new community
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      emoji,
      bgColor,
      description,
      guidelines,
      memberCount,
      memberAvatarColors,
      isJoined,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    const existing = await Community.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: 'A community with this name already exists' });
    }

    const community = new Community({
      name: name.trim(),
      category: category || 'General Wellbeing',
      emoji: emoji || '🌱',
      bgColor: bgColor || '#C8EDD5',
      description: description ? description.trim() : '',
      memberCount: memberCount || 1,
      memberAvatarColors: memberAvatarColors || ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
      isJoined: isJoined !== undefined ? isJoined : true,
      guidelines: guidelines ? guidelines.trim() : '',
    });

    await community.save();
    res.status(201).json(community);
  } catch (err) {
    console.error('Error creating community:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
