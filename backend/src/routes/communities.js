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
router.post('/', auth, requireRole(['admin', 'professional']), async (req, res) => {
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
      creatorId: req.user.id,
    });

    await community.save();
    await ActivityLog.create({
      type: 'COMMUNITY_CREATED',
      userEmail: req.user.email || 'unknown',
      userName: req.user.fullName || 'Unknown user',
      description: `${req.user.fullName || 'A professional'} created the community "${community.name}".`,
      metadata: { communityId: community._id, communityName: community.name, creatorRole: req.user.role },
    });
    res.status(201).json(community);
  } catch (err) {
    console.error('Error creating community:', err);
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', auth, requireRole(['admin', 'professional']), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found.' });
    if (req.user.role !== 'admin' && community.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Only the group creator can update this group.' });
    }

    const allowedFields = ['name', 'category', 'emoji', 'bgColor', 'imageUrl', 'description', 'guidelines'];
    allowedFields.forEach(field => {
      if (typeof req.body[field] === 'string') community[field] = req.body[field].trim();
    });
    await community.save();
    return res.json(community);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update community.' });
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
    if (!community.memberDetails) community.memberDetails = [];
    if (!community.members.includes(userId)) {
      community.members.push(userId);
      community.memberDetails.push({ userId, joinedAt: new Date() });
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
      community.memberDetails = (community.memberDetails || []).filter(
        member => member.userId !== userId,
      );
      await community.save();
    }

    res.json({ success: true, memberCount: community.members.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

module.exports = router;
