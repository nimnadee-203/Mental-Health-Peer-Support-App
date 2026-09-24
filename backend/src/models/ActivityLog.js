const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['LOGIN', 'ROLE_CHANGE', 'USER_CREATED', 'USER_DELETED', 'EMERGENCY', 'REPORT'],
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
