import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/convoai';
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`🌿 MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.warn(`⚠️ MongoDB connection warning (${err.message}). Using resilient in-memory/hybrid store.`);
    return null;
  }
}
