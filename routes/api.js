/**
 * @file api.js
 * @description Main API router for the Bar Union School Website.
 * @note This file has become a monolith. For better maintainability, it is highly
 * recommended to split these routes into separate files based on their domain
 * (e.g., forms.js, departments.js, clubs.js, etc.) and mount them
 * individually in the main server file.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Import route files
import clubsRoutes from './clubs/clubsroutes.js';
import departmentsRoutes from './departments/departmentsroutes.js';
import elearningRoutes from './e-learning/e-learningroutes.js';
import staticRoutes from './static/staticroutes.js';

const router = express.Router();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================================================================
// MULTER CONFIGURATION (File Uploads)
// =================================================================

/**
 * Creates a multer uploader instance with a specific configuration.
 * @param {string} folder - The subfolder within 'public/uploads/' to store files.
 * @param {string[]} allowedExtensions - An array of allowed file extensions (e.g., ['.jpg', '.pdf']).
 * @returns {multer.Instance} A configured multer instance.
 */
// =================================================================
// MULTER CONFIGURATION – Smart & Secure Uploads
// =================================================================
const createUploader = (folder, allowedExtensions = [], maxSize = 15 * 1024 * 1024) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${folder.slice(0, -1)}-${unique}${ext}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExtensions.length === 0 || allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`), false);
      }
    }
  });
};

// Define specific uploaders for different route types
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const documentExtensions = ['.pdf', '.doc', '.docx'];
const mediaExtensions = ['.mp4', '.mov', '.mp3', '.wav'];

const uploadResume = createUploader('resumes/', [...documentExtensions, ...imageExtensions]);
const uploadBlogImage = createUploader('blogs/', imageExtensions);
const uploadDonationDoc = createUploader('donations/', [...documentExtensions, ...imageExtensions]);
const uploadElearning = createUploader('elearning/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);
const uploadClubSubmission = createUploader('clubs/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);
const uploadDepartmentFile = createUploader('departments/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);
const uploadCoCurriculumPhoto = createUploader('cocurriculum/', imageExtensions);
const uploadGuidanceResource = createUploader('guidance/', documentExtensions);
const uploadWelfareAttachment = createUploader('welfare/', [...documentExtensions, ...imageExtensions]);


// Dedicated uploaders
const uploadImage = createUploader('images/', ['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const uploadDocument = createUploader('documents/', ['.pdf', '.doc', '.docx']);
const uploadMedia = createUploader('media/', ['.mp4', '.mov', '.mp3', '.wav']);
const uploadMixed = createUploader('mixed/', []); // Allows all safe types


// =================================================================
// HELPER FUNCTIONS (JSON Read/Write)
// =================================================================

/**
 * Reads and parses a JSON file.
 * @param {string} filePath - The absolute path to the JSON file.
 * @returns {Array|Object} The parsed JSON data, or an empty array if the file doesn't exist or an error occurs.
 */
const readJSON = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Read JSON error at ${filePath}:`, err.message);
    return [];
  }
};

/**
 * Writes data to a JSON file, creating the directory if it doesn't exist.
 * @param {string} filePath - The absolute path to the JSON file.
 * @param {Array|Object} data - The data to serialize and write.
 * @returns {boolean} True on success, false on failure.
 */
const writeJSON = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Write JSON error at ${filePath}:`, err.message);
    return false;
  }
};

// =================================================================
// AUTH MIDDLEWARE (SIMPLE SESSION CHECK)
// =================================================================
const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

// =================================================================
// CORE API ROUTES – CLEAN, MODULAR & PROFESSIONAL
// =================================================================

/**
 * @route   GET /config/clubs
 * @desc    Serves client-side configuration for clubs
 * @access  Public
 */
router.get('/config/clubs', (req, res) => {
  console.log('Serving clubs config');
  // Client-safe configuration (no sensitive data)
  const clientConfig = {
    api: {
      timeout: 10000,
      retries: 3,
      cache: { enabled: true, ttl: 5 * 60 * 1000 }
    },
    upload: {
      maxFiles: 20,
      maxFileSize: 50 * 1024 * 1024,
      allowedTypes: {
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        media: ['video/mp4', 'video/mov', 'audio/mp3', 'audio/wav']
      }
    },
    performance: { debounceSearch: 300 },
    ui: { theme: { primaryColor: '#0175C2', secondaryColor: '#0b2d5e', accentColor: '#ffd700' } },
    messages: {
      errors: {
        network: 'Network error. Please check your connection and try again.',
        server: 'Server error. Please try again later.',
        validation: 'Please check your input and try again.',
        auth: 'You must be logged in to access this feature.',
        duplicate: 'You already have a pending application for this club.',
        upload: {
          noFiles: 'Please select files to upload.',
          invalidType: 'Invalid file type. Please check allowed formats.',
          tooLarge: 'File is too large. Please check size limits.',
          failed: 'Upload failed. Please try again.'
        }
      },
      success: {
        load: 'Data loaded successfully.',
        join: 'Application submitted successfully! We\'ll contact you soon.',
        upload: 'Files uploaded successfully.'
      }
    },
    features: {
      enableJoinApplications: true,
      enableFileUploads: true,
      enableEventRegistration: true,
      enableSearch: true,
      enableFiltering: true,
      enableGallery: true
    }
  };

  res.json(clientConfig);
});

// Mount the imported routes
router.use('/clubs', clubsRoutes);
router.use('/departments', departmentsRoutes);
router.use('/elearning', elearningRoutes);
router.use('/static', staticRoutes);

export default router;