const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const ModerationAudit = require('../models/ModerationAudit');

const moderatorsOnly = [auth, requireRole(['moderator', 'admin'])];

router.get('/stats', ...moderatorsOnly, async (_req, res) => {
  try {
    const [reportCounts, hiddenPosts] = await Promise.all([
      Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Post.countDocuments({ moderationStatus: 'hidden' }),
    ]);
    const stats = { pending: 0, under_review: 0, resolved: 0, dismissed: 0, hiddenPosts };
    reportCounts.forEach(item => {
      if (Object.prototype.hasOwnProperty.call(stats, item._id)) stats[item._id] = item.count;
    });
    return res.json({ stats });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load moderation statistics.' });
  }
});

router.get('/reports', ...moderatorsOnly, async (req, res) => {
  try {
    const query = {};
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ reports });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load moderation reports.' });
  }
});

router.get('/history', ...moderatorsOnly, async (_req, res) => {
  try {
    const history = await ModerationAudit.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ history });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load moderation history.' });
  }
});

router.patch('/reports/:id', ...moderatorsOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid report status.' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user.id, reviewedAt: new Date(), moderatorAction: status },
      { new: true, runValidators: true },
    );
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    await ModerationAudit.create({
      moderatorId: req.user.id,
      action: status === 'dismissed' ? 'DISMISS_REPORT' : 'UPDATE_REPORT',
      targetType: 'report',
      targetId: report._id.toString(),
      reportId: report._id,
      reason: status,
    });
    return res.json({ report });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update report.' });
  }
});

router.patch('/posts/:id/:action', ...moderatorsOnly, async (req, res) => {
  try {
    if (!['hide', 'restore'].includes(req.params.action)) {
      return res.status(400).json({ error: 'Invalid moderation action.' });
    }
    const moderationStatus = req.params.action === 'hide' ? 'hidden' : 'visible';
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { moderationStatus },
      { new: true },
    );
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    if (req.body.reportId && mongoose.Types.ObjectId.isValid(req.body.reportId) && moderationStatus === 'hidden') {
      await Report.findByIdAndUpdate(req.body.reportId, {
        status: 'resolved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        moderatorAction: 'hide_post',
      });
    }
    await ModerationAudit.create({
      moderatorId: req.user.id,
      action: moderationStatus === 'hidden' ? 'HIDE_POST' : 'RESTORE_POST',
      targetType: 'post',
      targetId: post._id.toString(),
      reportId: req.body.reportId || undefined,
      reason: req.body.reason || '',
    });
    return res.json({ post });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update post moderation status.' });
  }
});

router.post('/users/:id/warn', ...moderatorsOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    const user = await User.findById(req.params.id).select('_id');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const audit = await ModerationAudit.create({
      moderatorId: req.user.id,
      action: 'WARN_USER',
      targetType: 'user',
      targetId: user._id.toString(),
      reason: typeof req.body.reason === 'string' ? req.body.reason.trim() : '',
    });
    return res.status(201).json({ audit });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record user warning.' });
  }
});

router.get('/users', auth, requireRole(['admin']), async (_req, res) => {
  try {
    const users = await User.find().select('_id fullName email role').sort({ createdAt: -1 }).lean();
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load users.' });
  }
});

router.patch('/users/:id/role', auth, requireRole(['admin']), async (req, res) => {
  try {
    if (!['user', 'moderator', 'admin'].includes(req.body.role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true },
    ).select('_id fullName email role');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
});

module.exports = router;