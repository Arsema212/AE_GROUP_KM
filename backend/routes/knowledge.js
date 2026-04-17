const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
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

function parseTags(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapKnowledge(row) {
  if (!row) return null;
  return {
    ...row,
    tags: parseTags(row.tags),
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { q, type, language, region, tag } = req.query;
    const filters = [];
    const values = [];
    let idx = 1;

    if (q) {
      filters.push(`(LOWER(title) LIKE ? OR LOWER(content) LIKE ?)`);
      const like = `%${String(q).toLowerCase()}%`;
      values.push(like, like);
      idx += 2;
    }
    if (type) {
      filters.push(`type = ?`);
      values.push(type);
      idx += 1;
    }
    if (language) {
      filters.push(`language = ?`);
      values.push(language);
      idx += 1;
    }
    if (region) {
      filters.push(`region = ?`);
      values.push(region);
      idx += 1;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `SELECT * FROM knowledge_items ${whereClause} ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC LIMIT 200`;
    const rows = await db.all(query, values);
    const mapped = rows.map(mapKnowledge);
    res.json(tag ? mapped.filter((row) => row.tags.includes(tag)) : mapped);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(mapKnowledge(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize(['admin', 'manager', 'staff']), upload.single('file'), async (req, res, next) => {
  try {
    const { title, content, type, tags, language, region, status = 'draft' } = req.body;
    const filePath = req.file ? req.file.path : null;
    const parsedTags = parseArrayField(tags);
    const id = crypto.randomUUID();
    await db.run(
      `INSERT INTO knowledge_items (id, title, content, type, tags, language, region, status, created_by, file_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, title, content, type, JSON.stringify(parsedTags), language, region, status, req.user.id, filePath]
    );
    const row = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [id]);
    res.status(201).json(mapKnowledge(row));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { title, content, type, tags, language, region, status } = req.body;
    const parsedTags = parseArrayField(tags);
    const existing = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await db.run(
      `UPDATE knowledge_items
       SET title = ?, content = ?, type = ?, tags = ?, language = ?, region = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title ?? existing.title,
        content ?? existing.content,
        type ?? existing.type,
        JSON.stringify(parsedTags),
        language ?? existing.language,
        region ?? existing.region,
        status ?? existing.status,
        req.params.id,
      ]
    );
    const row = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    res.json(mapKnowledge(row));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
