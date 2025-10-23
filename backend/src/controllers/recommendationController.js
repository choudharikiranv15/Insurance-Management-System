const { getRecommendations } = require('../services/recommendationService');

// @desc    Get smart policy recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getSmartRecommendations = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(req.user._id);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations for specific policy type
// @route   GET /api/recommendations/:policyType
// @access  Private
exports.getPolicyTypeRecommendation = async (req, res, next) => {
  try {
    const { policyType } = req.params;
    const allRecommendations = await getRecommendations(req.user._id);

    const specificRecommendation = allRecommendations.recommendations.find(
      r => r.policyType === policyType
    );

    if (!specificRecommendation) {
      return res.status(404).json({
        success: false,
        message: 'Policy type not found'
      });
    }

    res.json({
      success: true,
      data: specificRecommendation
    });
  } catch (error) {
    next(error);
  }
};
