import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const jsonPath = path.join(process.cwd(), 'data', 'db.json');
const sqlitePath = path.join(process.cwd(), 'data', 'database.sqlite');

async function migrate() {
  console.log("Starting zero-error migration from JSON to SQLite...");
  
  if (!fs.existsSync(jsonPath)) {
    console.log("No db.json found. Nothing to migrate.");
    return;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const db = await open({
    filename: sqlitePath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      model TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSON NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (model, id)
    )
  `);

  console.log("SQLite schema initialized. Beginning data transfer...");

  for (const model of Object.keys(data)) {
    const items = data[model];
    
    // Some keys might just be single objects instead of arrays (e.g. single config)
    if (Array.isArray(items)) {
      console.log(`Migrating ${items.length} items for model [${model}]...`);
      for (const item of items) {
        if (!item.id) {
            // Generate a random ID if none exists for some reason
            item.id = `migrated-${Date.now()}-${Math.random()}`;
        }
        await db.run(
          `INSERT OR REPLACE INTO documents (model, id, data) VALUES (?, ?, ?)`,
          [model, item.id, JSON.stringify(item)]
        );
      }
    } else {
       // It's a single object
       const item = items;
       const id = item.id || 'singleton';
       await db.run(
          `INSERT OR REPLACE INTO documents (model, id, data) VALUES (?, ?, ?)`,
          [model, id, JSON.stringify(item)]
        );
    }
  }

  console.log("Migration completed successfully! database.sqlite is ready.");
}

migrate().catch(console.error);
