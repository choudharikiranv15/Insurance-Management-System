const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const connectDB = require('../config/database');

// Demo users data
const demoUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@insurance.com',
    password: 'admin123',
    role: 'admin',
    phone: '1234567890',
    dateOfBirth: new Date('1985-01-01'),
    address: {
      street: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    isActive: true,
    emailVerified: true
  },
  {
    firstName: 'Agent',
    lastName: 'Smith',
    email: 'agent@insurance.com',
    password: 'agent123',
    role: 'agent',
    phone: '9876543210',
    dateOfBirth: new Date('1990-05-15'),
    agentCode: 'AG123456',
    address: {
      street: '456 Agent Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    isActive: true,
    emailVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@insurance.com',
    password: 'customer123',
    role: 'customer',
    phone: '9988776655',
    dateOfBirth: new Date('1995-08-20'),
    address: {
      street: '789 Customer Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    isActive: true,
    emailVerified: true
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    phone: '8877665544',
    dateOfBirth: new Date('1992-03-10'),
    address: {
      street: '321 Example Lane',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India'
    },
    isActive: true,
    emailVerified: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing users (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});

    // Create demo users
    console.log('👥 Creating demo users...');
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:');
    console.log('   Email: admin@insurance.com');
    console.log('   Password: admin123');
    console.log('\n👤 Agent:');
    console.log('   Email: agent@insurance.com');
    console.log('   Password: agent123');
    console.log('\n👤 Customer:');
    console.log('   Email: customer@insurance.com');
    console.log('   Password: customer123');
    console.log('\n👤 Customer 2:');
    console.log('   Email: jane@example.com');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
