const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { jwtSecret } = require('../config');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT id, name, email, role, expertise, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, expertise: user.expertise },
      jwtSecret,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, expertise: user.expertise } });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, expertise = [] } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, expertise) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, expertise',
      [name, email, hash, role || 'SME Support Staff', expertise]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
