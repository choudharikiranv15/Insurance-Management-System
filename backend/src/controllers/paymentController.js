const Payment = require('../models/Payment');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object based on user role
    const filter = {};

    // If user is customer, only show their payments
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }

    // Apply additional filters
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.paymentType && req.query.paymentType !== 'all') {
      filter.paymentType = req.query.paymentType;
    }

    if (req.query.paymentMethod && req.query.paymentMethod !== 'all') {
      filter.paymentMethod = req.query.paymentMethod;
    }

    if (req.query.policy) {
      filter.policy = req.query.policy;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { paymentId: searchRegex },
        { transactionId: searchRegex },
        { 'receipt.receiptNumber': searchRegex }
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.paymentDate = {};
      if (req.query.startDate) {
        filter.paymentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.paymentDate.$lte = new Date(req.query.endDate);
      }
    }

    // Build sort object
    const sortField = req.query.sortBy || 'paymentDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Execute queries
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('customer', 'firstName lastName email phone')
        .populate('policy', 'policyNumber policyName policyType')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      payments
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('policy', 'policyNumber policyName policyType coverageAmount premiumAmount');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user can access this payment
    if (req.user.role === 'customer' && payment.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment'
    });
  }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const {
      policy,
      amount,
      paymentMethod,
      paymentType,
      description,
      dueDate,
      billing
    } = req.body;

    // Verify policy exists
    const policyDoc = await Policy.findById(policy);
    if (!policyDoc) {
      return res.status(400).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user owns the policy (for customers)
    if (req.user.role === 'customer' && policyDoc.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create payment for this policy'
      });
    }

    // Calculate fees and taxes (simplified calculation)
    const gatewayFee = amount * 0.02; // 2% gateway fee
    const gst = (amount + gatewayFee) * 0.18; // 18% GST
    const totalFees = gatewayFee;
    const totalTax = gst;

    const payment = await Payment.create({
      policy,
      customer: req.user.role === 'customer' ? req.user.id : policyDoc.customer,
      paymentType: paymentType || 'premium',
      amount,
      paymentMethod,
      description,
      dueDate,
      billing: billing || {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone
      },
      fees: {
        gatewayFee,
        totalFees
      },
      taxes: {
        gst,
        totalTax
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    });

    await payment.populate('customer', 'firstName lastName email phone');
    await payment.populate('policy', 'policyNumber policyName policyType');

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
    });

  } catch (error) {
    console.error('Create payment error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A payment with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating payment'
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, gatewayTransactionId, failureReason } = req.body;

    if (!['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = status;

    if (gatewayTransactionId) {
      payment.gatewayTransactionId = gatewayTransactionId;
    }

    if (status === 'completed') {
      payment.processedDate = new Date();

      // Generate receipt
      if (!payment.receipt.receiptNumber) {
        payment.receipt.receiptNumber = `RCP${Date.now().toString().slice(-8)}`;
      }

      // Update policy payment history
      const policy = await Policy.findById(payment.policy);
      if (policy) {
        policy.paymentHistory.push({
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          status: 'completed'
        });

        // Update next payment due date for premium payments
        if (payment.paymentType === 'premium') {
          const nextDue = new Date(policy.nextPaymentDue);
          switch(policy.premiumFrequency) {
            case 'monthly':
              nextDue.setMonth(nextDue.getMonth() + 1);
              break;
            case 'quarterly':
              nextDue.setMonth(nextDue.getMonth() + 3);
              break;
            case 'semi-annual':
              nextDue.setMonth(nextDue.getMonth() + 6);
              break;
            case 'annual':
              nextDue.setFullYear(nextDue.getFullYear() + 1);
              break;
          }
          policy.nextPaymentDue = nextDue;
        }

        await policy.save();
      }
    }

    if (status === 'failed' && failureReason) {
      payment.description = `${payment.description || ''} - Failure Reason: ${failureReason}`;
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment status'
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    if (refundAmount > payment.netAmount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Create refund entry
    payment.refund = {
      refundId: `REF${Date.now()}`,
      refundAmount,
      refundDate: new Date(),
      refundReason,
      refundStatus: 'processing'
    };

    payment.status = 'refunded';
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      payment
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:id/receipt
// @access  Private
const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('policy', 'policyNumber policyName policyType');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user can access this payment
    if (req.user.role === 'customer' && payment.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment receipt'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Receipt not available for incomplete payments'
      });
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: payment.receipt.receiptNumber,
      paymentId: payment.paymentId,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate,
      customer: payment.customer,
      policy: payment.policy,
      amount: payment.amount,
      fees: payment.fees,
      taxes: payment.taxes,
      netAmount: payment.netAmount,
      paymentMethod: payment.paymentMethod,
      description: payment.description
    };

    res.status(200).json({
      success: true,
      receipt: receiptData
    });

  } catch (error) {
    console.error('Get payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment receipt'
    });
  }
};

// @desc    Get payment dashboard stats
// @route   GET /api/payments/dashboard-stats
// @access  Private
const getPaymentDashboardStats = async (req, res) => {
  try {
    // Build filter based on user role
    const filter = {};
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalNetAmount: { $sum: '$netAmount' },
          completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          refundedPayments: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
          premiumPayments: { $sum: { $cond: [{ $eq: ['$paymentType', 'premium'] }, 1, 0] } },
          claimPayments: { $sum: { $cond: [{ $eq: ['$paymentType', 'claim_settlement'] }, 1, 0] } },
          totalFees: { $sum: '$fees.totalFees' },
          totalTaxes: { $sum: '$taxes.totalTax' }
        }
      }
    ]);

    // Get payments by method
    const paymentsByMethod = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent payments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = await Payment.countDocuments({
      ...filter,
      paymentDate: { $gte: thirtyDaysAgo }
    });

    // Get overdue payments
    const overduePayments = await Payment.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $in: ['pending', 'processing'] }
    });

    const statistics = stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      totalNetAmount: 0,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
      premiumPayments: 0,
      claimPayments: 0,
      totalFees: 0,
      totalTaxes: 0
    };

    res.status(200).json({
      success: true,
      statistics: {
        ...statistics,
        paymentsByMethod,
        recentPayments,
        overduePayments
      }
    });

  } catch (error) {
    console.error('Get payment dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment dashboard stats'
    });
  }
};

// @desc    Get overdue payments
// @route   GET /api/payments/overdue
// @access  Private
const getOverduePayments = async (req, res) => {
  try {
    // Build filter based on user role
    const filter = {
      dueDate: { $lt: new Date() },
      status: { $in: ['pending', 'processing'] }
    };

    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }

    const overduePayments = await Payment.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('policy', 'policyNumber policyName policyType')
      .sort({ dueDate: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: overduePayments.length,
      payments: overduePayments
    });

  } catch (error) {
    console.error('Get overdue payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue payments'
    });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  processRefund,
  getPaymentReceipt,
  getPaymentDashboardStats,
  getOverduePayments
};