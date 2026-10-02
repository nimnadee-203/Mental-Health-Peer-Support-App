const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    date: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    meetingLink: { type: String, required: true, trim: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);
