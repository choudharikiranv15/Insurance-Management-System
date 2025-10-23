const express = require('express');
const router = express.Router();
const { chat, getSuggestions, getFAQs } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/faqs', getFAQs);

// Protected routes
router.post('/', protect, chat);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
