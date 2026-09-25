const express = require('express');
const auth = require('../middleware/auth');
const DigitalDetoxProgress = require('../models/DigitalDetoxProgress');

const router = express.Router();
const TOTAL_DAYS = 31;

const progressFor = userId => ({ userId });

router.get('/progress', auth, async (req, res) => {
  try {
    const progress = await DigitalDetoxProgress.findOne(progressFor(req.user.id)).lean();
    return res.json({ progress });
  } catch (error) {
    console.error('GET /api/digital-detox/progress error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch challenge progress.' });
  }
});

router.post('/start', auth, async (req, res) => {
  try {
    const progress = await DigitalDetoxProgress.findOneAndUpdate(
      progressFor(req.user.id),
      { $setOnInsert: { userId: req.user.id, startedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json({ progress });
  } catch (error) {
    console.error('POST /api/digital-detox/start error:', error.message);
    return res.status(500).json({ error: 'Failed to start the challenge.' });
  }
});

router.post('/day/:day/complete', auth, async (req, res) => {
  try {
    const day = Number(req.params.day);
    if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
      return res.status(400).json({ error: 'Challenge day must be between 1 and 31.' });
    }

    const progress = await DigitalDetoxProgress.findOne(progressFor(req.user.id));
    if (!progress) {
      return res.status(409).json({ error: 'Start the challenge before completing a day.' });
    }
    if (progress.completedDays.includes(day)) {
      return res.status(409).json({ error: 'This challenge day is already completed.', progress });
    }
    if (progress.completed || day !== progress.currentDay) {
      return res.status(409).json({ error: 'Complete the current challenge day first.', progress });
    }

    const completedAt = new Date();
    const reflection = typeof req.body?.reflection === 'string'
      ? req.body.reflection.trim().slice(0, 500)
      : undefined;
    const mood = ['😣', '😐', '🙂', '😌'].includes(req.body?.mood)
      ? req.body.mood
      : undefined;

    progress.completedDays.push(day);
    progress.history.push({ day, completedAt, reflection, mood });
    progress.lastCompletedAt = completedAt;
    progress.completed = day === TOTAL_DAYS;
    if (!progress.completed) {
      progress.currentDay = day + 1;
    }
    await progress.save();

    return res.json({ progress });
  } catch (error) {
    console.error('POST /api/digital-detox/day/:day/complete error:', error.message);
    return res.status(500).json({ error: 'Failed to save challenge progress.' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const progress = await DigitalDetoxProgress.findOne(progressFor(req.user.id))
      .select('history')
      .lean();
    return res.json({ history: progress?.history || [] });
  } catch (error) {
    console.error('GET /api/digital-detox/history error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch challenge history.' });
  }
});

module.exports = router;
