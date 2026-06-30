import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');

export async function getDb() {
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable WAL (Write-Ahead Logging) to allow highly concurrent writes (like our broadcastNotification function)
  await db.exec('PRAGMA journal_mode = WAL;');

  // Create the Document Store Table if it doesn't exist
  // We use the JSON extension in SQLite to store dynamic payloads safely
  await db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      model TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSON NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (model, id)
    )
  `);

  return db;
}
