const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const knowledgeRoutes = require('./routes/knowledge');
const lessonsRoutes = require('./routes/lessons');
const usersRoutes = require('./routes/users');
const discussionsRoutes = require('./routes/discussions');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/discussions', discussionsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
