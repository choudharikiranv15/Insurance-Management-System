const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'payment_due',
      'payment_received',
      'payment_overdue',
      'claim_submitted',
      'claim_updated',
      'claim_approved',
      'claim_rejected',
      'policy_created',
      'policy_expiring',
      'policy_renewed',
      'policy_cancelled',
      'system_alert',
      'account_update',
      'document_required',
      'general'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'read'],
    default: 'pending',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date
  },
  errorMessage: {
    type: String
  },
  metadata: {
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    pushSent: { type: Boolean, default: false },
    emailDeliveryStatus: String,
    smsDeliveryStatus: String,
    pushDeliveryStatus: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  if (this.status === 'sent') {
    this.status = 'read';
  }
  return this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark multiple as read
notificationSchema.statics.markMultipleAsRead = function(userId, notificationIds) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
        status: 'read'
      }
    }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
