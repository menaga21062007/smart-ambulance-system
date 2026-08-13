import { app } from '../src/server';
import { initializeSchema } from '../src/database/schema';
import { seedDatabase } from '../src/database/seed';

let isInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isInitialized) {
    try {
      await initializeSchema();
      await seedDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }
  return app(req, res);
}
