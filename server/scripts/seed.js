import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedRewardItems } from '../utils/seedRewards.js';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('[Seed Rewards] Connecting to MongoDB...');
    await connectDB();
    console.log('[Seed Rewards] Seeding reward items...');
    const items = await seedRewardItems();
    console.log(`[Seed Rewards] Successfully seeded ${items.length} reward items:`);
    items.forEach((item) => {
      console.log(`  - ${item.name} (${item.type}, ${item.rarity}): ${item.price} Gold [ID: ${item._id}]`);
    });
    await mongoose.connection.close();
    console.log('[Seed Rewards] Finished and database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Rewards Error]:', error.message);
    process.exit(1);
  }
};

runSeed();
