const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: '🌱',
      trim: true,
    },
    bgColor: {
      type: String,
      default: '#C8EDD5',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    memberAvatarColors: {
      type: [String],
      default: ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
    },
    isJoined: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Community', communitySchema);
