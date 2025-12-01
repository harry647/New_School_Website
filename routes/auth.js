// routes/auth.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { loginValidator, registerValidator } from '../validators/authValidator.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Helper: Read JSON data
const readJSON = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error('Error reading JSON:', err);
    return [];
  }
};

// Helper: Write JSON data
const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

  // In production, compare hashed password
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  // Set session
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.json({
    success: true,
    message: 'Login successful',
    role: user.role,
    name: user.name
  });
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
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role } = req.body;
  const usersFile = path.join('data', 'users.json');
  const users = readJSON(usersFile);

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  //  hash password for production
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role
  };

  users.push(newUser);
  writeJSON(usersFile, users);

  res.json({
    success: true,
    message: 'User registered successfully',
    user: { id: newUser.id, name, email, role }
  });
});

export default router;
