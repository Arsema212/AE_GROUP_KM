const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/experts', async (req, res, next) => {
  try {
    const { q, area } = req.query;
    const filters = ['role = ANY($1)', 'array_length(expertise, 1) > 0'];
    const values = [['Admin', 'SME Support Staff', 'Manager']];
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
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, role, expertise, region FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
