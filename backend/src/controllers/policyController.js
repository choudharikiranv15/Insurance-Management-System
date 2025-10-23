const Policy = require('../models/Policy');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all policies
// @route   GET /api/policies
// @access  Private
const getPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object based on user role
    const filter = {};

    // If user is customer, only show their policies
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }

    // If user is agent, show policies they are assigned to
    if (req.user.role === 'agent') {
      filter.agent = req.user.id;
    }

    // Apply additional filters
    if (req.query.policyType && req.query.policyType !== 'all') {
      filter.policyType = req.query.policyType;
    }

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.customer && req.user.role !== 'customer') {
      filter.customer = req.query.customer;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { policyNumber: searchRegex },
        { policyName: searchRegex }
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Build sort object
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Execute queries
    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .populate('customer', 'firstName lastName email phone')
        .populate('agent', 'firstName lastName email agentCode')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Policy.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: policies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      policies
    });

  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policies'
    });
  }
};

// @desc    Get single policy
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('agent', 'firstName lastName email phone agentCode')
      .populate('claimsHistory');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user can access this policy
    if (req.user.role === 'customer' && policy.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this policy'
      });
    }

    if (req.user.role === 'agent' && policy.agent && policy.agent._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this policy'
      });
    }

    res.status(200).json({
      success: true,
      policy
    });

  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policy'
    });
  }
};

// @desc    Create new policy
// @route   POST /api/policies
// @access  Private/Admin/Agent
const createPolicy = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const {
      policyType,
      policyName,
      description,
      coverageAmount,
      premiumAmount,
      premiumFrequency,
      duration,
      customer,
      beneficiaries,
      startDate,
      terms,
      exclusions,
      riskCategory
    } = req.body;

    // Verify customer exists
    const customerUser = await User.findById(customer);
    if (!customerUser || customerUser.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Valid customer is required'
      });
    }

    // Set agent based on role
    let agentId = null;
    if (req.user.role === 'agent') {
      agentId = req.user.id;
    } else if (req.body.agent) {
      const agentUser = await User.findById(req.body.agent);
      if (agentUser && agentUser.role === 'agent') {
        agentId = req.body.agent;
      }
    }

    // Validate beneficiaries total percentage
    if (beneficiaries && beneficiaries.length > 0) {
      const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (totalPercentage !== 100) {
        return res.status(400).json({
          success: false,
          message: 'Beneficiaries percentage must total 100%'
        });
      }
    }

    const policy = await Policy.create({
      policyType,
      policyName,
      description,
      coverageAmount,
      premiumAmount,
      premiumFrequency,
      duration,
      customer,
      agent: agentId,
      beneficiaries,
      startDate: startDate || new Date(),
      terms,
      exclusions,
      metadata: {
        riskCategory: riskCategory || 'medium'
      }
    });

    await policy.populate('customer', 'firstName lastName email phone');
    if (agentId) {
      await policy.populate('agent', 'firstName lastName email agentCode');
    }

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      policy
    });

  } catch (error) {
    console.error('Create policy error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A policy with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating policy'
    });
  }
};

// @desc    Update policy
// @route   PUT /api/policies/:id
// @access  Private/Admin/Agent
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check authorization
    if (req.user.role === 'agent' && policy.agent && policy.agent.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this policy'
      });
    }

    const {
      policyName,
      description,
      coverageAmount,
      premiumAmount,
      premiumFrequency,
      beneficiaries,
      status,
      terms,
      exclusions,
      riskCategory
    } = req.body;

    // Validate beneficiaries if provided
    if (beneficiaries && beneficiaries.length > 0) {
      const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (totalPercentage !== 100) {
        return res.status(400).json({
          success: false,
          message: 'Beneficiaries percentage must total 100%'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (policyName) updateData.policyName = policyName;
    if (description) updateData.description = description;
    if (coverageAmount) updateData.coverageAmount = coverageAmount;
    if (premiumAmount) updateData.premiumAmount = premiumAmount;
    if (premiumFrequency) updateData.premiumFrequency = premiumFrequency;
    if (beneficiaries) updateData.beneficiaries = beneficiaries;
    if (status) updateData.status = status;
    if (terms) updateData.terms = terms;
    if (exclusions) updateData.exclusions = exclusions;
    if (riskCategory) updateData['metadata.riskCategory'] = riskCategory;

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('customer', 'firstName lastName email phone')
      .populate('agent', 'firstName lastName email agentCode');

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      policy: updatedPolicy
    });

  } catch (error) {
    console.error('Update policy error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating policy'
    });
  }
};

// @desc    Delete policy
// @route   DELETE /api/policies/:id
// @access  Private/Admin
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if policy has active claims
    if (policy.claimsHistory && policy.claimsHistory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete policy with existing claims'
      });
    }

    // Instead of hard delete, update status to cancelled
    await Policy.findByIdAndUpdate(req.params.id, {
      status: 'cancelled',
      isActive: false
    });

    res.status(200).json({
      success: true,
      message: 'Policy cancelled successfully'
    });

  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting policy'
    });
  }
};

// @desc    Update policy status
// @route   PUT /api/policies/:id/status
// @access  Private/Admin/Agent
const updatePolicyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'pending', 'cancelled', 'expired', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check authorization
    if (req.user.role === 'agent' && policy.agent && policy.agent.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this policy status'
      });
    }

    policy.status = status;
    if (status === 'cancelled' || status === 'expired') {
      policy.isActive = false;
    }

    await policy.save();

    res.status(200).json({
      success: true,
      message: `Policy status updated to ${status}`,
      policy
    });

  } catch (error) {
    console.error('Update policy status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating policy status'
    });
  }
};

// @desc    Add payment to policy
// @route   POST /api/policies/:id/payment
// @access  Private
const addPaymentToPolicy = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user owns this policy
    if (req.user.role === 'customer' && policy.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add payment to this policy'
      });
    }

    // Add payment to history
    policy.paymentHistory.push({
      amount,
      paymentDate: new Date(),
      paymentMethod,
      transactionId,
      status: 'completed'
    });

    // Update next payment due date
    const nextDue = new Date(policy.nextPaymentDue);
    switch(policy.premiumFrequency) {
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'semi-annual':
        nextDue.setMonth(nextDue.getMonth() + 6);
        break;
      case 'annual':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
    }
    policy.nextPaymentDue = nextDue;

    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      policy
    });

  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding payment'
    });
  }
};

// @desc    Get policy dashboard stats
// @route   GET /api/policies/dashboard-stats
// @access  Private
const getPolicyDashboardStats = async (req, res) => {
  try {
    // Build filter based on user role
    const filter = {};
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'agent') {
      filter.agent = req.user.id;
    }

    const stats = await Policy.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          pendingPolicies: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          expiredPolicies: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          totalPremiumValue: { $sum: '$premiumAmount' },
          totalCoverageValue: { $sum: '$coverageAmount' },
          lifeInsurance: { $sum: { $cond: [{ $eq: ['$policyType', 'life'] }, 1, 0] } },
          healthInsurance: { $sum: { $cond: [{ $eq: ['$policyType', 'health'] }, 1, 0] } },
          autoInsurance: { $sum: { $cond: [{ $eq: ['$policyType', 'auto'] }, 1, 0] } },
          homeInsurance: { $sum: { $cond: [{ $eq: ['$policyType', 'home'] }, 1, 0] } },
          travelInsurance: { $sum: { $cond: [{ $eq: ['$policyType', 'travel'] }, 1, 0] } },
          businessInsurance: { $sum: { $cond: [{ $eq: ['$policyType', 'business'] }, 1, 0] } }
        }
      }
    ]);

    // Get policies expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await Policy.countDocuments({
      ...filter,
      endDate: { $lte: thirtyDaysFromNow },
      status: 'active'
    });

    // Get payments due soon (next 30 days)
    const paymentsDue = await Policy.countDocuments({
      ...filter,
      nextPaymentDue: { $lte: thirtyDaysFromNow },
      status: 'active'
    });

    const statistics = stats[0] || {
      totalPolicies: 0,
      activePolicies: 0,
      pendingPolicies: 0,
      expiredPolicies: 0,
      totalPremiumValue: 0,
      totalCoverageValue: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      autoInsurance: 0,
      homeInsurance: 0,
      travelInsurance: 0,
      businessInsurance: 0
    };

    res.status(200).json({
      success: true,
      statistics: {
        ...statistics,
        expiringSoon,
        paymentsDue
      }
    });

  } catch (error) {
    console.error('Get policy dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policy dashboard stats'
    });
  }
};

// @desc    Get policies expiring soon
// @route   GET /api/policies/expiring-soon
// @access  Private
const getPoliciesExpiringSoon = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Build filter based on user role
    const filter = {
      endDate: { $lte: futureDate },
      status: 'active'
    };

    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'agent') {
      filter.agent = req.user.id;
    }

    const policies = await Policy.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('agent', 'firstName lastName email agentCode')
      .sort({ endDate: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: policies.length,
      policies
    });

  } catch (error) {
    console.error('Get expiring policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expiring policies'
    });
  }
};

module.exports = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  updatePolicyStatus,
  addPaymentToPolicy,
  getPolicyDashboardStats,
  getPoliciesExpiringSoon
};