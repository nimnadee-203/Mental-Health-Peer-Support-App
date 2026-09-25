const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: { type: String, required: true, enum: ['great', 'good', 'okay', 'low', 'stressed'] },
    focus: { type: String, required: true, enum: ['clear', 'gratitude', 'feelings', 'plan'] },
    answers: { type: [String], required: true, default: [] },
    tinyWin: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true },
);

module.exports = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalEntrySchema);
