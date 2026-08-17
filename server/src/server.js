import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return response
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email, passwordHash });

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
    const { fullName, bio, interests } = request.body;

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
