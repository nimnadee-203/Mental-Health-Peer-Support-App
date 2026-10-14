const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

/**
 * GET /api/communities/team
 * Returns all moderators and admins (as professionals) — public, no auth needed.
 */
router.get('/team', async (_req, res) => {
  try {
    const community = _req.query.groupId
      ? await Community.findById(_req.query.groupId).select('moderatorIds').lean()
      : null;
    const moderatorQuery = community
      ? { _id: { $in: community.moderatorIds || [] }, role: 'moderator' }
      : { role: 'moderator' };
    const [moderators, professionals] = await Promise.all([
      User.find(moderatorQuery).select('fullName role').lean(),
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
    
    // Map to include real memberCount strictly based on actual members joined
    const mapped = communities.map(c => ({
      ...c,
      memberCount: Array.isArray(c.members) ? c.members.length : 0,
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Error fetching communities:', err);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

/**
 * GET /api/communities/:id
 * Get single community with accurate live memberCount
 */
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).lean();
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    const realCount = Array.isArray(community.members) ? community.members.length : 0;
    res.json({
      ...community,
      memberCount: realCount,
    });
  } catch (err) {
    console.error('Error fetching single community:', err);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

/**
 * POST /api/communities/:id/join
 * Join a community and return accurate memberCount
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to join.' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found.' });
    }

    if (!community.members) {
      community.members = [];
    }

    const alreadyMember = community.members.includes(userId);
    if (!alreadyMember) {
      community.members.push(userId);
    }
    community.memberCount = community.members.length;
    await community.save();

    res.json({
      success: true,
      memberCount: community.members.length,
      community: {
        ...community.toObject(),
        memberCount: community.members.length,
      },
    });
  } catch (err) {
    console.error('Error joining community:', err);
    res.status(500).json({ error: 'Failed to join community.' });
  }
});

/**
 * POST /api/communities/:id/leave
 * Leave a community and return accurate memberCount
 */
router.post('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to leave.' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found.' });
    }

    if (!community.members) {
      community.members = [];
    }

    community.members = community.members.filter(id => id !== userId);
    community.memberCount = community.members.length;
    await community.save();

    res.json({
      success: true,
      memberCount: community.members.length,
      community: {
        ...community.toObject(),
        memberCount: community.members.length,
      },
    });
  } catch (err) {
    console.error('Error leaving community:', err);
    res.status(500).json({ error: 'Failed to leave community.' });
  }
});

/**
 * POST /api/communities
 * Create a new community
 * Restricted to Peer Support Volunteers, Professionals, Moderators, and Admins.
 * Community Members cannot create support groups by default.
 */
router.post('/', async (req, res, next) => {
  // Check optional auth header if present or require role if user is set
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, () => {
      const allowedRoles = ['peer_volunteer', 'moderator', 'admin', 'professional'];
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
      imageUrl,
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
      imageUrl: imageUrl || '',
      description: description ? description.trim() : '',
      memberCount: memberCount || 1,
      memberAvatarColors: memberAvatarColors || ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
      isJoined: isJoined !== undefined ? isJoined : true,
      guidelines: guidelines ? guidelines.trim() : '',
      creatorId: req.user ? req.user.id : undefined,
    });

    await community.save();
    if (req.user) {
      await ActivityLog.create({
        type: 'COMMUNITY_CREATED',
        userEmail: req.user.email || 'unknown',
        userName: req.user.fullName || 'Unknown user',
        description: `${req.user.fullName || 'A user'} created the community "${community.name}".`,
        metadata: { communityId: community._id, communityName: community.name, creatorRole: req.user.role },
      }).catch(() => {});
    }
    return res.status(201).json(community);
  } catch (err) {
    console.error('Error creating community:', err);
    return res.status(400).json({ error: err.message });
  }
}

router.patch('/:id', auth, requireRole(['admin', 'professional', 'moderator', 'peer_volunteer']), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found.' });
    if (req.user.role !== 'admin' && community.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Only the group creator can update this group.' });
    }

    const updates = req.body;
    Object.assign(community, updates);
    await community.save();

    await ActivityLog.create({
      type: 'COMMUNITY_UPDATED',
      userEmail: req.user.email,
      userName: req.user.fullName,
      description: `${req.user.fullName} updated the community "${community.name}".`,
      metadata: { communityId: community._id, communityName: community.name },
    }).catch(() => {});

    res.json(community);
  } catch (err) {
    console.error('Error updating community:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
