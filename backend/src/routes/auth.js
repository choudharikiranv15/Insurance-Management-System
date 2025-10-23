const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange
} = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Routes with rate limiting and validation
router.post('/register', authLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:resettoken', passwordResetLimiter, resetPassword);
router.put('/update-password', protect, validatePasswordChange, updatePassword);

module.exports = router;