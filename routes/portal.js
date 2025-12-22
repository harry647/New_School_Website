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
 * @access  Protected - any logged-in user can access clubs.
 */
router.get('/clubs', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'clubs', 'clubs.html'));
});

// --------------------
// E-learning page (any logged-in user can access e-learning)
// --------------------
router.get('/e-learning', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'portal', 'e-learning-portal.html'));
});

// --------------------
// Notifications (any logged-in user)
// --------------------
router.get('/notifications', requireLogin, (req, res) => {
    res.sendFile(path.join('static', 'notifications.html'), { root: '.' });
});

export default router;
