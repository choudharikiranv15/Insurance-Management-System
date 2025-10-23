import api from './api';

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resettoken, password) => api.put(`/auth/reset-password/${resettoken}`, { password })
};

// User Services
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  bulkUpdateStatus: (userIds, status) => api.put('/users/bulk/status', { userIds, status }),
  getDashboardStats: () => api.get('/users/dashboard-stats')
};

// Profile Services
export const profileService = {
  get: () => api.get('/profile'),
  getByUserId: (userId) => api.get(`/profile/${userId}`),
  create: (profileData) => api.post('/profile', profileData),
  update: (profileData) => api.put('/profile', profileData),
  calculateCompleteness: (id) => api.put(`/profile/${id}/completeness`),
  // Backend-supported methods
  getActivityLog: () => api.get('/profile/activity'),
  updatePersonalInfo: (personalInfo) => api.put('/profile/personal-info', personalInfo),
  updateWorkInfo: (workInfo) => api.put('/profile/work-info', workInfo),
  updateMedicalInfo: (medicalInfo) => api.put('/profile/medical-info', medicalInfo),
  updatePreferences: (preferences) => api.put('/profile/preferences', preferences),
  updateSecuritySettings: (security) => api.put('/profile/security', security),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addBankDetails: (bankDetails) => api.post('/profile/bank-details', bankDetails),
  addNomineeDetails: (nomineeDetails) => api.post('/profile/nominee', nomineeDetails)
};

// Policy Services
export const policyService = {
  getAll: (params) => api.get('/policies', { params }),
  getById: (id) => api.get(`/policies/${id}`),
  create: (policyData) => api.post('/policies', policyData),
  update: (id, policyData) => api.put(`/policies/${id}`, policyData),
  delete: (id) => api.delete(`/policies/${id}`),
  updateStatus: (id, status) => api.put(`/policies/${id}/status`, { status }),
  addPayment: (id, paymentData) => api.post(`/policies/${id}/payment`, paymentData),
  getExpiringSoon: () => api.get('/policies/expiring-soon'),
  getDashboardStats: () => api.get('/policies/dashboard-stats')
};

// Claim Services
export const claimService = {
  getAll: (params) => api.get('/claims', { params }),
  getById: (id) => api.get(`/claims/${id}`),
  create: (claimData) => {
    const formData = new FormData();
    Object.keys(claimData).forEach(key => {
      if (key === 'documents' && Array.isArray(claimData[key])) {
        // Backend expects 'claimDocument' field name for file uploads
        claimData[key].forEach(file => formData.append('claimDocument', file));
      } else if (typeof claimData[key] === 'object' && claimData[key] !== null) {
        formData.append(key, JSON.stringify(claimData[key]));
      } else {
        formData.append(key, claimData[key]);
      }
    });
    return api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, claimData) => api.put(`/claims/${id}`, claimData),
  updateStatus: (id, status, notes) => api.put(`/claims/${id}/status`, { status, comments: notes }),
  assign: (id, assignedTo) => api.put(`/claims/${id}/assign`, { assignedTo }),
  addInvestigation: (id, investigationData) => api.put(`/claims/${id}/investigation`, investigationData),
  uploadDocuments: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('claimDocument', file));
    return api.post(`/claims/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDashboardStats: () => api.get('/claims/dashboard-stats')
};

// Payment Services
export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (paymentData) => api.post('/payments', paymentData),
  updateStatus: (id, status) => api.put(`/payments/${id}/status`, { status }),
  processRefund: (id, refundData) => api.post(`/payments/${id}/refund`, refundData),
  getReceipt: (id) => api.get(`/payments/${id}/receipt`),
  getOverdue: () => api.get('/payments/overdue'),
  getDashboardStats: () => api.get('/payments/dashboard-stats')
};

// Analytics Services
export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getPolicies: (params) => api.get('/analytics/policies', { params }),
  getClaims: (params) => api.get('/analytics/claims', { params }),
  getCustomers: (params) => api.get('/analytics/customers', { params }),
  exportData: (type, params) => api.get('/analytics/export', { params: { type, ...params } })
};

// Notification Services
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markMultipleAsRead: (notificationIds) => api.put('/notifications/mark-multiple-read', { notificationIds }),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  sendTest: () => api.post('/notifications/test'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', { preferences })
};

// Recommendation Services
export const recommendationService = {
  getAll: () => api.get('/recommendations'),
  getByPolicyType: (policyType) => api.get(`/recommendations/${policyType}`)
};

// Chatbot Services
export const chatbotService = {
  chat: (message) => api.post('/chatbot', { message }),
  getSuggestions: () => api.get('/chatbot/suggestions'),
  getFAQs: () => api.get('/chatbot/faqs')
};

export default {
  auth: authService,
  user: userService,
  profile: profileService,
  policy: policyService,
  claim: claimService,
  payment: paymentService,
  analytics: analyticsService,
  notification: notificationService,
  recommendation: recommendationService,
  chatbot: chatbotService
};
