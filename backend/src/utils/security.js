const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate secure random string
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate OTP
const generateOTP = (digits = 6) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Hash sensitive data
const hashData = (data, salt) => {
  const hash = crypto.createHmac('sha256', salt || process.env.JWT_SECRET);
  hash.update(data);
  return hash.digest('hex');
};

// Encrypt sensitive data
const encrypt = (text, key = process.env.JWT_SECRET) => {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Decrypt sensitive data
const decrypt = (encryptedData, key = process.env.JWT_SECRET) => {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipher(algorithm, key);

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH) || 8;
  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify and decode JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Rate limiting check
const checkRateLimit = (attempts, maxAttempts, windowMs) => {
  const now = new Date();
  const windowStart = new Date(now - windowMs);

  const recentAttempts = attempts.filter(attempt => attempt > windowStart);

  return {
    isLimitExceeded: recentAttempts.length >= maxAttempts,
    attemptsRemaining: Math.max(0, maxAttempts - recentAttempts.length),
    resetTime: new Date(recentAttempts[0]?.getTime() + windowMs)
  };
};

// Generate API key
const generateAPIKey = (prefix = 'ins') => {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${randomBytes}`;
};

// Mask sensitive data for logging
const maskSensitiveData = (data, fieldsToMask = ['password', 'ssn', 'cardNumber', 'cvv']) => {
  if (typeof data !== 'object' || data === null) return data;

  const masked = { ...data };

  fieldsToMask.forEach(field => {
    if (masked[field]) {
      const value = masked[field].toString();
      if (value.length <= 4) {
        masked[field] = '*'.repeat(value.length);
      } else {
        masked[field] = value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
      }
    }
  });

  return masked;
};

// Generate policy number
const generatePolicyNumber = (policyType) => {
  const prefix = policyType.toUpperCase().substring(0, 2);
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Generate claim number
const generateClaimNumber = () => {
  const prefix = 'CLM';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// IP address validation
const isValidIP = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Indian format)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  return phoneRegex.test(phone);
};

// PAN number validation (Indian)
const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

// Aadhar number validation (Indian)
const isValidAadhar = (aadhar) => {
  const aadharRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
  return aadharRegex.test(aadhar);
};

module.exports = {
  generateSecureToken,
  generateOTP,
  hashData,
  encrypt,
  decrypt,
  sanitizeInput,
  validatePasswordStrength,
  generateTokens,
  verifyToken,
  checkRateLimit,
  generateAPIKey,
  maskSensitiveData,
  generatePolicyNumber,
  generateClaimNumber,
  isValidIP,
  isValidEmail,
  isValidPhoneNumber,
  isValidPAN,
  isValidAadhar
};