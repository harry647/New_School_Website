// =================================================================
// CLUBS & CO-CURRICULUM ROUTES
// =================================================================

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import mongoose from 'mongoose';

// Import club models
import Club from '../../models/clubs/Club.js';
import Event from '../../models/clubs/Event.js';
import Leader from '../../models/clubs/Leader.js';
import Testimonial from '../../models/clubs/Testimonial.js';
import ClubJoin from '../../models/clubs/ClubJoin.js';

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
const fetchData = async (model, collectionName, jsonFilePath) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await model.find({});
      console.log(`✅ Fetched ${data.length} records from MongoDB collection: ${collectionName}`);
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
const saveData = async (model, collectionName, jsonFilePath, data) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await model.deleteMany({}); // Clear existing data
      if (Array.isArray(data)) {
        await model.insertMany(data);
      } else {
        await model.create(data);
      }
      console.log(`✅ Saved data to MongoDB collection: ${collectionName}`);
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

const uploadClubSubmission = createUploader('clubs/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

/**
 * @route   GET /list
 * @desc    Fetches the list of all clubs.
 * @access  Protected
 */
router.get('/list', requireAuth, async (req, res) => {
  try {
    const clubsFile = path.join(__dirname, '..', '..', 'data', 'clubs', 'clubs.json');
    const clubs = await fetchData(Club, 'clubs', clubsFile);

    if (!Array.isArray(clubs)) {
      return res.status(500).json({
        success: false,
        message: "Invalid clubs data format"
      });
    }

    // Log successful fetch
    console.log(`Clubs list fetched by user: ${req.session.user?.name || 'Unknown'}`);

    res.json({
      success: true,
      data: clubs,
      count: clubs.length
    });
  } catch (err) {
    console.error('Error fetching clubs list:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load clubs data"
    });
  }
});

/**
 * @route   GET /events
 * @desc    Fetches all scheduled club events.
 * @access  Protected
 */
router.get('/events', requireAuth, async (req, res) => {
  try {
    const eventsFile = path.join(__dirname, '..', '..', 'data', 'clubs', 'events.json');
    let events = await fetchData(Event, 'events', eventsFile);

    // Handle nested structure in JSON fallback
    if (Array.isArray(events) && events.length > 0 && events[0].clubId && events[0].events) {
      // Flatten nested structure for compatibility with MongoDB model
      events = events.flatMap(clubEvents =>
        clubEvents.events.map(event => ({
          ...event,
          clubId: clubEvents.clubId
        }))
      );
    }

    if (!Array.isArray(events)) {
      return res.status(500).json({
        success: false,
        message: "Invalid events data format"
      });
    }

    // Filter out past events and sort by date
    const now = new Date();
    const upcomingEvents = events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(`Events fetched by user: ${req.session.user?.name || 'Unknown'}`);

    res.json({
      success: true,
      data: upcomingEvents,
      totalEvents: upcomingEvents.length
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load events data"
    });
  }
});

/**
 * @route   GET /events/public
 * @desc    Fetches all scheduled club events (public access).
 * @access  Public
 */
router.get('/events/public', async (req, res) => {
  try {
    const eventsFile = path.join(__dirname, '..', '..', 'data', 'clubs', 'events.json');
    let events = await fetchData(Event, 'events', eventsFile);

    // Handle nested structure in JSON fallback
    if (Array.isArray(events) && events.length > 0 && events[0].clubId && events[0].events) {
      // Flatten nested structure for compatibility with MongoDB model
      events = events.flatMap(clubEvents =>
        clubEvents.events.map(event => ({
          ...event,
          clubId: clubEvents.clubId,
          isPublic: event.isPublic || true // Default to public if not specified
        }))
      );
    }

    if (!Array.isArray(events)) {
      return res.status(500).json({
        success: false,
        message: "Invalid events data format"
      });
    }

    // Filter out past events and sort by date
    const now = new Date();
    const upcomingEvents = events
      .filter(event => new Date(event.date) >= now && event.isPublic)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Public events fetched');

    res.json({
      success: true,
      data: upcomingEvents,
      totalEvents: upcomingEvents.length
    });
  } catch (err) {
    console.error('Error fetching public events:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load events data"
    });
  }
});

/**
 * @route   POST /join
 * @desc    Handles a student's application to join a club.
 * @access  Protected
 */
router.post('/join', requireAuth, async (req, res) => {
  try {
    const { name, email, form, phone, clubName, clubId, reason } = req.body;

    // Validation
    if (!name?.trim() || !email?.trim() || !clubName?.trim() || !clubId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and club information are required."
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format."
      });
    }

    // Phone validation (Kenyan format)
    if (phone && !/^(\+254|0)[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format."
      });
    }

    const file = path.join(__dirname, '..', '..', 'data', 'club-joins.json');
    let joins = await fetchData(ClubJoin, 'club-joins', file);

    // Check for duplicate applications
    const existing = joins.find(j =>
      j.email.toLowerCase() === email.toLowerCase() &&
      j.clubId.toString() === clubId &&
      j.status === 'pending'
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending application for this club."
      });
    }

    const application = {
      clubId: clubId.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      form: form || null,
      phone: phone?.trim() || null,
      clubName: clubName.trim(),
      reason: reason?.trim() || null,
      submitted_at: new Date().toISOString(),
      status: 'pending',
      userId: req.session.user?.id
    };

    joins.push(application);

    if (!await saveData(ClubJoin, 'club-joins', file, joins)) {
      throw new Error('Failed to save application');
    }

    console.log(`Club Join Application → ${name} for ${clubName}`);

    res.json({
      success: true,
      message: "Application submitted successfully! We'll contact you soon.",
      applicationId: application.id
    });
  } catch (err) {
    console.error('Error processing club join:', err);
    res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again."
    });
  }
});

/**
 * @route   GET /leaders
 * @desc    Fetches club leaders information
 * @access  Public
 */
router.get('/leaders', async (req, res) => {
  try {
    const leadersFile = path.join(__dirname, '..', '..', 'data', 'clubs', 'leaders.json');
    const leaders = await fetchData(Leader, 'leaders', leadersFile);

    if (!Array.isArray(leaders)) {
      return res.status(500).json({
        success: false,
        message: "Invalid leaders data format"
      });
    }

    console.log('Club leaders fetched');

    res.json({
      success: true,
      data: leaders,
      count: leaders.length
    });
  } catch (err) {
    console.error('Error fetching club leaders:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load leaders data"
    });
  }
});

/**
 * @route   GET /testimonials
 * @desc    Fetches student testimonials about clubs
 * @access  Public
 */
router.get('/testimonials', async (req, res) => {
  try {
    const testimonialsFile = path.join(__dirname, '..', '..', 'data', 'clubs', 'testimonials.json');
    const testimonials = await fetchData(Testimonial, 'testimonials', testimonialsFile);

    if (!Array.isArray(testimonials)) {
      return res.status(500).json({
        success: false,
        message: "Invalid testimonials data format"
      });
    }

    console.log('Club testimonials fetched');

    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (err) {
    console.error('Error fetching club testimonials:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load testimonials data"
    });
  }
});

/**
 * @route   POST /upload
 * @desc    Handles file submissions for a specific club.
 * @access  Protected
 */
router.post('/upload', requireAuth, uploadClubSubmission.array('files', 20), (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded"
      });
    }

    const { clubId } = req.body;
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: "Club ID is required"
      });
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
                         'application/pdf', 'application/msword',
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'];

    const maxSize = 50 * 1024 * 1024; // 50MB per file

    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type: ${file.originalname}. Allowed: images, PDFs, documents, videos, audio.`
        });
      }
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large: ${file.originalname}. Maximum size: 50MB.`
        });
      }
    }

    // Log successful upload
    console.log(`Club Upload → Club ID: ${clubId} | ${req.files.length} files by ${req.session.user?.name || 'Unknown'}`);

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully.`,
      files: req.files.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        mimetype: f.mimetype
      }))
    });
  } catch (err) {
    console.error('Error processing club upload:', err);
    res.status(500).json({
      success: false,
      message: "Upload failed. Please try again."
    });
  }
});

export default router;
