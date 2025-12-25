/**
 * @route   GET /cocurriculum/data
 * @desc    Fetches main data for the co-curriculum page.
 * @access  Protected
 */
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

const uploadCoCurriculumPhoto = createUploader('cocurriculum/', imageExtensions);
const uploadDepartmentFile = createUploader('departments/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);
const uploadGuidanceResource = createUploader('guidance/', documentExtensions);
const uploadWelfareAttachment = createUploader('welfare/', [...documentExtensions, ...imageExtensions]);

router.get('/cocurriculum/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'cocurriculum', 'data.json'));
  res.json(data);
});

/**
 * @route   POST /cocurriculum/join
 * @desc    Handles a student's application to join a co-curricular activity.
 * @access  Protected
 */
router.post('/cocurriculum/join', (req, res) => {
  const data = req.body;
  const file = path.join(__dirname, '..', '..', 'data', 'cocurriculum-joins.json');
  let joins = readJSON(file);
  joins.push({ ...data, submitted_at: new Date().toISOString() });
  writeJSON(file, joins);
  res.json({ success: true });
});

/**
 * @route   POST /cocurriculum/upload
 * @desc    Handles photo uploads for co-curricular activities.
 * @access  Protected
 */
router.post('/cocurriculum/upload', uploadCoCurriculumPhoto.array('photos', 30), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: "No photos uploaded" });
  }
  console.log(`Co-curriculum Upload → ${req.files.length} photos received.`);
  res.json({ success: true });
});


// =================================================================
// DEPARTMENT-SPECIFIC ROUTES
// =================================================================

// --- Applied Sciences ---
router.get('/applied-sciences', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'applied-sciences-data.json'));
  res.json(data);
});
router.post('/applied-sciences/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Applied Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Humanities ---
router.get('/humanities', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-data.json'));
  res.json(data);
});
router.get('/humanities/forum', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-forum.json'));
  res.json(posts.slice(0, 50)); // Return latest 50
});
router.post('/humanities/forum', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-forum.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});
router.post('/humanities/poll', (req, res) => {
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
  const file = path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-poll.json');
  let poll = readJSON(file);
  poll[subject] = (poll[subject] || 0) + 1;
  writeJSON(file, poll);
  res.json({ success: true });
});
router.post('/humanities/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Humanities Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Languages ---
router.get('/languages', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'languages-data.json'));
  res.json(data);
});
router.get('/languages/forum', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', 'data', 'departments', 'languages-forum.json'));
  res.json(posts.slice(0, 50)); // Return latest 50
});
router.post('/languages/forum', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', '..', 'data', 'departments', 'languages-forum.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});
router.post('/languages/poll', (req, res) => {
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
  const file = path.join(__dirname, '..', '..', 'data', 'departments', 'languages-poll.json');
  let poll = readJSON(file);
  poll[subject] = (poll[subject] || 0) + 1;
  writeJSON(file, poll);
  res.json({ success: true });
});
router.post('/languages/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Languages Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Mathematics ---
router.get('/mathematics', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'math-data.json'));
  res.json(data);
});
router.post('/mathematics/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files uploaded" });
  console.log(`Mathematics Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Mathematics Ask Question ---
router.post('/mathematics/ask', (req, res) => {
  const { question, teacher } = req.body;
  if (!question) {
    return res.status(400).json({ success: false, message: "Question is required" });
  }
  
  const file = path.join(__dirname, '..', '..', 'data', 'departments', 'math-questions.json');
  let questions = readJSON(file);
  
  questions.push({
    id: Date.now(),
    question,
    teacher: teacher || "Any Teacher",
    timestamp: new Date().toISOString()
  });
  
  writeJSON(file, questions);
  console.log(`Mathematics Question → ${question.substring(0, 50)}...`);
  res.json({ success: true });
});

// --- Sciences ---
router.get('/science', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'science-data.json'));
  res.json(data);
});
router.post('/science/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Resources ---
router.get('/resources/all', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'resources-data.json'));
  res.json(data);
});

router.post('/resources/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Resources Upload → ${req.files.length} files`);
  res.json({ success: true });
});


// =================================================================
// GUIDANCE & WELFARE ROUTES
// =================================================================

// --- Guidance & Counseling ---
router.get('/guidance/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'departments', 'guidance-data.json'));
  res.json(data);
});
router.get('/guidance/anonymous', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', '..', 'data', 'guidance-anonymous.json'));
  res.json(posts.slice(0, 20)); // Return latest 20
});
router.post('/guidance/anonymous', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', '..', 'data', 'guidance-anonymous.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});
router.post('/guidance/appointment', (req, res) => {
  const data = req.body;
  const file = path.join(__dirname, '..', '..', 'data', 'guidance-appointments.json');
  let appointments = readJSON(file);
  appointments.push({ ...data, submitted_at: new Date().toISOString(), status: "pending" });
  writeJSON(file, appointments);
  res.json({ success: true });
});
router.post('/guidance/upload', uploadGuidanceResource.array('resources', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  res.json({ success: true });
});

// --- Welfare ---
router.get('/welfare/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', '..', 'data', 'welfare', 'data.json'));
  res.json(data);
});
router.post('/welfare/request', uploadWelfareAttachment.array('attachments', 10), (req, res) => {
  const { userType, name, email, supportType, description } = req.body;

  if (!email || !supportType || !description) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'welfare-requests.json');
  let requests = readJSON(file);

  requests.push({
    id: Date.now().toString(),
    userType: userType || "Not specified",
    name: name || "Anonymous",
    email: email.toLowerCase().trim(),
    supportType,
    description: description.trim(),
    attachments: req.files?.map(f => `/uploads/welfare/${f.filename}`) || [],
    submitted_at: new Date().toISOString(),
    status: "new"
  });

  writeJSON(file, requests);
  console.log(`Welfare Request → ${name || 'Anonymous'} | ${supportType}`);
  res.json({ success: true });
});

export default router;