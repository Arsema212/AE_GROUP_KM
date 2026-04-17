const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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

router.get('/', async (req, res, next) => {
  try {
    const { q, type, language, region, tag } = req.query;
    const filters = [];
    const values = [];
    let idx = 1;

    if (q) {
      filters.push(`(title ILIKE $${idx} OR content ILIKE $${idx})`);
      values.push(`%${q}%`);
      idx += 1;
    }
    if (type) {
      filters.push(`type = $${idx}`);
      values.push(type);
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

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `SELECT * FROM knowledge_items ${whereClause} ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 200`;
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM knowledge_items WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize(['admin', 'manager', 'staff']), upload.single('file'), async (req, res, next) => {
  try {
    const { title, content, type, tags, language, region, status = 'draft' } = req.body;
    const filePath = req.file ? req.file.path : null;
    const parsedTags = parseArrayField(tags);
    const result = await db.query(
      `INSERT INTO knowledge_items (title, content, type, tags, language, region, status, created_by, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, content, type, parsedTags, language, region, status, req.user.id, filePath]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { title, content, type, tags, language, region, status } = req.body;
    const parsedTags = parseArrayField(tags);
    const result = await db.query(
      `UPDATE knowledge_items SET title = $1, content = $2, type = $3, tags = $4, language = $5, region = $6, status = $7, updated_at = now()
       WHERE id = $8 RETURNING *`,
      [title, content, type, parsedTags, language, region, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
