import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Set it in server/.env first.');
}

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected successfully.');
  await mongoose.disconnect();
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}`);
  process.exit(1);
}
