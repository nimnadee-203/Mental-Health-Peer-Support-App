require('dotenv').config();
const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Set DNS servers to Google DNS for reliable MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported
}

const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const communitiesRouter = require('./routes/communities');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/reports', reportsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Connect & Start ─────────────────────────────────────────────────────────
if (!MONGO_URI) {
  console.warn('⚠️  MONGODB_URI is not defined. Please check your backend/.env file.');
}

mongoose
  .connect(MONGO_URI || 'mongodb://127.0.0.1:27017/mhpss_db', {
    serverSelectionTimeoutMS: 10000,
  })
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
