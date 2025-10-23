const express = require('express');
const {
  getProfile,
  updateProfile,
  updatePersonalInfo,
  updateWorkInfo,
  updateMedicalInfo,
  updatePreferences,
  updateSecuritySettings,
  uploadAvatar,
  getActivityLog,
  addBankDetails,
  addNomineeDetails
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const { uploadProfileImage, handleUploadError, processUploadedFiles } = require('../middleware/upload');
const { generalLimiter, uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Routes
router.get('/', protect, getProfile);
router.put('/', protect, generalLimiter, updateProfile);
router.get('/activity', protect, getActivityLog);
router.put('/personal-info', protect, generalLimiter, validateProfileUpdate, updatePersonalInfo);
router.put('/work-info', protect, generalLimiter, updateWorkInfo);
router.put('/medical-info', protect, generalLimiter, updateMedicalInfo);
router.put('/preferences', protect, generalLimiter, updatePreferences);
router.put('/security', protect, generalLimiter, updateSecuritySettings);
router.post('/avatar', protect, uploadLimiter, uploadProfileImage, handleUploadError, processUploadedFiles, uploadAvatar);
router.post('/bank-details', protect, generalLimiter, addBankDetails);
router.post('/nominee', protect, generalLimiter, addNomineeDetails);

module.exports = router;