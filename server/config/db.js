import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifequest';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[Database Error] Primary MongoDB Atlas connection failed in production: ${error.message}`);
      return false;
    }
    console.warn(`[Database Warning] Primary MongoDB connection failed (${error.message}). Attempting In-Memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`[Database] In-Memory MongoDB Server Started & Connected: ${conn.connection.host}`);
      return true;
    } catch (memError) {
      console.error(`[Database Error] In-Memory MongoDB fallback error: ${memError.message}`);
      return false;
    }
  }
};
