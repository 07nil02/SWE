import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seedData.js';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    console.log('[Server] Connecting to database...');
    await connectDB();

    console.log('[Server] Checking and seeding initial fleet...');
    await seedDatabase();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[Server] Transport Fleet Automation Backend running on http://localhost:${PORT}`);
      console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Fatal error during startup:', err);
    process.exit(1);
  }
}

bootstrap();
