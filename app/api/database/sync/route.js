import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This endpoint receives all localStorage state from the client
// and writes it to the persistent server database file.
export async function POST(req) {
  try {
    const state = await req.json();
    
    // Validate we actually got data
    if (!state.issues || !state.users) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    
    // Create data dir if it doesn't exist
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    // Write to persistent JSON database
    fs.writeFileSync(dbPath, JSON.stringify({
      users: state.users,
      issues: state.issues,
      quests: state.quests || [],
      achievements: state.achievements || [],
      vitalsHistory: state.vitalsHistory || {},
      lastSynced: new Date().toISOString()
    }, null, 2));

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Database Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync database' }, { status: 500 });
  }
}
