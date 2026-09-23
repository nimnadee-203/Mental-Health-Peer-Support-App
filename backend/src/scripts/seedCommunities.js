require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Community = require('../models/Community');

const INITIAL_COMMUNITIES = [
  {
    name: 'General Wellbeing',
    category: 'General Wellbeing',
    emoji: '🌱',
    bgColor: '#E8F5E9',
    description:
      'A space for discussing daily habits, overall mental wellness, and finding balance.',
    guidelines: 'Be respectful and supportive.',
    memberCount: 3420,
    memberAvatarColors: ['#C5DFF8', '#F9D4E0', '#C8EDD5'],
    isPrivate: false,
  },
  {
    name: 'Anxiety & Stress Support',
    category: 'Stress & Anxiety',
    emoji: '🌧️',
    bgColor: '#E0F2FE',
    description:
      'Share your worries, learn coping mechanisms, and find comfort with others.',
    guidelines: 'No judgment. Share only what you are comfortable with.',
    memberCount: 2850,
    memberAvatarColors: ['#BAE6FD', '#7DD3FC', '#38BDF8'],
    isPrivate: false,
  },
  {
    name: 'Navigating Relationships',
    category: 'Relationships',
    emoji: '🤝',
    bgColor: '#FCE4EC',
    description:
      'Advice and support for family, romantic, and platonic relationship struggles.',
    guidelines: 'Keep details anonymous if needed.',
    memberCount: 1930,
    memberAvatarColors: ['#FBCFE8', '#F9A8D4', '#F472B6'],
    isPrivate: false,
  },
  {
    name: 'Academic Pressure',
    category: 'Academic Pressure',
    emoji: '📚',
    bgColor: '#F3E8FF',
    description:
      'For students dealing with exam stress, burnout, and balancing life.',
    guidelines: 'Encourage healthy study habits over burnout.',
    memberCount: 4200,
    memberAvatarColors: ['#E9D5FF', '#D8B4FE', '#C084FC'],
    isPrivate: false,
  },
  {
    name: 'Self-Care & Self-Love',
    category: 'Self-Care',
    emoji: '✨',
    bgColor: '#FEF3C7',
    description:
      'Building self-worth, overcoming imposter syndrome, and personal growth.',
    guidelines: 'Encouraging and uplifting discussions.',
    memberCount: 1210,
    memberAvatarColors: ['#F59E0B', '#FBBF24', '#FDE68A'],
    isPrivate: false,
  },
  {
    name: 'Daily Mindfulness & Healing',
    category: 'Mindfulness',
    emoji: '🧘',
    bgColor: '#E8F0FE',
    description:
      'Practice meditation, breathing exercises, and present-moment awareness.',
    guidelines: 'Share your journey openly.',
    memberCount: 890,
    memberAvatarColors: ['#818CF8', '#FBBF24', '#34D399'],
    isPrivate: false,
  },
  {
    name: 'Depression Recovery Peers',
    category: 'Depression',
    emoji: '☀️',
    bgColor: '#FEF3C7',
    description:
      'Supporting each other through low moments with hope and small wins.',
    guidelines: 'No medical advice; offer peer empathy.',
    memberCount: 1105,
    memberAvatarColors: ['#F87171', '#60A5FA', '#A78BFA'],
    isPrivate: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mhpss_db');
    console.log('Connected to MongoDB');

    for (const comm of INITIAL_COMMUNITIES) {
      const exists = await Community.findOne({ name: comm.name });
      if (!exists) {
        await Community.create(comm);
        console.log(`Created: ${comm.name}`);
      } else {
        console.log(`Skipped (already exists): ${comm.name}`);
      }
    }
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
