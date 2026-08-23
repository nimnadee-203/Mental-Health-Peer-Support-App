/**
 * seed.js — Populate MongoDB with sample posts for each community.
 * Run once: npm run seed
 *
 * Uses the same string groupIds as defined in App.tsx COMMUNITIES array.
 */
require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const Post = require('./models/Post');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const MONGO_URI = process.env.MONGODB_URI;

// ── These IDs must match the _id values in App.tsx COMMUNITIES ───────────────
const SEED_POSTS = [
  // Managing Academic Stress
  {
    groupId: 'academic_stress',
    content:
      "I've been feeling overwhelmed with assignments lately. Does anyone have small ways they manage academic stress? Even little things help.",
    topic: 'Study & Focus',
    contentNote: 'Academic pressure',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 12,
    commentsCount: 6,
  },
  {
    groupId: 'academic_stress',
    content:
      'Does anyone have a good routine for taking breaks while studying? I struggle to step away even when I know I need to.',
    topic: 'Breaks & Rest',
    contentNote: 'None',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 9,
    commentsCount: 4,
  },
  {
    groupId: 'academic_stress',
    content:
      'Something that helped me this week — journaling three things I noticed during the day (not even grateful for, just noticed). Surprisingly grounding.',
    topic: 'Sharing',
    contentNote: 'None',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 18,
    commentsCount: 7,
  },

  // Calm Minds Community
  {
    groupId: 'calm_minds',
    content:
      'Anxiety hit me hard this morning before my presentation. I tried the 5-4-3-2-1 grounding technique and it actually helped. Sharing in case it helps someone else.',
    topic: 'Sharing',
    contentNote: 'Anxiety / stress',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 22,
    commentsCount: 8,
  },
  {
    groupId: 'calm_minds',
    content:
      'What are some things you do when anxiety makes it hard to sleep? Looking for practical tips, not just "breathe deeply".',
    topic: 'Asking for support',
    contentNote: 'Anxiety / stress',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 15,
    commentsCount: 11,
  },

  // Mindfulness & Self-Care
  {
    groupId: 'mindfulness',
    content:
      'Started a 10-minute morning walk this week. No phone, no music — just walking. It sounds small but it genuinely shifted my mood every day.',
    topic: 'Sharing',
    contentNote: 'None',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 31,
    commentsCount: 5,
  },
  {
    groupId: 'mindfulness',
    content:
      'What self-care habits actually stuck for you long term? I keep starting things and dropping them after a week.',
    topic: 'General',
    contentNote: 'None',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 19,
    commentsCount: 13,
  },

  // You Are Not Alone
  {
    groupId: 'not_alone',
    content:
      'Today was heavy. I just needed to say that out loud somewhere. Thank you for this space existing.',
    topic: 'General',
    contentNote: 'Sensitive topic',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 47,
    commentsCount: 14,
  },
  {
    groupId: 'not_alone',
    content:
      "Reached out to a friend today for the first time in weeks. They didn't make it weird. Small win but it means a lot.",
    topic: 'Sharing',
    contentNote: 'None',
    isAnonymous: true,
    authorName: 'Anonymous Member',
    likes: 38,
    commentsCount: 9,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB Atlas');

    // Clear existing posts
    const deleted = await Post.deleteMany({});
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing posts`);

    // Insert seed posts
    const inserted = await Post.insertMany(SEED_POSTS);
    console.log(`🌱  Seeded ${inserted.length} posts across communities:`);

    const groups = [...new Set(SEED_POSTS.map(p => p.groupId))];
    groups.forEach(g => {
      const count = inserted.filter(p => p.groupId === g).length;
      console.log(`   • ${g}: ${count} posts`);
    });
  } catch (err) {
    console.error('❌  Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋  Disconnected from MongoDB');
  }
}

seed();
