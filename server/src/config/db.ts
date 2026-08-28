import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedInitialData } from '../services/seedData';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_college_assistant';

  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB at: ${uri}`);
    await seedInitialData();
  } catch (err: any) {
    console.warn(`[DB] Could not connect to external MongoDB (${err.message}). Initializing In-Memory MongoDB...`);
    try {
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`[DB] Connected to In-Memory MongoDB at: ${memUri}`);
      await seedInitialData();
    } catch (memErr: any) {
      console.error('[DB] Failed to start In-Memory MongoDB:', memErr);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
