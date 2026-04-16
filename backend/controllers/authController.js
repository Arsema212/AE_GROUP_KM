const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const userModel = require('../models/userModel');
const allowedRoles = new Set(['admin', 'manager', 'staff']);

function normalizeExpertise(expertise) {
  if (Array.isArray(expertise)) return expertise.filter(Boolean);
  if (typeof expertise === 'string') {
    return expertise
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function buildUserPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    expertise: user.expertise,
    region: user.region,
    language_preference: user.language_preference,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, role = 'staff', expertise = [], region = null, language_preference = 'en' } = req.body;
    const normalizedRole = String(role || 'staff').toLowerCase();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!allowedRoles.has(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await userModel.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await userModel.createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      expertise: normalizeExpertise(expertise),
      region,
      language_preference,
    });
    res.status(201).json({ user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await userModel.findByEmail(normalizedEmail);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(buildUserPayload(user), jwtSecret, { expiresIn: '8h' });
    res.json({ token, user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, expertise, region, language_preference } = req.body;
    const user = await userModel.updateProfile(req.user.id, {
      name,
      expertise: normalizeExpertise(expertise),
      region,
      language_preference,
    });
    res.json({ user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findByEmail(req.user.email);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const updated = await userModel.updatePassword(req.user.id, passwordHash);
    res.json({ user: buildUserPayload(updated) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
};
