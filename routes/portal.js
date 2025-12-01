import express from 'express';
import path from 'path';
import { requireLogin, requireRole } from '/middleware/authMiddleware.js';
import { clubEventValidator } from '/validators/portalValidator.js';
import { validationResult } from 'express-validator';


const router = express.Router();

// --------------------
// Clubs page (only for 'clubs' role)
// --------------------
router.post('/clubs/:clubName/events', requireRole('clubs'), clubEventValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
router.get('/clubs', requireRole('clubs'), (req, res) => {
    res.sendFile(path.join('static', 'clubs.html'), { root: '.' });
});

// --------------------
// E-learning page (only for 'e-learning' role)
// --------------------
router.get('/e-learning', requireRole('e-learning'), (req, res) => {
    res.sendFile(path.join('static', 'e-learning.html'), { root: '.' });
});

// --------------------
// Notifications (any logged-in user)
// --------------------
router.get('/notifications', requireLogin, (req, res) => {
    res.sendFile(path.join('static', 'notifications.html'), { root: '.' });
});

export default router;
