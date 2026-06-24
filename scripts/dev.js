const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const args = process.argv.slice(2);
const dbPath = path.join(__dirname, '../data/database.sqlite');

async function setup() {
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (args.includes('--help')) {
    console.log(`
🛡️ CivicTech Command - Dev Server Options:
  --clear-db                    Wipes the database entirely (preserves custom admins).
  --seed-data                   Seeds the database with test issues and users.
  --create-admin <email> <pass> Creates a new custom admin account.
  --help                        Shows this help menu.
    `);
    process.exit(0);
  }

  if (args.includes('--clear-db')) {
    console.log('🗑️  Clearing database (preserving admins)...');
    if (fs.existsSync(dbPath)) {
      try {
        const db = await open({ filename: dbPath, driver: sqlite3.Database });
        await db.exec(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            model TEXT,
            data TEXT
          )
        `);
        
        // Backup admins before clearing
        const rows = await db.all("SELECT * FROM documents WHERE model = 'users'");
        const admins = rows
          .map(r => ({ ...r, parsedData: JSON.parse(r.data) }))
          .filter(r => r.parsedData.role === 'admin');

        await db.exec('DELETE FROM documents');

        // Restore admins
        for (const admin of admins) {
          await db.run(
            `INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`,
            [admin.model, admin.id, JSON.stringify(admin.parsedData)]
          );
        }
        
        await db.close();
        console.log(`✅ Database cleared. Restored ${admins.length} admin accounts.`);
      } catch (err) {
        console.error('Failed to clear DB:', err);
      }
    }
  }

  if (args.includes('--seed-data')) {
    console.log('🌱 Seeding database...');
    try {
      const { seedData } = await import('file://' + path.join(__dirname, '../app/lib/seedData.js').replace(/\\/g, '/'));
      
      const db = await open({ filename: dbPath, driver: sqlite3.Database });
      await db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          model TEXT,
          data TEXT
        )
      `);
      
      // Backup custom admins during seed so we don't lose them
      const rows = await db.all("SELECT * FROM documents WHERE model = 'users'");
      const customAdmins = rows
        .map(r => ({ ...r, parsedData: JSON.parse(r.data) }))
        .filter(r => r.parsedData.role === 'admin' && !seedData.users?.find(u => u.id === r.parsedData.id));

      await db.exec('DELETE FROM documents');

      // Insert seed data
      for (const model of Object.keys(seedData)) {
        for (const item of seedData[model]) {
          await db.run(
            `INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`,
            [model, item.id, JSON.stringify(item)]
          );
        }
      }

      // Re-insert custom admins
      for (const admin of customAdmins) {
         await db.run(
           `INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`,
           [admin.model, admin.id, JSON.stringify(admin.parsedData)]
         );
      }

      await db.close();
      console.log('✅ Database seeded successfully!');
    } catch (err) {
      console.error('Failed to seed database:', err);
    }
  }

  const createAdminIdx = args.indexOf('--create-admin');
  if (createAdminIdx !== -1 && args.length > createAdminIdx + 2) {
    const email = args[createAdminIdx + 1];
    const password = args[createAdminIdx + 2];
    
    console.log(`🛡️  Creating new admin user: ${email}...`);
    try {
      const db = await open({ filename: dbPath, driver: sqlite3.Database });
      await db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          model TEXT,
          data TEXT
        )
      `);
      
      const newAdminId = 'u-admin-' + Buffer.from(email).toString('hex').slice(0, 8);
      const adminData = {
        id: newAdminId,
        name: 'Custom Admin',
        email: email,
        password: password,
        role: 'admin',
        level: 99,
        xp: 99999,
        shieldPoints: 9999,
        issuesReported: 0,
        issuesValidated: 0,
        accuracy: 1.0,
        neighborhood: 'bbmp_hq',
        joinedAt: new Date().toISOString(),
        title: 'Administrator',
        notifications: [],
        friends: []
      };

      const rows = await db.all("SELECT * FROM documents WHERE model = 'users'");
      const exists = rows.find(r => JSON.parse(r.data).email === email);
      
      if (exists) {
        console.log(`⚠️  User with email ${email} already exists! Skipping creation.`);
      } else {
        await db.run(
          `INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`,
          ['users', newAdminId, JSON.stringify(adminData)]
        );
        console.log(`✅ Admin ${email} created successfully!`);
      }
      
      await db.close();
    } catch (err) {
      console.error('Failed to create admin:', err);
    }
  }

  console.log('🚀 Starting Next.js development server...');
  
  const nextArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--clear-db' || args[i] === '--seed-data') {
      continue;
    }
    if (args[i] === '--create-admin') {
      i += 2; // skip the next 2 args (email, password)
      continue;
    }
    nextArgs.push(args[i]);
  }

  const nextProcess = spawn('npm', ['run', 'next-dev', '--', ...nextArgs], { stdio: 'inherit', shell: true });

  nextProcess.on('error', (err) => {
    console.error('Failed to start Next.js dev server:', err);
  });

  const pythonExecutable = path.join(__dirname, '../.venv/Scripts/python.exe');
  const pythonScript = path.join(__dirname, '../python_ai/chat_llm.py');
  
  if (fs.existsSync(pythonExecutable)) {
    console.log('🤖 Starting Python AI Server (chat_llm.py) automatically...');
    // Provide the correct CWD so it finds the database correctly if it uses relative paths
    const pythonProcess = spawn(pythonExecutable, [pythonScript], { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '../python_ai') 
    });
    
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python AI server:', err);
    });
  } else {
    console.log('⚠️  Python virtual environment not found. Skipping AI server startup.');
  }
}

setup();
