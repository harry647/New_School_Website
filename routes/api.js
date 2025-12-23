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

/* ==================== USER & AUTH ==================== */
router.get('/profile', requireAuth, (req, res) => {
  const { password, ...safeUser } = req.session.user;
  res.json({ success: true, user: safeUser });
});

router.put('/profile', requireAuth, uploadImage.single('photo'), (req, res) => {
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const index = users.findIndex(u => u.id === req.session.user.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

  const updates = req.body;
  if (req.file) updates.photo = `/uploads/images/${req.file.filename}`;

  users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
  if (writeJSON(path.join(__dirname, '..', 'data', 'users.json'), users)) {
    req.session.user = users[index];
    const { password, ...safeUser } = users[index];
    res.json({ success: true, user: safeUser, message: 'Profile updated!' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save profile' });
  }
});


// =================================================================
// FORM SUBMISSION ENDPOINTS
// =================================================================

/**
 * @route   POST /submit-enquiry
 * @desc    Handles homepage quick enquiry form submissions.
 * @access  Public
 */
router.post('/submit-enquiry', (req, res) => {
  const { studentName, parentPhone, email } = req.body;

  if (!studentName || !parentPhone) {
    return res.status(400).json({ success: false, message: 'Name and phone required.' });
  }

  if (!/^0[0-9]{9}$/.test(parentPhone)) {
    return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number.' });
  }

  const file = path.join(__dirname, '..', 'data', 'enquiries.json');
  const enquiries = readJSON(file);

  enquiries.push({
    id: Date.now().toString(),
    studentName: studentName.trim(),
    parentPhone: parentPhone.trim(),
    email: email?.trim() || null,
    submittedAt: new Date().toISOString(),
    status: 'new'
  });

  if (writeJSON(file, enquiries)) {
    console.log(`Enquiry → ${studentName} | ${parentPhone}`);
    res.json({ success: true, message: 'Enquiry received!' });
  } else {
    res.status(500).json({ success: false, message: 'Server error saving enquiry.' });
  }
});

/**
 * @route   POST /submit-application
 * @desc    Handles the full admission application form.
 * @access  Public
 */
router.post('/submit-application', (req, res) => {
  const { student_name, dob, gender, grade, parent_name, _replyto: email, phone, previous_school, message } = req.body;

  if (!student_name || !dob || !gender || !grade || !parent_name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'All required fields needed.' });
  }

  if (!/^(\+254|0)[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number.' });
  }

  const file = path.join(__dirname, '..', 'data', 'applications.json');
  const apps = readJSON(file);

  apps.push({
    id: Date.now().toString(),
    student_name: student_name.trim(),
    date_of_birth: dob,
    gender,
    grade_pathway: grade,
    parent_name: parent_name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    previous_school: previous_school?.trim() || null,
    special_notes: message?.trim() || null,
    submitted_at: new Date().toISOString(),
    status: "pending"
  });

  writeJSON(file, apps);
  console.log(`Application → ${student_name} | ${grade}`);
  res.json({ success: true, message: "Application received!" });
});

/**
 * @route   POST /contact
 * @desc    Handles the main contact form.
 * @access  Public
 */
router.post('/contact', (req, res) => {
  const { name, _replyto: email, phone, subject, department, message, followup } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Required fields missing.' });
  }

  const file = path.join(__dirname, '..', 'data', 'contacts.json');
  const contacts = readJSON(file);

  contacts.push({
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    subject,
    department: department || "General",
    message: message.trim(),
    preferred_contact: followup || "Any",
    submitted_at: new Date().toISOString(),
    status: "new"
  });

  writeJSON(file, contacts);
  console.log(`Contact → ${name} | ${subject}`);
  res.json({ success: true, message: "Message received!" });
});

/**
 * @route   POST /submit-blog
 * @desc    Handles student blog submissions with an image upload.
 * @access  Public
 */
router.post('/submit-blog', uploadBlogImage.single('image'), (req, res) => {
  const { author_name, grade, email, title, topic, content, consent } = req.body;

  if (!author_name || !grade || !email || !title || !topic || !content || !consent) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  const file = path.join(__dirname, '..', 'data', 'pending-blogs.json');
  const pending = readJSON(file);

  pending.push({
    id: Date.now().toString(),
    author_name: author_name.trim(),
    grade,
    email: email.toLowerCase().trim(),
    title: title.trim(),
    topic: topic.toLowerCase(),
    content: content.trim(),
    image: req.file ? `/uploads/blogs/${req.file.filename}` : null,
    submitted_at: new Date().toISOString(),
    status: "pending"
  });

  writeJSON(file, pending);
  console.log(`Blog Submission → ${author_name} | ${title}`);
  res.json({ success: true, message: "Blog submitted for review!" });
});

/**
 * @route   POST /book-counseling
 * @desc    Handles career counseling booking with optional resume upload.
 * @access  Public
 */
router.post('/book-counseling', uploadResume.single('resume'), (req, res) => {
  const { student_name, grade, parent_name, phone, _replyto: email, date: preferred_date, query } = req.body;

  if (!student_name || !grade || !phone || !email || !preferred_date || !query) {
    return res.status(400).json({ success: false, message: "All required fields needed." });
  }

  if (!/^(\+254|0)[71]\d{8}$/.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ success: false, message: "Invalid Kenyan phone." });
  }

  const file = path.join(__dirname, '..', 'data', 'counseling-bookings.json');
  const bookings = readJSON(file);

  bookings.push({
    id: Date.now().toString(),
    student_name: student_name.trim(),
    grade,
    parent_name: parent_name?.trim() || null,
    phone: phone.trim(),
    email: email.toLowerCase().trim(),
    preferred_date,
    query: query.trim(),
    resume_path: req.file ? `/uploads/resumes/${req.file.filename}` : null,
    submitted_at: new Date().toISOString(),
    status: "pending"
  });

  writeJSON(file, bookings);
  console.log(`Counseling Booking → ${student_name} on ${preferred_date}`);
  res.json({ success: true, message: "Booking received!" });
});

/**
 * @route   POST /donate
 * @desc    Handles donation form submissions with optional document upload.
 * @access  Public
 */
router.post('/donate', uploadDonationDoc.single('attachment'), (req, res) => {
  const { donor_name, _replyto: email, phone, amount, purpose, organization, message } = req.body;

  if (!donor_name || !email || !amount || !purpose) {
    return res.status(400).json({ success: false, message: "Required fields missing." });
  }

  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum < 50) {
    return res.status(400).json({ success: false, message: "Minimum donation is Ksh 50." });
  }

  const file = path.join(__dirname, '..', 'data', 'donations.json');
  const donations = readJSON(file);

  donations.unshift({
    id: Date.now().toString(),
    donor_name: donor_name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || null,
    amount: amountNum,
    purpose: purpose.trim(),
    organization: organization?.trim() || null,
    message: message?.trim() || null,
    attachment: req.file ? `/uploads/donations/${req.file.filename}` : null,
    submitted_at: new Date().toISOString(),
    payment_status: "pending"
  });

  writeJSON(file, donations);
  console.log(`Donation → ${donor_name} | Ksh ${amountNum}`);
  res.json({ success: true, message: "Donation recorded! Thank you for your generosity." });
});

/**
 * @route   POST /subscribe
 * @desc    Handles newsletter subscription form.
 * @access  Public
 */
router.post('/subscribe', (req, res) => {
  let { _replyto: email, name, 'preferences[]': prefs } = req.body;

  const preferences = Array.isArray(prefs) ? prefs : (prefs ? [prefs] : []);

  if (!email?.trim()) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: "Invalid email format." });
  }

  const file = path.join(__dirname, '..', 'data', 'subscribers.json');
  let list = readJSON(file);

  if (list.some(s => s.email === cleanEmail)) {
    return res.json({ success: true, message: "Already subscribed!" });
  }

  list.push({
    id: Date.now().toString(),
    email: cleanEmail,
    name: name?.trim() || null,
    preferences,
    subscribed_at: new Date().toISOString(),
    source: "website",
    status: "active"
  });

  writeJSON(file, list);
  console.log(`New Subscriber → ${cleanEmail}`);
  res.json({ success: true, message: "Subscription successful!" });
});


// =================================================================
// GENERAL & USER-RELATED ROUTES
// =================================================================

/**
 * @route   GET /notifications
 * @desc    Fetches a list of general notifications.
 * @access  Public
 */
router.get('/notifications', (req, res) => {
  const notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json'));
  res.json(notifications || []);
});

/**
 * @route   GET /users/:id
 * @desc    Fetches a single user's profile by ID.
 * @access  Public (should be protected in a real app)
 */
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const user = users.find(u => u.id.toString() === id.toString());

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // IMPORTANT: Never send the password hash or plain text password in a response.
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

/**
 * @route   PUT /users/:id
 * @desc    Updates a user's profile.
 * @access  Protected (should have middleware to check if user is updating their own profile or is an admin)
 */
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  const users = readJSON(usersFile);

  const index = users.findIndex(u => u.id.toString() === id.toString());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Update only provided fields
  if (name) users[index].name = name.trim();
  if (email) users[index].email = email.toLowerCase().trim();
  // SECURITY WARNING: Passwords should be hashed using a library like bcrypt before saving.
  // This is a major security risk in its current state.
  if (password) users[index].password = password;
  if (role) users[index].role = role;

  if (!writeJSON(usersFile, users)) {
    return res.status(500).json({ success: false, message: 'Failed to save changes.' });
  }

  const { password: _, ...updatedUser } = users[index];

  console.log(`User Updated → ID: ${id} | Name: ${updatedUser.name}`);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

/**
 * @route   GET /dashboard
 * @desc    Provides a redirect URL based on the logged-in user's role.
 * @access  Protected (relies on session)
 */
router.get('/dashboard', (req, res) => {
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized – Please log in' });
  }

  const redirects = {
  clubs: {
    student: '/portal/clubs.html',
    teacher: '/portal/clubs.html',
    admin: '/portal/clubs.html'
  },
  'e-learning': {
    student: '/portal/e-learning-portal.html',
    teacher: '/portal/e-learning-portal.html',
    admin: '/portal/e-learning-portal.html'
  }
};


  const redirectUrl = redirects[user.role] || '/user/profile.html';

  res.json({
    success: true,
    redirect: redirectUrl,
    message: `Welcome back, ${user.name || user.email}!`
  });
});


// =================================================================
// E-LEARNING ROUTES
// =================================================================

/**
 * @route   GET /elearning/data
 * @desc    Fetches all data for the main e-learning portal.
 * @access  Protected
 */
router.get('/elearning/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  res.json(data);
});

/**
 * @route   GET /notifications
 * @desc    Fetches notifications for the portal.
 * @access  Public
 */
router.get('/notifications', (req, res) => {
  const notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json'));
  res.json(notifications || []);
});

/**
 * @route   POST /elearning/upload
 * @desc    Handles resource uploads from teachers in the e-learning portal.
 * @access  Protected (should require teacher/admin role)
 */
router.post('/elearning/upload', uploadElearning.array('files', 10), (req, res) => {
  const { title, subject, type, description } = req.body;
  const teacher = req.session?.user?.name || "Teacher";

  if (!title || !subject || !type) {
    return res.status(400).json({ success: false, message: "Missing required fields: title, subject, and type." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files were uploaded." });
  }

  const resourcesFile = path.join(__dirname, '..', 'data', 'portal', 'resources.json');
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
// CLUBS & CO-CURRICULUM ROUTES
// =================================================================

/**
 * @route   GET /clubs/list
 * @desc    Fetches the list of all clubs.
 * @access  Protected
 */
router.get('/clubs/list', requireAuth, (req, res) => {
  try {
    const clubsFile = path.join(__dirname, '..', 'data', 'clubs', 'clubs.json');
    const clubs = readJSON(clubsFile);

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
 * @route   GET /clubs/events
 * @desc    Fetches all scheduled club events.
 * @access  Protected
 */
router.get('/clubs/events', requireAuth, (req, res) => {
  try {
    const eventsFile = path.join(__dirname, '..', 'data', 'clubs', 'events.json');
    const events = readJSON(eventsFile);

    if (!Array.isArray(events)) {
      return res.status(500).json({
        success: false,
        message: "Invalid events data format"
      });
    }

    // Filter out past events and sort by date
    const now = new Date();
    const upcomingEvents = events
      .map(group => ({
        ...group,
        events: group.events.filter(event => new Date(event.date) >= now)
      }))
      .filter(group => group.events.length > 0)
      .sort((a, b) => {
        const aDate = new Date(a.events[0].date);
        const bDate = new Date(b.events[0].date);
        return aDate - bDate;
      });

    console.log(`Events fetched by user: ${req.session.user?.name || 'Unknown'}`);

    res.json({
      success: true,
      data: upcomingEvents,
      totalEvents: upcomingEvents.reduce((sum, group) => sum + group.events.length, 0)
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
 * @route   GET /clubs/events/public
 * @desc    Fetches all scheduled club events (public access).
 * @access  Public
 */
router.get('/clubs/events/public', (req, res) => {
  try {
    const eventsFile = path.join(__dirname, '..', 'data', 'clubs', 'events.json');
    const events = readJSON(eventsFile);

    if (!Array.isArray(events)) {
      return res.status(500).json({
        success: false,
        message: "Invalid events data format"
      });
    }

    // Filter out past events and sort by date
    const now = new Date();
    const upcomingEvents = events
      .map(group => ({
        ...group,
        events: group.events.filter(event => new Date(event.date) >= now)
      }))
      .filter(group => group.events.length > 0)
      .sort((a, b) => {
        const aDate = new Date(a.events[0].date);
        const bDate = new Date(b.events[0].date);
        return aDate - bDate;
      });

    console.log('Public events fetched');

    res.json({
      success: true,
      data: upcomingEvents,
      totalEvents: upcomingEvents.reduce((sum, group) => sum + group.events.length, 0)
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
 * @route   POST /clubs/join
 * @desc    Handles a student's application to join a club.
 * @access  Protected
 */
router.post('/clubs/join', requireAuth, (req, res) => {
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

    const file = path.join(__dirname, '..', 'data', 'club-joins.json');
    let joins = readJSON(file);

    // Check for duplicate applications
    const existing = joins.find(j =>
      j.email.toLowerCase() === email.toLowerCase() &&
      j.clubId === clubId &&
      j.status === 'pending'
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending application for this club."
      });
    }

    const application = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      form: form || null,
      phone: phone?.trim() || null,
      clubName: clubName.trim(),
      clubId: clubId.trim(),
      reason: reason?.trim() || null,
      submitted_at: new Date().toISOString(),
      status: 'pending',
      userId: req.session.user?.id
    };

    joins.push(application);

    if (!writeJSON(file, joins)) {
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
 * @route   POST /clubs/upload
 * @desc    Handles file submissions for a specific club.
 * @access  Protected
 */
router.post('/clubs/upload', requireAuth, uploadClubSubmission.array('files', 20), (req, res) => {
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

/**
 * @route   GET /cocurriculum/data
 * @desc    Fetches main data for the co-curriculum page.
 * @access  Protected
 */
router.get('/cocurriculum/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'cocurriculum', 'data.json'));
  res.json(data);
});

/**
 * @route   POST /cocurriculum/join
 * @desc    Handles a student's application to join a co-curricular activity.
 * @access  Protected
 */
router.post('/cocurriculum/join', (req, res) => {
  const data = req.body;
  const file = path.join(__dirname, '..', 'data', 'cocurriculum-joins.json');
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
router.get('/departments/applied-sciences', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'applied-sciences-data.json'));
  res.json(data);
});
router.post('/departments/applied-sciences/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Applied Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Humanities ---
router.get('/departments/humanities', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'humanities-data.json'));
  res.json(data);
});
router.get('/departments/humanities/forum', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', 'data', 'departments', 'humanities-forum.json'));
  res.json(posts.slice(0, 50)); // Return latest 50
});
router.post('/departments/humanities/forum', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', 'data', 'departments', 'humanities-forum.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});
router.post('/departments/humanities/poll', (req, res) => {
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
  const file = path.join(__dirname, '..', 'data', 'departments', 'humanities-poll.json');
  let poll = readJSON(file);
  poll[subject] = (poll[subject] || 0) + 1;
  writeJSON(file, poll);
  res.json({ success: true });
});
router.post('/departments/humanities/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Humanities Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Languages ---
router.get('/departments/languages', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'languages-data.json'));
  res.json(data);
});
router.get('/departments/languages/forum', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', 'data', 'departments', 'languages-forum.json'));
  res.json(posts.slice(0, 50)); // Return latest 50
});
router.post('/departments/languages/forum', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', 'data', 'departments', 'languages-forum.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});
router.post('/departments/languages/poll', (req, res) => {
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
  const file = path.join(__dirname, '..', 'data', 'departments', 'languages-poll.json');
  let poll = readJSON(file);
  poll[subject] = (poll[subject] || 0) + 1;
  writeJSON(file, poll);
  res.json({ success: true });
});
router.post('/departments/languages/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Languages Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Mathematics ---
router.get('/departments/mathematics', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'math-data.json'));
  res.json(data);
});
router.post('/departments/mathematics/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files uploaded" });
  console.log(`Mathematics Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Sciences ---
router.get('/departments/science', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'science.json'));
  res.json(data);
});
router.post('/departments/science/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});


// =================================================================
// GUIDANCE & WELFARE ROUTES
// =================================================================

// --- Guidance & Counseling ---
router.get('/guidance/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'guidance', 'data.json'));
  res.json(data);
});
router.get('/guidance/anonymous', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', 'data', 'guidance-anonymous.json'));
  res.json(posts.slice(0, 20)); // Return latest 20
});
router.post('/guidance/anonymous', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', 'data', 'guidance-anonymous.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});
router.post('/guidance/appointment', (req, res) => {
  const data = req.body;
  const file = path.join(__dirname, '..', 'data', 'guidance-appointments.json');
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
  const data = readJSON(path.join(__dirname, '..', 'data', 'welfare', 'data.json'));
  res.json(data);
});
router.post('/welfare/request', uploadWelfareAttachment.array('attachments', 10), (req, res) => {
  const { userType, name, email, supportType, description } = req.body;

  if (!email || !supportType || !description) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  const file = path.join(__dirname, '..', 'data', 'welfare-requests.json');
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


// =================================================================
// SCHOOL-WIDE RESOURCES HUB
// =================================================================

/**
 * @route   GET /resources/all
 * @desc    Fetches all data for the main resources hub.
 * @access  Protected
 */
router.get('/resources/all', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'resources', 'data.json'));
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


export default router;