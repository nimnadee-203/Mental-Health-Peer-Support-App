const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const Community = require('../models/Community');
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
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const search = req.query.search.trim();
      const searchFields = [
        { targetContentPreview: { $regex: search, $options: 'i' } },
        { targetAuthor: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
      if (mongoose.Types.ObjectId.isValid(search)) searchFields.push({ _id: search });
      query.$or = searchFields;
    }
    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(100).lean();
    const postIds = reports.filter(report => report.targetType === 'Post').map(report => report.targetId);
    const posts = await Post.find({ _id: { $in: postIds } }).select('_id moderationStatus').lean();
    const postStatus = new Map(posts.map(post => [post._id.toString(), post.moderationStatus]));
    reports.forEach(report => {
      report.currentPostStatus = report.targetType === 'Post' ? postStatus.get(report.targetId) || 'unavailable' : 'unavailable';
    });
    return res.json({ reports });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load moderation reports.' });
  }
});

router.get('/history', ...moderatorsOnly, async (req, res) => {
  try {
    const query = req.query.reportId ? { reportId: req.query.reportId } : {};
    const history = await ModerationAudit.find(query)
      .populate('moderatorId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    history.forEach(entry => {
      entry.moderator = entry.moderatorId;
    });
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
      {
        status,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        moderatorAction: status,
        ...(typeof req.body.reason === 'string' ? { moderationNote: req.body.reason.trim() } : {}),
      },
      { new: true, runValidators: true },
    );
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    await ModerationAudit.create({
      moderatorId: req.user.id,
      action: status === 'dismissed' ? 'DISMISS_REPORT' : 'UPDATE_REPORT',
      targetType: 'report',
      targetId: report._id.toString(),
      reportId: report._id,
      reason: typeof req.body.reason === 'string' ? req.body.reason.trim() : status,
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

router.get('/members', ...moderatorsOnly, async (_req, res) => {
  try {
    const communities = await Community.find()
      .select('name createdAt members memberDetails joinRequests')
      .sort({ createdAt: -1 })
      .lean();
    const userIds = new Set();
    communities.forEach(community => {
      (community.members || []).forEach(userId => userIds.add(userId));
      (community.joinRequests || [])
        .filter(request => request.status === 'pending')
        .forEach(request => userIds.add(request.userId));
    });

    const validUserIds = [...userIds].filter(id => mongoose.Types.ObjectId.isValid(id));
    const users = await User.find({ _id: { $in: validUserIds } })
      .select('_id fullName email role createdAt')
      .lean();
    const usersById = new Map(users.map(user => [user._id.toString(), user]));
    const members = [];

    communities.forEach(community => {
      const detailsByUserId = new Map(
        (community.memberDetails || []).map(detail => [detail.userId, detail.joinedAt]),
      );
      (community.members || []).forEach(userId => {
        const user = usersById.get(userId);
        if (!user) return;
        members.push({
          id: `${community._id}:${userId}`,
          userId,
          communityId: community._id,
          communityName: community.name,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          joinDate: detailsByUserId.get(userId) || community.createdAt,
          status: 'active',
        });
      });
      (community.joinRequests || [])
        .filter(request => request.status === 'pending')
        .forEach(request => {
          const user = usersById.get(request.userId);
          if (!user) return;
          members.push({
            id: `${community._id}:${request.userId}:request`,
            userId: request.userId,
            communityId: community._id,
            communityName: community.name,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            joinDate: request.requestedAt,
            status: 'pending',
          });
        });
    });

    const uniqueMemberIds = new Set(members.filter(member => member.status === 'active').map(member => member.userId));
    const moderatorIds = new Set(
      members
        .filter(member => member.status === 'active' && member.role === 'moderator')
        .map(member => member.userId),
    );
    return res.json({
      members,
      stats: {
        totalMembers: uniqueMemberIds.size,
        moderators: moderatorIds.size,
        pendingRequests: members.filter(member => member.status === 'pending').length,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load community members.' });
  }
});

router.post('/members/:communityId/:userId/approve', ...moderatorsOnly, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ error: 'Community not found.' });
    const request = (community.joinRequests || []).find(
      item => item.userId === req.params.userId && item.status === 'pending',
    );
    if (!request) return res.status(404).json({ error: 'Pending request not found.' });
    if (!community.members.includes(req.params.userId)) {
      if (!community.memberDetails) community.memberDetails = [];
      community.members.push(req.params.userId);
      community.memberDetails.push({ userId: req.params.userId, joinedAt: new Date() });
    }
    community.joinRequests = community.joinRequests.filter(item => item !== request);
    await community.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to approve membership request.' });
  }
});

router.post('/members/:communityId/:userId/reject', ...moderatorsOnly, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ error: 'Community not found.' });
    const request = (community.joinRequests || []).find(
      item => item.userId === req.params.userId && item.status === 'pending',
    );
    if (!request) return res.status(404).json({ error: 'Pending request not found.' });
    request.status = 'rejected';
    await community.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reject membership request.' });
  }
});

router.delete('/members/:communityId/:userId', ...moderatorsOnly, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ error: 'Community not found.' });
    community.members = community.members.filter(userId => userId !== req.params.userId);
    community.memberDetails = (community.memberDetails || []).filter(
      member => member.userId !== req.params.userId,
    );
    await community.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove member.' });
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