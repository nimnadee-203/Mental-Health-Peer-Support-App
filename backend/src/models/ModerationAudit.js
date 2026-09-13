const mongoose = require('mongoose');

const moderationAuditSchema = new mongoose.Schema(
  {
    moderatorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    action: {
      type: String,
      enum: ['DISMISS_REPORT', 'HIDE_POST', 'RESTORE_POST', 'WARN_USER', 'UPDATE_REPORT'],
      required: true,
    },
    targetType: { type: String, enum: ['report', 'post', 'user'], required: true },
    targetId: { type: String, required: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    reason: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ModerationAudit', moderationAuditSchema);