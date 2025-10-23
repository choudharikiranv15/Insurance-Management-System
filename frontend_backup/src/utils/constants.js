/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CUSTOMER: 'customer'
};

// Policy Types
export const POLICY_TYPES = {
  LIFE: 'life',
  HEALTH: 'health',
  AUTO: 'auto',
  HOME: 'home',
  TRAVEL: 'travel',
  BUSINESS: 'business'
};

// Policy Type Display Names
export const POLICY_TYPE_NAMES = {
  [POLICY_TYPES.LIFE]: 'Life Insurance',
  [POLICY_TYPES.HEALTH]: 'Health Insurance',
  [POLICY_TYPES.AUTO]: 'Auto Insurance',
  [POLICY_TYPES.HOME]: 'Home Insurance',
  [POLICY_TYPES.TRAVEL]: 'Travel Insurance',
  [POLICY_TYPES.BUSINESS]: 'Business Insurance'
};

// Policy Status
export const POLICY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
};

// Claim Types
export const CLAIM_TYPES = {
  DEATH: 'death',
  DISABILITY: 'disability',
  MEDICAL: 'medical',
  ACCIDENT: 'accident',
  PROPERTY_DAMAGE: 'property_damage',
  THEFT: 'theft',
  FIRE: 'fire',
  NATURAL_DISASTER: 'natural_disaster',
  OTHER: 'other'
};

// Claim Status
export const CLAIM_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  INVESTIGATING: 'investigating',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLOSED: 'closed'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
  NET_BANKING: 'net_banking',
  WALLET: 'wallet',
  CASH: 'cash',
  CHEQUE: 'cheque'
};

// Premium Frequency
export const PREMIUM_FREQUENCY = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semi-annual',
  ANNUAL: 'annual'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  PAYMENT_DUE: 'payment_due',
  PAYMENT_OVERDUE: 'payment_overdue',
  PAYMENT_RECEIVED: 'payment_received',
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_UPDATED: 'claim_updated',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
  POLICY_CREATED: 'policy_created',
  POLICY_EXPIRING: 'policy_expiring',
  POLICY_RENEWED: 'policy_renewed',
  POLICY_CANCELLED: 'policy_cancelled',
  SYSTEM_ALERT: 'system_alert',
  ACCOUNT_UPDATE: 'account_update',
  DOCUMENT_REQUIRED: 'document_required',
  GENERAL: 'general'
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Status Colors for Chips
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
  expired: 'error',
  suspended: 'warning',
  completed: 'info',
  processing: 'info',
  failed: 'error',
  refunded: 'info',
  submitted: 'info',
  under_review: 'warning',
  investigating: 'warning',
  closed: 'default'
};

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY hh:mm A'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully.',
  REGISTER: 'Registration successful!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  CREATE: 'Created successfully!',
  UPLOAD: 'File uploaded successfully!',
  SUBMIT: 'Submitted successfully!'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  AGENT_DASHBOARD: '/agent/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard'
};

// Theme Colors
export const THEME_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3'
};

export default {
  API_CONFIG,
  USER_ROLES,
  POLICY_TYPES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS,
  CLAIM_TYPES,
  CLAIM_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PREMIUM_FREQUENCY,
  NOTIFICATION_TYPES,
  PRIORITY_LEVELS,
  STATUS_COLORS,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ROUTES,
  THEME_COLORS
};
