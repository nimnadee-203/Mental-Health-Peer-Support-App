const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const VolunteerApplication = require('../models/VolunteerApplication');
const User = require('../models/User');

const moderatorsOnly = [auth, requireRole(['moderator', 'admin'])];

/**
 * POST /api/volunteer/apply
 * Apply to become a Peer Support Volunteer
 */
router.post('/apply', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A reason for applying is required.' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (['peer_volunteer', 'moderator', 'admin'].includes(currentUser.role)) {
      return res.status(400).json({
        error: `You already have active ${currentUser.role} permissions.`,
      });
    }

    const existingPending = await VolunteerApplication.findOne({
      userId: req.user.id,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(409).json({
        error: 'You already have a pending Peer Support Volunteer application.',
      });
    }

    const application = await VolunteerApplication.create({
      userId: req.user.id,
      fullName: currentUser.fullName || 'Community Member',
      email: currentUser.email || '',
      reason: reason.trim(),
      status: 'pending',
    });

    return res.status(201).json({ application });
  } catch (err) {
    console.error('Error submitting volunteer application:', err);
    return res.status(500).json({ error: 'Failed to submit volunteer application.' });
  }
});

/**
 * GET /api/volunteer/my-status
 * Get the volunteer application status of the logged-in user
 */
router.get('/my-status', auth, async (req, res) => {
  try {
    const application = await VolunteerApplication.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.json({ application: application || null });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch application status.' });
  }
});

/**
 * GET /api/volunteer/applications
 * Get all volunteer applications (Moderators & Admins)
 */
router.get('/applications', ...moderatorsOnly, async (req, res) => {
  try {
    const applications = await VolunteerApplication.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ applications });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch volunteer applications.' });
  }
});

/**
 * POST /api/volunteer/applications/:id/approve
 * Approve a volunteer application and update user's role to 'peer_volunteer'
 */
router.post('/applications/:id/approve', ...moderatorsOnly, async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    application.status = 'approved';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    await User.findByIdAndUpdate(application.userId, {
      role: 'peer_volunteer',
    });

    return res.json({
      message: 'Application approved. User promoted to Peer Support Volunteer.',
      application,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to approve volunteer application.' });
  }
});

/**
 * POST /api/volunteer/applications/:id/reject
 * Reject a volunteer application
 */
router.post('/applications/:id/reject', ...moderatorsOnly, async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    application.status = 'rejected';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    return res.json({
      message: 'Application rejected.',
      application,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reject volunteer application.' });
  }
});

module.exports = router;
