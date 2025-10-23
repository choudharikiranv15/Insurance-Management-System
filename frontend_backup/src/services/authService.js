import api from './api';

// Auth service functions
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      // Call logout API first before removing token
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore API errors during logout
      console.error('Logout API error:', error);
    } finally {
      // Always remove token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/update-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default authService;