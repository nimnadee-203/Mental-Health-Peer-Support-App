const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

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
 * Restricted to Peer Support Volunteers, Moderators, and Admins.
 * Community Members cannot create support groups by default.
 */
router.post('/', async (req, res, next) => {
  // Check optional auth header if present or require role if user is set
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, () => {
      const allowedRoles = ['peer_volunteer', 'moderator', 'admin'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error:
            'Community members cannot create support groups by default. Please apply to become a Peer Support Volunteer.',
        });
      }
      return createCommunityHandler(req, res);
    });
  }
  return createCommunityHandler(req, res);
});

async function createCommunityHandler(req, res) {
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
    return res.status(201).json(community);
  } catch (err) {
    console.error('Error creating community:', err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = router;
