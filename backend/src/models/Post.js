const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    contentNote: {
      type: String,
      default: 'None',
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    authorName: {
      type: String,
      default: 'Member',
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index to quickly fetch posts for a specific group
postSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
