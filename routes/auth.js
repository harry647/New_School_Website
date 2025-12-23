// routes/auth.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { loginValidator, registerValidator } from '../validators/authValidator.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Helper: Read JSON data (auto-create if missing)
const readJSON = (filePath) => {
  try {
    // Ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }


    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8'); // start with empty array
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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
  } catch (err) {
    console.error('Error writing JSON:', err);
  }
};


// --------------------
// LOGIN
// --------------------
router.post('/login', loginValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const users = readJSON(path.join('data', 'users.json'));
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Prepare safe user data
  const { password: removed, ...safeUser } = user;

  // Store session
  req.session.user = {
    id: safeUser.id,
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
router.post('/register', registerValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // <-- log the exact errors
    console.log('Request body:', req.body); // <-- log what was sent
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { fullName, email, password, role, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;
  console.log('Register payload:', { fullName, email, password, role, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 });

  const usersFile = path.join('data', 'users.json');
  const users = readJSON(usersFile);

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // hash password for production
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

  res.json({
    success: true,
    message: 'User registered successfully',
    user: { id: newUser.id, name: fullName, email, role }
  });
});

// --------------------
// FORGOT PASSWORD - Step 1: Submit Email
// --------------------
router.post('/api/forgot-password/email', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const users = readJSON(path.join('data', 'users.json'));
  const user = users.find(u => u.email === email);

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
router.post('/api/forgot-password/verify', (req, res) => {
  const { email, answer1, answer2 } = req.body;
  if (!email || !answer1 || !answer2) {
    return res.status(400).json({ success: false, message: 'Email and answers are required' });
  }

  const users = readJSON(path.join('data', 'users.json'));
  const user = users.find(u => u.email === email);

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
router.post('/api/forgot-password/reset', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required' });
  }

  const users = readJSON(path.join('data', 'users.json'));
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Email not found' });
  }

  // Update the user's password
  users[userIndex].password = newPassword;
  writeJSON(path.join('data', 'users.json'), users);

  res.json({ success: true, message: 'Password reset successfully' });
});

/* ==================== USER & AUTH ==================== */
router.get('/profile', requireAuth, (req, res) => {
  const { password, ...safeUser } = req.session.user;
  res.json({ success: true, user: safeUser });
});

router.put('/profile', requireAuth, uploadImage.single('photo'), (req, res) => {
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const index = users.findIndex(u => u.id === req.session.user.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

  const updates = req.body;
  if (req.file) updates.photo = `/uploads/images/${req.file.filename}`;

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
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const user = users.find(u => u.id.toString() === id.toString());

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // IMPORTANT: Never send the password hash or plain text password in a response.
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

/**
 * @route   PUT /users/:id
 * @desc    Updates a user's profile.
 * @access  Protected (should have middleware to check if user is updating their own profile or is an admin)
 */
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

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

export default router;

