const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'test@ethereal.email',
      pass: process.env.SMTP_PASS || 'testpassword'
    }
  });
};

// Create a notification
const createNotification = async ({
  recipient,
  type,
  title,
  message,
  data = {},
  priority = 'medium',
  channels = { email: true, sms: false, push: true, inApp: true },
  scheduledFor = null
}) => {
  try {
    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      data,
      priority,
      channels,
      scheduledFor,
      status: 'pending'
    });

    await notification.save();

    // If not scheduled, send immediately
    if (!scheduledFor) {
      await sendNotification(notification._id);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send notification through configured channels
const sendNotification = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId).populate('recipient', 'email phone firstName lastName');

    if (!notification) {
      throw new Error('Notification not found');
    }

    const results = {
      email: false,
      sms: false,
      push: false
    };

    // Send email
    if (notification.channels.email && notification.recipient.email) {
      try {
        await sendEmail(notification);
        results.email = true;
        notification.metadata.emailSent = true;
        notification.metadata.emailDeliveryStatus = 'sent';
      } catch (error) {
        console.error('Email send error:', error);
        notification.metadata.emailDeliveryStatus = 'failed';
      }
    }

    // Send SMS (placeholder - requires Twilio configuration)
    if (notification.channels.sms && notification.recipient.phone) {
      try {
        // await sendSMS(notification);
        results.sms = true;
        notification.metadata.smsSent = true;
        notification.metadata.smsDeliveryStatus = 'sent';
      } catch (error) {
        console.error('SMS send error:', error);
        notification.metadata.smsDeliveryStatus = 'failed';
      }
    }

    // Update notification status
    notification.status = 'sent';
    notification.sentAt = new Date();
    notification.attempts += 1;
    notification.lastAttemptAt = new Date();

    await notification.save();

    return { success: true, results };
  } catch (error) {
    console.error('Error sending notification:', error);

    // Update notification with error
    await Notification.findByIdAndUpdate(notificationId, {
      status: 'failed',
      errorMessage: error.message,
      attempts: { $inc: 1 },
      lastAttemptAt: new Date()
    });

    throw error;
  }
};

// Send email
const sendEmail = async (notification) => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Insurance Management <noreply@insurance.com>',
    to: notification.recipient.email,
    subject: notification.title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            .priority-high { border-left: 4px solid #f44336; }
            .priority-urgent { border-left: 4px solid #ff5722; background-color: #fff3e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Insurance Management System</h1>
            </div>
            <div class="content ${notification.priority === 'high' ? 'priority-high' : ''} ${notification.priority === 'urgent' ? 'priority-urgent' : ''}">
              <h2>${notification.title}</h2>
              <p>Dear ${notification.recipient.firstName} ${notification.recipient.lastName},</p>
              <p>${notification.message}</p>
              ${notification.data && notification.data.policyId ? `<p><strong>Policy Reference:</strong> ${notification.data.policyId}</p>` : ''}
              ${notification.data && notification.data.claimId ? `<p><strong>Claim Reference:</strong> ${notification.data.claimId}</p>` : ''}
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View Dashboard</a></p>
            </div>
            <div class="footer">
              <p>This is an automated message from Insurance Management System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return info;
};

// Send SMS (placeholder - requires Twilio setup)
const sendSMS = async (notification) => {
  // Implement Twilio SMS sending here
  // Example:
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: notification.message,
  //   to: notification.recipient.phone,
  //   from: process.env.TWILIO_PHONE_NUMBER
  // });

  console.log('SMS would be sent to:', notification.recipient.phone);
  return { success: true };
};

// Send payment due reminders
const sendPaymentReminder = async (payment, user) => {
  const dueDate = new Date(payment.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  let title, message, priority;

  if (daysUntilDue < 0) {
    title = 'Payment Overdue';
    message = `Your payment of ₹${payment.amount} is overdue by ${Math.abs(daysUntilDue)} days. Please make the payment immediately to avoid policy cancellation.`;
    priority = 'urgent';
  } else if (daysUntilDue <= 3) {
    title = 'Payment Due Soon';
    message = `Your payment of ₹${payment.amount} is due in ${daysUntilDue} day(s). Please make the payment to keep your policy active.`;
    priority = 'high';
  } else {
    title = 'Upcoming Payment';
    message = `You have an upcoming payment of ₹${payment.amount} due on ${dueDate.toLocaleDateString()}.`;
    priority = 'medium';
  }

  return createNotification({
    recipient: user._id,
    type: daysUntilDue < 0 ? 'payment_overdue' : 'payment_due',
    title,
    message,
    data: {
      paymentId: payment._id,
      policyId: payment.policy,
      amount: payment.amount,
      dueDate: payment.dueDate
    },
    priority,
    channels: { email: true, sms: daysUntilDue < 0, push: true, inApp: true }
  });
};

// Send claim status update
const sendClaimUpdate = async (claim, user, statusUpdate) => {
  const statusMessages = {
    submitted: 'Your claim has been successfully submitted and is under review.',
    under_review: 'Your claim is currently under review by our team.',
    investigating: 'Your claim is being investigated. We will update you soon.',
    approved: `Great news! Your claim has been approved for ₹${claim.approvedAmount || claim.claimAmount}.`,
    rejected: 'Unfortunately, your claim has been rejected. Please check your dashboard for details.',
    closed: 'Your claim has been closed.'
  };

  return createNotification({
    recipient: user._id,
    type: 'claim_updated',
    title: `Claim Status: ${statusUpdate.toUpperCase().replace('_', ' ')}`,
    message: statusMessages[statusUpdate] || 'Your claim status has been updated.',
    data: {
      claimId: claim._id,
      policyId: claim.policy,
      status: statusUpdate
    },
    priority: statusUpdate === 'approved' || statusUpdate === 'rejected' ? 'high' : 'medium',
    channels: { email: true, sms: statusUpdate === 'approved' || statusUpdate === 'rejected', push: true, inApp: true }
  });
};

// Send policy expiry reminder
const sendPolicyExpiryReminder = async (policy, user) => {
  const expiryDate = new Date(policy.endDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  return createNotification({
    recipient: user._id,
    type: 'policy_expiring',
    title: 'Policy Expiring Soon',
    message: `Your policy ${policy.policyName} will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}. Please renew to maintain coverage.`,
    data: {
      policyId: policy._id,
      expiryDate: policy.endDate,
      policyName: policy.policyName
    },
    priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
    channels: { email: true, sms: daysUntilExpiry <= 7, push: true, inApp: true }
  });
};

// Get user notifications
const getUserNotifications = async (userId, options = {}) => {
  const {
    limit = 50,
    skip = 0,
    unreadOnly = false,
    type = null
  } = options;

  const query = { recipient: userId };
  if (unreadOnly) query.isRead = false;
  if (type) query.type = type;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('data.policyId', 'policyNumber policyName')
    .populate('data.claimId', 'claimNumber')
    .populate('data.paymentId', 'paymentId amount');

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(userId);

  return {
    notifications,
    total,
    unreadCount,
    hasMore: total > skip + limit
  };
};

// Process scheduled notifications
const processScheduledNotifications = async () => {
  try {
    const now = new Date();
    const scheduledNotifications = await Notification.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    });

    for (const notification of scheduledNotifications) {
      await sendNotification(notification._id);
    }

    console.log(`Processed ${scheduledNotifications.length} scheduled notifications`);
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
};

module.exports = {
  createNotification,
  sendNotification,
  sendEmail,
  sendSMS,
  sendPaymentReminder,
  sendClaimUpdate,
  sendPolicyExpiryReminder,
  getUserNotifications,
  processScheduledNotifications
};
