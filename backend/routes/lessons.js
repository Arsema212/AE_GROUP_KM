const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM lessons_learned ORDER BY created_at DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

function parseArrayField(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

router.post('/', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { problem, solution, outcome, recommendation, tags, language, region } = req.body;
    const parsedTags = parseArrayField(tags);
    const result = await db.query(
      `INSERT INTO lessons_learned (problem, solution, outcome, recommendation, tags, language, region, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [problem, solution, outcome, recommendation, parsedTags, language, region, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
