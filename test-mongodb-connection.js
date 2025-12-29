/**
 * MongoDB Connection Test Script
 * Tests the MongoDB connection and basic model operations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Notification from './models/Notification.js';
import Club from './models/Club.js';

dotenv.config();

console.log('Starting MongoDB connection test...');

// Test MongoDB connection
const testMongoDBConnection = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully!');
    console.log(`Database: ${mongoose.connection.db.databaseName}`);
    console.log(`Connection string: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal'}`);
    
    // Test model operations
    console.log('\nTesting MongoDB models...');
    
    // Test User model
    const testUser = new User({
      id: 9999,
      name: 'Test User',
      email: 'test@example.com',
      password: 'test_password',
      role: 'student'
    });
    
    await testUser.save();
    console.log('User model working - test user created');
    
    // Test Notification model
    const testNotification = new Notification({
      userId: testUser._id,
      title: 'Test Notification',
      message: 'This is a test notification',
      priority: 'low',
      source: 'system'
    });
    
    await testNotification.save();
    console.log('Notification model working - test notification created');
    
    // Test Club model
    const testClub = new Club({
      name: 'Test Club',
      description: 'A test club for MongoDB testing',
      category: 'technology',
      isActive: true
    });
    
    await testClub.save();
    console.log('Club model working - test club created');
    
    // Clean up test data
    await User.deleteOne({ email: 'test@example.com' });
    await Notification.deleteOne({ title: 'Test Notification' });
    await Club.deleteOne({ name: 'Test Club' });
    console.log('Test data cleaned up');
    
    console.log('\nAll MongoDB tests passed!');
    console.log('Your MongoDB setup is working correctly');
    console.log('JSON files remain unchanged as backup');
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    
    process.exit(0);
    
  } catch (error) {
    console.error('MongoDB connection test failed:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.log('\nCommon issues:');
      console.log('  1. MongoDB server not running');
      console.log('  2. Incorrect connection string in .env');
      console.log('  3. MongoDB not installed');
      console.log('\nTry running: mongod');
    }
    
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Run the test
testMongoDBConnection();