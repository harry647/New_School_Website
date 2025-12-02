import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireLogin, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// This router serves the main HTML entry points for protected portal areas.
// The actual data for these pages is fetched via client-side calls to /api/... routes.
// --------------------

/**
 * @route   GET /clubs
 * @desc    Serves the main clubs page HTML.
 * @access  Protected - requires 'clubs' role (example).
 */
router.get('/clubs', requireRole('clubs'), (req, res) => { // Role check can be adjusted
    res.sendFile(path.join(__dirname, '..', 'clubs', 'clubs.html'));
});

// --------------------
// E-learning page (only for 'e-learning' role)
// --------------------
router.get('/e-learning', requireRole('e-learning'), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'portal', 'e-learning-portal.html'));
});

// --------------------
// Notifications (any logged-in user)
// --------------------
router.get('/notifications', requireLogin, (req, res) => {
    res.sendFile(path.join('static', 'notifications.html'), { root: '.' });
});

export default router;
