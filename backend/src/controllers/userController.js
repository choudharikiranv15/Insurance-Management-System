const User = require('../models/User');
const Profile = require('../models/Profile');
const { validationResult } = require('express-validator');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.role && req.query.role !== 'all') {
      filter.role = req.query.role;
    }

    if (req.query.status && req.query.status !== 'all') {
      filter.isActive = req.query.status === 'active';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Build sort object
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Calculate statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalActive: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalInactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          agentCount: { $sum: { $cond: [{ $eq: ['$role', 'agent'] }, 1, 0] } },
          customerCount: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } }
        }
      }
    ]);

    const statistics = stats[0] || {
      total: 0,
      totalActive: 0,
      totalInactive: 0,
      adminCount: 0,
      agentCount: 0,
      customerCount: 0
    };

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      statistics,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user data'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const { firstName, lastName, email, password, phone, role, dateOfBirth, address, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user data object
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'customer',
      dateOfBirth,
      address
    };

    // Add department for agents and admins
    if (role === 'agent' || role === 'admin') {
      userData.department = department;
    }

    // Create user
    const user = await User.create(userData);

    // Create initial profile
    await Profile.create({
      user: user._id,
      personalInfo: {
        dateOfBirth,
        nationality: 'Indian'
      },
      workInfo: role !== 'customer' ? {
        department,
        position: role === 'admin' ? 'Administrator' : 'Insurance Agent',
        employmentType: 'full-time',
        joinDate: new Date()
      } : undefined,
      preferences: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        theme: 'light',
        notifications: {
          email: true,
          sms: true,
          push: true,
          marketing: false,
          policyReminders: true,
          paymentReminders: true,
          claimUpdates: true
        }
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date(),
        loginAttempts: 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        agentCode: user.agentCode,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Create user error:', error);

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
        message: `A user with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, role, address, department, isActive } = req.body;

    // Check if user can update this data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only admins can change role and active status
    const updateData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      address: address || user.address
    };

    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      if (department) updateData.department = department;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Instead of hard delete, we'll deactivate the user
    await User.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or inactive'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = status === 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};

// @desc    Bulk update user status (Admin only)
// @route   PUT /api/users/bulk/status
// @access  Private/Admin
const bulkUpdateUserStatus = async (req, res) => {
  try {
    const { userIds, status } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or inactive'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds }, role: { $ne: 'admin' } }, // Don't update admin users
      { isActive: status === 'active' }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
          totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          totalAgents: { $sum: { $cond: [{ $eq: ['$role', 'agent'] }, 1, 0] } },
          totalCustomers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } }
        }
      }
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get daily registrations for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    const statistics = stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      totalAdmins: 0,
      totalAgents: 0,
      totalCustomers: 0
    };

    res.status(200).json({
      success: true,
      statistics: {
        ...statistics,
        recentRegistrations,
        dailyRegistrations
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkUpdateUserStatus,
  getDashboardStats
};