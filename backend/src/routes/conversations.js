const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// ── GET /api/conversations ────────────────────────────────────────────────────
// Returns all conversations sorted by most-recent message first. If userId is provided, filter by participants.
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { participants: { $in: [userId] } } : {};
    
    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();
      
    if (userId) {
      // For direct chats, resolve peer details relative to the requesting userId
      for (const conv of conversations) {
        conv.unreadCount = conv.unreadCounts?.[userId] || 0;
        if (conv.type === 'direct' && conv.participants && conv.participants.length === 2) {
          const otherId = conv.participants.find(id => id !== userId);
          if (otherId) {
            try {
              const otherUser = await User.findById(otherId).select('fullName role');
              if (otherUser) {
                conv.peerName = otherUser.fullName;
                if (otherUser.role === 'moderator') {
                  conv.avatarEmoji = '🛡️';
                  conv.avatarBgColor = '#EDE8FA';
                } else if (otherUser.role === 'professional') {
                  conv.avatarEmoji = '👨‍⚕️';
                  conv.avatarBgColor = '#E8F0FF';
                } else {
                  conv.avatarEmoji = '😊';
                  conv.avatarBgColor = '#C5DFF8';
                }
              }
            } catch(e) {
              // Ignore invalid ID errors
            }
          }
        }
      }
    }
    
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/conversations ───────────────────────────────────────────────────
// Creates a new conversation (direct or group).
router.post('/', async (req, res) => {
  try {
    const { type, participants } = req.body;

    // Check if direct conversation already exists between the exactly 2 participants
    if (type === 'direct' && participants && participants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'direct',
        participants: { $all: participants, $size: 2 }
      });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const conversation = await Conversation.create(req.body);
    res.status(201).json(conversation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── POST /api/conversations/professional-support ────────────────────────────
// Sends one automated support request to every professional account.
router.post('/professional-support', async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const requester = await User.findById(userId).select('fullName').lean();
    if (!requester) {
      return res.status(404).json({ error: 'Requesting user not found' });
    }
    const senderName = requester.fullName || 'User';

    const professionals = await User.find({ role: { $in: ['professional', 'admin'] } })
      .select('_id fullName role')
      .lean();

    if (professionals.length === 0) {
      return res.status(404).json({ error: 'No professionals are available' });
    }

    const conversations = [];
    for (const professional of professionals) {
      const professionalId = professional._id.toString();
      let conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [userId, professionalId], $size: 2 },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: 'direct',
          participants: [userId, professionalId],
          peerName: professional.fullName,
          avatarEmoji: '👨‍⚕️',
          avatarBgColor: '#E8F0FF',
        });
      }

      const sentAt = new Date();
      await Message.create({
        conversationId: conversation._id,
        senderName,
        senderId: userId,
        text: message,
        isOwn: true,
        sentAt,
      });

      const unreadCounts = { ...(conversation.unreadCounts || {}) };
      unreadCounts[professionalId] = (unreadCounts[professionalId] || 0) + 1;
      unreadCounts[userId] = 0;
      conversation.lastMessageText = message;
      conversation.lastMessageSender = senderName;
      conversation.lastMessageAt = sentAt;
      conversation.unreadCounts = unreadCounts;
      conversation.unreadCount = unreadCounts[professionalId];
      await conversation.save();
      conversations.push(conversation);
    }

    res.status(201).json({ conversations, sentTo: professionals.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// ── POST /api/conversations/:id/read ─────────────────────────────────────────
router.post('/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const unreadCounts = { ...(conversation.unreadCounts || {}) };
    unreadCounts[userId] = 0;
    conversation.unreadCounts = unreadCounts;
    conversation.unreadCount = 0;
    await conversation.save();
    res.json({ success: true });
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
    res.json(messages.map(message => ({
      ...message,
      isOwn: req.query.userId ? message.senderId === req.query.userId : message.isOwn,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/conversations/:id/messages ──────────────────────────────────────
// Sends a new message and updates the conversation's lastMessage snapshot.
router.post('/:id/messages', async (req, res) => {
  try {
    const { senderName, senderId, text, isOwn, mediaUrl } = req.body;

    if (!senderName || (!text && !mediaUrl)) {
      return res.status(400).json({ error: 'senderName and either text or mediaUrl are required' });
    }

    const sentAt = new Date();

    // Create the message
    const message = await Message.create({
      conversationId: req.params.id,
      senderName,
      senderId: senderId || null,
      text: text || '',
      mediaUrl: mediaUrl || null,
      isOwn: isOwn ?? true,
      sentAt,
    });

    // Update the conversation's last-message snapshot and clear unread count
    // (in a real app unreadCount would only be reset for the reading user)
    const snapshotText = text ? text : (mediaUrl ? 'Sent an attachment' : '');
    
    const conversation = await Conversation.findById(req.params.id);
    const unreadCounts = { ...(conversation?.unreadCounts || {}) };
    if (senderId && conversation) {
      conversation.participants.forEach(participantId => {
        const participant = participantId.toString();
        unreadCounts[participant] = participant === senderId
          ? 0
          : (unreadCounts[participant] || 0) + 1;
      });
    }

    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessageText: snapshotText,
      lastMessageSender: senderName,
      lastMessageAt: sentAt,
      ...(senderId ? { unreadCounts, unreadCount: unreadCounts[senderId] || 0 } : { unreadCount: 0 }),
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
