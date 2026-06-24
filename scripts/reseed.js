/**
 * NagrikShield - Re-seed Script
 * Wipes the users table and re-seeds with updated data (emails, passwords, friends, avatarSeed).
 * Run: node scripts/reseed.js
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.join(__dirname, '..', 'data', 'database.sqlite');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const users = [
  { id: 'u-admin-001', name: 'System Admin',    email: 'admin@nagrik.in',   password: 'admin123',   avatarSeed: 99, friends: [],                     level: 99, xp: 99999, shieldPoints: 9999, issuesReported: 0,  issuesValidated: 0,   accuracy: 1.00, neighborhood: 'bbmp_hq',     joinedAt: daysAgo(365), title: 'Administrator', role: 'admin', notifications: [] },
  { id: 'u1',         name: 'Arjun Reddy',      email: 'arjun@nagrik.in',   password: 'arjun123',   avatarSeed: 0,  friends: ['u2','u3','u8'],        level: 18, xp: 4500,  shieldPoints: 320,  issuesReported: 45, issuesValidated: 120, accuracy: 0.94, neighborhood: 'koramangala', joinedAt: daysAgo(180), title: 'Champion',      role: 'user', notifications: [] },
  { id: 'u2',         name: 'Priya Sharma',     email: 'priya@nagrik.in',   password: 'priya123',   avatarSeed: 1,  friends: ['u1','u4','u8','u12'],  level: 22, xp: 6200,  shieldPoints: 580,  issuesReported: 78, issuesValidated: 200, accuracy: 0.97, neighborhood: 'indiranagar', joinedAt: daysAgo(240), title: 'Legend',        role: 'user', notifications: [] },
  { id: 'u3',         name: 'Karthik Nair',     email: 'karthik@nagrik.in', password: 'karthik123', avatarSeed: 2,  friends: ['u1','u9','u15'],       level: 12, xp: 2100,  shieldPoints: 150,  issuesReported: 22, issuesValidated: 55,  accuracy: 0.88, neighborhood: 'jayanagar',   joinedAt: daysAgo(90),  title: 'Guardian',      role: 'user', notifications: [] },
  { id: 'u4',         name: 'Ananya Rao',       email: 'ananya@nagrik.in',  password: 'ananya123',  avatarSeed: 3,  friends: ['u2','u10'],            level: 15, xp: 3300,  shieldPoints: 245,  issuesReported: 38, issuesValidated: 90,  accuracy: 0.91, neighborhood: 'whitefield',  joinedAt: daysAgo(150), title: 'Guardian',      role: 'user', notifications: [] },
  { id: 'u5',         name: 'Rahul Gowda',      email: 'rahul@nagrik.in',   password: 'rahul123',   avatarSeed: 4,  friends: ['u6','u13'],            level: 8,  xp: 1200,  shieldPoints: 85,   issuesReported: 15, issuesValidated: 30,  accuracy: 0.85, neighborhood: 'hsr_layout',  joinedAt: daysAgo(60),  title: 'Ranger',        role: 'user', notifications: [] },
  { id: 'u6',         name: 'Deepika Iyer',     email: 'deepika@nagrik.in', password: 'deepika123', avatarSeed: 5,  friends: ['u5','u1','u13'],       level: 10, xp: 1800,  shieldPoints: 120,  issuesReported: 20, issuesValidated: 48,  accuracy: 0.90, neighborhood: 'koramangala', joinedAt: daysAgo(120), title: 'Ranger',        role: 'user', notifications: [] },
  { id: 'u7',         name: 'Suresh Kumar',     email: 'suresh@nagrik.in',  password: 'suresh123',  avatarSeed: 6,  friends: ['u12','u15'],           level: 6,  xp: 800,   shieldPoints: 55,   issuesReported: 10, issuesValidated: 18,  accuracy: 0.82, neighborhood: 'malleshwaram',joinedAt: daysAgo(45),  title: 'Ranger',        role: 'user', notifications: [] },
  { id: 'u8',         name: 'Meera Joshi',      email: 'meera@nagrik.in',   password: 'meera123',   avatarSeed: 7,  friends: ['u1','u2','u10','u14'], level: 20, xp: 5800,  shieldPoints: 490,  issuesReported: 65, issuesValidated: 180, accuracy: 0.96, neighborhood: 'indiranagar', joinedAt: daysAgo(200), title: 'Champion',      role: 'user', notifications: [] },
  { id: 'u9',         name: 'Vikram Singh',     email: 'vikram@nagrik.in',  password: 'vikram123',  avatarSeed: 8,  friends: ['u3'],                  level: 4,  xp: 450,   shieldPoints: 30,   issuesReported: 6,  issuesValidated: 10,  accuracy: 0.78, neighborhood: 'jayanagar',   joinedAt: daysAgo(20),  title: 'Scout',         role: 'user', notifications: [] },
  { id: 'u10',        name: 'Lakshmi Menon',    email: 'lakshmi@nagrik.in', password: 'lakshmi123', avatarSeed: 9,  friends: ['u4','u8'],             level: 14, xp: 2900,  shieldPoints: 210,  issuesReported: 32, issuesValidated: 75,  accuracy: 0.92, neighborhood: 'whitefield',  joinedAt: daysAgo(130), title: 'Guardian',      role: 'user', notifications: [] },
  { id: 'u11',        name: 'Aditya Patel',     email: 'aditya@nagrik.in',  password: 'aditya123',  avatarSeed: 10, friends: [],                     level: 3,  xp: 280,   shieldPoints: 18,   issuesReported: 4,  issuesValidated: 5,   accuracy: 0.75, neighborhood: 'hsr_layout',  joinedAt: daysAgo(10),  title: 'Scout',         role: 'user', notifications: [] },
  { id: 'u12',        name: 'Kavitha Rangan',   email: 'kavitha@nagrik.in', password: 'kavitha123', avatarSeed: 11, friends: ['u2','u7'],             level: 16, xp: 3800,  shieldPoints: 290,  issuesReported: 42, issuesValidated: 95,  accuracy: 0.93, neighborhood: 'malleshwaram',joinedAt: daysAgo(160), title: 'Champion',      role: 'user', notifications: [] },
  { id: 'u13',        name: 'Mohammed Farhan',  email: 'farhan@nagrik.in',  password: 'farhan123',  avatarSeed: 12, friends: ['u5','u6'],             level: 9,  xp: 1500,  shieldPoints: 100,  issuesReported: 18, issuesValidated: 40,  accuracy: 0.87, neighborhood: 'koramangala', joinedAt: daysAgo(75),  title: 'Ranger',        role: 'user', notifications: [] },
  { id: 'u14',        name: 'Sneha Kulkarni',   email: 'sneha@nagrik.in',   password: 'sneha123',   avatarSeed: 13, friends: ['u8'],                  level: 7,  xp: 950,   shieldPoints: 65,   issuesReported: 12, issuesValidated: 22,  accuracy: 0.84, neighborhood: 'indiranagar', joinedAt: daysAgo(50),  title: 'Ranger',        role: 'user', notifications: [] },
  { id: 'u15',        name: 'Ravi Shankar',     email: 'ravi@nagrik.in',    password: 'ravi123',    avatarSeed: 14, friends: ['u3','u7'],             level: 11, xp: 1950,  shieldPoints: 140,  issuesReported: 25, issuesValidated: 60,  accuracy: 0.89, neighborhood: 'jayanagar',   joinedAt: daysAgo(100), title: 'Guardian',      role: 'user', notifications: [] },
];

async function reseed() {
  console.log('🌱 NagrikShield Re-seed Starting...');
  console.log(`📂 Database: ${sqlitePath}`);

  const db = await open({ filename: sqlitePath, driver: sqlite3.Database });

  // Ensure schema exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      model TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSON NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (model, id)
    )
  `);

  // Wipe only the users table
  const deleted = await db.run(`DELETE FROM documents WHERE model = 'users'`);
  console.log(`🗑️  Wiped ${deleted.changes} old user records.`);

  // Insert fresh users
  for (const user of users) {
    await db.run(
      `INSERT OR REPLACE INTO documents (model, id, data) VALUES (?, ?, ?)`,
      ['users', user.id, JSON.stringify(user)]
    );
  }

  console.log(`✅ Seeded ${users.length} users with emails, passwords, friends & avatarSeeds.`);
  console.log('\n📋 Login credentials:');
  users.forEach(u => console.log(`   ${u.email.padEnd(25)} → ${u.password}`));

  await db.close();
  console.log('\n✨ Done! Restart npm run dev if it\'s running.');
}

reseed().catch(err => {
  console.error('❌ Reseed failed:', err);
  process.exit(1);
});
