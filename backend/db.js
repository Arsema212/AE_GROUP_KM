const fs = require('fs');
const path = require('path');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const { db: dbConfig } = require('./config');

let dbPromise = null;
let resolvedSqlitePath = null;

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function initSchema(db) {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','manager','staff')) DEFAULT 'staff',
      expertise TEXT NOT NULL DEFAULT '[]',
      region TEXT,
      language_preference TEXT DEFAULT 'en',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('document','faq','sop','training','insight')),
      tags TEXT NOT NULL DEFAULT '[]',
      language TEXT NOT NULL DEFAULT 'en',
      region TEXT DEFAULT 'national',
      status TEXT NOT NULL CHECK (status IN ('draft','published','review')) DEFAULT 'draft',
      version INTEGER NOT NULL DEFAULT 1,
      file_path TEXT,
      created_by TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS lessons_learned (
      id TEXT PRIMARY KEY,
      problem TEXT NOT NULL,
      solution TEXT NOT NULL,
      outcome TEXT NOT NULL,
      recommendation TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      language TEXT NOT NULL DEFAULT 'en',
      region TEXT DEFAULT 'national',
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS discussion_posts (
      id TEXT PRIMARY KEY,
      author_id TEXT,
      post_type TEXT NOT NULL CHECK (post_type IN ('article','meme')),
      title TEXT,
      body TEXT NOT NULL DEFAULT '',
      image_path TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS discussion_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      author_id TEXT,
      parent_id TEXT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_id) REFERENCES discussion_comments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS discussion_reactions (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like','love','laugh','insight','celebrate')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed demo users for quick role-based login testing.
  const seeds = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Admin',
      email: 'admin@aetrade.demo',
      password: 'Admin@123',
      role: 'admin',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Demo Manager',
      email: 'manager@aetrade.demo',
      password: 'Manager@123',
      role: 'manager',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Demo Staff',
      email: 'staff@aetrade.demo',
      password: 'Staff@123',
      role: 'staff',
    },
  ];

  for (const user of seeds) {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [user.email]);
    if (!existing) {
      const passwordHash = bcrypt.hashSync(user.password, 10);
      await db.run(
        `INSERT INTO users (id, name, email, password_hash, role, expertise, region, language_preference, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [user.id, user.name, user.email, passwordHash, user.role, '[]', null, 'en']
      );
    }
  }
}

async function getDb() {
  if (!dbPromise) {
    let sqlite3;
    try {
      sqlite3 = require('sqlite3');
    } catch (err) {
      throw new Error(`Failed to load sqlite3 runtime: ${err.message}`);
    }
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
    const configuredPath = dbConfig.sqlitePath || './data/kms.sqlite';
    const runtimePath = isVercel && !process.env.SQLITE_DB_PATH ? '/tmp/kms.sqlite' : configuredPath;
    const sqlitePath = path.resolve(process.cwd(), runtimePath);
    resolvedSqlitePath = sqlitePath;
    ensureDir(sqlitePath);
    dbPromise = open({
      filename: sqlitePath,
      driver: sqlite3.Database,
    }).then(async (db) => {
      await initSchema(db);
      return db;
    });
  }
  return dbPromise;
}

async function all(sql, params = []) {
  const db = await getDb();
  return db.all(sql, params);
}

async function get(sql, params = []) {
  const db = await getDb();
  return db.get(sql, params);
}

async function run(sql, params = []) {
  const db = await getDb();
  return db.run(sql, params);
}

module.exports = {
  getDb,
  all,
  get,
  run,
  getResolvedPath: () => resolvedSqlitePath,
};
