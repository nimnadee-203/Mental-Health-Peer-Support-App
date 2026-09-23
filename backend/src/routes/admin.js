const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Community = require('../models/Community');
const EmergencyRequest = require('../models/EmergencyRequest');
const Report = require('../models/Report');
const User = require('../models/User'); // Used if we want to query total users in this DB

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admins only' });
  }
};

/**
 * GET /api/admin/stats
 * Retrieves system-wide statistics for the dashboard.
 */
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalCommunities = await Community.countDocuments();
    const activeEmergencies = await EmergencyRequest.countDocuments({ status: { $in: ['PENDING', 'CONTACTED'] } });
    const totalReports = await Report.countDocuments();
    
    // Total users is technically managed by auth server, but we can count local Users table if synced
    const totalUsers = await User.countDocuments();

    res.json({
      totalCommunities,
      activeEmergencies,
      totalReports,
      totalUsers
    });
  } catch (err) {
    console.error('GET /api/admin/stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

/**
 * GET /api/admin/activities
 * Retrieves a feed of recent system events (emergencies and reports).
 */
router.get('/activities', auth, requireAdmin, async (req, res) => {
  try {
    const recentEmergencies = await EmergencyRequest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'fullName email')
      .lean();

    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('reporterId', 'fullName')
      .lean();

    // Map emergencies to a uniform activity structure
    const emergencyActivities = recentEmergencies.map(e => ({
      _id: `em_${e._id}`,
      type: 'EMERGENCY',
      description: e.description,
      status: e.status,
      user: e.userId ? e.userId.fullName : 'Unknown User',
      createdAt: e.createdAt,
      originalId: e._id
    }));

    // Map reports to a uniform activity structure
    const reportActivities = recentReports.map(r => ({
      _id: `rep_${r._id}`,
      type: 'REPORT',
      description: `Reported ${r.targetType}: ${r.reason}`,
      status: r.status,
      user: r.reporterId ? r.reporterId.fullName : 'Unknown User',
      createdAt: r.createdAt,
      originalId: r._id
    }));

    // Combine and sort
    const activities = [...emergencyActivities, ...reportActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 15);

    res.json(activities);
  } catch (err) {
    console.error('GET /api/admin/activities error:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin activities.' });
  }
});

module.exports = router;
