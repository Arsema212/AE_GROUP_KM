const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

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
    status: row.status || 'published',
  };
}

function visibilityClause(user) {
  if (!user) {
    return { sql: 'COALESCE(status, ?) = ?', params: ['published', 'published'] };
  }
  if (user.role === 'admin' || user.role === 'manager') {
    return { sql: '1 = 1', params: [] };
  }
  return {
    sql: '(COALESCE(status, ?) = ? OR (created_by = ? AND COALESCE(status, ?) IN (?, ?, ?)))',
    params: ['published', 'published', user.id, 'published', 'review', 'rejected', 'draft'],
  };
}

router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const vis = visibilityClause(req.user);
    const query = `SELECT * FROM lessons_learned WHERE ${vis.sql} ORDER BY created_at DESC LIMIT 200`;
    const rows = await db.all(query, vis.params);
    res.json(rows.map(mapLesson));
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize(['staff']), async (req, res, next) => {
  try {
    const { problem, solution, outcome, recommendation, tags, language, region } = req.body;
    const parsedTags = parseArrayField(tags);
    const id = crypto.randomUUID();
    await db.run(
      `INSERT INTO lessons_learned (id, problem, solution, outcome, recommendation, tags, language, region, status, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, problem, solution, outcome, recommendation, JSON.stringify(parsedTags), language, region, 'review', req.user.id]
    );
    const row = await db.get('SELECT * FROM lessons_learned WHERE id = ?', [id]);
    res.status(201).json(mapLesson(row));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/review', authenticate, authorize(['manager']), async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve or reject' });
    }
    const existing = await db.get('SELECT * FROM lessons_learned WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const st = existing.status || 'published';
    if (st !== 'review') {
      return res.status(400).json({ error: 'Lesson is not pending review' });
    }
    const nextStatus = action === 'approve' ? 'published' : 'rejected';
    await db.run(`UPDATE lessons_learned SET status = ? WHERE id = ?`, [nextStatus, req.params.id]);
    const row = await db.get('SELECT * FROM lessons_learned WHERE id = ?', [req.params.id]);
    res.json(mapLesson(row));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
