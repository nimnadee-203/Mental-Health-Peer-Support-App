const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin', 'professional'],
      default: 'user',
      index: true,
    },
    medicalExperience: String,
  },
  { collection: 'users' },
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);