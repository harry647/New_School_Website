import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to read JSON files
const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON:', err);
    return [];
  }
};

// --------------------
// Notifications API
// --------------------
router.get('/notifications', (req, res) => {
  const notifications = readJSON(path.join('data', 'notifications.json'));
  res.json(notifications);
});

// --------------------
// Club Events API
// --------------------
router.get('/clubs/:clubName/events', (req, res) => {
  const { clubName } = req.params;
  const events = readJSON(path.join('data', 'clubEvents.json'));
  const filtered = events.filter(ev => ev.club.toLowerCase() === clubName.toLowerCase());
  res.json(filtered);
});

// --------------------
// E-learning Assignments API
// --------------------
router.get('/e-learning/assignments', (req, res) => {
  const assignments = readJSON(path.join('data', 'assignments.json'));
  res.json(assignments);
});

// --------------------
// User Profile API
// --------------------
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const users = readJSON(path.join('data', 'users.json'));
  const user = users.find(u => u.id.toString() === id.toString());
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update user profile
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const usersFile = path.join('data', 'users.json');
  const users = readJSON(usersFile);

  const index = users.findIndex(u => u.id.toString() === id.toString());
  if (index === -1) return res.status(404).json({ message: 'User not found' });

  users[index] = { ...users[index], name, email, role };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ success: true, message: 'User profile updated', user: users[index] });
});

// --------------------
// Role-based content example
// --------------------
router.get('/dashboard', (req, res) => {
  const user = req.session?.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (user.role === 'clubs') {
    res.json({ redirect: '/portal/clubs', message: 'Redirect to Clubs dashboard' });
  } else if (user.role === 'e-learning') {
    res.json({ redirect: '/portal/e-learning', message: 'Redirect to E-Learning dashboard' });
  } else {
    res.json({ message: 'Unknown role', redirect: '/' });
  }
});

export default router;
