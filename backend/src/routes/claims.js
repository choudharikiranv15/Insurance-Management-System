const express = require('express');
const {
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  updateClaimStatus,
  assignClaim,
  addInvestigationDetails,
  uploadClaimDocuments,
  getClaimDashboardStats
} = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');
const { validateClaimCreation } = require('../middleware/validation');
const { uploadLimiter, searchLimiter } = require('../middleware/rateLimiter');
const { uploadClaimDocuments: uploadMiddleware, handleUploadError, processUploadedFiles } = require('../middleware/upload');

const router = express.Router();

// Routes
router.get('/', protect, searchLimiter, getClaims);
router.get('/dashboard-stats', protect, getClaimDashboardStats);
router.get('/:id', protect, getClaimById);
router.post('/', protect, uploadMiddleware, handleUploadError, processUploadedFiles, validateClaimCreation, createClaim);
router.put('/:id', protect, updateClaim);
router.put('/:id/status', protect, authorize('admin', 'agent'), updateClaimStatus);
router.put('/:id/assign', protect, authorize('admin'), assignClaim);
router.put('/:id/investigation', protect, authorize('admin', 'agent'), addInvestigationDetails);
router.post('/:id/documents', protect, uploadLimiter, uploadMiddleware, handleUploadError, processUploadedFiles, uploadClaimDocuments);

module.exports = router;