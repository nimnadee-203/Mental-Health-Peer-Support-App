const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TrustedContact = require('../models/TrustedContact');

/**
 * GET /api/trusted-contact
 * Fetch the authenticated user's trusted contact details.
 */
router.get('/', auth, async (req, res) => {
  try {
    const contact = await TrustedContact.findOne({ userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ error: 'No trusted contact found.' });
    }

    res.json({ success: true, contact });
  } catch (err) {
    console.error('GET /api/trusted-contact error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trusted contact.' });
  }
});

/**
 * POST /api/trusted-contact
 * Create/Save a trusted contact.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    // Validate fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    if (!relationship || typeof relationship !== 'string' || relationship.trim().length === 0) {
      return res.status(400).json({ error: 'Relationship is required.' });
    }

    // Check if one already exists
    const existingContact = await TrustedContact.findOne({ userId: req.user.id });
    if (existingContact) {
      return res.status(400).json({
        error: 'A trusted contact already exists. Use PATCH to update it.',
      });
    }

    const contact = new TrustedContact({
      userId: req.user.id,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    });

    await contact.save();

    // SECURITY: Do NOT log the phone number.
    console.log(`[TrustedContact] Created contact ${contact._id} for user ${req.user.id}`);

    res.status(201).json({ success: true, contact });
  } catch (err) {
    console.error('POST /api/trusted-contact error:', err.message);
    res.status(500).json({ error: 'Failed to save trusted contact.' });
  }
});

/**
 * PATCH /api/trusted-contact
 * Update the authenticated user's trusted contact details.
 */
router.patch('/', auth, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    const contact = await TrustedContact.findOne({ userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ error: 'Trusted contact not found.' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name cannot be empty.' });
      }
      contact.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || phone.trim().length === 0) {
        return res.status(400).json({ error: 'Phone number cannot be empty.' });
      }
      contact.phone = phone.trim();
    }

    if (relationship !== undefined) {
      if (typeof relationship !== 'string' || relationship.trim().length === 0) {
        return res.status(400).json({ error: 'Relationship cannot be empty.' });
      }
      contact.relationship = relationship.trim();
    }

    await contact.save();

    console.log(`[TrustedContact] Updated contact ${contact._id} for user ${req.user.id}`);

    res.json({ success: true, contact });
  } catch (err) {
    console.error('PATCH /api/trusted-contact error:', err.message);
    res.status(500).json({ error: 'Failed to update trusted contact.' });
  }
});

/**
 * DELETE /api/trusted-contact
 * Remove the authenticated user's trusted contact.
 */
router.delete('/', auth, async (req, res) => {
  try {
    const result = await TrustedContact.deleteOne({ userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Trusted contact not found.' });
    }

    console.log(`[TrustedContact] Deleted contact for user ${req.user.id}`);

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/trusted-contact error:', err.message);
    res.status(500).json({ error: 'Failed to delete trusted contact.' });
  }
});

module.exports = router;
