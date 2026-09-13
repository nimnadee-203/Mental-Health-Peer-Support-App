const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EmergencyRequest = require('../models/EmergencyRequest');
const TrustedContact = require('../models/TrustedContact');
const NotificationService = require('../services/NotificationService');

const VALID_TYPES = ['IMMEDIATE_DANGER', 'MEDICAL', 'MENTAL_HEALTH', 'TRUSTED_CONTACT'];
const VALID_STATUSES = ['PENDING', 'CONTACTED', 'RESOLVED', 'CANCELLED'];

/**
 * POST /api/emergency
 * Create a new emergency/support request.
 * Authenticated users only.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { type, description } = req.body;

    // Validate type
    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid emergency type.' });
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    const request = new EmergencyRequest({
      userId: req.user.id,
      type,
      status: 'PENDING',
      description: description.trim(),
    });

    await request.save();

    // SECURITY: Do NOT log the description.
    console.log(`[Emergency] Created emergency request ${request._id} for user ${req.user.id}`);

    res.status(201).json({
      success: true,
      requestId: request._id,
      status: 'PENDING',
    });
  } catch (err) {
    console.error('POST /api/emergency error:', err.message);
    res.status(500).json({ error: 'Failed to create emergency request.' });
  }
});

/**
 * GET /api/emergency/my-requests
 * Retrieve all emergency requests for the authenticated user.
 */
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await EmergencyRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('GET /api/emergency/my-requests error:', err.message);
    res.status(500).json({ error: 'Failed to fetch emergency requests.' });
  }
});

/**
 * PATCH /api/emergency/:id/status
 * Update the status of an emergency request.
 * User can only update their own request.
 */
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid emergency status.' });
    }

    const request = await EmergencyRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Emergency request not found.' });
    }

    // Authorization: Must own the request
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not own this request.' });
    }

    request.status = status;
    await request.save();

    console.log(`[Emergency] Updated request ${id} status to ${status}`);
    res.json(request);
  } catch (err) {
    console.error('PATCH /api/emergency/:id/status error:', err.message);
    res.status(500).json({ error: 'Failed to update emergency request status.' });
  }
});

/**
 * POST /api/emergency/:id/notify-trusted-contact
 * Triggers a notification to the user's trusted contact for this emergency.
 */
router.post('/:id/notify-trusted-contact', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await EmergencyRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Emergency request not found.' });
    }

    // Authorization: Must own the request
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not own this request.' });
    }

    const contact = await TrustedContact.findOne({ userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ error: 'No trusted contact configured.' });
    }

    const notificationResult = await NotificationService.sendEmergencyNotification(
      req.user,
      contact,
      request
    );

    res.json(notificationResult);
  } catch (err) {
    console.error('POST /api/emergency/:id/notify-trusted-contact error:', err.message);
    res.status(500).json({ error: 'Failed to notify trusted contact.' });
  }
});

module.exports = router;
