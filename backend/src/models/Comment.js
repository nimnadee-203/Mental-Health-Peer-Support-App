const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    authorName: {
      type: String,
      default: 'Anonymous Member',
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index to quickly fetch comments for a specific post
commentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
