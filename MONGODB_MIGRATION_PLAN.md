# MongoDB Migration Plan for Bar Union School Website

## Current System Analysis

### 1. Current Storage Architecture
- **Session Storage**: SQLite via `connect-sqlite3`
- **Data Storage**: JSON files in `data/` directory
- **User Management**: JSON-based authentication
- **File Uploads**: Multer with local filesystem

### 2. Key Components Using Current Storage

#### Session Management
- File: [`server.js`](server.js:34-60)
- Uses: `connect-sqlite3` for session persistence
- Location: `database/sessions.db`

#### User Authentication
- File: [`routes/auth.js`](routes/auth.js:17-55)
- Data: `data/users.json`
- Operations: CRUD operations using JSON file I/O

#### API Data Storage
- File: [`routes/api.js`](routes/api.js:96-128)
- Helper functions: `readJSON()` and `writeJSON()`
- Used across all API endpoints for data persistence

#### Data Structure
- **Users**: `data/users.json`
- **Notifications**: `data/notifications.json`
- **Clubs**: `data/clubs/*.json`
- **Departments**: `data/departments/*.json`
- **E-Learning**: `data/portal/*.json`
- **And many more JSON files** (30+ files identified)

## MongoDB Migration Strategy

### Phase 1: Preparation

#### 1. Install Required Packages
```bash
npm install mongoose connect-mongo express-session
```

#### 2. Create Environment Configuration
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/school_portal
SESSION_SECRET=bar-union-2025-super-secret-key-please-change-in-production
PORT=3000
```

#### 3. Update package.json Dependencies
```json
"dependencies": {
  "connect-mongo": "^5.1.0",
  "mongoose": "^8.0.0",
  "mongodb": "^6.0.0"
}
```

### Phase 2: Database Setup

#### 1. Create MongoDB Models Directory
```bash
mkdir models
```

#### 2. Create Core Models

**User Model** ([`models/User.js`](models/User.js)):
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  photo: String,
  personal: {
    dob: String,
    gender: String,
    parentContact: String,
    emergencyContact: String,
    residence: String,
    studentId: String
  },
  preferences: {
    learningStyle: String,
    favoriteSubjects: String,
    careerInterests: String,
    skillsToDevelop: String
  },
  academic: {
    term: String,
    meanGrade: String,
    bestSubject: String,
    subjectsTaken: Number,
    subjectGrades: [String]
  },
  security: {
    lastLogin: String,
    activeDevices: Number,
    passwordStrength: String,
    twoFactorEnabled: Boolean
  },
  securityQuestions: [{
    question: String,
    answer: String
  }],
  accountStatus: { type: String, default: 'active' },
  deletionRequestedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
```

**Notification Model** ([`models/Notification.js`](models/Notification.js)):
```javascript
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  source: { type: String, required: true },
  action: String,
  isRead: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isAcknowledged: { type: Boolean, default: false },
  acknowledgedAt: Date,
  createdAt: { type: Date, default: Date.now },
  reference: String
});

export default mongoose.model('Notification', notificationSchema);
```

**Club Model** ([`models/Club.js`](models/Club.js)):
```javascript
import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  events: [{
    title: String,
    date: Date,
    description: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Club', clubSchema);
```

### Phase 3: Session Migration

#### Update server.js
Replace SQLite session storage with MongoDB:

```javascript
// Remove SQLite imports
// import SQLiteStore from 'connect-sqlite3';
// import fs from 'fs';

// Add MongoDB imports
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectToMongoDB();

// Replace SQLite session setup
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal',
  ttl: 7 * 24 * 60 * 60 // 7 days
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'bar-union-2025-super-secret-key-please-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

// Remove SQLite database folder creation code
```

### Phase 4: Data Migration

#### Create Migration Script
Create file: [`scripts/migrateToMongoDB.js`](scripts/migrateToMongoDB.js)

```javascript
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Club from '../models/Club.js';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_portal');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read JSON files
const readJSON = (filePath) => {
  try {
    const absolutePath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(absolutePath)) {
      console.log(`File not found: ${absolutePath}`);
      return [];
    }
    return JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
};

// Migration functions
const migrateUsers = async () => {
  console.log('Starting user migration...');
  const users = readJSON('data/users.json');
  
  for (const user of users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`User already exists: ${user.email}, skipping...`);
        continue;
      }
      
      // Create new user
      const newUser = await User.create(user);
      console.log(`Migrated user: ${newUser.email} (ID: ${newUser._id})`);
    } catch (err) {
      console.error(`Error migrating user ${user.email}:`, err.message);
    }
  }
  
  console.log(`User migration completed. ${users.length} users processed.`);
};

const migrateNotifications = async () => {
  console.log('Starting notification migration...');
  const notifications = readJSON('data/notifications.json');
  
  for (const notification of notifications) {
    try {
      // Find user by ID
      const user = await User.findOne({ id: notification.userId });
      if (!user) {
        console.log(`User not found for notification: ${notification.title}`);
        continue;
      }
      
      // Create notification with proper user reference
      const newNotification = await Notification.create({
        ...notification,
        userId: user._id
      });
      
      console.log(`Migrated notification: ${newNotification.title}`);
    } catch (err) {
      console.error(`Error migrating notification ${notification.title}:`, err.message);
    }
  }
  
  console.log(`Notification migration completed. ${notifications.length} notifications processed.`);
};

const migrateClubs = async () => {
  console.log('Starting club migration...');
  const clubs = readJSON('data/clubs/clubs.json');
  
  for (const club of clubs) {
    try {
      const newClub = await Club.create(club);
      console.log(`Migrated club: ${newClub.name}`);
    } catch (err) {
      console.error(`Error migrating club ${club.name}:`, err.message);
    }
  }
  
  console.log(`Club migration completed. ${clubs.length} clubs processed.`);
};

// Run migrations
const runMigrations = async () => {
  try {
    await migrateUsers();
    await migrateNotifications();
    await migrateClubs();
    
    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigrations();
```

#### Add Migration Script to package.json
```json
"scripts": {
  "migrate": "node scripts/migrateToMongoDB.js",
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Phase 5: Update Authentication Routes

#### Modify routes/auth.js
Replace JSON file operations with MongoDB operations:

```javascript
// Remove JSON helper functions
// const readJSON = (filePath) => { ... }
// const writeJSON = (filePath, data) => { ... }

// Add MongoDB imports
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Update login route
router.post('/login', loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Prepare safe user data
    const { password: removed, ...safeUser } = user.toObject();

    // Store session
    req.session.user = {
      id: safeUser._id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
      photo: safeUser.photo || '/assets/images/defaults/default-user.png'
    };

    req.session.save(err => {
      if (err) {
        console.error("Session save failed:", err);
        return res.status(500).json({
          success: false,
          message: "Login failed – server error"
        });
      }

      res.json({
        success: true,
        message: "Login successful!",
        user: safeUser
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update registration route
router.post('/register', registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { fullName, email, password, role, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Get next available ID
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    // Create new user
    const newUser = new User({
      id: nextId,
      name: fullName,
      email,
      password,
      role,
      securityQuestions: [
        { question: securityQuestion1, answer: securityAnswer1.toLowerCase() },
        { question: securityQuestion2, answer: securityAnswer2.toLowerCase() }
      ]
    });

    await newUser.save();

    res.json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser.id, name: fullName, email, role }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// Update profile routes to use MongoDB
router.get('/profile', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...safeUser } = user.toObject();
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Continue updating all other auth routes similarly...
```

### Phase 6: Update API Routes

#### Modify routes/api.js
Replace JSON operations with MongoDB operations:

```javascript
// Remove JSON helper functions
// const readJSON = (filePath) => { ... }
// const writeJSON = (filePath, data) => { ... }

// Add MongoDB imports
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Club from '../models/Club.js';

// Update notification routes
router.get('/notifications', requireLogin, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.session.user.id });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.post('/notifications', requireLogin, async (req, res) => {
  try {
    const { title, message, priority, source, action } = req.body;
    if (!title || !message || !priority || !source) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newNotification = new Notification({
      userId: req.session.user.id,
      title,
      message,
      priority,
      source,
      action,
      reference: `NOTIF-${new Date().getFullYear()}-${Date.now()}`
    });

    await newNotification.save();
    res.json({ success: true, notification: newNotification });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Continue updating all other API routes similarly...
```

### Phase 7: Update Club Routes

#### Modify routes/clubs/clubsroutes.js
```javascript
import express from 'express';
import Club from '../../models/Club.js';
import User from '../../models/User.js';

const router = express.Router();

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().populate('leader', 'name email');
    res.json({ success: true, clubs });
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
  }
});

// Get single club
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('leader', 'name email')
      .populate('members', 'name email');
    
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    res.json({ success: true, club });
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch club' });
  }
});

// Continue with other club routes...
```

### Phase 8: Testing and Validation

#### 1. Test Authentication
- Test login, registration, and profile management
- Verify session persistence across requests
- Test all auth-related endpoints

#### 2. Test Data Migration
- Run migration script: `npm run migrate`
- Verify data integrity in MongoDB
- Check that all records are properly migrated

#### 3. Test API Endpoints
- Test all CRUD operations
- Verify data relationships (e.g., user-notification relationships)
- Test error handling and edge cases

#### 4. Performance Testing
- Compare response times before and after migration
- Test concurrent request handling
- Verify database query optimization

### Phase 9: Deployment

#### 1. Production Configuration
```env
# Production .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_portal?retryWrites=true&w=majority
SESSION_SECRET=your-production-secret-key-here
PORT=3000
NODE_ENV=production
```

#### 2. MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Set up cluster and database
3. Configure network access
4. Create database users with proper permissions
5. Update connection string in .env

#### 3. Backup Strategy
```javascript
// Create backup script
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `school_portal_backup_${timestamp}`;
  
  exec(`mongodump --uri="${process.env.MONGODB_URI}" --out=backups/${backupName}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    console.log('Backup completed:', backupName);
  });
};
```

### Phase 10: Monitoring and Maintenance

#### 1. Add MongoDB Monitoring
```javascript
// Add to server.js
import mongoose from 'mongoose';

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

#### 2. Add Performance Metrics
```javascript
// Add middleware for performance tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## Benefits of MongoDB Migration

### 1. Performance Improvements
- **Faster Queries**: Indexed MongoDB queries vs. full JSON file scans
- **Better Scalability**: Handles larger datasets efficiently
- **Concurrent Access**: Better handling of multiple simultaneous requests

### 2. Data Integrity
- **Schema Validation**: Built-in data validation
- **Relationships**: Proper document references between collections
- **Atomic Operations**: Safe data updates

### 3. Development Benefits
- **Flexible Schema**: Easy to evolve data structures
- **Rich Query Language**: Powerful querying capabilities
- **Aggregation Framework**: Advanced data processing

### 4. Operational Benefits
- **Backup/Restore**: Built-in tools for data management
- **Monitoring**: Comprehensive monitoring capabilities
- **Scaling**: Easy horizontal scaling

### 5. Security Improvements
- **Access Control**: Fine-grained permissions
- **Encryption**: Built-in encryption options
- **Audit Logging**: Comprehensive logging capabilities

## Risk Assessment and Mitigation

### Potential Risks
1. **Data Migration Issues**: Data loss or corruption during migration
2. **Downtime**: Service interruption during migration
3. **Performance Regression**: Slower performance if not properly optimized
4. **Compatibility Issues**: Code that doesn't work with MongoDB

### Mitigation Strategies
1. **Backup First**: Complete backup before migration
2. **Staged Migration**: Migrate in phases, test each phase
3. **Performance Testing**: Benchmark before and after
4. **Fallback Plan**: Ability to revert to JSON files if needed
5. **Monitoring**: Close monitoring during and after migration

## Implementation Timeline

### Week 1: Preparation
- [ ] Set up MongoDB development environment
- [ ] Create MongoDB models
- [ ] Update package.json dependencies
- [ ] Set up environment configuration

### Week 2: Core Migration
- [ ] Update session management
- [ ] Migrate authentication system
- [ ] Create data migration scripts
- [ ] Test basic functionality

### Week 3: API Migration
- [ ] Update all API routes
- [ ] Migrate club and department data
- [ ] Update e-learning routes
- [ ] Test all endpoints

### Week 4: Testing and Optimization
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing
- [ ] Optimization and tuning

### Week 5: Deployment
- [ ] Set up production MongoDB
- [ ] Final data migration
- [ ] Deploy to production
- [ ] Monitor post-deployment

## Post-Migration Tasks

1. **Documentation Update**: Update all documentation to reflect MongoDB usage
2. **Team Training**: Train team on MongoDB operations and troubleshooting
3. **Monitoring Setup**: Implement comprehensive monitoring
4. **Backup Strategy**: Implement regular backup schedule
5. **Performance Tuning**: Optimize queries and indexes

## Conclusion

This migration plan provides a comprehensive approach to moving from JSON file storage to MongoDB. The migration will significantly improve the scalability, performance, and maintainability of the Bar Union School Website while providing a solid foundation for future growth.

The plan is designed to be implemented in phases, allowing for thorough testing at each stage to ensure data integrity and system stability throughout the migration process.