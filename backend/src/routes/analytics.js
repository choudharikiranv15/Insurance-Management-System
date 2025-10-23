const express = require('express');
const {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getPolicyAnalytics,
  getClaimsAnalytics,
  getCustomerAnalytics,
  exportAnalyticsData
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All analytics routes are restricted to admin users
router.use(protect);
router.use(authorize('admin'));

// Routes
router.get('/dashboard', searchLimiter, getDashboardAnalytics);
router.get('/revenue', searchLimiter, getRevenueAnalytics);
router.get('/policies', searchLimiter, getPolicyAnalytics);
router.get('/claims', searchLimiter, getClaimsAnalytics);
router.get('/customers', searchLimiter, getCustomerAnalytics);
router.get('/export', searchLimiter, exportAnalyticsData);

module.exports = router;