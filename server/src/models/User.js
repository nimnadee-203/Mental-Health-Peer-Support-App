import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, required: true },
    email: { type: String, lowercase: true, trim: true, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin', 'professional'],
      default: 'user',
      index: true,
    },
    medicalExperience: { type: String, trim: true },
    bio: {
      type: String,
      trim: true,
      default: 'Sharing small steps, honest updates, and support with the community.',
    },
    interests: { type: [String], default: ['Anxiety support', 'Mindfulness', 'Daily journaling'] },
    stats: {
      posts: { type: Number, default: 0 },
      supports: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
    },
    privacySettings: {
      profileVisibility: { type: String, enum: ['Everyone', 'Group Members', 'Only Me'], default: 'Group Members' },
      anonymousSharing: { type: Boolean, default: true },
      whoCanMessageMe: { type: String, enum: ['Everyone', 'Group Members', 'Nobody'], default: 'Group Members' },
      showInterestsOnProfile: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model('User', userSchema);