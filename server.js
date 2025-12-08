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
import multer from 'multer';
import cors from 'cors';

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
// 2. CORS Configuration
// ================================================
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ================================================
// 4. Middleware
// ================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for contact form file uploads
const contactUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'public', 'uploads', 'contact');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `contact-attachment-${unique}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'image/jpeg', 
      'image/jpg', 
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'), false);
    }
  }
});

app.use(logger);

// ================================================
// 5. Static Files
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
// 6. Routes
// ================================================
app.use('/auth', authRoutes);
app.use('/portal', portalRoutes);
app.use('/api', apiRoutes);

// ================================================
// 7. HTML Pages (Root Routes)
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
app.get('*', (req, res) => {
  // Only serve index.html for routes that don't have a file extension
  // and are not API/auth/portal routes
  if (!req.path.includes('.') &&
      !req.path.startsWith('/auth') &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/portal')) {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

// ================================================
// 8. Error Handler
// ================================================
app.use(errorHandler);

// ================================================
// 9. Start Server
// ================================================
app.listen(PORT, () => {
  console.log(`Bar Union School Website LIVE at http://localhost:${PORT}`);
  console.log('SQLite session database → /database/sessions.db');
});
