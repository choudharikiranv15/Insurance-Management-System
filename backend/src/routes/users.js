const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkUpdateUserStatus,
  getDashboardStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUserRegistration, validateSearchParams } = require('../middleware/validation');
const { adminLimiter, searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Routes
router.get('/', protect, authorize('admin', 'agent'), searchLimiter, getUsers);
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);
router.get('/:id', protect, getUserById);
router.post('/', protect, authorize('admin'), adminLimiter, validateUserRegistration, createUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), adminLimiter, deleteUser);
router.put('/:id/status', protect, authorize('admin'), adminLimiter, updateUserStatus);
router.put('/bulk/status', protect, authorize('admin'), adminLimiter, bulkUpdateUserStatus);

module.exports = router;