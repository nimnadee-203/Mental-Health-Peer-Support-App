const express = require('express');
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Community = require('../models/Community');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const staffOnly = [auth, requireRole(['admin', 'moderator'])];

const sessionFields = 'title description group date startTime endTime meetingLink host hostName createdBy';

function isStaff(user) {
  return user && (user.role === 'admin' || user.role === 'moderator');
}

function normalizeDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function hasRequiredFields(body) {
  return body && body.title && body.description && body.group && body.date
    && body.startTime && body.endTime && body.meetingLink;
}

async function populateSession(query) {
  return query
    .select(sessionFields)
    .populate('group', 'name emoji')
    .populate('host', 'fullName email')
    .lean();
}

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    let groupIds;
    if (!isStaff(req.user)) {
      const groups = await Community.find({ members: req.user.id }).select('_id').lean();
      groupIds = groups.map(group => group._id);
      if (!groupIds.length) return res.json([]);
    }

    const query = { date: { $gte: today } };
    if (groupIds) query.group = { $in: groupIds };
    const sessions = await populateSession(
      Session.find(query).sort({ date: 1, startTime: 1 }),
    );
    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load online sessions.' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid session ID.' });
    }
    const session = await populateSession(Session.findById(req.params.id));
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (!isStaff(req.user) && !session.group?.members?.includes(req.user.id)) {
      const group = await Community.findById(session.group._id).select('members').lean();
      if (!group?.members?.includes(req.user.id)) {
        return res.status(403).json({ error: 'You are not a member of this group.' });
      }
    }
    return res.json(session);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load session details.' });
  }
});

router.post('/', ...staffOnly, async (req, res) => {
  try {
    if (!hasRequiredFields(req.body)) {
      return res.status(400).json({ error: 'All session fields are required.' });
    }
    const normalizedDate = normalizeDate(req.body.date);
    if (!normalizedDate) return res.status(400).json({ error: 'Enter a valid session date.' });
    if (!mongoose.Types.ObjectId.isValid(req.body.group)) {
      return res.status(400).json({ error: 'Invalid group.' });
    }
    const group = await Community.findById(req.body.group).select('_id name');
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    const session = await Session.create({
      title: req.body.title,
      description: req.body.description,
      group: group._id,
      date: normalizedDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      meetingLink: req.body.meetingLink,
      host: req.user.id,
      hostName: req.user.fullName || (req.user.role === 'admin' ? 'Admin' : 'Moderator'),
      createdBy: req.user.id,
    });
    return res.status(201).json(await populateSession(Session.findById(session._id)));
  } catch (error) {
    console.error('POST /api/sessions error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create online session.' });
  }
});

router.put('/:id', ...staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid session ID.' });
    }
    const updates = {};
    ['title', 'description', 'date', 'startTime', 'endTime', 'meetingLink'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.date !== undefined) {
      updates.date = normalizeDate(updates.date);
      if (!updates.date) return res.status(400).json({ error: 'Enter a valid session date.' });
    }
    if (req.body.group !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.group)) return res.status(400).json({ error: 'Invalid group.' });
      const group = await Community.findById(req.body.group).select('_id');
      if (!group) return res.status(404).json({ error: 'Group not found.' });
      updates.group = group._id;
    }
    const session = await Session.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    return res.json(await populateSession(Session.findById(session._id)));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update online session.' });
  }
});

router.delete('/:id', ...staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid session ID.' });
    }
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete online session.' });
  }
});

module.exports = router;
