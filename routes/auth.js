// routes/auth.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loginValidator, registerValidator } from '../validators/authValidator.js';
import { validationResult } from 'express-validator';
import { requireLogin } from '../middleware/authMiddleware.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';
import mongoose from 'mongoose';
import User from '../models/users/User.js';
import Notification from '../models/users/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Check if MongoDB is connected
const isMongoDBConnected = () => {
  return mongoose.connection.readyState === 1; // 1 means connected
};

// Cache for JSON data to optimize fallback performance
const jsonCache = {
  users: null,
  notifications: null,
  lastUpdated: 0,
  cacheTTL: 5 * 60 * 1000 // 5 minutes cache TTL
};

// Clear cache if TTL expired
const clearCacheIfExpired = () => {
  if (Date.now() - jsonCache.lastUpdated > jsonCache.cacheTTL) {
    jsonCache.users = null;
    jsonCache.notifications = null;
  }
};

// Enhanced fallback mechanism with error handling, latency optimization, and caching
const withFallback = async (mongoOperation, jsonOperation, operationName = 'unknown') => {
  const startTime = Date.now();
  let fallbackReason = null;

  try {
    if (isMongoDBConnected()) {
      const result = await mongoOperation();
      const latency = Date.now() - startTime;
      console.log(`[MongoDB] ${operationName} completed in ${latency}ms`);
      return { source: 'mongodb', data: result, latency };
    } else {
      fallbackReason = 'mongodb_not_connected';
    }
  } catch (mongoError) {
    console.error(`[MongoDB] ${operationName} failed:`, mongoError.message);
    fallbackReason = `mongodb_error: ${mongoError.message}`;
  }

  try {
    // Clear cache if expired before JSON operation
    clearCacheIfExpired();
    const result = await jsonOperation();
    const latency = Date.now() - startTime;
    console.log(`[JSON Fallback] ${operationName} completed in ${latency}ms (Reason: ${fallbackReason})`);
    return { source: 'json', data: result, latency, fallbackReason };
  } catch (jsonError) {
    console.error(`[JSON] ${operationName} failed:`, jsonError.message);
    throw new Error(`Both MongoDB and JSON operations failed for ${operationName}`);
  }
};

// Helper: Read JSON data (auto-create if missing) with caching
const readJSON = (filePath) => {
  try {
    // Check cache first
    if (filePath.includes('users.json') && jsonCache.users) {
      return jsonCache.users;
    }
    if (filePath.includes('notifications.json') && jsonCache.notifications) {
      return jsonCache.notifications;
    }

    // Ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8'); // start with empty array
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Update cache
    if (filePath.includes('users.json')) {
      jsonCache.users = data;
    } else if (filePath.includes('notifications.json')) {
      jsonCache.notifications = data;
    }
    jsonCache.lastUpdated = Date.now();

    return data;
  } catch (err) {
    console.error('Error reading JSON:', err);
    return [];
  }
};


// Helper: Write JSON data (auto-create folder if missing)
const writeJSON = (filePath, data) => {
  try {
    // Ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // Update cache
    if (filePath.includes('users.json')) {
      jsonCache.users = data;
    } else if (filePath.includes('notifications.json')) {
      jsonCache.notifications = data;
    }
    jsonCache.lastUpdated = Date.now();

    return true;
  } catch (err) {
    console.error('Error writing JSON:', err);
    return false;
  }
};


// --------------------
// LOGIN
// --------------------
router.post('/login', loginValidator, async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ success: false, errors: errors.array() });
   }

   const { email, password } = req.body;
   console.log('Login attempt:', email, password);

   const result = await withFallback(
     async () => await User.findOne({ email, password }),
     async () => {
       const usersPath = path.join(__dirname, '..', 'data', 'users.json');
       const users = readJSON(usersPath);
       return users.find(u => u.email === email && u.password === password);
     },
     'user_login'
   );

   const user = result.data;
   console.log(`${result.source.toUpperCase()} user found:`, user ? user.email : 'none');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Prepare safe user data
  const { password: removed, ...safeUser } = user._doc || user;

  // Store session
  req.session.user = {
    id: safeUser.id || safeUser._id,
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

    console.log(`LOGIN SUCCESS → ${safeUser.name} (${safeUser.email}) – Role: ${safeUser.role}`);

    // Frontend expects: success, message, and user object (no redirect - frontend controls navigation)
    res.json({
      success: true,
      message: "Login successful!",
      user: safeUser
    });
  });
});


// --------------------
// CHECK AUTH STATUS
// --------------------
router.get('/check', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// --------------------
// LOGOUT
// --------------------
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.clearCookie('connect.sid'); // clear session cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// --------------------
// REGISTER
// --------------------
router.post('/register', registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // <-- log the exact errors
    console.log('Request body:', req.body); // <-- log what was sent
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { fullName, email, password, role, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;
  console.log('Register payload:', { fullName, email, password, role, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 });

  // Check if email already exists using fallback mechanism
  const existingUserResult = await withFallback(
    async () => await User.findOne({ email }),
    async () => {
      const usersFile = path.join(__dirname, '..', 'data', 'users.json');
      const users = readJSON(usersFile);
      return users.find(u => u.email === email);
    },
    'check_email_exists'
  );

  if (existingUserResult.data) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Create new user using fallback mechanism
  const result = await withFallback(
    async () => {
      const newUser = new User({
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
      return { id: newUser._id, name: fullName, email, role };
    },
    async () => {
      const usersFile = path.join(__dirname, '..', 'data', 'users.json');
      const users = readJSON(usersFile);
      const newUser = {
        id: users.length + 1,
        name: fullName,
        email,
        password,
        role,
        securityQuestions: [
          { question: securityQuestion1, answer: securityAnswer1.toLowerCase() },
          { question: securityQuestion2, answer: securityAnswer2.toLowerCase() }
        ]
      };
      users.push(newUser);
      writeJSON(usersFile, users);
      return { id: newUser.id, name: fullName, email, role };
    },
    'user_registration'
  );

  res.json({
    success: true,
    message: 'User registered successfully',
    user: result.data
  });
});

// --------------------
// FORGOT PASSWORD - Step 1: Submit Email
// --------------------
router.post('/api/forgot-password/email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  let user = null;

  // Try MongoDB first
  if (isMongoDBConnected()) {
    try {
      user = await User.findOne({ email });
    } catch (err) {
      console.error('MongoDB forgot password error:', err);
    }
  }

  // Fallback to JSON if MongoDB fails or user not found
  if (!user) {
    const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
    user = users.find(u => u.email === email);
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'Email not found' });
  }

  // Return security questions for the user
  const questions = user.securityQuestions || [];
  res.json({ success: true, questions: questions.map(q => q.question) });
});

// --------------------
// FORGOT PASSWORD - Step 2: Verify Answers
// --------------------
router.post('/api/forgot-password/verify', async (req, res) => {
  const { email, answer1, answer2 } = req.body;
  if (!email || !answer1 || !answer2) {
    return res.status(400).json({ success: false, message: 'Email and answers are required' });
  }

  let user = null;

  // Try MongoDB first
  if (isMongoDBConnected()) {
    try {
      user = await User.findOne({ email });
    } catch (err) {
      console.error('MongoDB verify answers error:', err);
    }
  }

  // Fallback to JSON if MongoDB fails or user not found
  if (!user) {
    const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
    user = users.find(u => u.email === email);
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'Email not found' });
  }

  const securityQuestions = user.securityQuestions || [];
  const isAnswer1Correct = securityQuestions.some(q => q.answer === answer1.toLowerCase());
  const isAnswer2Correct = securityQuestions.some(q => q.answer === answer2.toLowerCase());

  if (!isAnswer1Correct || !isAnswer2Correct) {
    return res.status(401).json({ success: false, message: 'Incorrect answers. Please try again.' });
  }

  res.json({ success: true, message: 'Answers verified successfully' });
});

// --------------------
// FORGOT PASSWORD - Step 3: Reset Password
// --------------------
router.post('/api/forgot-password/reset', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required' });
  }

  // Try MongoDB first
  if (isMongoDBConnected()) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      // Update the user's password
      user.password = newPassword;
      await user.save();

      return res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      console.error('MongoDB reset password error:', err);
    }
  }

  // Fallback to JSON if MongoDB fails
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Email not found' });
  }

  // Update the user's password
  users[userIndex].password = newPassword;
  writeJSON(path.join(__dirname, '..', 'data', 'users.json'), users);

  res.json({ success: true, message: 'Password reset successfully' });
});

/* ==================== USER & AUTH ==================== */
router.get('/profile', requireLogin, async (req, res) => {
  const result = await withFallback(
    async () => await User.findById(req.session.user.id),
    async () => {
      const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
      return users.find(u => u.id === req.session.user.id);
    },
    'fetch_profile'
  );

  const user = result.data;
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { password, ...safeUser } = user._doc || user;
  res.json({ success: true, user: safeUser });
});

router.put('/profile', requireLogin, uploadImage, async (req, res) => {
  const updates = req.body;
  if (req.file) updates.photo = `/uploads/images/${req.file.filename}`;

  // Try MongoDB first
  if (isMongoDBConnected()) {
    try {
      const user = await User.findById(req.session.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Update user
      Object.assign(user, updates, { updated_at: new Date().toISOString() });
      await user.save();

      req.session.user = user;
      const { password, ...safeUser } = user._doc;
      return res.json({ success: true, user: safeUser, message: 'Profile updated!' });
    } catch (err) {
      console.error('MongoDB profile update error:', err);
    }
  }

  // Fallback to JSON if MongoDB fails
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const index = users.findIndex(u => u.id === req.session.user.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

  users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
  if (writeJSON(path.join(__dirname, '..', 'data', 'users.json'), users)) {
    req.session.user = users[index];
    const { password, ...safeUser } = users[index];
    res.json({ success: true, user: safeUser, message: 'Profile updated!' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save profile' });
  }
});

/**
 * @route   GET /users/:id
 * @desc    Fetches a single user's profile by ID.
 * @access  Public (should be protected in a real app)
 */
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  let user = null;

  // Try MongoDB first
  if (isMongoDBConnected()) {
    try {
      user = await User.findById(id);
    } catch (err) {
      console.error('MongoDB user fetch error:', err);
    }
  }

  // Fallback to JSON if MongoDB fails or user not found
  if (!user) {
    const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
    user = users.find(u => u.id.toString() === id.toString());
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // IMPORTANT: Never send the password hash or plain text password in a response.
  const { password, ...safeUser } = user._doc || user;
  res.json({ success: true, user: safeUser });
});

/**
 * @route   PUT /users/:id
 * @desc    Updates a user's profile.
 * @access  Protected (should have middleware to check if user is updating their own profile or is an admin)
 */
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  // Try MongoDB first
  if (isMongoDBConnected()) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Update only provided fields
      if (name) user.name = name.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (password) user.password = password;
      if (role) user.role = role;

      await user.save();

      const { password: _, ...updatedUser } = user._doc;
      console.log(`User Updated → ID: ${id} | Name: ${updatedUser.name}`);
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (err) {
      console.error('MongoDB user update error:', err);
    }
  }

  // Fallback to JSON if MongoDB fails
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  const users = readJSON(usersFile);

  const index = users.findIndex(u => u.id.toString() === id.toString());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Update only provided fields
  if (name) users[index].name = name.trim();
  if (email) users[index].email = email.toLowerCase().trim();
  // SECURITY WARNING: Passwords should be hashed using a library like bcrypt before saving.
  // This is a major security risk in its current state.
  if (password) users[index].password = password;
  if (role) users[index].role = role;

  if (!writeJSON(usersFile, users)) {
    return res.status(500).json({ success: false, message: 'Failed to save changes.' });
  }

  const { password: _, ...updatedUser } = users[index];

  console.log(`User Updated → ID: ${id} | Name: ${updatedUser.name}`);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

// =================================================================
// ENHANCED PROFILE ENDPOINTS – ULTRA-PREMIUM 2025-2026
// =================================================================

/**
 * @route   GET /profile/enhanced
 * @desc    Get current user profile with enhanced data (academic, personal, preferences, security)
 * @access  Private
 */
router.get('/profile/enhanced', requireLogin, async (req, res) => {
  try {
    let user = null;

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        user = await User.findById(req.session.user.id);
      } catch (err) {
        console.error('MongoDB enhanced profile fetch error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails or user not found
    if (!user) {
      const usersFile = path.join(__dirname, '..', 'data', 'users.json');
      const users = readJSON(usersFile);
      user = users.find(u => u.id === req.session.user.id);
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get base user data
    const { password, ...safeUser } = user._doc || user;
    
    // Enhance with academic data (from user data or defaults)
    const academicData = user.academic || {
      term: 'Term 2, 2025',
      meanGrade: 'B+ (3.3)',
      bestSubject: 'Mathematics',
      subjectsTaken: 9,
      subjectGrades: ['A', 'B+', 'B', 'A-', 'B+', 'B', 'A', 'B+', 'B']
    };
    
    // Enhance with personal data
    const personalData = user.personal || {
      dob: '15 January 2008',
      gender: 'Male',
      parentContact: '+254 712 345 678',
      emergencyContact: '+254 723 456 789',
      residence: 'Nairobi, Kenya',
      studentId: 'S2025/0042'
    };
    
    // Enhance with preferences
    const preferencesData = user.preferences || {
      learningStyle: 'Practical / Hands-on',
      favoriteSubjects: 'Mathematics, Physics, Robotics',
      careerInterests: 'Engineering, Robotics, Computer Science',
      skillsToDevelop: 'Programming, Leadership, Public Speaking'
    };
    
    // Enhance with security info
    const securityData = user.security || {
      lastLogin: new Date().toLocaleString(),
      activeDevices: 2,
      passwordStrength: 'Strong',
      twoFactorEnabled: false
    };
    
    // Combine all data
    const enhancedUser = {
      ...safeUser,
      academic: academicData,
      personal: personalData,
      preferences: preferencesData,
      security: securityData,
      role: user.role || 'student'
    };
    
    res.json({ success: true, user: enhancedUser });
  } catch (err) {
    console.error('Enhanced profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch enhanced profile data' });
  }
});

/**
 * @route   PUT /profile/personal
 * @desc    Update personal information
 * @access  Private
 */
router.put('/profile/personal', requireLogin, async (req, res) => {
  try {
    const { dob, gender, parentContact, emergencyContact, residence } = req.body;
    
    // Validate required fields
    if (!dob || !gender || !parentContact || !emergencyContact) {
      return res.status(400).json({
        success: false,
        message: 'Missing required personal information fields'
      });
    }
    
    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Update personal data
        user.personal = {
          dob,
          gender,
          parentContact,
          emergencyContact,
          residence: residence || user.personal?.residence
        };
        
        // Save updated user data
        await user.save();
        
        // Update session
        req.session.user.personal = user.personal;
        
        return res.json({
          success: true,
          message: 'Personal information updated successfully',
          personal: user.personal
        });
      } catch (err) {
        console.error('MongoDB personal info update error:', err);
      }
    }
    
    // Fallback to JSON if MongoDB fails
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.id === req.session.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update personal data
    users[userIndex].personal = {
      dob,
      gender,
      parentContact,
      emergencyContact,
      residence: residence || users[userIndex].personal?.residence
    };
    
    // Save updated user data
    if (!writeJSON(usersFile, users)) {
      return res.status(500).json({ success: false, message: 'Failed to save personal information' });
    }
    
    // Update session
    req.session.user.personal = users[userIndex].personal;
    
    res.json({
      success: true,
      message: 'Personal information updated successfully',
      personal: users[userIndex].personal
    });
  } catch (err) {
    console.error('Personal info update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update personal information' });
  }
});

/**
 * @route   PUT /profile/preferences
 * @desc    Update learning preferences
 * @access  Private
 */
router.put('/profile/preferences', requireLogin, async (req, res) => {
  try {
    const { learningStyle, favoriteSubjects, careerInterests, skillsToDevelop } = req.body;
    
    // Validate required fields
    if (!learningStyle || !favoriteSubjects || !careerInterests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required preference fields'
      });
    }
    
    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Update preferences
        user.preferences = {
          learningStyle,
          favoriteSubjects,
          careerInterests,
          skillsToDevelop: skillsToDevelop || user.preferences?.skillsToDevelop
        };
        
        // Save updated user data
        await user.save();
        
        // Update session
        req.session.user.preferences = user.preferences;
        
        return res.json({
          success: true,
          message: 'Learning preferences updated successfully',
          preferences: user.preferences
        });
      } catch (err) {
        console.error('MongoDB preferences update error:', err);
      }
    }
    
    // Fallback to JSON if MongoDB fails
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.id === req.session.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update preferences
    users[userIndex].preferences = {
      learningStyle,
      favoriteSubjects,
      careerInterests,
      skillsToDevelop: skillsToDevelop || users[userIndex].preferences?.skillsToDevelop
    };
    
    // Save updated user data
    if (!writeJSON(usersFile, users)) {
      return res.status(500).json({ success: false, message: 'Failed to save preferences' });
    }
    
    // Update session
    req.session.user.preferences = users[userIndex].preferences;
    
    res.json({
      success: true,
      message: 'Learning preferences updated successfully',
      preferences: users[userIndex].preferences
    });
  } catch (err) {
    console.error('Preferences update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
});

/**
 * @route   PUT /profile/security
 * @desc    Update security settings
 * @access  Private
 */
router.put('/profile/security', requireLogin, async (req, res) => {
  try {
    const { currentPassword, newPassword, enableTwoFactor } = req.body;
    
    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Validate current password if changing password
        if (newPassword && user.password !== currentPassword) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Update password if provided
        if (newPassword) {
          user.password = newPassword;
          req.session.user.passwordChanged = true;
        }
        
        // Update two-factor authentication setting
        if (enableTwoFactor !== undefined) {
          user.security = {
            ...user.security,
            twoFactorEnabled: !!enableTwoFactor
          };
          req.session.user.security = user.security;
        }
        
        // Save updated user data
        await user.save();
        
        return res.json({
          success: true,
          message: 'Security settings updated successfully',
          security: user.security
        });
      } catch (err) {
        console.error('MongoDB security update error:', err);
      }
    }
    
    // Fallback to JSON if MongoDB fails
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.id === req.session.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Validate current password if changing password
    if (newPassword && users[userIndex].password !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password if provided
    if (newPassword) {
      users[userIndex].password = newPassword;
      req.session.user.passwordChanged = true;
    }
    
    // Update two-factor authentication setting
    if (enableTwoFactor !== undefined) {
      users[userIndex].security = {
        ...users[userIndex].security,
        twoFactorEnabled: !!enableTwoFactor
      };
      req.session.user.security = users[userIndex].security;
    }
    
    // Save updated user data
    if (!writeJSON(usersFile, users)) {
      return res.status(500).json({ success: false, message: 'Failed to save security settings' });
    }
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      security: users[userIndex].security
    });
  } catch (err) {
    console.error('Security update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update security settings' });
  }
});

/**
 * @route   GET /profile/activity
 * @desc    Get user activity feed
 * @access  Private
 */
router.get('/profile/activity', requireLogin, (req, res) => {
  try {
    // Mock activity data - in a real app, this would come from a database
    const mockActivity = [
      {
        id: 1,
        category: 'academic',
        title: 'Won 1st Place in Science Fair',
        description: 'Congratulations! Your project on renewable energy impressed the judges.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: 'trophy'
      },
      {
        id: 2,
        category: 'academic',
        title: 'Earned 50 Merit Points',
        description: 'For excellent performance in Mathematics mid-term exam.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        icon: 'star'
      },
      {
        id: 3,
        category: 'clubs',
        title: 'Joined Robotics Club',
        description: 'Welcome to the team! First meeting this Friday.',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        icon: 'users'
      },
      {
        id: 4,
        category: 'system',
        title: 'Profile Updated',
        description: 'You updated your personal information and preferences.',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        icon: 'cog'
      },
      {
        id: 5,
        category: 'academic',
        title: 'Term 1 Results Released',
        description: 'Your term 1 results are now available. Mean grade: B+',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        icon: 'graduation-cap'
      }
    ];
    
    res.json({
      success: true,
      activity: mockActivity.map(item => ({
        ...item,
        timestamp: item.timestamp.toISOString()
      }))
    });
  } catch (err) {
    console.error('Activity feed error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch activity feed' });
  }
});

/**
 * @route   GET /profile/attendance
 * @desc    Get attendance records (admin/student view)
 * @access  Private
 */
router.get('/profile/attendance', requireLogin, (req, res) => {
  try {
    const userRole = req.session.user.role || 'student';
    
    // Basic attendance data for all users
    const basicAttendance = {
      overallAttendance: '98% (Excellent)',
      lateArrivals: 2,
      disciplineRecords: 'None',
      commendations: 3
    };
    
    // Admin gets detailed records
    const detailedRecords = [
      {
        date: '2025-11-15',
        status: 'late',
        reason: 'Traffic',
        actionTaken: 'None'
      },
      {
        date: '2025-10-05',
        status: 'late',
        reason: 'Transport issue',
        actionTaken: 'None'
      }
    ];
    
    res.json({
      success: true,
      attendance: {
        ...basicAttendance,
        ...(userRole === 'admin' && { detailedRecords })
      }
    });
  } catch (err) {
    console.error('Attendance fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance data' });
  }
});

// --------------------
// LOGOUT FROM ALL DEVICES
// --------------------
router.post('/logout-all', requireLogin, (req, res) => {
  try {
    // In a real app, you would invalidate all sessions for this user
    // For this demo, we'll just destroy the current session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Failed to log out of all devices' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out of all devices successfully' });
    });
  } catch (err) {
    console.error('Logout all error:', err);
    res.status(500).json({ success: false, message: 'Failed to log out of all devices' });
  }
});

// --------------------
// DOWNLOAD USER DATA
// --------------------
router.get('/download-data', requireLogin, async (req, res) => {
  try {
    let user = null;

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        user = await User.findById(req.session.user.id);
      } catch (err) {
        console.error('MongoDB download data error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails or user not found
    if (!user) {
      const usersFile = path.join(__dirname, '..', 'data', 'users.json');
      const users = readJSON(usersFile);
      user = users.find(u => u.id === req.session.user.id);
    }
  
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  
    // Remove sensitive data
    const { password, ...safeUser } = user._doc || user;
  
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=user-data.json');
  
    res.json(safeUser);
  } catch (err) {
    console.error('Download data error:', err);
    res.status(500).json({ success: false, message: 'Failed to download user data' });
  }
});

// --------------------
// CLEAR CACHED DATA
// --------------------
router.post('/clear-cache', requireLogin, (req, res) => {
  try {
    // In a real app, you would clear cached data for this user
    // For this demo, we'll just return a success message
    res.json({ success: true, message: 'Cached data cleared successfully' });
  } catch (err) {
    console.error('Clear cache error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear cached data' });
  }
});

// --------------------
// REQUEST ACCOUNT DELETION
// --------------------
router.post('/request-deletion', requireLogin, async (req, res) => {
  try {
    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Mark user as requested for deletion
        user.accountStatus = 'deletion_requested';
        user.deletionRequestedAt = new Date().toISOString();
        
        await user.save();
        
        // Destroy session
        req.session.destroy(err => {
          if (err) {
            console.error('Error destroying session:', err);
          }
          res.clearCookie('connect.sid');
        });
        
        return res.json({ success: true, message: 'Account deletion requested successfully' });
      } catch (err) {
        console.error('MongoDB request deletion error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.id === req.session.user.id);
   
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
   
    // Mark user as requested for deletion
    users[userIndex].accountStatus = 'deletion_requested';
    users[userIndex].deletionRequestedAt = new Date().toISOString();
   
    if (!writeJSON(usersFile, users)) {
      return res.status(500).json({ success: false, message: 'Failed to request account deletion' });
    }
   
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.clearCookie('connect.sid');
    });
   
    res.json({ success: true, message: 'Account deletion requested successfully' });
  } catch (err) {
    console.error('Request deletion error:', err);
    res.status(500).json({ success: false, message: 'Failed to request account deletion' });
  }
});

// --------------------
// NOTIFICATIONS API
// --------------------

// Helper: Read notifications data
const readNotifications = () => {
  const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
  return readJSON(notificationsFile);
};

// Helper: Write notifications data
const writeNotifications = (data) => {
  const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
  return writeJSON(notificationsFile, data);
};

// Get all notifications for the current user
router.get('/notifications', requireLogin, async (req, res) => {
  try {
    const result = await withFallback(
      async () => await Notification.find({ userId: req.session.user.id }),
      async () => {
        const jsonNotifications = readNotifications();
        return jsonNotifications.filter(n => n.userId === req.session.user.id);
      },
      'fetch_notifications'
    );

    res.json({ success: true, notifications: result.data });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Create a new notification
router.post('/notifications', requireLogin, async (req, res) => {
  try {
    const { title, message, priority, source, action } = req.body;
    if (!title || !message || !priority || !source) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
  
    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const newNotification = new Notification({
          userId: req.session.user.id,
          title,
          message,
          priority,
          source,
          action,
          isRead: false,
          isPinned: false,
          createdAt: new Date().toISOString(),
          reference: `NOTIF-${new Date().getFullYear()}-${Date.now()}`
        });
        
        await newNotification.save();
        return res.json({ success: true, notification: newNotification });
      } catch (err) {
        console.error('MongoDB notification creation error:', err);
      }
    }
  
    // Fallback to JSON if MongoDB fails
    const notifications = readNotifications();
    const newNotification = {
      id: notifications.length + 1,
      userId: req.session.user.id,
      title,
      message,
      priority,
      source,
      action,
      isRead: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      reference: `NOTIF-${new Date().getFullYear()}-${notifications.length + 1}`
    };
  
    notifications.push(newNotification);
    if (writeNotifications(notifications)) {
      res.json({ success: true, notification: newNotification });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save notification' });
    }
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Mark a notification as read
router.put('/notifications/:id/read', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const notification = await Notification.findById(id);
        if (!notification || notification.userId !== req.session.user.id) {
          return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        notification.isRead = true;
        await notification.save();
        return res.json({ success: true, notification: notification });
      } catch (err) {
        console.error('MongoDB notification read error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    const notifications = readNotifications();
    const notificationIndex = notifications.findIndex(n => n.id.toString() === id.toString() && n.userId === req.session.user.id);
  
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  
    notifications[notificationIndex].isRead = true;
    if (writeNotifications(notifications)) {
      res.json({ success: true, notification: notifications[notificationIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Pin a notification
router.put('/notifications/:id/pin', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const notification = await Notification.findById(id);
        if (!notification || notification.userId !== req.session.user.id) {
          return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        notification.isPinned = !notification.isPinned;
        await notification.save();
        return res.json({ success: true, notification: notification });
      } catch (err) {
        console.error('MongoDB notification pin error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    const notifications = readNotifications();
    const notificationIndex = notifications.findIndex(n => n.id.toString() === id.toString() && n.userId === req.session.user.id);
  
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  
    notifications[notificationIndex].isPinned = !notifications[notificationIndex].isPinned;
    if (writeNotifications(notifications)) {
      res.json({ success: true, notification: notifications[notificationIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
  } catch (err) {
    console.error('Error pinning notification:', err);
    res.status(500).json({ success: false, message: 'Failed to pin notification' });
  }
});

// Delete a notification
router.delete('/notifications/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const notification = await Notification.findById(id);
        if (!notification || notification.userId !== req.session.user.id) {
          return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        await Notification.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Notification deleted successfully' });
      } catch (err) {
        console.error('MongoDB notification delete error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    const notifications = readNotifications();
    const notificationIndex = notifications.findIndex(n => n.id.toString() === id.toString() && n.userId === req.session.user.id);
  
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  
    notifications.splice(notificationIndex, 1);
    if (writeNotifications(notifications)) {
      res.json({ success: true, message: 'Notification deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// Get pinned notifications
router.get('/notifications/pinned', requireLogin, async (req, res) => {
  try {
    let notifications = [];

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        notifications = await Notification.find({ userId: req.session.user.id, isPinned: true });
      } catch (err) {
        console.error('MongoDB pinned notifications fetch error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    if (!notifications || notifications.length === 0) {
      const jsonNotifications = readNotifications();
      notifications = jsonNotifications.filter(n => n.userId === req.session.user.id && n.isPinned);
    }

    res.json({ success: true, notifications: notifications });
  } catch (err) {
    console.error('Error fetching pinned notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pinned notifications' });
  }
});

// Get unread notifications
router.get('/notifications/unread', requireLogin, async (req, res) => {
  try {
    let notifications = [];

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        notifications = await Notification.find({ userId: req.session.user.id, isRead: false });
      } catch (err) {
        console.error('MongoDB unread notifications fetch error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    if (!notifications || notifications.length === 0) {
      const jsonNotifications = readNotifications();
      notifications = jsonNotifications.filter(n => n.userId === req.session.user.id && !n.isRead);
    }

    res.json({ success: true, notifications: notifications });
  } catch (err) {
    console.error('Error fetching unread notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch unread notifications' });
  }
});

// Acknowledge a notification
router.put('/notifications/:id/acknowledge', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    // Try MongoDB first
    if (isMongoDBConnected()) {
      try {
        const notification = await Notification.findById(id);
        if (!notification || notification.userId !== req.session.user.id) {
          return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        notification.isAcknowledged = true;
        notification.acknowledgedAt = new Date().toISOString();
        await notification.save();
        return res.json({ success: true, notification: notification });
      } catch (err) {
        console.error('MongoDB notification acknowledge error:', err);
      }
    }

    // Fallback to JSON if MongoDB fails
    const notifications = readNotifications();
    const notificationIndex = notifications.findIndex(n => n.id.toString() === id.toString() && n.userId === req.session.user.id);
  
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  
    notifications[notificationIndex].isAcknowledged = true;
    notifications[notificationIndex].acknowledgedAt = new Date().toISOString();
    if (writeNotifications(notifications)) {
      res.json({ success: true, notification: notifications[notificationIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to acknowledge notification' });
    }
  } catch (err) {
    console.error('Error acknowledging notification:', err);
    res.status(500).json({ success: false, message: 'Failed to acknowledge notification' });
  }
});

export default router;

