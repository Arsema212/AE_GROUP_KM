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

module.exports = {
  getExperts,
  getUsers,
  updateUserRole,
};
