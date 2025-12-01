import express from 'express';
import path from 'path';
import fs from 'fs';
import { loginValidator } from '/validators/authValidator.js';
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
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(path.join('data', 'users.json'));

  //validation  with authValidator.js 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

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
    redirect: `/api/dashboard`
  });
});

// --------------------
// LOGOUT
// --------------------
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// --------------------
// REGISTER
// --------------------
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  const usersFile = path.join('data', 'users.json');
  const users = readJSON(usersFile);

  // Simple validation (replace with authValidator.js later)
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });
  if (users.some(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password, // In production, hash passwords!
    role
  };

  users.push(newUser);
  writeJSON(usersFile, users);

  res.json({ success: true, message: 'User registered', user: { id: newUser.id, name, email, role } });
});

export default router;
