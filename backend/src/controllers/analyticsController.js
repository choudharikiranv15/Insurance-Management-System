const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const Profile = require('../models/Profile');

// @desc    Get overall dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Users analytics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalCustomers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
          totalAgents: { $sum: { $cond: [{ $eq: ['$role', 'agent'] }, 1, 0] } },
          totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          newUsersThisPeriod: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startDate] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Policies analytics
    const policyStats = await Policy.aggregate([
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          pendingPolicies: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          expiredPolicies: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          totalCoverageValue: { $sum: '$coverageAmount' },
          totalPremiumValue: { $sum: '$premiumAmount' },
          newPoliciesThisPeriod: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startDate] },
                1,
                0
              ]
            }
          },
          avgPolicyValue: { $avg: '$coverageAmount' },
          avgPremium: { $avg: '$premiumAmount' }
        }
      }
    ]);

    // Claims analytics
    const claimStats = await Claim.aggregate([
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          pendingClaims: { $sum: { $cond: [{ $in: ['$status', ['submitted', 'under_review', 'investigating']] }, 1, 0] } },
          approvedClaims: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedClaims: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          totalClaimAmount: { $sum: '$claimAmount' },
          totalApprovedAmount: { $sum: '$approvedAmount' },
          newClaimsThisPeriod: {
            $sum: {
              $cond: [
                { $gte: ['$reportedDate', startDate] },
                1,
                0
              ]
            }
          },
          avgClaimAmount: { $avg: '$claimAmount' },
          avgProcessingTime: { $avg: '$actualProcessingDays' }
        }
      }
    ]);

    // Payments analytics
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
          totalFees: { $sum: '$fees.totalFees' },
          paymentsThisPeriod: {
            $sum: {
              $cond: [
                { $gte: ['$paymentDate', startDate] },
                1,
                0
              ]
            }
          },
          revenueThisPeriod: {
            $sum: {
              $cond: [
                { $and: [
                  { $gte: ['$paymentDate', startDate] },
                  { $eq: ['$status', 'completed'] }
                ]},
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    const analytics = {
      users: userStats[0] || {},
      policies: policyStats[0] || {},
      claims: claimStats[0] || {},
      payments: paymentStats[0] || {}
    };

    res.status(200).json({
      success: true,
      timeframe: `${timeframe} days`,
      analytics
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard analytics'
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = async (req, res) => {
  try {
    const period = req.query.period || 'monthly'; // daily, weekly, monthly, yearly
    const year = parseInt(req.query.year) || new Date().getFullYear();

    let groupBy, dateFormat;
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
          day: { $dayOfMonth: '$paymentDate' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$paymentDate' },
          week: { $week: '$paymentDate' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$paymentDate' }
        };
        dateFormat = '%Y';
        break;
      default: // monthly
        groupBy = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' }
        };
        dateFormat = '%Y-%m';
    }

    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentType: 'premium',
          $expr: { $eq: [{ $year: '$paymentDate' }, year] }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$amount' },
          totalFees: { $sum: '$fees.totalFees' },
          netRevenue: { $sum: '$netAmount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    // Get revenue by policy type
    const revenueByPolicyType = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentType: 'premium',
          $expr: { $eq: [{ $year: '$paymentDate' }, year] }
        }
      },
      {
        $lookup: {
          from: 'policies',
          localField: 'policy',
          foreignField: '_id',
          as: 'policyData'
        }
      },
      {
        $unwind: '$policyData'
      },
      {
        $group: {
          _id: '$policyData.policyType',
          totalRevenue: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      }
    ]);

    // Get top customers by revenue
    const topCustomers = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentType: 'premium',
          $expr: { $eq: [{ $year: '$paymentDate' }, year] }
        }
      },
      {
        $group: {
          _id: '$customer',
          totalPaid: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerData'
        }
      },
      {
        $unwind: '$customerData'
      },
      {
        $project: {
          customerName: { $concat: ['$customerData.firstName', ' ', '$customerData.lastName'] },
          email: '$customerData.email',
          totalPaid: 1,
          paymentCount: 1
        }
      },
      {
        $sort: { totalPaid: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      period,
      year,
      revenueData,
      revenueByPolicyType,
      topCustomers
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue analytics'
    });
  }
};

// @desc    Get policy analytics
// @route   GET /api/analytics/policies
// @access  Private/Admin
const getPolicyAnalytics = async (req, res) => {
  try {
    // Policy distribution by type
    const policyByType = await Policy.aggregate([
      {
        $group: {
          _id: '$policyType',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          avgPremium: { $avg: '$premiumAmount' }
        }
      }
    ]);

    // Policy status distribution
    const policyByStatus = await Policy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      }
    ]);

    // Policies by agent performance
    const agentPerformance = await Policy.aggregate([
      {
        $match: { agent: { $exists: true } }
      },
      {
        $group: {
          _id: '$agent',
          policiesSold: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          totalPremium: { $sum: '$premiumAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agentData'
        }
      },
      {
        $unwind: '$agentData'
      },
      {
        $project: {
          agentName: { $concat: ['$agentData.firstName', ' ', '$agentData.lastName'] },
          agentCode: '$agentData.agentCode',
          policiesSold: 1,
          totalCoverage: 1,
          totalPremium: 1
        }
      },
      {
        $sort: { policiesSold: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Policy trends over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const policyTrends = await Policy.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newPolicies: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          avgPremium: { $avg: '$premiumAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Risk analysis
    const riskAnalysis = await Policy.aggregate([
      {
        $group: {
          _id: '$metadata.riskCategory',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          avgPremium: { $avg: '$premiumAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        policyByType,
        policyByStatus,
        agentPerformance,
        policyTrends,
        riskAnalysis
      }
    });

  } catch (error) {
    console.error('Get policy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policy analytics'
    });
  }
};

// @desc    Get claims analytics
// @route   GET /api/analytics/claims
// @access  Private/Admin
const getClaimsAnalytics = async (req, res) => {
  try {
    // Claims by type
    const claimsByType = await Claim.aggregate([
      {
        $group: {
          _id: '$claimType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
          approvedAmount: { $sum: '$approvedAmount' },
          avgProcessingTime: { $avg: '$actualProcessingDays' }
        }
      }
    ]);

    // Claims by status
    const claimsByStatus = await Claim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' }
        }
      }
    ]);

    // Claims approval rate
    const approvalRate = await Claim.aggregate([
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          approvedClaims: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedClaims: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      },
      {
        $project: {
          totalClaims: 1,
          approvedClaims: 1,
          rejectedClaims: 1,
          approvalRate: {
            $cond: [
              { $gt: ['$totalClaims', 0] },
              { $multiply: [{ $divide: ['$approvedClaims', '$totalClaims'] }, 100] },
              0
            ]
          },
          rejectionRate: {
            $cond: [
              { $gt: ['$totalClaims', 0] },
              { $multiply: [{ $divide: ['$rejectedClaims', '$totalClaims'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    // Claims trends over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const claimsTrends = await Claim.aggregate([
      {
        $match: {
          reportedDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$reportedDate' },
            month: { $month: '$reportedDate' }
          },
          newClaims: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
          approvedAmount: { $sum: '$approvedAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // High-value claims
    const highValueClaims = await Claim.find({ claimAmount: { $gte: 100000 } })
      .populate('customer', 'firstName lastName email')
      .populate('policy', 'policyNumber policyType')
      .sort({ claimAmount: -1 })
      .limit(10)
      .select('claimNumber claimAmount status reportedDate claimType');

    // Processing time analysis
    const processingTimeAnalysis = await Claim.aggregate([
      {
        $match: {
          actualProcessingDays: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$claimType',
          avgProcessingTime: { $avg: '$actualProcessingDays' },
          minProcessingTime: { $min: '$actualProcessingDays' },
          maxProcessingTime: { $max: '$actualProcessingDays' },
          claimCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        claimsByType,
        claimsByStatus,
        approvalRate: approvalRate[0] || {},
        claimsTrends,
        highValueClaims,
        processingTimeAnalysis
      }
    });

  } catch (error) {
    console.error('Get claims analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims analytics'
    });
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private/Admin
const getCustomerAnalytics = async (req, res) => {
  try {
    // Customer demographics
    const demographics = await Profile.aggregate([
      {
        $group: {
          _id: '$personalInfo.gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age distribution
    const ageDistribution = await Profile.aggregate([
      {
        $match: {
          'personalInfo.dateOfBirth': { $exists: true }
        }
      },
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$personalInfo.dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 25, 35, 45, 55, 65, 100],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Customer lifetime value
    const customerLTV = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentType: 'premium'
        }
      },
      {
        $group: {
          _id: '$customer',
          totalPaid: { $sum: '$amount' },
          paymentCount: { $sum: 1 },
          avgPayment: { $avg: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerData'
        }
      },
      {
        $unwind: '$customerData'
      },
      {
        $project: {
          customerName: { $concat: ['$customerData.firstName', ' ', '$customerData.lastName'] },
          email: '$customerData.email',
          totalPaid: 1,
          paymentCount: 1,
          avgPayment: 1
        }
      },
      {
        $sort: { totalPaid: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Customer acquisition trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const acquisitionTrends = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Profile completion stats
    const profileCompletionStats = await Profile.aggregate([
      {
        $bucket: {
          groupBy: '$profileCompleteness',
          boundaries: [0, 25, 50, 75, 100],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        demographics,
        ageDistribution,
        customerLTV,
        acquisitionTrends,
        profileCompletionStats
      }
    });

  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer analytics'
    });
  }
};

// @desc    Export analytics data
// @route   GET /api/analytics/export
// @access  Private/Admin
const exportAnalyticsData = async (req, res) => {
  try {
    const { type, format } = req.query;

    let data = [];

    switch (type) {
      case 'users':
        data = await User.find({})
          .select('firstName lastName email role isActive createdAt lastLogin')
          .lean();
        break;
      case 'policies':
        data = await Policy.find({})
          .populate('customer', 'firstName lastName email')
          .populate('agent', 'firstName lastName agentCode')
          .lean();
        break;
      case 'claims':
        data = await Claim.find({})
          .populate('customer', 'firstName lastName email')
          .populate('policy', 'policyNumber policyType')
          .lean();
        break;
      case 'payments':
        data = await Payment.find({})
          .populate('customer', 'firstName lastName email')
          .populate('policy', 'policyNumber policyType')
          .lean();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // For now, return JSON format
    // In production, you might want to support CSV, Excel, etc.
    res.status(200).json({
      success: true,
      type,
      format: format || 'json',
      count: data.length,
      data
    });

  } catch (error) {
    console.error('Export analytics data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting analytics data'
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getPolicyAnalytics,
  getClaimsAnalytics,
  getCustomerAnalytics,
  exportAnalyticsData
};