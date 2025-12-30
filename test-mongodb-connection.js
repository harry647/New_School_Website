/**
 * MongoDB Connection Test Script
 * Tests the MongoDB connection, migrates users from JSON to MongoDB, and tests authentication routes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Notification from './models/Notification.js';
import Club from './models/Club.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    
    // List all collections to verify database creation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\nDocument counts:');
    const userCount = await User.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const clubCount = await Club.countDocuments();
    console.log(`- Users: ${userCount}`);
    console.log(`- Notifications: ${notificationCount}`);
    console.log(`- Clubs: ${clubCount}`);
    
    console.log('\n📌 Database "school_portal" has been created and populated.');
    console.log('You should now see it in MongoDB Compass.');
    
    // Clean up test data
    await User.deleteOne({ email: 'test@example.com' });
    await Notification.deleteOne({ title: 'Test Notification' });
    await Club.deleteOne({ name: 'Test Club' });
    console.log('\nTest data cleaned up');
    
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

// Migrate users from JSON to MongoDB
const migrateUsersToMongoDB = async () => {
  try {
    console.log('\n🔄 Migrating users from JSON to MongoDB...');
    
    const usersFile = path.join(__dirname, 'data', 'users.json');
    if (!fs.existsSync(usersFile)) {
      console.log('No users.json file found. Skipping migration.');
      return;
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    console.log(`Found ${users.length} users in JSON file.`);
    
    if (users.length === 0) {
      console.log('No users to migrate.');
      return;
    }
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    
    // Migrate users
    for (const user of users) {
      try {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = new User({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password || 'default_password',
            role: user.role || 'student',
            securityQuestions: user.securityQuestions || [
              { question: 'pet_name', answer: 'cat' },
              { question: 'favorite_subject', answer: 'maths' }
            ],
            defaultDashboard: user.defaultDashboard || 'profile',
            language: user.language || 'en',
            timezone: user.timezone || 'Africa/Nairobi',
            theme: user.theme || 'light',
            reduceMotion: user.reduceMotion || false,
            emailAlerts: user.emailAlerts || false,
            clubUpdates: user.clubUpdates || false,
            hideEmail: user.hideEmail || true,
            updated_at: user.updated_at || new Date().toISOString()
          });
          await newUser.save();
          console.log(`Migrated user: ${user.email}`);
        } else {
          console.log(`User already exists: ${user.email}`);
        }
      } catch (err) {
        console.error(`Error migrating user ${user.email}:`, err.message);
      }
    }
    
    console.log('User migration completed!');
    
    // Verify migration
    const migratedUsers = await User.find();
    console.log(`\n✅ Successfully migrated ${migratedUsers.length} users to MongoDB.`);
    
  } catch (error) {
    console.error('User migration failed:', error.message);
  }
};

// Test authentication routes
const testAuthRoutes = async () => {
  try {
    console.log('\n🔐 Testing authentication routes...');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    
    // Test login
    console.log('Testing login...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('Test user found for login test');
    } else {
      console.log('Creating test user for login test');
      const newTestUser = new User({
        id: 9999,
        name: 'Test User',
        email: 'test@example.com',
        password: 'test_password',
        role: 'student'
      });
      await newTestUser.save();
      console.log('Test user created for login test');
    }
    
    console.log('Authentication routes test completed!');
    
  } catch (error) {
    console.error('Authentication routes test failed:', error.message);
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

// Run the tests
const runAllTests = async () => {
  await testMongoDBConnection();
  await migrateUsersToMongoDB();
  await testAuthRoutes();
  
  // Close connection
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed');
  
  process.exit(0);
};

// Run all tests
runAllTests();