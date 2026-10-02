import bcrypt from 'bcryptjs';
import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';
import User from './models/User.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const role = process.argv[2];
if (!['admin', 'moderator'].includes(role)) {
  throw new Error('Usage: npm run create-admin | npm run create-moderator');
}

const ask = question => new Promise(resolve => {
  const interfaceRef = readline.createInterface({ input: process.stdin, output: process.stdout });
  interfaceRef.question(question, answer => {
    interfaceRef.close();
    resolve(answer.trim());
  });
});

const askPassword = question => new Promise(resolve => {
  const interfaceRef = readline.createInterface({ input: process.stdin, output: process.stdout });
  const mutedWrite = interfaceRef._writeToOutput;
  interfaceRef._writeToOutput = () => {};
  interfaceRef.question(question, answer => {
    interfaceRef._writeToOutput = mutedWrite;
    interfaceRef.close();
    process.stdout.write('\n');
    resolve(answer);
  });
});

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createRoleAccount = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Set it in server/.env first.');
  }

  const fullName = await ask('Admin name: ');
  const email = (await ask('Admin email: ')).toLowerCase();
  const password = await askPassword('Admin password: ');

  if (fullName.length < 2) throw new Error('Name must be at least 2 characters long.');
  if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === role) {
      console.log(`This account is already a ${role}: ${email}. No changes were made.`);
      return;
    }

    const confirmation = (await ask(
      `Account ${email} has role "${existing.role}". Change it to "${role}"? (yes/no): `,
    )).toLowerCase();
    if (confirmation !== 'yes' && confirmation !== 'y') {
      console.log('No changes were made.');
      return;
    }

    existing.role = role;
    await existing.save();
    console.log(`Updated existing account ${email} to ${role}.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ fullName, email, passwordHash, role });
  console.log(`Created ${role} account: ${email}.`);
};

createRoleAccount()
  .catch(error => {
    console.error(`Could not create ${role} account: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });