// =================================================================
// E-LEARNING ROUTES
// =================================================================

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();

// Fix __dirname in ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Read JSON data (auto-create if missing)
const readJSON = (filePath) => {
  try {
    // Ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8'); // start with empty array
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error('Error reading JSON:', err);
    return [];
  }
};

// Helper: Write JSON data (auto-create folder if missing)
const writeJSON = (filePath, data) => {
  try {
    // Ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing JSON:', err);
    return false;
  }
};

// Multer configuration
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

const uploadElearning = createUploader('elearning/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);
const uploadDepartmentFile = createUploader('departments/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);

/**
 * @route   GET /elearning/data
 * @desc    Fetches all data for the main e-learning portal.
 * @access  Protected
 */
router.get('/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'elearning-data.json'));
  res.json(data);
});

/**
 * @route   GET /subjects
 * @desc    Fetches all subjects for the e-learning portal.
 * @access  Public
 */
router.get('/subjects', (req, res) => {
  const subjects = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'subjects.json'));
  res.json(subjects);
});

/**
 * @route   GET /resources
 * @desc    Fetches all resources for the e-learning portal.
 * @access  Public
 */
router.get('/resources', (req, res) => {
  const resources = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'resources.json'));
  res.json(resources);
});

/**
 * @route   GET /media
 * @desc    Fetches all media for the e-learning portal.
 * @access  Public
 */
router.get('/media', (req, res) => {
  const media = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'media.json'));
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';
  const type = req.query.type || '';

  // Filter media based on search and type
  let filteredMedia = media;
  if (search) {
    filteredMedia = filteredMedia.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (type) {
    filteredMedia = filteredMedia.filter(item =>
      item.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Paginate media
  const pageSize = 6;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMedia = filteredMedia.slice(startIndex, endIndex);

  res.json({ items: paginatedMedia });
});

/**
 * @route   GET /media/:id
 * @desc    Fetches a single media item for the e-learning portal.
 * @access  Public
 */
router.get('/media/:id', (req, res) => {
  const media = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'media.json'));
  const item = media.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Media not found' });
  }
  res.json(item);
});

/**
 * @route   GET /media/:id/download
 * @desc    Downloads a media item for the e-learning portal.
 * @access  Public
 */
router.get('/media/:id/download', (req, res) => {
  const media = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'media.json'));
  const item = media.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Media not found' });
  }
  res.redirect(item.url);
});

/**
 * @route   GET /study-plans
 * @desc    Fetches all study plans for the e-learning portal.
 * @access  Public
 */
router.get('/study-plans', (req, res) => {
  const studyPlans = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'study-plans.json'));
  res.json(studyPlans);
});

/**
 * @route   GET /notifications
 * @desc    Fetches notifications for the portal.
 * @access  Public
 */
router.get('/notifications', (req, res) => {
  const notifications = readJSON(path.join(__dirname, '..', '..', 'data', 'notifications.json'));
  res.json(notifications || []);
});

/**
 * @route   POST /elearning/upload
 * @desc    Handles resource uploads from teachers in the e-learning portal.
 * @access  Protected (should require teacher/admin role)
 */
router.post('/upload', uploadElearning.array('files', 10), (req, res) => {
  const { title, subject, type, description } = req.body;
  const teacher = req.session?.user?.name || "Teacher";

  if (!title || !subject || !type) {
    return res.status(400).json({ success: false, message: "Missing required fields: title, subject, and type." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files were uploaded." });
  }

  const resourcesFile = path.join(__dirname, '..', '..', 'data', 'portal', 'resources.json');
  let resources = readJSON(resourcesFile);

  const newResources = req.files.map(file => ({
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    subject,
    type,
    description: description || "",
    teacher,
    date: new Date().toISOString(),
    url: `/uploads/elearning/${file.filename}`,
    size: file.size
  }));

  resources = [...newResources, ...resources]; // Add new resources to the top
  writeJSON(resourcesFile, resources);

  console.log(`E-Learning Upload → Teacher ${teacher} uploaded ${req.files.length} file(s) for ${subject}`);
  res.json({ success: true, message: "Upload successful!" });
});


// =================================================================
// SCHOOL-WIDE RESOURCES HUB
// =================================================================

/**
 * @route   GET /resources/all
 * @desc    Fetches all data for the main resources hub.
 * @access  Protected
 */
router.get('/resources/all', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'resources', 'data.json'));
  res.json(data);
});

/**
 * @route   POST /resources/upload
 * @desc    Handles uploads for the main resources hub.
 * @access  Protected
 */
router.post('/resources/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: "No files" });
  }
  // In a real app, you would save file metadata to a JSON file or database here.
  console.log(`Resource Hub Upload → ${req.files.length} files received.`);
  res.json({ success: true });
});

/**
 * @route   GET /calendar
 * @desc    Fetches calendar events for a specific month and year.
 * @access  Public
 */
router.get('/calendar', (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();
  
  // Read calendar data from the JSON file
  const calendarDataPath = path.join(__dirname, '..', '..', 'data', 'static', 'school-calendar.json');
  const calendarData = readJSON(calendarDataPath);
  
  // Filter events for the specified month and year
  const events = calendarData.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
  });
  
  res.json({ events });
});

/**
 * @route   GET /quiz/:id
 * @desc    Fetches a specific quiz by ID with detailed questions
 * @access  Public
 */
router.get('/quiz/:id', (req, res) => {
  const quizzes = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'quizzes.json'));
  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json(quiz);
});

/**
 * @route   GET /quizzes
 * @desc    Fetches all available quizzes
 * @access  Public
 */
router.get('/quizzes', (req, res) => {
  const quizzes = readJSON(path.join(__dirname, '..', '..', 'data', 'portal', 'quizzes.json'));
  res.json(quizzes);
});

export default router;