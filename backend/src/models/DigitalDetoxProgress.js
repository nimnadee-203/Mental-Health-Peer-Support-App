const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    completedAt: { type: Date, required: true },
    reflection: { type: String, trim: true, maxlength: 500 },
    mood: { type: String, enum: ['😣', '😐', '🙂', '😌'] },
  },
  { _id: false },
);

const digitalDetoxProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentDay: { type: Number, required: true, min: 1, max: 31, default: 1 },
    completedDays: { type: [Number], default: [] },
    startedAt: { type: Date, default: Date.now },
    lastCompletedAt: { type: Date },
    completed: { type: Boolean, default: false },
    history: { type: [completionSchema], default: [] },
  },
  { timestamps: true },
);

digitalDetoxProgressSchema.index({ userId: 1 }, { unique: true });

module.exports =
  mongoose.models.DigitalDetoxProgress ||
  mongoose.model('DigitalDetoxProgress', digitalDetoxProgressSchema);
