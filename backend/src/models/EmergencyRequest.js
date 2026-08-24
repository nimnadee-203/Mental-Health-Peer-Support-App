const mongoose = require('mongoose');

const EmergencyRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['IMMEDIATE_DANGER', 'MEDICAL', 'MENTAL_HEALTH', 'TRUSTED_CONTACT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONTACTED', 'RESOLVED', 'CANCELLED'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for query efficiency
EmergencyRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('EmergencyRequest', EmergencyRequestSchema);
