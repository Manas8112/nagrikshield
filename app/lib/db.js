import { getDb } from './sqliteDb';

// User Models
export async function getUserByEmail(email) {
  const db = await getDb();
  const rows = await db.all(`SELECT data FROM documents WHERE model = 'users'`);
  const users = rows.map(r => JSON.parse(r.data));
  return users.find(u => u.email === email) || null;
}

export async function getUserById(id) {
  const db = await getDb();
  const row = await db.get(`SELECT data FROM documents WHERE model = 'users' AND id = ?`, [id]);
  if (!row) return null;
  return JSON.parse(row.data);
}

export async function createUser(user) {
  const db = await getDb();
  const newUser = {
    ...user,
    id: `u-${Date.now()}`,
    role: 'user',
    avatar: '',
    level: 1,
    xp: 0,
    shieldPoints: 100,
    accuracy: 1.0,
    issuesReported: 0
  };
  await db.run(
    `INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`,
    ['users', newUser.id, JSON.stringify(newUser)]
  );
  return newUser;
}
