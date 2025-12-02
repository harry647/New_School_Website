import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import portalRoutes from './routes/portal.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/api.js';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup for login/role handling
app.use(session({
    secret: 'school-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Logger middleware
app.use(logger);

// --------------------
// Static assets
// --------------------
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/includes', express.static(path.join(__dirname, 'includes')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/portal', express.static(path.join(__dirname, 'portal')));
app.use('/clubs', express.static(path.join(__dirname, 'clubs')));
app.use('/blogs', express.static(path.join(__dirname, 'blogs')));
app.use('/departments', express.static(path.join(__dirname, 'departments')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/user', express.static(path.join(__dirname, 'user')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// --------------------
// Modular Routes
// --------------------
app.use('/auth', authRoutes);       // login, logout, register APIs
app.use('/portal', portalRoutes);   // e-learning, clubs, notifications, protected routes
app.use('/api', apiRoutes);         // roues to all APIs

// --------------------
// HTML Pages
// --------------------
const pages = [
    '',
    'about',
    'academics',
    'admissions',
    'gallery',
    'news',
    'contact',
    'administration',
    'staff',
    'student-life',
    'e-learning',
    'alumni',
    'career-guidance',
    'support-utilities'
];

pages.forEach(page => {
    const route = page === '' ? '/' : `/${page}`;
    app.get(route, (req, res) => {
        const fileName = page === '' ? 'index.html' : `${page}.html`;
        res.sendFile(path.join(__dirname, 'static', fileName));
    });
});

// --------------------
// Fallback for non-file routes
// --------------------
app.get(/^\/[^.]*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// --------------------
// Error Handler
// --------------------
app.use(errorHandler);

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
    console.log(`School Website live at port ${PORT}`);
});
