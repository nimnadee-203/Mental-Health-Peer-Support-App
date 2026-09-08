const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ── GET /api/conversations ────────────────────────────────────────────────────
// Returns all conversations sorted by most-recent message first.
router.get('/', async (_req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/conversations ───────────────────────────────────────────────────
// Creates a new conversation (direct or group).
router.post('/', async (req, res) => {
  try {
    const conversation = await Conversation.create(req.body);
    res.status(201).json(conversation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET /api/conversations/:id ────────────────────────────────────────────────
// Returns a single conversation by ID.
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).lean();
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/conversations/:id/messages ──────────────────────────────────────
// Returns all messages for a conversation in chronological order.
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ sentAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/conversations/:id/messages ──────────────────────────────────────
// Sends a new message and updates the conversation's lastMessage snapshot.
router.post('/:id/messages', async (req, res) => {
  try {
    const { senderName, text, isOwn } = req.body;

    if (!senderName || !text) {
      return res.status(400).json({ error: 'senderName and text are required' });
    }

    const sentAt = new Date();

    // Create the message
    const message = await Message.create({
      conversationId: req.params.id,
      senderName,
      text,
      isOwn: isOwn ?? true,
      sentAt,
    });

    // Update the conversation's last-message snapshot and clear unread count
    // (in a real app unreadCount would only be reset for the reading user)
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessageText: text,
      lastMessageSender: senderName,
      lastMessageAt: sentAt,
      unreadCount: 0,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/conversations/:id ─────────────────────────────────────────────
// Deletes a conversation and all its messages.
router.delete('/:id', async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.id });
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
