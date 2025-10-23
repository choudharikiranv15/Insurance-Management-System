const express = require('express');
const router = express.Router();
const {
  getSmartRecommendations,
  getPolicyTypeRecommendation
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getSmartRecommendations);
router.get('/:policyType', getPolicyTypeRecommendation);

module.exports = router;
