const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private
const getClaims = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object based on user role
    const filter = {};

    // If user is customer, only show their claims
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }

    // If user is agent, show claims for policies they manage
    if (req.user.role === 'agent') {
      // First get policies managed by this agent
      const agentPolicies = await Policy.find({ agent: req.user.id }).select('_id');
      const policyIds = agentPolicies.map(p => p._id);
      filter.policy = { $in: policyIds };
    }

    // Apply additional filters
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.claimType && req.query.claimType !== 'all') {
      filter.claimType = req.query.claimType;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      filter.priority = req.query.priority;
    }

    if (req.query.assignedTo && req.user.role === 'admin') {
      filter.assignedTo = req.query.assignedTo;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { claimNumber: searchRegex },
        { description: searchRegex }
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.reportedDate = {};
      if (req.query.startDate) {
        filter.reportedDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.reportedDate.$lte = new Date(req.query.endDate);
      }
    }

    // Build sort object
    const sortField = req.query.sortBy || 'reportedDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Execute queries
    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('customer', 'firstName lastName email phone')
        .populate('policy', 'policyNumber policyName policyType coverageAmount')
        .populate('assignedTo', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: claims.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      claims
    });

  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims'
    });
  }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('policy', 'policyNumber policyName policyType coverageAmount premiumAmount')
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('investigation.investigator', 'firstName lastName email')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user can access this claim
    if (req.user.role === 'customer' && claim.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this claim'
      });
    }

    if (req.user.role === 'agent') {
      // Check if agent manages the policy for this claim
      const policy = await Policy.findById(claim.policy._id);
      if (!policy || policy.agent.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this claim'
        });
      }
    }

    res.status(200).json({
      success: true,
      claim
    });

  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claim'
    });
  }
};

// @desc    Create new claim
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
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
      policy,
      claimType,
      incidentDate,
      claimAmount,
      description,
      incidentLocation,
      witnesses,
      priority
    } = req.body;

    // Verify policy exists and user owns it
    const policyDoc = await Policy.findById(policy);
    if (!policyDoc) {
      return res.status(400).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Check if user owns the policy (for customers)
    if (req.user.role === 'customer' && policyDoc.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create claim for this policy'
      });
    }

    // Check if policy is active
    if (policyDoc.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create claim for inactive policy'
      });
    }

    // Check if claim amount is within coverage
    if (claimAmount > policyDoc.coverageAmount) {
      return res.status(400).json({
        success: false,
        message: 'Claim amount exceeds policy coverage amount'
      });
    }

    // Check if incident occurred during policy coverage period
    const incidentDateObj = new Date(incidentDate);
    if (incidentDateObj < policyDoc.startDate || incidentDateObj > policyDoc.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Incident date is outside policy coverage period'
      });
    }

    const claim = await Claim.create({
      policy,
      customer: req.user.role === 'customer' ? req.user.id : policyDoc.customer,
      claimType,
      incidentDate,
      claimAmount,
      description,
      incidentLocation,
      witnesses,
      priority: priority || 'medium',
      statusHistory: [{
        status: 'submitted',
        updatedBy: req.user.id,
        updatedAt: new Date(),
        comments: 'Claim submitted'
      }]
    });

    // Add claim to policy's claims history
    policyDoc.claimsHistory.push(claim._id);
    await policyDoc.save();

    // If uploaded documents exist, add them to the claim
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      claim.documents = req.uploadedFiles.map(file => ({
        name: file.originalname,
        url: file.url,
        type: 'other',
        uploadDate: new Date(),
        verified: false
      }));
      await claim.save();
    }

    await claim.populate('customer', 'firstName lastName email phone');
    await claim.populate('policy', 'policyNumber policyName policyType coverageAmount');

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      claim
    });

  } catch (error) {
    console.error('Create claim error:', error);

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
        message: `A claim with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating claim'
    });
  }
};

// @desc    Update claim
// @route   PUT /api/claims/:id
// @access  Private
const updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this claim'
      });
    }

    // Customers can only update claims in submitted status
    if (req.user.role === 'customer' && claim.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update claim after it has been processed'
      });
    }

    const {
      claimAmount,
      description,
      incidentLocation,
      witnesses,
      priority
    } = req.body;

    // Update allowed fields
    const updateData = {};
    if (claimAmount) updateData.claimAmount = claimAmount;
    if (description) updateData.description = description;
    if (incidentLocation) updateData.incidentLocation = incidentLocation;
    if (witnesses) updateData.witnesses = witnesses;
    if (priority && req.user.role !== 'customer') updateData.priority = priority;

    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('customer', 'firstName lastName email phone')
      .populate('policy', 'policyNumber policyName policyType coverageAmount')
      .populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Claim updated successfully',
      claim: updatedClaim
    });

  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating claim'
    });
  }
};

// @desc    Update claim status
// @route   PUT /api/claims/:id/status
// @access  Private/Admin/Agent
const updateClaimStatus = async (req, res) => {
  try {
    const { status, comments, approvedAmount, rejectionReason } = req.body;

    console.log('Update claim status request:', {
      claimId: req.params.id,
      status,
      comments,
      userRole: req.user.role,
      userId: req.user.id
    });

    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!['submitted', 'under_review', 'investigating', 'approved', 'rejected', 'closed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Must be one of: submitted, under_review, investigating, approved, rejected, closed, cancelled`
      });
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Only admin can approve/reject claims
    if (['approved', 'rejected'].includes(status) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can approve or reject claims'
      });
    }

    // Update claim status and related fields
    claim.status = status;

    if (status === 'approved' && approvedAmount) {
      claim.approvedAmount = approvedAmount;
    }

    if (status === 'rejected' && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }

    if (status === 'under_review' || status === 'investigating') {
      claim.assignedTo = req.user.id;
    }

    // Add to status history
    claim.statusHistory.push({
      status,
      updatedBy: req.user.id,
      updatedAt: new Date(),
      comments,
      reason: rejectionReason
    });

    await claim.save();

    console.log('Claim status updated successfully:', {
      claimId: claim._id,
      newStatus: status
    });

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}`,
      claim
    });

  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating claim status'
    });
  }
};

// @desc    Assign claim to investigator
// @route   PUT /api/claims/:id/assign
// @access  Private/Admin
const assignClaim = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    // Verify assignee exists and is an admin or agent
    const assignee = await User.findById(assignedTo);
    if (!assignee || !['admin', 'agent'].includes(assignee.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignee. Must be an admin or agent.'
      });
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.assignedTo = assignedTo;
    claim.status = 'under_review';

    // Add to status history
    claim.statusHistory.push({
      status: 'under_review',
      updatedBy: req.user.id,
      updatedAt: new Date(),
      comments: `Claim assigned to ${assignee.firstName} ${assignee.lastName}`
    });

    await claim.save();

    await claim.populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Claim assigned successfully',
      claim
    });

  } catch (error) {
    console.error('Assign claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning claim'
    });
  }
};

// @desc    Add investigation details
// @route   PUT /api/claims/:id/investigation
// @access  Private/Admin/Agent
const addInvestigationDetails = async (req, res) => {
  try {
    const {
      findings,
      recommendation,
      notes
    } = req.body;

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user is assigned to this claim or is admin
    if (req.user.role !== 'admin' && claim.assignedTo && claim.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update investigation details'
      });
    }

    // Update investigation details
    if (!claim.investigation.investigator) {
      claim.investigation.investigator = req.user.id;
      claim.investigation.startDate = new Date();
    }

    if (findings) claim.investigation.findings = findings;
    if (recommendation) claim.investigation.recommendation = recommendation;
    if (notes) {
      if (!claim.investigation.notes) claim.investigation.notes = [];
      claim.investigation.notes.push(notes);
    }

    claim.status = 'investigating';

    // Add to status history
    claim.statusHistory.push({
      status: 'investigating',
      updatedBy: req.user.id,
      updatedAt: new Date(),
      comments: 'Investigation details updated'
    });

    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Investigation details updated successfully',
      claim
    });

  } catch (error) {
    console.error('Add investigation details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating investigation details'
    });
  }
};

// @desc    Upload claim documents
// @route   POST /api/claims/:id/documents
// @access  Private
const uploadClaimDocuments = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Check if user can upload documents for this claim
    if (req.user.role === 'customer' && claim.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this claim'
      });
    }

    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Add documents to claim
    const newDocuments = req.uploadedFiles.map(file => ({
      name: file.originalname,
      url: file.url,
      type: req.body.documentType || 'other',
      uploadDate: new Date(),
      verified: false
    }));

    claim.documents.push(...newDocuments);
    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      documents: newDocuments
    });

  } catch (error) {
    console.error('Upload claim documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading documents'
    });
  }
};

// @desc    Get claim dashboard stats
// @route   GET /api/claims/dashboard-stats
// @access  Private
const getClaimDashboardStats = async (req, res) => {
  try {
    // Build filter based on user role
    const filter = {};
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'agent') {
      // Get policies managed by this agent
      const agentPolicies = await Policy.find({ agent: req.user.id }).select('_id');
      const policyIds = agentPolicies.map(p => p._id);
      filter.policy = { $in: policyIds };
    }

    const stats = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalClaims: { $sum: 1 },
          submittedClaims: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
          underReviewClaims: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
          investigatingClaims: { $sum: { $cond: [{ $eq: ['$status', 'investigating'] }, 1, 0] } },
          approvedClaims: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedClaims: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          closedClaims: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          totalClaimAmount: { $sum: '$claimAmount' },
          totalApprovedAmount: { $sum: '$approvedAmount' },
          avgProcessingDays: { $avg: '$actualProcessingDays' },
          highPriorityClaims: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgentClaims: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    // Get claims by type
    const claimsByType = await Claim.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$claimType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' }
        }
      }
    ]);

    // Get recent claims (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClaims = await Claim.countDocuments({
      ...filter,
      reportedDate: { $gte: thirtyDaysAgo }
    });

    const statistics = stats[0] || {
      totalClaims: 0,
      submittedClaims: 0,
      underReviewClaims: 0,
      investigatingClaims: 0,
      approvedClaims: 0,
      rejectedClaims: 0,
      closedClaims: 0,
      totalClaimAmount: 0,
      totalApprovedAmount: 0,
      avgProcessingDays: 0,
      highPriorityClaims: 0,
      urgentClaims: 0
    };

    res.status(200).json({
      success: true,
      statistics: {
        ...statistics,
        claimsByType,
        recentClaims
      }
    });

  } catch (error) {
    console.error('Get claim dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claim dashboard stats'
    });
  }
};

module.exports = {
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  updateClaimStatus,
  assignClaim,
  addInvestigationDetails,
  uploadClaimDocuments,
  getClaimDashboardStats
};