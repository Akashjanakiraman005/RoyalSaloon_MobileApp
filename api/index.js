import { createApp } from '../backend/app.js';
import { connectToDatabase, getDb } from '../backend/config/db.js';
import { seedDatabase } from '../backend/utils/seed.js';

// Top-level await to connect and seed Firestore on function cold start
try {
  await connectToDatabase();
  await seedDatabase(getDb());
} catch (error) {
  console.error('Database connection or seeding error in serverless entrypoint:', error);
}

const app = createApp();

export default app;
