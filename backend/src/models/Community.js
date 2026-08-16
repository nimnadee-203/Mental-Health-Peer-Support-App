const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    category: {type: String, required: true, trim: true},
    emoji: {type: String, required: true},
    bgColor: {type: String, required: true},
    description: {type: String, required: true},
    memberCount: {type: Number, default: 0, min: 0},
    memberAvatarColors: [{type: String}],
    isJoined: {type: Boolean, default: false},
  },
  {timestamps: true},
);

// Text index for search
communitySchema.index({name: 'text', description: 'text'});

module.exports = mongoose.model('Community', communitySchema);
