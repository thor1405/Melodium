import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    if (uri && !uri.includes('memory')) {
      const isAtlas = uri.includes('mongodb+srv') || uri.includes('.mongodb.net');
      console.log(`[Database] Connecting to ${isAtlas ? 'MongoDB Atlas Cloud Database' : 'MongoDB'}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`[Database] Connected successfully to ${isAtlas ? 'MongoDB Atlas Cluster' : 'MongoDB'}: ${conn.connection.host}`);
      return conn;
    }
  } catch (err) {
    console.warn(`[Database] Connection to MONGO_URI failed (${err.message}). Falling back to Embedded MongoDB...`);
  }

  // Fallback to Embedded MongoMemoryServer for development if Atlas is not reachable
  try {
    mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[Database] Connected to Embedded MongoDB Instance: ${memUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database] Failed to start MongoDB:`, memErr.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
