import bcrypt from 'bcryptjs';
import cors from 'cors';
import dns from 'dns';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      trim: true,
      default: 'Sharing small steps, honest updates, and support with the community.',
    },
    interests: {
      type: [String],
      default: ['Anxiety support', 'Mindfulness', 'Daily journaling'],
    },
    stats: {
      posts: {
        type: Number,
        default: 0,
      },
      supports: {
        type: Number,
        default: 0,
      },
      replies: {
        type: Number,
        default: 0,
      },
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['Everyone', 'Group Members', 'Only Me'],
        default: 'Group Members',
      },
      anonymousSharing: {
        type: Boolean,
        default: true,
      },
      whoCanMessageMe: {
        type: String,
        enum: ['Everyone', 'Group Members', 'Nobody'],
        default: 'Group Members',
      },
      showInterestsOnProfile: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

const buildUserProfile = user => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  bio: user.bio,
  interests: user.interests,
  stats: user.stats,
  privacySettings: user.privacySettings || {
    profileVisibility: 'Group Members',
    anonymousSharing: true,
    whoCanMessageMe: 'Group Members',
    showInterestsOnProfile: false,
  },
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/auth/signup', async (request, response) => {
  try {
    const { fullName, email, password } = request.body;

    if (!fullName || !email || !password) {
      return response.status(400).json({ message: 'All fields are required.' });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return response
        .status(400)
        .json({ message: 'Full name must be at least 2 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return response
        .status(400)
        .json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return response
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return response
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName: cleanName, email: cleanEmail, passwordHash });

    return response.status(201).json({
      user: buildUserProfile(user),
    });
  } catch (error) {
    return response.status(500).json({ message: 'Could not create account.' });
  }
});

app.post('/auth/login', async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    return response.json({
      user: buildUserProfile(user),
    });
  } catch (error) {
    return response.status(500).json({ message: 'Could not log in.' });
  }
});

app.get('/profile/:userId', async (request, response) => {
  try {
    const { userId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return response.status(400).json({ message: 'Invalid user ID.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).json({ message: 'User not found.' });
    }

    return response.json({ user: buildUserProfile(user) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not load profile.' });
  }
});

app.put('/profile/:userId', async (request, response) => {
  try {
    const { userId } = request.params;
    const { fullName, bio, interests, privacySettings } = request.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return response.status(400).json({ message: 'Invalid user ID.' });
    }

    const updates = {};

    if (typeof fullName === 'string') {
      updates.fullName = fullName.trim();
    }

    if (typeof bio === 'string') {
      updates.bio = bio.trim();
    }

    if (Array.isArray(interests)) {
      updates.interests = interests
        .filter(interest => typeof interest === 'string')
        .map(interest => interest.trim())
        .filter(Boolean);
    }

    if (privacySettings && typeof privacySettings === 'object') {
      updates.privacySettings = privacySettings;
    }

    if (updates.fullName === '') {
      return response.status(400).json({ message: 'Full name cannot be empty.' });
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return response.status(404).json({ message: 'User not found.' });
    }

    return response.json({ user: buildUserProfile(user) });
  } catch (error) {
    return response.status(500).json({ message: 'Could not update profile.' });
  }
});

app.get('/communities', (_request, response) => {
  response.json([
    {
      _id: '1',
      name: 'Anxiety & Stress Support',
      category: 'Stress & Anxiety',
      emoji: '🌿',
      bgColor: '#E6F4EA',
      description: 'A safe space to share anxiety coping strategies and ground yourself.',
      guidelines: 'Be kind, respectful, and supportive.',
      memberCount: 1420,
      memberAvatarColors: ['#34D399', '#60A5FA', '#F472B6'],
      isJoined: false,
    },
    {
      _id: '2',
      name: 'Daily Mindfulness & Healing',
      category: 'Mindfulness',
      emoji: '🧘',
      bgColor: '#E8F0FE',
      description: 'Practice meditation, breathing exercises, and present-moment awareness.',
      guidelines: 'Share your journey openly.',
      memberCount: 890,
      memberAvatarColors: ['#818CF8', '#FBBF24', '#34D399'],
      isJoined: false,
    },
    {
      _id: '3',
      name: 'Depression Recovery Peers',
      category: 'Depression',
      emoji: '☀️',
      bgColor: '#FEF3C7',
      description: 'Supporting each other through low moments with hope and small wins.',
      guidelines: 'No medical advice; offer peer empathy.',
      memberCount: 1105,
      memberAvatarColors: ['#F87171', '#60A5FA', '#A78BFA'],
      isJoined: false,
    },
  ]);
});

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Copy .env.example to .env and set it there.');
}

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
