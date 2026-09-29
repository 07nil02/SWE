import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export async function connectDB(): Promise<string> {
  const customUri = process.env.MONGODB_URI;
  if (customUri) {
    try {
      const maskedUri = customUri.replace(/:([^:@]+)@/, ':****@');
      console.log(`[DB] Attempting connection to custom MONGODB_URI: ${maskedUri}...`);
      await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 10000,
        dbName: 'transport_fleet',
      });
      console.log(`[DB] Successfully connected to MongoDB Atlas (database: transport_fleet)`);
      return customUri;
    } catch (err) {
      console.warn(`[DB] Custom MONGODB_URI failed, falling back: ${(err as Error).message}`);
    }
  }

  // Try local default mongod first with 2-second timeout
  try {
    const localUri = 'mongodb://127.0.0.1:27017/transport_fleet';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[DB] Connected to local MongoDB at ${localUri}`);
    return localUri;
  } catch {
    // Local mongo not running, proceed to memory server
  }

  // In-memory MongoDB for zero-configuration standalone operation
  try {
    console.log('[DB] Launching embedded in-memory MongoDB...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'transport_fleet',
      },
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to embedded in-memory MongoDB at ${memoryUri}`);
    return memoryUri;
  } catch (err) {
    console.error('[DB] Failed to launch in-memory MongoDB:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
}
