import { describe, it, expect, afterAll } from 'vitest';
import { connectDB, disconnectDB } from './db.js';
import mongoose from 'mongoose';

describe('Database Connection Test', () => {
  afterAll(async () => {
    await disconnectDB();
  });

  it('Should successfully establish database connection', async () => {
    const uri = await connectDB();
    expect(uri).toBeTruthy();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  }, 45000);
});
