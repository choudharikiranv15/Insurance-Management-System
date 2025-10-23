// Mock user service for demo purposes
let mockUsers = [
  {
    id: 1,
    email: 'admin@demo.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    phone: '+1 (555) 123-4567',
    department: 'Administration',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-20',
    avatar: null
  },
  {
    id: 2,
    email: 'agent@demo.com',
    firstName: 'Agent',
    lastName: 'Smith',
    role: 'agent',
    status: 'active',
    phone: '+1 (555) 234-5678',
    department: 'Sales',
    joinDate: '2023-03-20',
    lastLogin: '2024-01-19',
    avatar: null
  },
  {
    id: 3,
    email: 'customer@demo.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    status: 'active',
    phone: '+1 (555) 345-6789',
    department: null,
    joinDate: '2023-06-10',
    lastLogin: '2024-01-18',
    avatar: null
  },
  {
    id: 4,
    email: 'jane.agent@demo.com',
    firstName: 'Jane',
    lastName: 'Wilson',
    role: 'agent',
    status: 'active',
    phone: '+1 (555) 456-7890',
    department: 'Sales',
    joinDate: '2023-05-15',
    lastLogin: '2024-01-17',
    avatar: null
  },
  {
    id: 5,
    email: 'mike.customer@demo.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'customer',
    status: 'inactive',
    phone: '+1 (555) 567-8901',
    department: null,
    joinDate: '2023-08-22',
    lastLogin: '2023-12-15',
    avatar: null
  },
  {
    id: 6,
    email: 'sarah.admin@demo.com',
    firstName: 'Sarah',
    lastName: 'Brown',
    role: 'admin',
    status: 'active',
    phone: '+1 (555) 678-9012',
    department: 'IT',
    joinDate: '2023-02-10',
    lastLogin: '2024-01-16',
    avatar: null
  },
  {
    id: 7,
    email: 'tom.agent@demo.com',
    firstName: 'Tom',
    lastName: 'Davis',
    role: 'agent',
    status: 'pending',
    phone: '+1 (555) 789-0123',
    department: 'Sales',
    joinDate: '2024-01-10',
    lastLogin: null,
    avatar: null
  },
  {
    id: 8,
    email: 'lisa.customer@demo.com',
    firstName: 'Lisa',
    lastName: 'Garcia',
    role: 'customer',
    status: 'active',
    phone: '+1 (555) 890-1234',
    department: null,
    joinDate: '2023-09-30',
    lastLogin: '2024-01-15',
    avatar: null
  }
];

// Utility function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate next user ID
const getNextId = () => {
  return Math.max(...mockUsers.map(u => u.id)) + 1;
};

export const mockUserService = {
  // Get all users with optional filters
  getUsers: async (filters = {}) => {
    await delay(800);

    let filteredUsers = [...mockUsers];

    // Apply filters
    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(filters.search)
      );
    }

    // Sort by join date (newest first)
    filteredUsers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

    return {
      users: filteredUsers,
      total: filteredUsers.length,
      totalActive: mockUsers.filter(u => u.status === 'active').length,
      totalInactive: mockUsers.filter(u => u.status === 'inactive').length,
      totalPending: mockUsers.filter(u => u.status === 'pending').length,
      roleStats: {
        admin: mockUsers.filter(u => u.role === 'admin').length,
        agent: mockUsers.filter(u => u.role === 'agent').length,
        customer: mockUsers.filter(u => u.role === 'customer').length
      }
    };
  },

  // Get user by ID
  getUserById: async (id) => {
    await delay(500);

    const user = mockUsers.find(u => u.id === parseInt(id));
    if (!user) {
      throw new Error('User not found');
    }

    return { user };
  },

  // Create new user
  createUser: async (userData) => {
    await delay(1000);

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: getNextId(),
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: null,
      avatar: null
    };

    mockUsers.push(newUser);

    return {
      user: newUser,
      message: 'User created successfully'
    };
  },

  // Update user
  updateUser: async (id, userData) => {
    await delay(1000);

    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email already exists (excluding current user)
    if (userData.email) {
      const existingUser = mockUsers.find(u => u.email === userData.email && u.id !== parseInt(id));
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData
    };

    return {
      user: mockUsers[userIndex],
      message: 'User updated successfully'
    };
  },

  // Delete user
  deleteUser: async (id) => {
    await delay(800);

    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletedUser = mockUsers[userIndex];
    mockUsers.splice(userIndex, 1);

    return {
      user: deletedUser,
      message: 'User deleted successfully'
    };
  },

  // Update user status
  updateUserStatus: async (id, status) => {
    await delay(600);

    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers[userIndex].status = status;

    return {
      user: mockUsers[userIndex],
      message: `User ${status} successfully`
    };
  },

  // Bulk operations
  bulkUpdateStatus: async (userIds, status) => {
    await delay(1200);

    const updatedUsers = [];

    userIds.forEach(id => {
      const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
      if (userIndex !== -1) {
        mockUsers[userIndex].status = status;
        updatedUsers.push(mockUsers[userIndex]);
      }
    });

    return {
      users: updatedUsers,
      message: `${updatedUsers.length} users updated successfully`
    };
  },

  // Get user statistics
  getUserStats: async () => {
    await delay(500);

    const stats = {
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'active').length,
      inactive: mockUsers.filter(u => u.status === 'inactive').length,
      pending: mockUsers.filter(u => u.status === 'pending').length,
      roles: {
        admin: mockUsers.filter(u => u.role === 'admin').length,
        agent: mockUsers.filter(u => u.role === 'agent').length,
        customer: mockUsers.filter(u => u.role === 'customer').length
      },
      recentJoins: mockUsers
        .filter(u => {
          const joinDate = new Date(u.joinDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate >= thirtyDaysAgo;
        }).length
    };

    return { stats };
  }
};

export default mockUserService;