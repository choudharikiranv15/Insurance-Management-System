const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  createNotificationManual,
  sendTestNotification,
  getPreferences,
  updatePreferences
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.put('/:id/read', markAsRead);
router.put('/mark-multiple-read', markMultipleAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.post('/test', sendTestNotification);

// Admin only routes
router.post('/', authorize('admin'), createNotificationManual);

module.exports = router;
