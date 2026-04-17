const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const rows = await db.all('SELECT * FROM lessons_learned ORDER BY created_at DESC LIMIT 200');
    res.json(rows.map(mapLesson));
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

function parseTags(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapLesson(row) {
  if (!row) return null;
  return {
    ...row,
    tags: parseTags(row.tags),
  };
}

router.post('/', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { problem, solution, outcome, recommendation, tags, language, region } = req.body;
    const parsedTags = parseArrayField(tags);
    const id = crypto.randomUUID();
    await db.run(
      `INSERT INTO lessons_learned (id, problem, solution, outcome, recommendation, tags, language, region, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, problem, solution, outcome, recommendation, JSON.stringify(parsedTags), language, region, req.user.id]
    );
    const row = await db.get('SELECT * FROM lessons_learned WHERE id = ?', [id]);
    res.status(201).json(mapLesson(row));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
