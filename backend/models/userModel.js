const db = require('../db');

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query('SELECT id, name, email, role, expertise, region, language_preference FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser({ name, email, passwordHash, role = 'staff', expertise = [], region = null, language_preference = 'en' }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role, expertise, region, language_preference)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, expertise, region, language_preference`,
    [name, email, passwordHash, role, expertise, region, language_preference]
  );
  return result.rows[0];
}

async function updateProfile(id, { name, expertise, region, language_preference }) {
  const result = await db.query(
    `UPDATE users SET
      name = COALESCE($1, name),
      expertise = COALESCE($2, expertise),
      region = COALESCE($3, region),
      language_preference = COALESCE($4, language_preference),
      updated_at = now()
     WHERE id = $5 RETURNING id, name, email, role, expertise, region, language_preference`,
    [name ? String(name).trim() : null, expertise || null, region || null, language_preference || null, id]
  );
  return result.rows[0];
}

async function updatePassword(id, passwordHash) {
  const result = await db.query(
    `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 RETURNING id, name, email, role, expertise, region, language_preference`,
    [passwordHash, id]
  );
  return result.rows[0];
}

async function getExperts({ q, area }) {
  const filters = ['role = ANY($1)', 'array_length(expertise, 1) > 0'];
  const values = [['admin', 'manager', 'staff']];
  let idx = 2;

  if (q) {
    filters.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
    values.push(`%${q}%`);
    idx += 1;
  }
  if (area) {
    filters.push(`$${idx} = ANY(expertise)`);
    values.push(area);
    idx += 1;
  }

  const query = `SELECT id, name, role, expertise, region, email FROM users WHERE ${filters.join(' AND ')} ORDER BY name ASC LIMIT 100`;
  const result = await db.query(query, values);
  return result.rows;
}

async function listUsers() {
  const result = await db.query('SELECT id, name, email, role, expertise, region, language_preference FROM users ORDER BY name ASC');
  return result.rows;
}

async function updateUserRole(id, role) {
  const result = await db.query(
    `UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING id, name, email, role, expertise, region, language_preference`,
    [role, id]
  );
  return result.rows[0];
}

async function updateUser(id, { name, email, role, expertise, region, language_preference }) {
  const result = await db.query(
    `UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      role = COALESCE($3, role),
      expertise = COALESCE($4, expertise),
      region = COALESCE($5, region),
      language_preference = COALESCE($6, language_preference),
      updated_at = now()
     WHERE id = $7
     RETURNING id, name, email, role, expertise, region, language_preference`,
    [name || null, email || null, role || null, expertise || null, region || null, language_preference || null, id]
  );
  return result.rows[0];
}

async function deleteUser(id) {
  const result = await db.query(
    `DELETE FROM users WHERE id = $1 RETURNING id, name, email, role`,
    [id]
  );
  return result.rows[0];
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
  updateUser,
  deleteUser,
};
