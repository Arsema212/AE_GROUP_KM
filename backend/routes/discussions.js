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
  filename: (req, file, cb) => cb(null, `disc-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    next();
  });
}

const REACTIONS = new Set(['like', 'love', 'laugh', 'insight', 'celebrate']);

async function loadReactionData(postIds, userId) {
  if (!postIds.length) return { counts: {}, mine: {} };
  const placeholders = postIds.map(() => '?').join(',');
  const r = await db.all(
    `SELECT post_id, reaction_type, COUNT(*) AS cnt
     FROM discussion_reactions WHERE post_id IN (${placeholders})
     GROUP BY post_id, reaction_type`,
    postIds
  );
  const counts = {};
  for (const row of r) {
    if (!counts[row.post_id]) counts[row.post_id] = {};
    counts[row.post_id][row.reaction_type] = Number(row.cnt) || 0;
  }
  let mine = {};
  if (userId) {
    const m = await db.all(
      `SELECT post_id, reaction_type FROM discussion_reactions WHERE post_id IN (${placeholders}) AND user_id = ?`,
      [...postIds, userId]
    );
    mine = Object.fromEntries(m.map((x) => [x.post_id, x.reaction_type]));
  }
  return { counts, mine };
}

function mapPost(row, reactionCounts, myReaction) {
  return {
    id: row.id,
    post_type: row.post_type,
    title: row.title,
    body: row.body,
    image_path: row.image_path,
    image_url: row.image_path ? `/uploads/${path.basename(row.image_path)}` : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: row.author_id
      ? { id: row.author_id, name: row.author_name, email: row.author_email }
      : null,
    comment_count: Number(row.comment_count) || 0,
    reaction_counts: reactionCounts[row.id] || {},
    my_reaction: myReaction || null,
  };
}

router.get('/posts', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    let userId = null;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const { jwtSecret } = require('../config');
        const token = header.replace('Bearer ', '');
        const payload = jwt.verify(token, jwtSecret);
        userId = payload.id;
      } catch {
        userId = null;
      }
    }

    const result = await db.all(
      `SELECT p.id, p.post_type, p.title, p.body, p.image_path, p.created_at, p.updated_at,
              p.author_id, u.name AS author_name, u.email AS author_email,
              (SELECT COUNT(*) FROM discussion_comments c WHERE c.post_id = p.id) AS comment_count
       FROM discussion_posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const ids = result.map((r) => r.id);
    const { counts, mine } = await loadReactionData(ids, userId);
    const posts = result.map((row) => mapPost(row, counts, mine[row.id]));
    res.json({ posts, has_more: result.length === limit });
  } catch (err) {
    next(err);
  }
});

router.get('/posts/:id', async (req, res, next) => {
  try {
    let userId = null;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const { jwtSecret } = require('../config');
        const payload = jwt.verify(header.replace('Bearer ', ''), jwtSecret);
        userId = payload.id;
      } catch {
        userId = null;
      }
    }

    const postResult = await db.get(
      `SELECT p.id, p.post_type, p.title, p.body, p.image_path, p.created_at, p.updated_at,
              p.author_id, u.name AS author_name, u.email AS author_email,
              (SELECT COUNT(*) FROM discussion_comments c WHERE c.post_id = p.id) AS comment_count
       FROM discussion_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!postResult) return res.status(404).json({ error: 'Post not found' });
    const row = postResult;
    const { counts, mine } = await loadReactionData([row.id], userId);

    const commentsResult = await db.all(
      `SELECT c.id, c.post_id, c.parent_id, c.content, c.created_at,
              c.author_id, u.name AS author_name, u.email AS author_email
       FROM discussion_comments c
       LEFT JOIN users u ON u.id = c.author_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json({
      post: mapPost(row, counts, mine[row.id]),
      comments: commentsResult.map((c) => ({
        id: c.id,
        parent_id: c.parent_id,
        content: c.content,
        created_at: c.created_at,
        author: c.author_id
          ? { id: c.author_id, name: c.author_name, email: c.author_email }
          : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/posts',
  authenticate,
  authorize(['admin', 'manager', 'staff']),
  uploadImage,
  async (req, res, next) => {
    try {
      const { post_type = 'article', title = '', body = '' } = req.body;
      const type = post_type === 'meme' ? 'meme' : 'article';
      const imagePath = req.file ? req.file.path : null;

      if (type === 'article') {
        if (!String(title).trim() || !String(body).trim()) {
          return res.status(400).json({ error: 'Article requires title and body' });
        }
      } else {
        if (!imagePath) {
          return res.status(400).json({ error: 'Meme requires an image' });
        }
      }

      const id = crypto.randomUUID();
      await db.run(
        `INSERT INTO discussion_posts (id, author_id, post_type, title, body, image_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [id, req.user.id, type, String(title).trim() || null, String(body).trim(), imagePath]
      );
      const p = await db.get('SELECT * FROM discussion_posts WHERE id = ?', [id]);
      const u = await db.get('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
      res.status(201).json({
        id: p.id,
        post_type: p.post_type,
        title: p.title,
        body: p.body,
        image_path: p.image_path,
        image_url: p.image_path ? `/uploads/${path.basename(p.image_path)}` : null,
        created_at: p.created_at,
        author: { id: req.user.id, name: u?.name, email: u?.email },
        comment_count: 0,
        reaction_counts: {},
        my_reaction: null,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/posts/:id', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const existing = await db.get('SELECT author_id FROM discussion_posts WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Post not found' });
    const isOwner = existing.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    await db.run('DELETE FROM discussion_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/comments', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { content, parent_id = null } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    const postCheck = await db.get('SELECT id FROM discussion_posts WHERE id = ?', [req.params.id]);
    if (!postCheck) return res.status(404).json({ error: 'Post not found' });
    if (parent_id) {
      const parentCheck = await db.get(
        'SELECT id FROM discussion_comments WHERE id = ? AND post_id = ?',
        [parent_id, req.params.id]
      );
      if (!parentCheck) return res.status(400).json({ error: 'Invalid parent comment' });
    }
    const commentId = crypto.randomUUID();
    await db.run(
      `INSERT INTO discussion_comments (id, post_id, author_id, parent_id, content, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [commentId, req.params.id, req.user.id, parent_id || null, String(content).trim()]
    );
    const row = await db.get('SELECT * FROM discussion_comments WHERE id = ?', [commentId]);
    const u = await db.get('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
    res.status(201).json({
      ...row,
      author: { id: req.user.id, name: u?.name, email: u?.email },
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/comments/:id', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const row = await db.get('SELECT author_id FROM discussion_comments WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Comment not found' });
    const isOwner = row.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    await db.run('DELETE FROM discussion_comments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/reactions', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    const { reaction_type } = req.body;
    if (!REACTIONS.has(reaction_type)) {
      return res.status(400).json({ error: 'Invalid reaction' });
    }
    const postCheck = await db.get('SELECT id FROM discussion_posts WHERE id = ?', [req.params.id]);
    if (!postCheck) return res.status(404).json({ error: 'Post not found' });

    const rid = crypto.randomUUID();
    await db.run(
      `INSERT INTO discussion_reactions (id, post_id, user_id, reaction_type, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(post_id, user_id) DO UPDATE SET
         reaction_type = excluded.reaction_type,
         created_at = CURRENT_TIMESTAMP`,
      [rid, req.params.id, req.user.id, reaction_type]
    );

    const agg = await db.all(
      `SELECT reaction_type, COUNT(*) AS cnt
       FROM discussion_reactions WHERE post_id = ?
       GROUP BY reaction_type`,
      [req.params.id]
    );
    const reaction_counts = Object.fromEntries(agg.map((x) => [x.reaction_type, Number(x.cnt) || 0]));
    res.json({ my_reaction: reaction_type, reaction_counts });
  } catch (err) {
    next(err);
  }
});

router.delete('/posts/:id/reactions', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res, next) => {
  try {
    await db.run('DELETE FROM discussion_reactions WHERE post_id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    const agg = await db.all(
      `SELECT reaction_type, COUNT(*) AS cnt
       FROM discussion_reactions WHERE post_id = ?
       GROUP BY reaction_type`,
      [req.params.id]
    );
    const reaction_counts = Object.fromEntries(agg.map((x) => [x.reaction_type, Number(x.cnt) || 0]));
    res.json({ my_reaction: null, reaction_counts });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
