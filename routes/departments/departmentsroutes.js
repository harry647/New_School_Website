/**
 * @route   GET /cocurriculum/data
 * @desc    Fetches main data for the co-curriculum page.
 * @access  Protected
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import mongoose from 'mongoose';

// Import MongoDB models
import AppliedScience from '../../models/departments/AppliedScience.js';
import Humanities from '../../models/departments/Humanities.js';
import HumanitiesForum from '../../models/departments/HumanitiesForum.js';
import HumanitiesPoll from '../../models/departments/HumanitiesPoll.js';
import Languages from '../../models/departments/Languages.js';
import LanguagesForum from '../../models/departments/LanguagesForum.js';
import LanguagesPoll from '../../models/departments/LanguagesPoll.js';
import Mathematics from '../../models/departments/Mathematics.js';
import MathematicsQuestion from '../../models/departments/MathematicsQuestion.js';
import Science from '../../models/departments/Science.js';
import Resource from '../../models/departments/Resource.js';
import Guidance from '../../models/departments/Guidance.js';
import GuidanceAnonymous from '../../models/departments/GuidanceAnonymous.js';
import GuidanceAppointment from '../../models/departments/GuidanceAppointment.js';
import Welfare from '../../models/departments/Welfare.js';
import WelfareRequest from '../../models/departments/WelfareRequest.js';

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

// Helper: Fetch data from MongoDB with fallback to JSON
const fetchData = async (model, jsonFilePath) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await model.find({});
      console.log(`✅ Fetched ${data.length} records from MongoDB using model: ${model.modelName}`);
      return data;
    } else {
      console.log('⚠️ MongoDB not connected. Falling back to JSON.');
      return readJSON(jsonFilePath);
    }
  } catch (err) {
    console.error(`❌ Error fetching from MongoDB: ${err.message}. Falling back to JSON.`);
    return readJSON(jsonFilePath);
  }
};

// Helper: Save data to MongoDB with fallback to JSON
const saveData = async (model, jsonFilePath, data) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await model.deleteMany({}); // Clear existing data
      if (Array.isArray(data)) {
        await model.insertMany(data);
      } else {
        await model.create(data);
      }
      console.log(`✅ Saved data to MongoDB using model: ${model.modelName}`);
      return true;
    } else {
      console.log('⚠️ MongoDB not connected. Falling back to JSON.');
      return writeJSON(jsonFilePath, data);
    }
  } catch (err) {
    console.error(`❌ Error saving to MongoDB: ${err.message}. Falling back to JSON.`);
    return writeJSON(jsonFilePath, data);
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

router.get('/cocurriculum/data', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'cocurriculum', 'data.json');
    const data = await fetchData(AppliedScience, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching cocurriculum data:', err);
    res.status(500).json({ success: false, message: 'Failed to load cocurriculum data' });
  }
});

/**
 * @route   POST /cocurriculum/join
 * @desc    Handles a student's application to join a co-curricular activity.
 * @access  Protected
 */
router.post('/cocurriculum/join', async (req, res) => {
  try {
    const data = req.body;
    const file = path.join(__dirname, '..', '..', 'data', 'cocurriculum-joins.json');
    let joins = await fetchData(AppliedScience, file);
    joins.push({ ...data, submitted_at: new Date().toISOString() });
    await saveData(AppliedScience, file, joins);
    res.json({ success: true });
  } catch (err) {
    console.error('Error processing cocurriculum join:', err);
    res.status(500).json({ success: false, message: 'Failed to process join request' });
  }
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
router.get('/applied-sciences', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'applied-sciences-data.json');
    const data = await fetchData(AppliedScience, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching applied sciences data:', err);
    res.status(500).json({ success: false, message: 'Failed to load applied sciences data' });
  }
});
router.post('/applied-sciences/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Applied Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Humanities ---
router.get('/humanities', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-data.json');
    const data = await fetchData(Humanities, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching humanities data:', err);
    res.status(500).json({ success: false, message: 'Failed to load humanities data' });
  }
});
router.get('/humanities/forum', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-forum.json');
    const posts = await fetchData(HumanitiesForum, jsonFilePath);
    res.json(posts.slice(0, 50)); // Return latest 50
  } catch (err) {
    console.error('Error fetching humanities forum:', err);
    res.status(500).json({ success: false, message: 'Failed to load humanities forum' });
  }
});
router.post('/humanities/forum', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
    const file = path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-forum.json');
    let posts = await fetchData(HumanitiesForum, file);
    posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
    await saveData(HumanitiesForum, file, posts);
    res.json({ success: true });
  } catch (err) {
    console.error('Error posting to humanities forum:', err);
    res.status(500).json({ success: false, message: 'Failed to post to forum' });
  }
});
router.post('/humanities/poll', async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
    const file = path.join(__dirname, '..', '..', 'data', 'departments', 'humanities-poll.json');
    let poll = await fetchData(HumanitiesPoll, file);
    poll[subject] = (poll[subject] || 0) + 1;
    await saveData(HumanitiesPoll, file, poll);
    res.json({ success: true });
  } catch (err) {
    console.error('Error processing humanities poll:', err);
    res.status(500).json({ success: false, message: 'Failed to process poll' });
  }
});
router.post('/humanities/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Humanities Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Languages ---
router.get('/languages', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'languages-data.json');
    const data = await fetchData(Languages, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching languages data:', err);
    res.status(500).json({ success: false, message: 'Failed to load languages data' });
  }
});
router.get('/languages/forum', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', 'data', 'departments', 'languages-forum.json');
    const posts = await fetchData(LanguagesForum, jsonFilePath);
    res.json(posts.slice(0, 50)); // Return latest 50
  } catch (err) {
    console.error('Error fetching languages forum:', err);
    res.status(500).json({ success: false, message: 'Failed to load languages forum' });
  }
});
router.post('/languages/forum', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
    const file = path.join(__dirname, '..', '..', 'data', 'departments', 'languages-forum.json');
    let posts = await fetchData(LanguagesForum, file);
    posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
    await saveData(LanguagesForum, file, posts);
    res.json({ success: true });
  } catch (err) {
    console.error('Error posting to languages forum:', err);
    res.status(500).json({ success: false, message: 'Failed to post to forum' });
  }
});
router.post('/languages/poll', async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
    const file = path.join(__dirname, '..', '..', 'data', 'departments', 'languages-poll.json');
    let poll = await fetchData(LanguagesPoll, file);
    poll[subject] = (poll[subject] || 0) + 1;
    await saveData(LanguagesPoll, file, poll);
    res.json({ success: true });
  } catch (err) {
    console.error('Error processing languages poll:', err);
    res.status(500).json({ success: false, message: 'Failed to process poll' });
  }
});
router.post('/languages/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Languages Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Mathematics ---
router.get('/mathematics', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'math-data.json');
    const data = await fetchData(Mathematics, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching mathematics data:', err);
    res.status(500).json({ success: false, message: 'Failed to load mathematics data' });
  }
});
router.post('/mathematics/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files uploaded" });
  console.log(`Mathematics Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Mathematics Ask Question ---
router.post('/mathematics/ask', async (req, res) => {
  try {
    const { question, teacher } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }
  
    const file = path.join(__dirname, '..', '..', 'data', 'departments', 'math-questions.json');
    let questions = await fetchData(MathematicsQuestion, file);
  
    questions.push({
      id: Date.now(),
      question,
      teacher: teacher || "Any Teacher",
      timestamp: new Date().toISOString()
    });
  
    await saveData(MathematicsQuestion, file, questions);
    console.log(`Mathematics Question → ${question.substring(0, 50)}...`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error processing mathematics question:', err);
    res.status(500).json({ success: false, message: 'Failed to process question' });
  }
});

// --- Sciences ---
router.get('/science', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'science-data.json');
    const data = await fetchData(Science, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching science data:', err);
    res.status(500).json({ success: false, message: 'Failed to load science data' });
  }
});
router.post('/science/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Resources ---
router.get('/resources/all', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'resources-data.json');
    const data = await fetchData(Resource, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching resources data:', err);
    res.status(500).json({ success: false, message: 'Failed to load resources data' });
  }
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
router.get('/guidance/data', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'guidance-data.json');
    const data = await fetchData(Guidance, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching guidance data:', err);
    res.status(500).json({ success: false, message: 'Failed to load guidance data' });
  }
});
router.get('/guidance/anonymous', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'guidance-anonymous.json');
    const posts = await fetchData(GuidanceAnonymous, jsonFilePath);
    res.json(posts.slice(0, 20)); // Return latest 20
  } catch (err) {
    console.error('Error fetching guidance anonymous posts:', err);
    res.status(500).json({ success: false, message: 'Failed to load guidance posts' });
  }
});
router.post('/guidance/anonymous', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
    const file = path.join(__dirname, '..', '..', 'data', 'guidance-anonymous.json');
    let posts = await fetchData(GuidanceAnonymous, file);
    posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
    await saveData(GuidanceAnonymous, file, posts);
    res.json({ success: true });
  } catch (err) {
    console.error('Error posting to guidance anonymous:', err);
    res.status(500).json({ success: false, message: 'Failed to post to guidance' });
  }
});
router.post('/guidance/appointment', async (req, res) => {
  try {
    const data = req.body;
    const file = path.join(__dirname, '..', '..', 'data', 'guidance-appointments.json');
    let appointments = await fetchData(GuidanceAppointment, file);
    appointments.push({ ...data, submitted_at: new Date().toISOString(), status: "pending" });
    await saveData(GuidanceAppointment, file, appointments);
    res.json({ success: true });
  } catch (err) {
    console.error('Error processing guidance appointment:', err);
    res.status(500).json({ success: false, message: 'Failed to process appointment' });
  }
});
router.post('/guidance/upload', uploadGuidanceResource.array('resources', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  res.json({ success: true });
});

// --- Welfare ---
router.get('/welfare/data', async (req, res) => {
  try {
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'departments', 'welfare-data.json');
    const data = await fetchData(Welfare, jsonFilePath);
    res.json(data);
  } catch (err) {
    console.error('Error fetching welfare data:', err);
    res.status(500).json({ success: false, message: 'Failed to load welfare data' });
  }
});
router.post('/welfare/request', uploadWelfareAttachment.array('attachments', 10), async (req, res) => {
  try {
    const { userType, name, email, supportType, description } = req.body;

    if (!email || !supportType || !description) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const file = path.join(__dirname, '..', '..', 'data', 'departments', 'welfare-requests.json');
    let requests = await fetchData(WelfareRequest, file);

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

    await saveData(WelfareRequest, file, requests);
    console.log(`Welfare Request → ${name || 'Anonymous'} | ${supportType}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error processing welfare request:', err);
    res.status(500).json({ success: false, message: 'Failed to process welfare request' });
  }
});

export default router;