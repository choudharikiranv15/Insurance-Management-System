// Mock profile service for managing user profiles
import mockAuthService from './mockAuthService';

// Mock profile data
let profileData = {
  1: { // Admin user
    personalInfo: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@demo.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-06-15',
      address: {
        street: '123 Admin Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543'
      }
    },
    workInfo: {
      employeeId: 'EMP001',
      department: 'Administration',
      position: 'System Administrator',
      joinDate: '2023-01-15',
      reportingManager: 'CEO',
      workLocation: 'Headquarters',
      employmentType: 'Full-time'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      notifications: {
        email: true,
        sms: true,
        push: true,
        marketing: false
      },
      dashboard: {
        defaultView: 'analytics',
        refreshInterval: 300000, // 5 minutes
        compactMode: false
      }
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-01',
      loginAttempts: 0,
      accountLocked: false,
      securityQuestions: [
        {
          question: 'What was your first pet\'s name?',
          answered: true
        },
        {
          question: 'What city were you born in?',
          answered: true
        }
      ]
    },
    avatar: null,
    lastUpdated: new Date().toISOString()
  }
};

// Utility function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockProfileService = {
  // Get user profile
  getProfile: async (userId) => {
    await delay(800);

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    return {
      profile: profileData[userId],
      message: 'Profile retrieved successfully'
    };
  },

  // Update personal information
  updatePersonalInfo: async (userId, personalInfo) => {
    await delay(1000);

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    profileData[userId].personalInfo = {
      ...profileData[userId].personalInfo,
      ...personalInfo
    };
    profileData[userId].lastUpdated = new Date().toISOString();

    return {
      profile: profileData[userId],
      message: 'Personal information updated successfully'
    };
  },

  // Update work information
  updateWorkInfo: async (userId, workInfo) => {
    await delay(1000);

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    profileData[userId].workInfo = {
      ...profileData[userId].workInfo,
      ...workInfo
    };
    profileData[userId].lastUpdated = new Date().toISOString();

    return {
      profile: profileData[userId],
      message: 'Work information updated successfully'
    };
  },

  // Update preferences
  updatePreferences: async (userId, preferences) => {
    await delay(800);

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    profileData[userId].preferences = {
      ...profileData[userId].preferences,
      ...preferences
    };
    profileData[userId].lastUpdated = new Date().toISOString();

    return {
      profile: profileData[userId],
      message: 'Preferences updated successfully'
    };
  },

  // Update avatar
  updateAvatar: async (userId, avatarData) => {
    await delay(1200);

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    profileData[userId].avatar = avatarData;
    profileData[userId].lastUpdated = new Date().toISOString();

    return {
      profile: profileData[userId],
      message: 'Profile picture updated successfully'
    };
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    await delay(1500);

    // In a real app, you'd verify the current password
    const user = mockAuthService.getUser();
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized');
    }

    // Simulate password validation
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    profileData[userId].security.lastPasswordChange = new Date().toISOString();
    profileData[userId].lastUpdated = new Date().toISOString();

    return {
      message: 'Password changed successfully'
    };
  },

  // Update security settings
  updateSecuritySettings: async (userId, securitySettings) => {
    await delay(1000);

    if (!profileData[userId]) {
      throw new Error('Profile not found');
    }

    profileData[userId].security = {
      ...profileData[userId].security,
      ...securitySettings
    };
    profileData[userId].lastUpdated = new Date().toISOString();

    return {
      profile: profileData[userId],
      message: 'Security settings updated successfully'
    };
  },

  // Get activity log
  getActivityLog: async (userId) => {
    await delay(600);

    // Mock activity data
    const activities = [
      {
        id: 1,
        action: 'Profile Updated',
        details: 'Updated personal information',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        ip: '192.168.1.100',
        device: 'Chrome on Windows'
      },
      {
        id: 2,
        action: 'Login',
        details: 'Successful login',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        ip: '192.168.1.100',
        device: 'Chrome on Windows'
      },
      {
        id: 3,
        action: 'Password Changed',
        details: 'Password updated successfully',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        ip: '192.168.1.100',
        device: 'Chrome on Windows'
      },
      {
        id: 4,
        action: 'Settings Updated',
        details: 'Changed notification preferences',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        ip: '192.168.1.105',
        device: 'Safari on Mac'
      },
      {
        id: 5,
        action: 'Login',
        details: 'Successful login',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        ip: '192.168.1.105',
        device: 'Safari on Mac'
      }
    ];

    return {
      activities,
      message: 'Activity log retrieved successfully'
    };
  },

  // Initialize profile for new user
  initializeProfile: async (userId, userRole) => {
    await delay(500);

    const defaultProfile = {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      },
      workInfo: userRole !== 'customer' ? {
        employeeId: '',
        department: '',
        position: '',
        joinDate: new Date().toISOString().split('T')[0],
        reportingManager: '',
        workLocation: '',
        employmentType: 'Full-time'
      } : null,
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false
        },
        dashboard: {
          defaultView: 'overview',
          refreshInterval: 300000,
          compactMode: false
        }
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
        loginAttempts: 0,
        accountLocked: false,
        securityQuestions: []
      },
      avatar: null,
      lastUpdated: new Date().toISOString()
    };

    profileData[userId] = defaultProfile;

    return {
      profile: defaultProfile,
      message: 'Profile initialized successfully'
    };
  }
};

export default mockProfileService;