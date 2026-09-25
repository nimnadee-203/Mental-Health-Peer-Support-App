const mongoose = require('mongoose');

/**
 * Conversation — represents either a direct peer-to-peer chat or a group chat.
 *
 * For direct chats: avatarEmoji + avatarBgColor are used to render the avatar.
 * For group chats:  groupName + groupEmoji + groupBgColor are used instead.
 */
const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
    },

    // ── Participants (display names) ──────────────────────────────────────────
    participants: {
      type: [String],
      default: [],
    },

    // ── Direct-chat display fields ────────────────────────────────────────────
    peerName: {
      type: String,
      default: '',
      trim: true,
    },
    avatarEmoji: {
      type: String,
      default: '😊',
    },
    avatarBgColor: {
      type: String,
      default: '#C5DFF8',
    },
    // Whether to render the avatar as a circle (direct) or rounded square (group)
    avatarIsCircle: {
      type: Boolean,
      default: true,
    },
    // Online / active indicator
    isOnline: {
      type: Boolean,
      default: false,
    },

    // ── Group-chat display fields ─────────────────────────────────────────────
    groupName: {
      type: String,
      default: '',
      trim: true,
    },
    groupEmoji: {
      type: String,
      default: '🧘',
    },
    groupBgColor: {
      type: String,
      default: '#D4C9F5',
    },
    groupBgColorEnd: {
      type: String,
      default: '#D4C9F5',
    },

    // ── Last message snapshot ─────────────────────────────────────────────────
    lastMessageText: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageSender: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },

    // ── Unread badge ──────────────────────────────────────────────────────────
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Always return newest conversations first
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
