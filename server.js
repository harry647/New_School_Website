// ==================================================
// server.js – FINAL WORKING VERSION (2025–2026)
// Using SQLite session storage (correct and stable)
// ==================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import portalRoutes from './routes/portal.js';
import apiRoutes from './routes/api.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';





// ================================================
// Resolve __dirname and file paths
// ================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================
// 1. SESSION SETUP – USING SQLITE (BEST OPTION)
// ================================================
// Ensure database folder exists
const dbFolder = path.join(__dirname, 'database');
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

const SQLiteStoreInstance = SQLiteStore(session);

app.use(
  session({
    store: new SQLiteStoreInstance({
      db: 'sessions.db',
      dir: dbFolder,
      concurrentDB: true
    }),
    secret: 'bar-union-2025-super-secret-key-please-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

// ================================================
// 2. Middleware
// ================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ================================================
// 3. Static Files
// ================================================
const staticPaths = [
  'css', 'js', 'assets', 'includes', 'data', 'downloads',
  'admin', 'portal', 'clubs', 'blogs', 'departments',
  'resources', 'user', 'static'
];

staticPaths.forEach(folder => {
  app.use(`/${folder}`, express.static(path.join(__dirname, folder)));
});

// ================================================
// 4. Routes
// ================================================
app.use('/auth', authRoutes);
app.use('/portal', portalRoutes);
app.use('/api', apiRoutes);

// ================================================
// 5. HTML Pages (Root Routes)
// ================================================
const pages = [
  '', 'about', 'academics', 'admissions', 'gallery', 'news',
  'contact', 'administration', 'staff', 'student-life',
  'e-learning', 'alumni', 'career-guidance', 'support-utilities'
];

pages.forEach(page => {
  const route = page === '' ? '/' : `/${page}`;
  const fileName = page === '' ? 'index.html' : `${page}.html`;

  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'static', fileName));
  });
});

// SPA fallback (for routes without a dot/extension)
app.get(/^\/[^.]*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// ================================================
// 6. Error Handler
// ================================================
app.use(errorHandler);

// ================================================
// 7. Start Server
// ================================================
app.listen(PORT, () => {
  console.log(`Bar Union School Website LIVE at http://localhost:${PORT}`);
  console.log('SQLite session database → /database/sessions.db');
});
