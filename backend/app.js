const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const knowledgeRoutes = require('./routes/knowledge');
const lessonsRoutes = require('./routes/lessons');
const usersRoutes = require('./routes/users');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/users', usersRoutes);
app.get('/api/health', async (req, res) => {
  try {
    const row = await db.get('SELECT 1 as ok');
    res.json({
      status: 'ok',
      db: row?.ok === 1 ? 'connected' : 'unknown',
      sqlitePath: db.getResolvedPath(),
      vercel: process.env.VERCEL ? true : false,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
