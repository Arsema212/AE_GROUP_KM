const userModel = require('../models/userModel');

async function getExperts(req, res, next) {
  try {
    const { q, area } = req.query;
    const users = await userModel.getExperts({ q, area });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await userModel.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const user = await userModel.updateUserRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await userModel.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const deleted = await userModel.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getExperts,
  getUsers,
  updateUserRole,
  updateUser,
  deleteUser,
};
