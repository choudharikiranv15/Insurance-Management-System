const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', '-password');

    if (!profile) {
      // Create default profile if not exists
      profile = await Profile.create({
        user: req.user.id,
        personalInfo: {
          nationality: 'Indian'
        },
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

      await profile.populate('user', '-password');
    }

    res.status(200).json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update personal information
// @route   PUT /api/profile/personal-info
// @access  Private
const updatePersonalInfo = async (req, res) => {
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
      dateOfBirth,
      gender,
      maritalStatus,
      nationality,
      occupation,
      annualIncome,
      emergencyContact
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update personal info
    const personalInfoUpdate = {};
    if (dateOfBirth) personalInfoUpdate.dateOfBirth = dateOfBirth;
    if (gender) personalInfoUpdate.gender = gender;
    if (maritalStatus) personalInfoUpdate.maritalStatus = maritalStatus;
    if (nationality) personalInfoUpdate.nationality = nationality;
    if (occupation) personalInfoUpdate.occupation = occupation;
    if (annualIncome) personalInfoUpdate.annualIncome = annualIncome;
    if (emergencyContact) personalInfoUpdate.emergencyContact = emergencyContact;

    profile.personalInfo = { ...profile.personalInfo, ...personalInfoUpdate };
    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Personal information updated',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Personal information updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update personal info error:', error);

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
      message: 'Server error while updating personal information'
    });
  }
};

// @desc    Update work information
// @route   PUT /api/profile/work-info
// @access  Private
const updateWorkInfo = async (req, res) => {
  try {
    const {
      employeeId,
      company,
      department,
      position,
      workLocation,
      employmentType,
      joinDate,
      salary,
      reportingManager,
      workAddress
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update work info
    const workInfoUpdate = {};
    if (employeeId) workInfoUpdate.employeeId = employeeId;
    if (company) workInfoUpdate.company = company;
    if (department) workInfoUpdate.department = department;
    if (position) workInfoUpdate.position = position;
    if (workLocation) workInfoUpdate.workLocation = workLocation;
    if (employmentType) workInfoUpdate.employmentType = employmentType;
    if (joinDate) workInfoUpdate.joinDate = joinDate;
    if (salary) workInfoUpdate.salary = salary;
    if (reportingManager) workInfoUpdate.reportingManager = reportingManager;
    if (workAddress) workInfoUpdate.workAddress = workAddress;

    profile.workInfo = { ...profile.workInfo, ...workInfoUpdate };
    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Work information updated',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Work information updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update work info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating work information'
    });
  }
};

// @desc    Update medical information
// @route   PUT /api/profile/medical-info
// @access  Private
const updateMedicalInfo = async (req, res) => {
  try {
    const {
      bloodGroup,
      height,
      weight,
      allergies,
      chronicConditions,
      medications,
      familyMedicalHistory,
      smokingStatus,
      drinkingStatus,
      lastHealthCheckup
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update medical info
    const medicalInfoUpdate = {};
    if (bloodGroup) medicalInfoUpdate.bloodGroup = bloodGroup;
    if (height) medicalInfoUpdate.height = height;
    if (weight) medicalInfoUpdate.weight = weight;
    if (allergies) medicalInfoUpdate.allergies = allergies;
    if (chronicConditions) medicalInfoUpdate.chronicConditions = chronicConditions;
    if (medications) medicalInfoUpdate.medications = medications;
    if (familyMedicalHistory) medicalInfoUpdate.familyMedicalHistory = familyMedicalHistory;
    if (smokingStatus) medicalInfoUpdate.smokingStatus = smokingStatus;
    if (drinkingStatus) medicalInfoUpdate.drinkingStatus = drinkingStatus;
    if (lastHealthCheckup) medicalInfoUpdate.lastHealthCheckup = lastHealthCheckup;

    profile.medicalInfo = { ...profile.medicalInfo, ...medicalInfoUpdate };
    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Medical information updated',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Medical information updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update medical info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating medical information'
    });
  }
};

// @desc    Update preferences
// @route   PUT /api/profile/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const {
      language,
      timezone,
      currency,
      theme,
      notifications,
      communication
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update preferences
    const preferencesUpdate = {};
    if (language) preferencesUpdate.language = language;
    if (timezone) preferencesUpdate.timezone = timezone;
    if (currency) preferencesUpdate.currency = currency;
    if (theme) preferencesUpdate.theme = theme;
    if (notifications) preferencesUpdate.notifications = { ...profile.preferences.notifications, ...notifications };
    if (communication) preferencesUpdate.communication = { ...profile.preferences.communication, ...communication };

    profile.preferences = { ...profile.preferences, ...preferencesUpdate };
    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Preferences updated',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
};

// @desc    Update security settings
// @route   PUT /api/profile/security
// @access  Private
const updateSecuritySettings = async (req, res) => {
  try {
    const {
      twoFactorEnabled,
      securityQuestions
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update security settings
    const securityUpdate = {};
    if (typeof twoFactorEnabled === 'boolean') securityUpdate.twoFactorEnabled = twoFactorEnabled;
    if (securityQuestions) {
      // Hash security question answers
      const hashedQuestions = await Promise.all(
        securityQuestions.map(async (q) => ({
          question: q.question,
          answer: await bcrypt.hash(q.answer.toLowerCase(), 10)
        }))
      );
      securityUpdate.securityQuestions = hashedQuestions;
    }

    profile.security = { ...profile.security, ...securityUpdate };
    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Security settings updated',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Security settings updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating security settings'
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarFile = req.uploadedFiles[0];

    // Update user profile image
    await User.findByIdAndUpdate(req.user.id, {
      profileImage: avatarFile.url
    });

    // Update profile documents
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Remove existing profile photo
      profile.documents = profile.documents.filter(doc => doc.type !== 'profile_photo');

      // Add new profile photo
      profile.documents.push({
        name: avatarFile.originalname,
        type: 'profile_photo',
        url: avatarFile.url,
        verified: false,
        uploadDate: new Date()
      });

      // Add to activity log
      profile.activityLog.push({
        action: 'Profile avatar updated',
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarFile.url
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
};

// @desc    Get activity log
// @route   GET /api/profile/activity
// @access  Private
const getActivityLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get paginated activity log
    const totalActivities = profile.activityLog.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Sort by timestamp descending and paginate
    const activities = profile.activityLog
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      activities,
      totalActivities,
      totalPages: Math.ceil(totalActivities / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity log'
    });
  }
};

// @desc    Add bank details
// @route   POST /api/profile/bank-details
// @access  Private
const addBankDetails = async (req, res) => {
  try {
    const { accountNumber, ifscCode, bankName, accountType, isPrimary } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // If this is primary, set all others to non-primary
    if (isPrimary) {
      profile.bankDetails.forEach(bank => {
        bank.isPrimary = false;
      });
    }

    // Add new bank details
    profile.bankDetails.push({
      accountNumber,
      ifscCode,
      bankName,
      accountType,
      isPrimary: isPrimary || profile.bankDetails.length === 0,
      verified: false
    });

    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Bank details added',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Bank details added successfully',
      profile
    });

  } catch (error) {
    console.error('Add bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding bank details'
    });
  }
};

// @desc    Add nominee details
// @route   POST /api/profile/nominee
// @access  Private
const addNomineeDetails = async (req, res) => {
  try {
    const {
      name,
      relationship,
      dateOfBirth,
      address,
      phone,
      email,
      share,
      guardianName,
      guardianRelation
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Validate total share percentage
    const currentTotalShare = profile.nomineeDetails.reduce((total, nominee) => total + (nominee.share || 0), 0);
    const newTotalShare = currentTotalShare + (share || 0);

    if (newTotalShare > 100) {
      return res.status(400).json({
        success: false,
        message: 'Total nominee share cannot exceed 100%'
      });
    }

    // Add new nominee
    profile.nomineeDetails.push({
      name,
      relationship,
      dateOfBirth,
      address,
      phone,
      email,
      share,
      guardianName,
      guardianRelation
    });

    profile.lastUpdated = new Date();

    // Add to activity log
    profile.activityLog.push({
      action: 'Nominee details added',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Nominee details added successfully',
      profile
    });

  } catch (error) {
    console.error('Add nominee details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding nominee details'
    });
  }
};

// @desc    Update entire profile (general update)
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { personalInfo, workInfo, medicalInfo, preferences, avatar } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      // Create profile if not exists
      profile = await Profile.create({
        user: req.user.id,
        personalInfo: personalInfo || {},
        workInfo: workInfo || {},
        medicalInfo: medicalInfo || {},
        preferences: preferences || {
          language: 'en',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          theme: 'light',
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        }
      });
    } else {
      // Update existing profile
      if (personalInfo) {
        profile.personalInfo = { ...profile.personalInfo.toObject(), ...personalInfo };
      }
      if (workInfo) {
        profile.workInfo = { ...profile.workInfo.toObject(), ...workInfo };
      }
      if (medicalInfo) {
        profile.medicalInfo = { ...profile.medicalInfo.toObject(), ...medicalInfo };
      }
      if (preferences) {
        profile.preferences = { ...profile.preferences.toObject(), ...preferences };
      }

      profile.lastUpdated = new Date();

      // Add to activity log
      profile.activityLog.push({
        action: 'Profile updated',
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await profile.save();
    }

    // Update user's first name, last name, phone, email if provided in personalInfo
    if (personalInfo) {
      const userUpdate = {};
      if (personalInfo.firstName) userUpdate.firstName = personalInfo.firstName;
      if (personalInfo.lastName) userUpdate.lastName = personalInfo.lastName;
      if (personalInfo.phone) userUpdate.phone = personalInfo.phone;
      if (personalInfo.email) userUpdate.email = personalInfo.email;

      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(req.user.id, userUpdate);
      }
    }

    // Handle avatar as base64 if provided
    if (avatar) {
      await User.findByIdAndUpdate(req.user.id, {
        profileImage: avatar
      });
    }

    // Populate and return updated profile
    await profile.populate('user', '-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

module.exports = {
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
};