require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const communitiesRouter = require('./routes/communities');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/communities', communitiesRouter);

app.get('/health', (_req, res) => res.json({status: 'ok', time: new Date()}));

// ── Connect & Start ─────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB Atlas');
    app.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}`),
    );
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
