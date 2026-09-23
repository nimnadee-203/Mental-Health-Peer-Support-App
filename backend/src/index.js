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
const conversationsRouter = require('./routes/conversations');
const reportsRouter = require('./routes/reports');
const emergencyRouter = require('./routes/emergency');
const trustedContactRouter = require('./routes/trustedContact');
const resourcesRouter = require('./routes/resources');
const moderationRouter = require('./routes/moderation');
const uploadRouter = require('./routes/upload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/trusted-contact', trustedContactRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/moderation', moderationRouter);
app.use('/api/upload', uploadRouter);

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
    const server = app.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}`),
    );

    // ── Graceful shutdown (fixes EADDRINUSE on nodemon restart) ────────────
    const shutdown = (signal) => {
      console.log(`\n⚙️  ${signal} received — closing server gracefully...`);
      server.close(() => {
        mongoose.connection.close(false).then(() => {
          console.log('✅  Server and DB connection closed.');
          process.exit(0);
        });
      });
    };

    // nodemon sends SIGUSR2 before restarting on Windows
    process.once('SIGUSR2', () => shutdown('SIGUSR2'));
    // Standard termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
