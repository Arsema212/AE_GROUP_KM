const db = require('../db');
const crypto = require('crypto');

function parseArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapUser(row) {
  if (!row) return null;
  return {
    ...row,
    expertise: parseArray(row.expertise),
  };
}

async function findByEmail(email) {
  const row = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  return mapUser(row);
}

async function findById(id) {
  const row = await db.get(
    'SELECT id, name, email, role, expertise, region, language_preference FROM users WHERE id = ?',
    [id]
  );
  return mapUser(row);
}

async function createUser({ name, email, passwordHash, role = 'staff', expertise = [], region = null, language_preference = 'en' }) {
  const id = crypto.randomUUID();
  await db.run(
    `INSERT INTO users (id, name, email, password_hash, role, expertise, region, language_preference, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [id, name, email, passwordHash, role, JSON.stringify(expertise || []), region, language_preference]
  );
  return findById(id);
}

async function updateProfile(id, { name, expertise, region, language_preference }) {
  const existing = await findById(id);
  if (!existing) return null;

  await db.run(
    `UPDATE users SET
      name = ?,
      expertise = ?,
      region = ?,
      language_preference = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      name ? String(name).trim() : existing.name,
      JSON.stringify(Array.isArray(expertise) ? expertise : existing.expertise),
      region !== undefined ? region : existing.region,
      language_preference || existing.language_preference,
      id,
    ]
  );
  return findById(id);
}

async function updatePassword(id, passwordHash) {
  await db.run(
    `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [passwordHash, id]
  );
  return findById(id);
}

async function getExperts({ q, area }) {
  let sql = 'SELECT id, name, role, expertise, region, email FROM users WHERE role IN (?, ?, ?)';
  const values = ['admin', 'manager', 'staff'];

  if (q) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)';
    const like = `%${String(q).toLowerCase()}%`;
    values.push(like, like);
  }

  sql += ' ORDER BY name ASC LIMIT 100';
  const rows = await db.all(sql, values);
  const mapped = rows.map(mapUser);
  if (!area) return mapped;
  return mapped.filter((user) => user.expertise.includes(area));
}

async function listUsers() {
  const rows = await db.all(
    'SELECT id, name, email, role, expertise, region, language_preference FROM users ORDER BY name ASC'
  );
  return rows.map(mapUser);
}

async function updateUserRole(id, role) {
  await db.run(
    `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [role, id]
  );
  return findById(id);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  updatePassword,
  getExperts,
  listUsers,
  updateUserRole,
};
