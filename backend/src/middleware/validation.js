const { body, validationResult } = require('express-validator');

// Handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  body('role')
    .optional()
    .isIn(['customer', 'agent', 'admin'])
    .withMessage('Role must be customer, agent, or admin'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Policy creation validation
const validatePolicyCreation = [
  body('policyType')
    .isIn(['life', 'health', 'auto', 'home', 'travel', 'business'])
    .withMessage('Invalid policy type'),
  body('policyName')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Policy name must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('coverageAmount')
    .isFloat({ min: 1000 })
    .withMessage('Coverage amount must be at least 1000'),
  body('premiumAmount')
    .isFloat({ min: 100 })
    .withMessage('Premium amount must be at least 100'),
  body('premiumFrequency')
    .isIn(['monthly', 'quarterly', 'semi-annual', 'annual'])
    .withMessage('Invalid premium frequency'),
  body('duration')
    .isInt({ min: 1, max: 50 })
    .withMessage('Duration must be between 1 and 50 years'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('terms')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Terms must be at least 50 characters'),
  body('beneficiaries')
    .optional()
    .isArray()
    .withMessage('Beneficiaries must be an array'),
  body('beneficiaries.*.name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Beneficiary name is required'),
  body('beneficiaries.*.relationship')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Beneficiary relationship is required'),
  body('beneficiaries.*.percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Beneficiary percentage must be between 0 and 100'),
  handleValidationErrors
];

// Claim creation validation
const validateClaimCreation = [
  body('policy')
    .isMongoId()
    .withMessage('Valid policy ID is required'),
  body('claimType')
    .isIn(['death', 'disability', 'medical', 'accident', 'property_damage', 'theft', 'fire', 'natural_disaster', 'other'])
    .withMessage('Invalid claim type'),
  body('incidentDate')
    .isISO8601()
    .withMessage('Please provide a valid incident date')
    .custom(value => {
      if (new Date(value) > new Date()) {
        throw new Error('Incident date cannot be in the future');
      }
      return true;
    }),
  body('claimAmount')
    .isFloat({ min: 1 })
    .withMessage('Claim amount must be positive'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('incidentLocation.address')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters'),
  handleValidationErrors
];

// Payment validation
const validatePayment = [
  body('policy')
    .isMongoId()
    .withMessage('Valid policy ID is required'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Payment amount must be positive'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'upi', 'net_banking', 'wallet', 'cash', 'cheque'])
    .withMessage('Invalid payment method'),
  body('paymentType')
    .optional()
    .isIn(['premium', 'claim_settlement', 'refund', 'penalty', 'late_fee'])
    .withMessage('Invalid payment type'),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('personalInfo.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('personalInfo.gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender'),
  body('personalInfo.maritalStatus')
    .optional()
    .isIn(['single', 'married', 'divorced', 'widowed', 'separated'])
    .withMessage('Invalid marital status'),
  body('personalInfo.annualIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual income must be positive'),
  body('workInfo.employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'unemployed', 'retired'])
    .withMessage('Invalid employment type'),
  body('workInfo.salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be positive'),
  body('medicalInfo.bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('medicalInfo.height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('medicalInfo.weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

// Search and filter validation
const validateSearchParams = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  body('sortBy')
    .optional()
    .isAlpha()
    .withMessage('Sort field must contain only letters'),
  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// OTP validation
const validateOTP = [
  body('otp')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 4-6 digits'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePolicyCreation,
  validateClaimCreation,
  validatePayment,
  validateProfileUpdate,
  validatePasswordChange,
  validateSearchParams,
  validateEmail,
  validateOTP,
  handleValidationErrors
};