import express from 'express';
import path from 'path';
import { requireLogin, requireRole } from '../middleware/authMiddleware.js';
import { clubEventValidator } from '../validators/portalValidator.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// --------------------
// Clubs page (only for 'clubs' role)
// --------------------

// Get Clubs page
router.get('/clubs', requireRole('clubs'), (req, res) => {
    res.sendFile(path.join('static', 'clubs.html'), { root: '.' });
});

// Post new club event
router.post('/clubs/:clubName/events', requireRole('clubs'), clubEventValidator, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { clubName } = req.params;
    const { title, date, description } = req.body;

    // Here, you would save the event to your database or JSON file
    // Example: append to data/clubs-events.json
    // const events = readJSON('data/clubs-events.json') || [];
    // events.push({ clubName, title, date, description });
    // writeJSON('data/clubs-events.json', events);

    res.json({ success: true, message: `Event added for ${clubName}`, event: { title, date, description } });
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
