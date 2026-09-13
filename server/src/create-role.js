import bcrypt from 'bcryptjs';
import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';

dotenv.config();

// Use a resolver that can reach MongoDB Atlas SRV records on this network.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const role = process.argv[2];
if (!['admin', 'moderator'].includes(role)) {
  throw new Error('Usage: npm run create-admin | npm run create-moderator');
}

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  },
  { collection: 'users' },
);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const ask = question => new Promise(resolve => {
  const interfaceRef = readline.createInterface({ input: process.stdin, output: process.stdout });
  interfaceRef.question(question, answer => {
    interfaceRef.close();
    resolve(answer.trim());
  });
});

const createRoleAccount = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in server/.env');
  const fullName = await ask('Full name: ');
  const email = (await ask('Email: ')).toLowerCase();
  const password = await ask('Password: ');
  if (!fullName || !email || password.length < 6) throw new Error('Name, email, and a password of at least 6 characters are required.');

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = role;
    existing.passwordHash = await bcrypt.hash(password, 12);
    existing.fullName = fullName;
    await existing.save();
    console.log(`Updated existing account ${email} to ${role}.`);
  } else {
    await User.create({ fullName, email, passwordHash: await bcrypt.hash(password, 12), role });
    console.log(`Created ${role} account ${email}.`);
  }
  await mongoose.disconnect();
};

createRoleAccount().catch(async error => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});