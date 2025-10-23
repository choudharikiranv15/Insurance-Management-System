const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    unique: true,
    required: false  // Auto-generated in pre-save hook
  },
  policyType: {
    type: String,
    required: [true, 'Please specify policy type'],
    enum: ['life', 'health', 'auto', 'home', 'travel', 'business']
  },
  policyName: {
    type: String,
    required: [true, 'Please add policy name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add policy description']
  },
  coverageAmount: {
    type: Number,
    required: [true, 'Please specify coverage amount'],
    min: [0, 'Coverage amount must be positive']
  },
  premiumAmount: {
    type: Number,
    required: [true, 'Please specify premium amount'],
    min: [0, 'Premium amount must be positive']
  },
  premiumFrequency: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
    default: 'annual'
  },
  duration: {
    type: Number,
    required: [true, 'Please specify policy duration in years'],
    min: [1, 'Policy duration must be at least 1 year']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  beneficiaries: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: false  // Auto-calculated in pre-save hook based on startDate + duration
  },
  nextPaymentDue: {
    type: Date,
    required: false  // Auto-calculated in pre-save hook based on startDate + premiumFrequency
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'cancelled', 'expired', 'suspended'],
    default: 'pending'
  },
  terms: {
    type: String,
    required: true
  },
  exclusions: [String],
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  paymentHistory: [{
    amount: Number,
    paymentDate: Date,
    paymentMethod: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed'
    }
  }],
  claimsHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    tags: [String],
    notes: String,
    riskCategory: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate policy number
policySchema.pre('save', async function(next) {
  if (!this.policyNumber) {
    const prefix = this.policyType.toUpperCase().substring(0, 2);
    const timestamp = Date.now().toString().slice(-8);
    this.policyNumber = `${prefix}${timestamp}`;
  }
  next();
});

// Calculate end date based on start date and duration
policySchema.pre('save', function(next) {
  if (this.isNew && this.startDate && this.duration && !this.endDate) {
    this.endDate = new Date(this.startDate);
    this.endDate.setFullYear(this.endDate.getFullYear() + this.duration);
  }
  next();
});

// Calculate next payment due
policySchema.pre('save', function(next) {
  if (this.isNew && this.startDate && this.premiumFrequency && !this.nextPaymentDue) {
    this.nextPaymentDue = new Date(this.startDate);

    switch(this.premiumFrequency) {
      case 'monthly':
        this.nextPaymentDue.setMonth(this.nextPaymentDue.getMonth() + 1);
        break;
      case 'quarterly':
        this.nextPaymentDue.setMonth(this.nextPaymentDue.getMonth() + 3);
        break;
      case 'semi-annual':
        this.nextPaymentDue.setMonth(this.nextPaymentDue.getMonth() + 6);
        break;
      case 'annual':
        this.nextPaymentDue.setFullYear(this.nextPaymentDue.getFullYear() + 1);
        break;
    }
  }
  next();
});

// Virtual for days until expiration
policySchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for policy age
policySchema.virtual('policyAge').get(function() {
  const now = new Date();
  const diffTime = now - this.startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
policySchema.index({ customer: 1, status: 1 });
policySchema.index({ agent: 1, status: 1 });
policySchema.index({ policyType: 1, status: 1 });
policySchema.index({ nextPaymentDue: 1 });

module.exports = mongoose.model('Policy', policySchema);