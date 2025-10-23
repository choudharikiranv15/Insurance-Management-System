const Notification = require('../models/Notification');
const {
  getUserNotifications,
  createNotification,
  sendNotification
} = require('../services/notificationService');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const {
      limit = 50,
      page = 1,
      unreadOnly = false,
      type
    } = req.query;

    const skip = (page - 1) * limit;

    const result = await getUserNotifications(req.user._id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type
    });

    res.json({
      success: true,
      ...result,
      currentPage: parseInt(page),
      totalPages: Math.ceil(result.total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/mark-multiple-read
// @access  Private
exports.markMultipleAsRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of notification IDs'
      });
    }

    const result = await Notification.markMultipleAsRead(req.user._id, notificationIds);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          status: 'read'
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotificationManual = async (req, res, next) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      data,
      priority,
      channels,
      scheduledFor
    } = req.body;

    const notification = await createNotification({
      recipient,
      type,
      title,
      message,
      data,
      priority,
      channels,
      scheduledFor
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
exports.sendTestNotification = async (req, res, next) => {
  try {
    const notification = await createNotification({
      recipient: req.user._id,
      type: 'general',
      title: 'Test Notification',
      message: 'This is a test notification from Insurance Management System.',
      priority: 'low',
      channels: { email: true, sms: false, push: true, inApp: true }
    });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    // This would fetch from user preferences/profile
    // For now, returning default preferences
    const preferences = {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      types: {
        payment_due: { email: true, sms: true, push: true },
        payment_overdue: { email: true, sms: true, push: true },
        claim_updated: { email: true, sms: false, push: true },
        policy_expiring: { email: true, sms: true, push: true }
      }
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    // This would update user preferences/profile
    // For now, just acknowledging the update

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    next(error);
  }
};
