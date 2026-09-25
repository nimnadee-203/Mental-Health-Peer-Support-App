const express = require('express');
const auth = require('../middleware/auth');
const JournalEntry = require('../models/JournalEntry');

const router = express.Router();
const moods = ['great', 'good', 'okay', 'low', 'stressed'];
const focuses = ['clear', 'gratitude', 'feelings', 'plan'];

router.get('/', auth, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json({ entries });
  } catch (error) {
    console.error('GET /api/journals error:', error.message);
    return res.status(500).json({ error: 'Failed to load journal entries.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { mood, focus, answers, tinyWin } = req.body || {};
    if (!moods.includes(mood) || !focuses.includes(focus)) {
      return res.status(400).json({ error: 'A valid mood and focus are required.' });
    }
    if (!Array.isArray(answers) || answers.length !== 3 || answers.some(answer => typeof answer !== 'string')) {
      return res.status(400).json({ error: 'Three journal answers are required.' });
    }
    if (tinyWin !== undefined && typeof tinyWin !== 'string') {
      return res.status(400).json({ error: 'Tiny win must be text.' });
    }

    const entry = await JournalEntry.create({
      userId: req.user.id,
      mood,
      focus,
      answers: answers.map(answer => answer.trim().slice(0, 2000)),
      tinyWin: (tinyWin || '').trim().slice(0, 2000),
    });

    return res.status(201).json({ entry });
  } catch (error) {
    console.error('POST /api/journals error:', error.message);
    return res.status(500).json({ error: 'Failed to save journal entry.' });
  }
});

module.exports = router;
