const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['Post', 'Comment'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    groupId: {
      type: String,
      default: null,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      default: '',
      trim: true,
    },
    reasonNote: {
      type: String,
      default: '',
      trim: true,
    },
    targetContentPreview: {
      type: String,
      default: '',
      trim: true,
    },
    targetAuthor: {
      type: String,
      default: '',
      trim: true,
    },
    reporterName: {
      type: String,
      default: 'Anonymous User',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to quickly fetch pending reports for a group or target type
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Report', reportSchema);
