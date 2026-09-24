const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');

/**
 * GET /api/communities/team
 * Returns all moderators and admins (as professionals) — public, no auth needed.
 */
router.get('/team', async (_req, res) => {
  try {
    const [moderators, professionals] = await Promise.all([
      User.find({ role: 'moderator' }).select('fullName role').lean(),
      User.find({ role: { $in: ['admin', 'professional'] } }).select('fullName role').lean(),
    ]);
    res.json({ moderators, professionals });
  } catch (err) {
    console.error('Error fetching community team:', err);
    res.status(500).json({ error: 'Failed to fetch community team' });
  }
});

/**
 * GET /api/communities
 * Get all communities
 */
router.get('/', async (_req, res) => {
  try {
    const communities = await Community.find().sort({ createdAt: -1 }).lean();
    
    // Map to include real memberCount based on members array
    const mapped = communities.map(c => ({
      ...c,
      memberCount: c.members ? c.members.length : 0, // Force real member count
    }));

    res.json(mapped);
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

/**
 * POST /api/communities/:id/join
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    if (!community.members) community.members = [];
    if (!community.members.includes(userId)) {
      community.members.push(userId);
      await community.save();
    }

    res.json({ success: true, memberCount: community.members.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join community' });
  }
});

/**
 * POST /api/communities/:id/leave
 */
router.post('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    if (community.members && community.members.includes(userId)) {
      community.members = community.members.filter(id => id !== userId);
      await community.save();
    }

    res.json({ success: true, memberCount: community.members.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

module.exports = router;
