import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { CONFIG } from '../config';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await open({
      filename: CONFIG.DB_PATH,
      driver: sqlite3.Database
    });
    await dbInstance.run('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
