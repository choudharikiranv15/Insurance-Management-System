const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: [true, 'Policy reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer reference is required']
  },
  paymentType: {
    type: String,
    required: [true, 'Please specify payment type'],
    enum: ['premium', 'claim_settlement', 'refund', 'penalty', 'late_fee']
  },
  amount: {
    type: Number,
    required: [true, 'Please specify payment amount'],
    min: [0, 'Payment amount must be positive']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please specify payment method'],
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'upi', 'net_banking', 'wallet', 'cash', 'cheque']
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'payu', 'paypal', 'manual'],
    default: 'razorpay'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  gatewayTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  processedDate: Date,
  description: String,
  billing: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    bankName: String,
    upiId: String,
    walletProvider: String
  },
  fees: {
    gatewayFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  taxes: {
    gst: {
      type: Number,
      default: 0
    },
    serviceTax: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    }
  },
  netAmount: Number,
  refund: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed']
    }
  },
  receipt: {
    receiptNumber: String,
    receiptUrl: String,
    emailSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    }
  },
  reminders: [{
    reminderDate: Date,
    reminderType: {
      type: String,
      enum: ['email', 'sms', 'notification']
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual', 'annual']
    },
    nextPaymentDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String,
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate payment ID
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const prefix = 'PAY';
    const timestamp = Date.now().toString().slice(-8);
    this.paymentId = `${prefix}${timestamp}`;
  }
  next();
});

// Generate transaction ID if not provided
paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Calculate net amount
paymentSchema.pre('save', function(next) {
  if (this.amount && (this.fees.totalFees || this.taxes.totalTax)) {
    this.netAmount = this.amount - (this.fees.totalFees || 0) - (this.taxes.totalTax || 0);
  } else {
    this.netAmount = this.amount;
  }
  next();
});

// Generate receipt number
paymentSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.receipt.receiptNumber) {
    this.receipt.receiptNumber = `RCP${Date.now().toString().slice(-8)}`;
  }
  next();
});

// Set processed date when payment is completed
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.processedDate) {
    this.processedDate = new Date();
  }
  next();
});

// Virtual for payment age
paymentSchema.virtual('paymentAge').get(function() {
  const now = new Date();
  const diffTime = now - this.paymentDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
paymentSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for days overdue
paymentSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const diffTime = new Date() - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ policy: 1, status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ status: 1, paymentType: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);