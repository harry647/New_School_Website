// =================================================================
// E-LEARNING ROUTES
// =================================================================

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import mongoose from 'mongoose';

const router = express.Router();

// Fix __dirname in ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import MongoDB models
let Resource, Subject, Assignment, Quiz, ElearningUser, AssignmentSubmission, Media, QuizSubmission, StudyPlan;
try {
  Resource = (await import('../models/elearning/Resource.js')).default;
  Subject = (await import('../models/elearning/Subject.js')).default;
  Assignment = (await import('../models/elearning/Assignment.js')).default;
  Quiz = (await import('../models/elearning/Quiz.js')).default;
  ElearningUser = (await import('../models/elearning/ElearningUser.js')).default;
  AssignmentSubmission = (await import('../models/elearning/AssignmentSubmission.js')).default;
  Media = (await import('../models/elearning/Media.js')).default;
  QuizSubmission = (await import('../models/elearning/QuizSubmission.js')).default;
  StudyPlan = (await import('../models/elearning/StudyPlan.js')).default;
} catch (err) {
  console.warn('MongoDB models not available, using JSON fallback');
}

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

// Helper: Get data from MongoDB with JSON fallback
const getDataWithFallback = async (model, jsonPath, query = {}) => {
  try {
    // Try MongoDB first
    if (model && mongoose.connection.readyState === 1) {
      const data = await model.find(query).lean();
      console.log(`✅ Using MongoDB for ${model.modelName}`);
      return data;
    }
  } catch (err) {
    console.error(`❌ MongoDB error for ${model?.modelName || 'unknown'}`, err);
  }

  // Fallback to JSON
  console.log(`🔄 Using JSON fallback for ${model?.modelName || 'unknown'}`);
  return readJSON(jsonPath);
};

// Helper: Save data to MongoDB with JSON backup
const saveDataWithBackup = async (model, jsonPath, data) => {
  try {
    // Try MongoDB first
    if (model && mongoose.connection.readyState === 1) {
      await model.create(data);
      console.log(`✅ Saved to MongoDB for ${model.modelName}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ MongoDB save error for ${model?.modelName || 'unknown'}`, err);
  }

  // Backup to JSON
  console.log(`🔄 Using JSON backup for ${model?.modelName || 'unknown'}`);
  return writeJSON(jsonPath, data);
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
router.get('/data', async (req, res) => {
  try {
    const data = await getDataWithFallback(
      null, // No specific model for elearning-data
      path.join(__dirname, '..', '..', 'data', 'portal', 'elearning-data.json')
    );
    res.json(data);
  } catch (err) {
    console.error('Error fetching e-learning data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /subjects
 * @desc    Fetches all subjects for the e-learning portal.
 * @access  Public
 */
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await getDataWithFallback(
      Subject,
      path.join(__dirname, '..', '..', 'data', 'portal', 'subjects.json')
    );
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /resources
 * @desc    Fetches all resources for the e-learning portal.
 * @access  Public
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = await getDataWithFallback(
      Resource,
      path.join(__dirname, '..', '..', 'data', 'portal', 'resources.json')
    );
    res.json(resources);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /assignments
 * @desc    Fetches all assignments for the e-learning portal.
 * @access  Public
 */
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await getDataWithFallback(
      Assignment,
      path.join(__dirname, '..', '..', 'data', 'portal', 'assignments.json')
    );
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /quizzes
 * @desc    Fetches all quizzes for the e-learning portal.
 * @access  Public
 */
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await getDataWithFallback(
      Quiz,
      path.join(__dirname, '..', '..', 'data', 'portal', 'quizzes.json')
    );
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /elearning-users
 * @desc    Fetches all e-learning users for the e-learning portal.
 * @access  Protected
 */
router.get('/elearning-users', async (req, res) => {
  try {
    const elearningUsers = await getDataWithFallback(
      ElearningUser,
      path.join(__dirname, '..', '..', 'data', 'portal', 'elearning-users.json')
    );
    res.json(elearningUsers);
  } catch (err) {
    console.error('Error fetching e-learning users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /assignment-submissions
 * @desc    Fetches all assignment submissions for the e-learning portal.
 * @access  Protected
 */
router.get('/assignment-submissions', async (req, res) => {
  try {
    const assignmentSubmissions = await getDataWithFallback(
      AssignmentSubmission,
      path.join(__dirname, '..', '..', 'data', 'portal', 'assignment-submissions.json')
    );
    res.json(assignmentSubmissions);
  } catch (err) {
    console.error('Error fetching assignment submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /quiz-submissions
 * @desc    Fetches all quiz submissions for the e-learning portal.
 * @access  Protected
 */
router.get('/quiz-submissions', async (req, res) => {
  try {
    const quizSubmissions = await getDataWithFallback(
      QuizSubmission,
      path.join(__dirname, '..', '..', 'data', 'portal', 'quiz-submissions.json')
    );
    res.json(quizSubmissions);
  } catch (err) {
    console.error('Error fetching quiz submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /study-plans
 * @desc    Fetches all study plans for the e-learning portal.
 * @access  Protected
 */
router.get('/study-plans', async (req, res) => {
  try {
    const studyPlans = await getDataWithFallback(
      StudyPlan,
      path.join(__dirname, '..', '..', 'data', 'portal', 'study-plans.json')
    );
    res.json(studyPlans);
  } catch (err) {
    console.error('Error fetching study plans:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /media
 * @desc    Fetches all media for the e-learning portal.
 * @access  Public
 */
router.get('/media', async (req, res) => {
  try {
    const media = await getDataWithFallback(
      null, // No specific model for media
      path.join(__dirname, '..', '..', 'data', 'portal', 'media.json')
    );
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
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /media/:id
 * @desc    Fetches a single media item for the e-learning portal.
 * @access  Public
 */
router.get('/media/:id', async (req, res) => {
  try {
    const media = await getDataWithFallback(
      null, // No specific model for media
      path.join(__dirname, '..', '..', 'data', 'portal', 'media.json')
    );
    const item = media.find(item => item.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching media item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /media/:id/download
 * @desc    Downloads a media item for the e-learning portal.
 * @access  Public
 */
router.get('/media/:id/download', async (req, res) => {
  try {
    const media = await getDataWithFallback(
      null, // No specific model for media
      path.join(__dirname, '..', '..', 'data', 'portal', 'media.json')
    );
    const item = media.find(item => item.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.redirect(item.url);
  } catch (err) {
    console.error('Error downloading media item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /study-plans
 * @desc    Fetches all study plans for the e-learning portal.
 * @access  Public
 */
router.get('/study-plans', async (req, res) => {
  try {
    const studyPlans = await getDataWithFallback(
      null, // No specific model for study-plans
      path.join(__dirname, '..', '..', 'data', 'portal', 'study-plans.json')
    );
    res.json(studyPlans);
  } catch (err) {
    console.error('Error fetching study plans:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /notifications
 * @desc    Fetches notifications for the portal.
 * @access  Public
 */
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await getDataWithFallback(
      null, // No specific model for notifications
      path.join(__dirname, '..', '..', 'data', 'notifications.json')
    );
    res.json(notifications || []);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /elearning/upload
 * @desc    Handles resource uploads from teachers in the e-learning portal.
 * @access  Protected (should require teacher/admin role)
 */
router.post('/upload', uploadElearning.array('files', 10), async (req, res) => {
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
  
  // Save to MongoDB with JSON backup
  const saveSuccess = await saveDataWithBackup(
    Resource,
    resourcesFile,
    newResources
  );

  if (!saveSuccess) {
    // If both MongoDB and JSON backup failed, write directly to JSON as last resort
    writeJSON(resourcesFile, resources);
  }

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
router.get('/resources/all', async (req, res) => {
  try {
    const data = await getDataWithFallback(
      null, // No specific model for resources hub
      path.join(__dirname, '..', '..', 'data', 'resources', 'data.json')
    );
    res.json(data);
  } catch (err) {
    console.error('Error fetching resources hub data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /resources/upload
 * @desc    Handles uploads for the main resources hub.
 * @access  Protected
 */
router.post('/resources/upload', uploadDepartmentFile.array('files', 20), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: "No files" });
  }
  
  // In a real app, you would save file metadata to a JSON file or database here.
  // For now, we'll just log and respond
  console.log(`Resource Hub Upload → ${req.files.length} files received.`);
  res.json({ success: true });
});

/**
 * @route   GET /calendar
 * @desc    Fetches calendar events for a specific month and year.
 * @access  Public
 */
router.get('/calendar', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Read calendar data from the JSON file
    const calendarDataPath = path.join(__dirname, '..', '..', 'data', 'static', 'school-calendar.json');
    const calendarData = await getDataWithFallback(
      null, // No specific model for calendar
      calendarDataPath
    );
    
    // Filter events for the specified month and year
    const events = calendarData.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
    });
    
    res.json({ events });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;