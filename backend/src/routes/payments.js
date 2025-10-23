const express = require('express');
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  processRefund,
  getPaymentReceipt,
  getPaymentDashboardStats,
  getOverduePayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');
const { generalLimiter, searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Routes
router.get('/', protect, searchLimiter, getPayments);
router.get('/dashboard-stats', protect, getPaymentDashboardStats);
router.get('/overdue', protect, getOverduePayments);
router.get('/:id', protect, getPaymentById);
router.get('/:id/receipt', protect, getPaymentReceipt);
router.post('/', protect, generalLimiter, validatePayment, createPayment);
router.put('/:id/status', protect, authorize('admin'), updatePaymentStatus);
router.post('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;