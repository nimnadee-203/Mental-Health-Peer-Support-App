const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

/**
 * POST /api/reports
 * Submit a report for a Post or Comment.
 */
router.post('/', async (req, res) => {
  try {
    const {
      targetType,
      targetId,
      groupId,
      category,
      subCategory,
      reasonNote,
      reporterName,
    } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────
    if (!targetType || !['Post', 'Comment'].includes(targetType)) {
      return res
        .status(400)
        .json({ error: "targetType must be either 'Post' or 'Comment'." });
    }

    if (!targetId || targetId.trim().length === 0) {
      return res.status(400).json({ error: 'targetId is required.' });
    }

    if (!category || category.trim().length === 0) {
      return res.status(400).json({ error: 'category is required.' });
    }

    // ── Retrieve target content snapshot for moderator review ─────────────
    let targetContentPreview = '';
    let targetAuthor = '';
    let detectedGroupId = groupId || null;

    if (targetType === 'Post') {
      const post = await Post.findById(targetId).catch(() => null);
      if (post) {
        targetContentPreview = post.content ? post.content.substring(0, 500) : '';
        targetAuthor = post.authorName || 'Member';
        if (!detectedGroupId) {
          detectedGroupId = post.groupId;
        }
      }
    } else if (targetType === 'Comment') {
      const comment = await Comment.findById(targetId).catch(() => null);
      if (comment) {
        targetContentPreview = comment.content ? comment.content.substring(0, 500) : '';
        targetAuthor = comment.authorName || 'Anonymous Member';
        if (!detectedGroupId && comment.postId) {
          const parentPost = await Post.findById(comment.postId).catch(() => null);
          if (parentPost) {
            detectedGroupId = parentPost.groupId;
          }
        }
      }
    }

    const report = new Report({
      targetType,
      targetId: targetId.trim(),
      groupId: detectedGroupId,
      category: category.trim(),
      subCategory: subCategory ? subCategory.trim() : '',
      reasonNote: reasonNote ? reasonNote.trim() : '',
      targetContentPreview,
      targetAuthor,
      reporterName: reporterName ? reporterName.trim() : 'Anonymous User',
      status: 'pending',
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for keeping our community safe.',
      report,
    });
  } catch (err) {
    console.error('POST /api/reports —', err.message);
    res.status(500).json({ error: 'Failed to submit report. Please try again later.' });
  }
});

/**
 * GET /api/reports
 * Get list of reports with optional filtering by status, targetType, or groupId.
 */
router.get('/', async (req, res) => {
  try {
    const { status, targetType, groupId, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;
    if (groupId) query.groupId = groupId;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Report.countDocuments(query),
    ]);

    res.json({
      reports,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    });
  } catch (err) {
    console.error('GET /api/reports —', err.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/reports/:id
 * Get details of a single report.
 */
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error('GET /api/reports/:id —', err.message);
    res.status(500).json({ error: 'Failed to fetch report details' });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Update report review status (e.g. reviewed, dismissed, action_taken).
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'reviewed', 'dismissed', 'action_taken'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report,
    });
  } catch (err) {
    console.error('PATCH /api/reports/:id/status —', err.message);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

module.exports = router;
