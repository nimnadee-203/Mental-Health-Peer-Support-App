/**
 * Imports the built-in frontend resource cards into MongoDB.
 * Safe to rerun: entries are matched by title and upserted.
 */
require('dotenv').config();
const dns = require('dns');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const vm = require('vm');
const Resource = require('./models/Resource');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (_error) {}

const MONGO_URI = process.env.MONGODB_URI;

function getBuiltInResources() {
  const resourceFile = path.resolve(
    __dirname,
    '../../src/types/ResourceArticle.ts',
  );
  const source = fs.readFileSync(resourceFile, 'utf8');
  const executableSource = source
    .replace(/export type ResourceArticleSection = \{[\s\S]*?\};\s*/, '')
    .replace(/export type ResourceArticle = \{[\s\S]*?\};\s*/, '')
    .replace('export const resourceArticles', 'const resourceArticles');

  return new vm.Script(
    `${executableSource}\nresourceArticles;`,
  ).runInNewContext();
}

async function seedResources() {
  if (!MONGO_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  const resources = getBuiltInResources();
  await mongoose.connect(MONGO_URI);

  const result = await Resource.bulkWrite(
    resources.map(resource => ({
      updateOne: {
        filter: { title: resource.title },
        update: { $set: resource },
        upsert: true,
      },
    })),
  );

  console.log(
    `Seeded ${resources.length} resources (${result.upsertedCount} new).`,
  );
}

seedResources()
  .catch(error => {
    console.error('Resource seed error:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
