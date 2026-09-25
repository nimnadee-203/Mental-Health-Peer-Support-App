const mongoose = require('mongoose');

/**
 * Message — a single chat message belonging to a Conversation.
 *
 * `isOwn` is used by the frontend to decide which side the bubble appears on.
 * In a real app this would derive from the authenticated user; here it is stored
 * for simplicity so the seed data looks correct without auth middleware.
 */
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },

    senderName: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      default: '',
      trim: true,
    },

    mediaUrl: {
      type: String,
      default: null,
    },

    // true  → bubble appears on the right (current user's message)
    // false → bubble appears on the left (peer / group member)
    isOwn: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // We index by conversationId + sentAt so messages are fetched in order
    timestamps: false,
  }
);

messageSchema.index({ conversationId: 1, sentAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
