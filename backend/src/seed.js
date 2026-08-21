/**
 * seed.js — Populate MongoDB with the 7 communities from the Figma design.
 * Run once: node src/seed.js
 */
require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const Community = require('./models/Community');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const MONGO_URI = process.env.MONGODB_URI;

const SEED_DATA = [
  {
    name: 'Managing Academic Stress',
    category: 'Academic Pressure',
    emoji: '📚',
    bgColor: '#FDDCB5',
    description:
      'Share experiences and discover ways to manage academic pressure together.',
    memberCount: 128,
    memberAvatarColors: ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
    isJoined: false,
  },
  {
    name: 'Mindfulness & Healthy Habits',
    category: 'Mindfulness',
    emoji: '🧘',
    bgColor: '#D4C9F5',
    description:
      'A supportive community focused on building healthier everyday habits.',
    memberCount: 96,
    memberAvatarColors: ['#FDDCB5', '#C5DFF8', '#F9D4E0'],
    isJoined: false,
  },
  {
    name: 'Anxiety Support Circle',
    category: 'Stress & Anxiety',
    emoji: '🌊',
    bgColor: '#C5DFF8',
    description:
      'A safe space for people to share experiences and support one another.',
    memberCount: 154,
    memberAvatarColors: ['#C8EDD5', '#D4C9F5', '#FDDCB5'],
    isJoined: false,
  },
  {
    name: 'Grief & Loss',
    category: 'General Wellbeing',
    emoji: '🕊️',
    bgColor: '#F9D4E0',
    description:
      'Gentle, supportive conversations about loss, grief, and healing at your pace.',
    memberCount: 112,
    memberAvatarColors: ['#C5DFF8', '#C8EDD5', '#FDDCB5'],
    isJoined: false,
  },
  {
    name: 'Recovery & Growth',
    category: 'General Wellbeing',
    emoji: '🌱',
    bgColor: '#C8EDD5',
    description:
      'Celebrating progress together — big milestones and small everyday wins.',
    memberCount: 87,
    memberAvatarColors: ['#F9D4E0', '#D4C9F5', '#C5DFF8'],
    isJoined: false,
  },
  {
    name: 'Relationships & Connection',
    category: 'Relationships',
    emoji: '🤝',
    bgColor: '#F9D4E0',
    description:
      'A space to talk about friendship, connection, and the challenges they bring.',
    memberCount: 73,
    memberAvatarColors: ['#FDDCB5', '#C8EDD5', '#C5DFF8'],
    isJoined: false,
  },
  {
    name: 'Emotional Wellbeing',
    category: 'General Wellbeing',
    emoji: '💛',
    bgColor: '#FDDCB5',
    description:
      "Share what's on your mind and find support from people who understand.",
    memberCount: 141,
    memberAvatarColors: ['#F9D4E0', '#C5DFF8', '#D4C9F5'],
    isJoined: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB Atlas');

    // Clear existing
    const deleted = await Community.deleteMany({});
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing communities`);

    // Insert fresh seed data
    const inserted = await Community.insertMany(SEED_DATA);
    console.log(`🌱  Seeded ${inserted.length} communities:`);
    inserted.forEach(c => console.log(`   • ${c.name} [${c.category}]`));
  } catch (err) {
    console.error('❌  Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋  Disconnected from MongoDB');
  }
}

seed();
