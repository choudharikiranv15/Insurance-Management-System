// Mock authentication service for demo purposes
const mockUsers = [
  {
    id: 1,
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    status: 'active'
  },
  {
    id: 2,
    email: 'agent@demo.com',
    password: 'agent123',
    role: 'agent',
    firstName: 'Agent',
    lastName: 'Smith',
    status: 'active'
  },
  {
    id: 3,
    email: 'customer@demo.com',
    password: 'customer123',
    role: 'customer',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active'
  }
];

// Utility function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  // Login user
  login: async (email, password) => {
    await delay(1000); // Simulate network delay

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Create mock token
    const token = `mock_token_${user.id}_${Date.now()}`;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = {
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    };

    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return response;
  },

  // Register new user (mock)
  register: async (userData) => {
    await delay(1000);

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'customer',
      firstName: userData.firstName,
      lastName: userData.lastName,
      status: 'active'
    };

    mockUsers.push(newUser);

    // Create mock token
    const token = `mock_token_${newUser.id}_${Date.now()}`;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    const response = {
      token,
      user: userWithoutPassword,
      message: 'Registration successful'
    };

    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return response;
  },

  // Logout user
  logout: async () => {
    await delay(500);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { message: 'Logged out successfully' };
  },

  // Get current user
  getCurrentUser: async () => {
    await delay(500);

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      throw new Error('Not authenticated');
    }

    return {
      user: JSON.parse(user)
    };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update password (mock)
  updatePassword: async (currentPassword, newPassword) => {
    await delay(1000);

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      throw new Error('Not authenticated');
    }

    // In a real app, you'd verify the current password
    // For demo purposes, we'll just simulate success
    return { message: 'Password updated successfully' };
  }
};

export default mockAuthService;