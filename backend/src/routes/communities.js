const express = require('express');
const router = express.Router();
const Community = require('../models/Community');

/**
 * GET /api/communities
 * Query params:
 *   category  – filter by category (omit or "all" for all)
 *   search    – case-insensitive name/description search
 */
router.get('/', async (req, res) => {
  try {
    const {category, search} = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (search && search.trim()) {
      query.$or = [
        {name: {$regex: search.trim(), $options: 'i'}},
        {description: {$regex: search.trim(), $options: 'i'}},
        {category: {$regex: search.trim(), $options: 'i'}},
      ];
    }

    const communities = await Community.find(query).sort({createdAt: 1});
    res.json(communities);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to fetch communities'});
  }
});

/**
 * GET /api/communities/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({error: 'Community not found'});
    res.json(community);
  } catch (err) {
    res.status(500).json({error: 'Failed to fetch community'});
  }
});

/**
 * POST /api/communities
 * Body: { name, category, emoji, bgColor, description, memberCount, memberAvatarColors }
 */
router.post('/', async (req, res) => {
  try {
    const community = new Community(req.body);
    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

/**
 * POST /api/communities/:id/join
 * Toggles isJoined and adjusts memberCount
 */
router.post('/:id/join', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({error: 'Community not found'});

    community.isJoined = !community.isJoined;
    if (community.isJoined) {
      community.memberCount += 1;
    } else {
      community.memberCount = Math.max(0, community.memberCount - 1);
    }

    await community.save();
    res.json(community);
  } catch (err) {
    res.status(500).json({error: 'Failed to update join status'});
  }
});

/**
 * DELETE /api/communities/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    await Community.findByIdAndDelete(req.params.id);
    res.json({message: 'Community deleted'});
  } catch (err) {
    res.status(500).json({error: 'Failed to delete community'});
  }
});

module.exports = router;
