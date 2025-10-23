const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'separated']
    },
    nationality: {
      type: String,
      default: 'Indian'
    },
    occupation: String,
    annualIncome: Number,
    identificationDocuments: [{
      type: {
        type: String,
        enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id'],
        required: true
      },
      number: {
        type: String,
        required: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      documentUrl: String
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    }
  },
  workInfo: {
    employeeId: String,
    company: String,
    department: String,
    position: String,
    workLocation: String,
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'unemployed', 'retired']
    },
    joinDate: Date,
    salary: Number,
    reportingManager: String,
    workAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  medicalInfo: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    height: Number, // in cm
    weight: Number, // in kg
    allergies: [String],
    chronicConditions: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    familyMedicalHistory: [{
      relation: String,
      condition: String,
      ageOfDiagnosis: Number
    }],
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current'],
      default: 'never'
    },
    drinkingStatus: {
      type: String,
      enum: ['never', 'occasionally', 'regularly'],
      default: 'never'
    },
    lastHealthCheckup: Date
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'es', 'fr', 'de', 'zh']
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      },
      policyReminders: {
        type: Boolean,
        default: true
      },
      paymentReminders: {
        type: Boolean,
        default: true
      },
      claimUpdates: {
        type: Boolean,
        default: true
      }
    },
    communication: {
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'sms', 'app'],
        default: 'email'
      },
      preferredContactTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'anytime'],
        default: 'anytime'
      }
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    backupCodes: [String],
    securityQuestions: [{
      question: String,
      answer: String // This should be hashed
    }],
    lastPasswordChange: Date,
    passwordHistory: [String], // Store hashed passwords
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: Date,
    trustedDevices: [{
      deviceId: String,
      deviceName: String,
      ipAddress: String,
      userAgent: String,
      lastUsed: Date,
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['profile_photo', 'id_proof', 'address_proof', 'income_proof', 'medical_report', 'other']
    },
    url: String,
    verified: {
      type: Boolean,
      default: false
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedDate: Date
  }],
  riskProfile: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    riskCategory: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    riskFactors: [String],
    lastAssessment: Date,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  bankDetails: [{
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountType: {
      type: String,
      enum: ['savings', 'current', 'salary']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  nomineeDetails: [{
    name: String,
    relationship: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String,
    email: String,
    share: {
      type: Number,
      min: 0,
      max: 100
    },
    guardianName: String, // For minor nominees
    guardianRelation: String
  }],
  activityLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }],
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate profile completeness
profileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const weights = {
    personalInfo: 30,
    workInfo: 20,
    medicalInfo: 15,
    preferences: 10,
    security: 15,
    documents: 10
  };

  // Personal Info completeness
  const personalFields = ['dateOfBirth', 'gender', 'nationality', 'occupation'];
  const personalComplete = personalFields.reduce((acc, field) => {
    return acc + (this.personalInfo[field] ? 1 : 0);
  }, 0);
  score += (personalComplete / personalFields.length) * weights.personalInfo;

  // Work Info completeness
  if (this.workInfo.company && this.workInfo.position) {
    score += weights.workInfo;
  }

  // Medical Info completeness
  if (this.medicalInfo.bloodGroup && this.medicalInfo.height && this.medicalInfo.weight) {
    score += weights.medicalInfo;
  }

  // Preferences are usually auto-filled, so give full score
  score += weights.preferences;

  // Security completeness
  if (this.security.twoFactorEnabled && this.security.securityQuestions.length > 0) {
    score += weights.security;
  }

  // Documents completeness
  const requiredDocs = ['profile_photo', 'id_proof', 'address_proof'];
  const docsComplete = requiredDocs.reduce((acc, docType) => {
    return acc + (this.documents.some(doc => doc.type === docType && doc.verified) ? 1 : 0);
  }, 0);
  score += (docsComplete / requiredDocs.length) * weights.documents;

  this.profileCompleteness = Math.round(score);
  return this.profileCompleteness;
};

// Virtual for age
profileSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const now = new Date();
  const birth = new Date(this.personalInfo.dateOfBirth);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// Virtual for BMI
profileSchema.virtual('bmi').get(function() {
  if (!this.medicalInfo.height || !this.medicalInfo.weight) return null;
  const heightInMeters = this.medicalInfo.height / 100;
  return (this.medicalInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Update profile completeness before saving
profileSchema.pre('save', function(next) {
  this.calculateCompleteness();
  this.lastUpdated = new Date();
  next();
});

// Index for efficient queries
profileSchema.index({ user: 1 });
profileSchema.index({ 'personalInfo.dateOfBirth': 1 });
profileSchema.index({ 'riskProfile.riskCategory': 1 });
profileSchema.index({ profileCompleteness: 1 });

module.exports = mongoose.model('Profile', profileSchema);