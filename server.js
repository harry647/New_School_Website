// ==================================================
// server.js – FINAL WORKING VERSION (2025–2026)
// Using SQLite session storage (correct and stable)
// ==================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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
// MongoDB Connection Setup
// ================================================
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_website_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
    
    // Set up MongoDB session store
    const sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/school_website_db',
      ttl: parseInt(process.env.SESSION_TTL) || 7 * 24 * 60 * 60 // 7 days
    });
    
    // Add MongoDB session store to app for later use
    app.locals.mongoSessionStore = sessionStore;
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Continue with SQLite if MongoDB fails (fallback)
  }
};

// Connect to MongoDB (non-blocking)
connectToMongoDB();

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// ================================================
// 1. SESSION SETUP – MONGODB (PRIMARY) WITH SQLITE FALLBACK
// ================================================
// Ensure database folder exists for SQLite fallback
const dbFolder = path.join(__dirname, 'database');
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

const SQLiteStoreInstance = SQLiteStore(session);

// Determine which session store to use
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'bar-union-2025-super-secret-key-please-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

// Use MongoDB session store if available, otherwise fallback to SQLite
if (app.locals.mongoSessionStore) {
  console.log('🔄 Using MongoDB for session storage');
  sessionConfig.store = app.locals.mongoSessionStore;
} else {
  console.log('🔄 Using SQLite for session storage (fallback)');
  sessionConfig.store = new SQLiteStoreInstance({
    db: 'sessions.db',
    dir: dbFolder,
    concurrentDB: true
  });
}

app.use(session(sessionConfig));

// ================================================
// 2. Middleware
// ================================================
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ================================================
// 3. Static Files
// ================================================
const staticPaths = [
  'css', 'js', 'assets', 'includes', 'data', 'downloads',
  'admin', 'portal', 'clubs', 'blogs', 'departments',
  'resources', 'user', 'static', 'user', 'e-learning', 
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

// Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'images', 'favicon.ico'));
});

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
// 6. Error Handler
// ================================================
app.use(errorHandler);

// ================================================
// 7. Start Server
// ================================================
app.listen(PORT, () => {
  console.log(`🚀 Bar Union School Website LIVE at http://localhost:${PORT}`);
  
  if (mongoose.connection.readyState === 1) {
    console.log('🔄 MongoDB session database → Active');
    console.log('📊 Primary data storage → MongoDB');
  } else {
    console.log('🔄 SQLite session database → /database/sessions.db');
    console.log('⚠️  MongoDB not connected - using SQLite fallback');
  }
  
  console.log('📁 JSON files remain intact as backup');
});
