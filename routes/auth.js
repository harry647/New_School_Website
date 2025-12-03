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

    // Frontend expects: success, message, and user object
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
router.post('/auth/register', registerValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // <-- log the exact errors
    console.log('Request body:', req.body); // <-- log what was sent
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role, admission, gender } = req.body;
  console.log('Register payload:', { name, email, password, role, admission, gender });

  const usersFile = path.join('data', 'users.json');
  const users = readJSON(usersFile);

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // hash password for production
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role,
    admission,
    gender
  };

  users.push(newUser);
  writeJSON(usersFile, users);

  res.json({
    success: true,
    message: 'User registered successfully',
    user: { id: newUser.id, name, email, role, admission, gender }
  });
});

export default router;

