const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status = 'approved', q, language, region, tag } = req.query;
    const allowed = ['pending', 'approved', 'denied'];
    const resolvedStatus = allowed.includes(status) ? status : 'approved';
    const filters = ['status = $1'];
    const values = [resolvedStatus];
    let idx = 2;

    if (q) {
      filters.push(
        `(problem ILIKE $${idx} OR solution ILIKE $${idx} OR outcome ILIKE $${idx} OR COALESCE(recommendation, '') ILIKE $${idx})`
      );
      values.push(`%${q}%`);
      idx += 1;
    }
    if (language) {
      filters.push(`language = $${idx}`);
      values.push(language);
      idx += 1;
    }
    if (region) {
      filters.push(`region = $${idx}`);
      values.push(region);
      idx += 1;
    }
    if (tag) {
      filters.push(`$${idx} = ANY(tags)`);
      values.push(tag);
      idx += 1;
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;
    const result = await db.query(
      `SELECT * FROM lessons_learned ${whereClause} ORDER BY created_at DESC LIMIT 200`,
      values
    );
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
    if (req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff can submit lessons' });
    }

    const { problem, solution, outcome, recommendation, tags, language, region } = req.body;
    const parsedTags = parseArrayField(tags);
    const result = await db.query(
      `INSERT INTO lessons_learned (problem, solution, outcome, recommendation, tags, language, region, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [problem, solution, outcome, recommendation, parsedTags, language, region, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/review', authenticate, authorize(['manager']), async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['approve', 'deny'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or deny' });
    }

    const nextStatus = action === 'approve' ? 'approved' : 'denied';
    const result = await db.query(
      `UPDATE lessons_learned
       SET status = $1, reviewed_by = $2, reviewed_at = now()
       WHERE id = $3
       RETURNING *`,
      [nextStatus, req.user.id, req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
