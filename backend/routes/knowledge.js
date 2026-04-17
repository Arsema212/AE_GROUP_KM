const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const db = require('../db');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

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
  },
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

function visibilityClause(user) {
  if (!user) {
    return { sql: 'status = ?', params: ['published'] };
  }
  if (user.role === 'admin' || user.role === 'manager') {
    return { sql: '1 = 1', params: [] };
  }
  return {
    sql: '(status = ? OR (created_by = ? AND status IN (?, ?, ?)))',
    params: ['published', user.id, 'review', 'rejected', 'draft'],
  };
}

function canViewKnowledge(user, row) {
  if (!row) return false;
  if (row.status === 'published') return true;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'manager') return true;
  return row.created_by === user.id;
}

router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const { q, type, language, region, tag } = req.query;
    const vis = visibilityClause(req.user);
    const filters = [vis.sql];
    const values = [...vis.params];

    if (q) {
      filters.push(`(LOWER(title) LIKE ? OR LOWER(content) LIKE ?)`);
      const like = `%${String(q).toLowerCase()}%`;
      values.push(like, like);
    }
    if (type) {
      filters.push(`type = ?`);
      values.push(type);
    }
    if (language) {
      filters.push(`language = ?`);
      values.push(language);
    }
    if (region) {
      filters.push(`region = ?`);
      values.push(region);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;
    const query = `SELECT * FROM knowledge_items ${whereClause} ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC LIMIT 200`;
    const rows = await db.all(query, values);
    const mapped = rows.map(mapKnowledge);
    res.json(tag ? mapped.filter((row) => row.tags.includes(tag)) : mapped);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const row = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (!canViewKnowledge(req.user, row)) return res.status(404).json({ error: 'Not found' });
    res.json(mapKnowledge(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize(['staff']), upload.single('file'), async (req, res, next) => {
  try {
    const { title, content, type, tags, language, region } = req.body;
    const filePath = req.file ? req.file.path : null;
    const parsedTags = parseArrayField(tags);
    const id = crypto.randomUUID();
    const submissionStatus = 'review';
    await db.run(
      `INSERT INTO knowledge_items (id, title, content, type, tags, language, region, status, created_by, file_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, title, content, type, JSON.stringify(parsedTags), language, region, submissionStatus, req.user.id, filePath]
    );
    const row = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [id]);
    res.status(201).json(mapKnowledge(row));
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
    const existing = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.status !== 'review') {
      return res.status(400).json({ error: 'Item is not pending review' });
    }
    const nextStatus = action === 'approve' ? 'published' : 'rejected';
    await db.run(
      `UPDATE knowledge_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextStatus, req.params.id]
    );
    const row = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    res.json(mapKnowledge(row));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize(['staff']), async (req, res, next) => {
  try {
    const { title, content, type, tags, language, region, status } = req.body;
    const parsedTags = parseArrayField(tags);
    const existing = await db.get('SELECT * FROM knowledge_items WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.created_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own items' });
    }
    if (existing.status === 'published' || existing.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot edit after review' });
    }

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
