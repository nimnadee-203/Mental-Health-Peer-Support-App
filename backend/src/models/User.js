const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    passwordHash: String,
    role: {
      type: String,
      enum: ['community_member', 'user', 'peer_volunteer', 'moderator', 'admin'],
      default: 'community_member',
      index: true,
    },
    bio: String,
    interests: [String],
    stats: Object,
    privacySettings: Object,
  },
  { collection: 'users', timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);