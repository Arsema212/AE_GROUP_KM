const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/experts', userController.getExperts);
router.get('/', authenticate, authorize(['admin']), userController.getUsers);
router.put('/:id/role', authenticate, authorize(['admin']), userController.updateUserRole);
router.put('/:id', authenticate, authorize(['admin']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

module.exports = router;
