const express = require('express');
const {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  updatePolicyStatus,
  addPaymentToPolicy,
  getPolicyDashboardStats,
  getPoliciesExpiringSoon
} = require('../controllers/policyController');
const { protect, authorize } = require('../middleware/auth');
const { validatePolicyCreation } = require('../middleware/validation');
const { generalLimiter, searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Routes
router.get('/', protect, searchLimiter, getPolicies);
router.get('/dashboard-stats', protect, getPolicyDashboardStats);
router.get('/expiring-soon', protect, getPoliciesExpiringSoon);
router.get('/:id', protect, getPolicyById);
router.post('/', protect, authorize('admin', 'agent'), generalLimiter, validatePolicyCreation, createPolicy);
router.put('/:id', protect, authorize('admin', 'agent'), updatePolicy);
router.delete('/:id', protect, authorize('admin'), deletePolicy);
router.put('/:id/status', protect, authorize('admin', 'agent'), updatePolicyStatus);
router.post('/:id/payment', protect, addPaymentToPolicy);

module.exports = router;