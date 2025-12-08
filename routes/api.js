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

// Configure multer for contact form uploads
const contactUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'contact');
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
router.get('/auth/check', (req, res) => {
  const loggedIn = !!req.session?.user;
  res.json({ loggedIn, user: loggedIn ? req.session.user : null });
});

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
 * @desc    Handles the main contact form with file upload support.
 * @access  Public
 */
router.post('/contact', (req, res) => {
  try {
    // Extract form data from req.body (multipart form data)
    const name = req.body.name;
    const email = req.body._replyto;
    const phone = req.body.phone;
    const subject = req.body.subject;
    const department = req.body.department || "General";
    const message = req.body.message;
    const followup = req.body.followup || "No preference";

    console.log('Contact form data:', { name, email, phone, subject, department, message, followup });

    if (!name || !email || !phone || !subject || !message) {
      console.log('Missing required fields:', { name: !!name, email: !!email, phone: !!phone, subject: !!subject, message: !!message });
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing. Please check name, email, phone, subject, and message.',
        received: { name, email, phone, subject, department, message, followup }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Phone validation (Kenyan format)
    if (!/^(\+254|0)[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number.' });
    }

    const file = path.join(__dirname, '..', 'data', 'contacts.json');
    const contacts = readJSON(file);

    const contactEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      subject,
      department: department || "General",
      message: message.trim(),
      preferred_contact: followup || "No preference",
      attachment: null, // File upload support to be implemented
      submitted_at: new Date().toISOString(),
      status: "new",
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    contacts.push(contactEntry);

    if (!writeJSON(file, contacts)) {
      throw new Error('Failed to save contact data');
    }

    console.log(`Contact Form Submission → ${name} | ${subject} | Email: ${email}`);
    
    res.json({ 
      success: true, 
      message: "Thank you for your message! We'll get back to you within 24 hours.",
      contactId: contactEntry.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your message. Please try again or contact us directly.' 
    });
  }
});

/**
 * @route   GET /contact/stats
 * @desc    Get contact form submission statistics.
 * @access  Public
 */
router.get('/contact/stats', (req, res) => {
  try {
    const file = path.join(__dirname, '..', 'data', 'contacts.json');
    const contacts = readJSON(file);
    
    const stats = {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      read: contacts.filter(c => c.status === 'read').length,
      replied: contacts.filter(c => c.status === 'replied').length,
      thisWeek: contacts.filter(c => {
        const submissionDate = new Date(c.submitted_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return submissionDate >= weekAgo;
      }).length,
      bySubject: contacts.reduce((acc, contact) => {
        acc[contact.subject] = (acc[contact.subject] || 0) + 1;
        return acc;
      }, {}),
      byDepartment: contacts.reduce((acc, contact) => {
        const dept = contact.department || 'General';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

/**
 * @route   GET /contact/submissions
 * @desc    Get all contact form submissions (for admin purposes).
 * @access  Protected (Admin/Teacher)
 */
router.get('/contact/submissions', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    
    // Only allow admin or teacher to view submissions
    if (!['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin or teacher privileges required.' 
      });
    }
    
    const file = path.join(__dirname, '..', 'data', 'contacts.json');
    const contacts = readJSON(file);
    
    // Sort by submission date (newest first)
    const sortedContacts = contacts.sort((a, b) => 
      new Date(b.submitted_at) - new Date(a.submitted_at)
    );
    
    res.json({ 
      success: true, 
      submissions: sortedContacts,
      count: sortedContacts.length 
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
});

/**
 * @route   PUT /contact/submissions/:id
 * @desc    Update contact submission status (Admin/Teacher only).
 * @access  Protected
 */
router.put('/contact/submissions/:id', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Only allow admin or teacher to update submissions
    if (!['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin or teacher privileges required.' 
      });
    }
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be new, read, replied, or archived.' 
      });
    }
    
    const file = path.join(__dirname, '..', 'data', 'contacts.json');
    const contacts = readJSON(file);
    
    const contactIndex = contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Update the submission
    contacts[contactIndex].status = status;
    contacts[contactIndex].updated_at = new Date().toISOString();
    contacts[contactIndex].updated_by = user.name;
    if (notes) {
      contacts[contactIndex].admin_notes = notes;
    }
    
    if (!writeJSON(file, contacts)) {
      throw new Error('Failed to save updated submission');
    }
    
    console.log(`Contact Submission ${id} updated to ${status} by ${user.name}`);
    
    res.json({ 
      success: true, 
      message: `Submission marked as ${status}`,
      submission: contacts[contactIndex]
    });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    res.status(500).json({ success: false, message: 'Failed to update submission' });
  }
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
// Dedicated donation uploader with explicit configuration
const donationUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'donations');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `donation-${unique}${ext}`);
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

router.post('/donate', donationUpload.single('attachment'), (req, res) => {
  try {
    console.log('=== DONATION REQUEST DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('================================');
    
    const { donor_name, _replyto: email, phone, amount, purpose, organization, message } = req.body;

    console.log('Extracted fields:', { donor_name, email, amount, purpose });
    
    if (!donor_name || !email || !amount || !purpose) {
      console.log('Validation failed - missing fields:', { 
        hasDonorName: !!donor_name, 
        hasEmail: !!email, 
        hasAmount: !!amount, 
        hasPurpose: !!purpose 
      });
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

    if (!writeJSON(file, donations)) {
      throw new Error('Failed to save donation data');
    }

    console.log(`Donation → ${donor_name} | Ksh ${amountNum}`);
    res.json({ success: true, message: "Donation recorded! Thank you for your generosity." });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ success: false, message: "Failed to process donation. Please try again." });
  }
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
    clubs: '/portal/clubs.html',
    'e-learning': '/portal/e-learning-portal.html',
    admin: '/admin/dashboard.html',
    teacher: '/portal/teacher-dashboard.html', // Example
    parent: '/portal/parent-dashboard.html',   // Example
    student: '/portal/student-dashboard.html'  // Example
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
 * @route   GET /elearning/subjects
 * @desc    Fetches all subjects/courses for the e-learning portal.
 * @access  Public
 */
router.get('/elearning/subjects', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  res.json({ success: true, subjects: data.subjects || [] });
});

/**
 * @route   GET /elearning/resources
 * @desc    Fetches all learning resources.
 * @access  Public
 */
router.get('/elearning/resources', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { subject, type } = req.query;
  
  let resources = data.resources || [];
  
  if (subject) {
    resources = resources.filter(r => r.subject.toLowerCase() === subject.toLowerCase());
  }
  if (type) {
    resources = resources.filter(r => r.type.toLowerCase() === type.toLowerCase());
  }
  
  res.json({ success: true, resources, count: resources.length });
});

/**
 * @route   GET /elearning/quizzes
 * @desc    Fetches all quizzes for the e-learning portal.
 * @access  Public
 */
router.get('/elearning/quizzes', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { status, subject } = req.query;
  
  let quizzes = data.quizzes || [];
  
  if (status) {
    quizzes = quizzes.filter(q => q.status === status);
  }
  if (subject) {
    quizzes = quizzes.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
  }
  
  res.json({ success: true, quizzes, count: quizzes.length });
});

/**
 * @route   GET /elearning/quiz/:id
 * @desc    Fetches a specific quiz by ID.
 * @access  Public
 */
router.get('/elearning/quiz/:id', (req, res) => {
  const { id } = req.params;
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const quiz = (data.quizzes || []).find(q => q.id === id);
  
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }
  
  res.json({ success: true, quiz });
});

/**
 * @route   POST /elearning/quiz/:id/submit
 * @desc    Submits quiz answers.
 * @access  Protected
 */
router.post('/elearning/quiz/:id/submit', (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const user = req.session?.user;
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Answers are required' });
  }
  
  const submissionsFile = path.join(__dirname, '..', 'data', 'portal', 'quiz-submissions.json');
  let submissions = readJSON(submissionsFile);
  
  const submission = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    quizId: id,
    userId: user?.id || 'anonymous',
    userName: user?.name || 'Student',
    answers,
    submittedAt: new Date().toISOString(),
    status: 'submitted'
  };
  
  submissions.push(submission);
  writeJSON(submissionsFile, submissions);
  
  console.log(`Quiz Submission → ${submission.userName} submitted quiz ${id}`);
  res.json({ success: true, message: 'Quiz submitted successfully!', submissionId: submission.id });
});

/**
 * @route   GET /elearning/assignments
 * @desc    Fetches all assignments for the e-learning portal.
 * @access  Public
 */
router.get('/elearning/assignments', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { status, subject } = req.query;
  
  let assignments = data.assignments || [];
  
  if (status) {
    assignments = assignments.filter(a => a.status === status);
  }
  if (subject) {
    assignments = assignments.filter(a => a.subject.toLowerCase() === subject.toLowerCase());
  }
  
  res.json({ success: true, assignments, count: assignments.length });
});

/**
 * @route   POST /elearning/assignment/submit
 * @desc    Submits an assignment with file upload.
 * @access  Protected
 */
router.post('/elearning/assignment/submit', uploadElearning.array('files', 5), (req, res) => {
  const { assignmentId, notes } = req.body;
  const user = req.session?.user;
  
  if (!assignmentId) {
    return res.status(400).json({ success: false, message: 'Assignment ID is required' });
  }
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one file is required' });
  }
  
  const submissionsFile = path.join(__dirname, '..', 'data', 'portal', 'assignment-submissions.json');
  let submissions = readJSON(submissionsFile);
  
  const submission = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    assignmentId,
    userId: user?.id || 'anonymous',
    userName: user?.name || 'Student',
    userEmail: user?.email || 'student@school.edu',
    notes: notes?.trim() || '',
    files: req.files.map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      size: formatFileSize(f.size),
      url: `/uploads/elearning/${f.filename}`
    })),
    submittedAt: new Date().toISOString(),
    status: 'submitted'
  };
  
  submissions.push(submission);
  writeJSON(submissionsFile, submissions);
  
  console.log(`Assignment Submission → ${submission.userName} submitted assignment ${assignmentId}`);
  res.json({ success: true, message: 'Assignment submitted successfully!', submissionId: submission.id });
});

/**
 * @route   GET /elearning/live-sessions
 * @desc    Fetches all live sessions.
 * @access  Public
 */
router.get('/elearning/live-sessions', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { status } = req.query;
  
  let sessions = data.liveSessions || [];
  
  if (status) {
    sessions = sessions.filter(s => s.status === status);
  }
  
  // Filter out past sessions
  const now = new Date();
  sessions = sessions.filter(s => new Date(s.scheduledTime) >= now);
  
  res.json({ success: true, sessions, count: sessions.length });
});

/**
 * @route   POST /elearning/live-session/:id/register
 * @desc    Registers a user for a live session.
 * @access  Protected
 */
router.post('/elearning/live-session/:id/register', (req, res) => {
  const { id } = req.params;
  const user = req.session?.user;
  
  const dataFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
  let data = readJSON(dataFile);
  
  const sessionIndex = (data.liveSessions || []).findIndex(s => s.id === id);
  if (sessionIndex === -1) {
    return res.status(404).json({ success: false, message: 'Live session not found' });
  }
  
  const session = data.liveSessions[sessionIndex];
  
  if (session.registered >= session.maxParticipants) {
    return res.status(400).json({ success: false, message: 'Session is full' });
  }
  
  // Increment registered count
  data.liveSessions[sessionIndex].registered += 1;
  writeJSON(dataFile, data);
  
  console.log(`Live Session Registration → ${user?.name || 'User'} registered for ${session.title}`);
  res.json({ 
    success: true, 
    message: 'Successfully registered for the session!',
    meetingLink: session.meetingLink
  });
});

/**
 * @route   GET /elearning/forum
 * @desc    Fetches forum threads.
 * @access  Public
 */
router.get('/elearning/forum', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { category, status } = req.query;
  
  let threads = data.forum || [];
  
  if (category) {
    threads = threads.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    threads = threads.filter(t => t.status === status);
  }
  
  // Sort by pinned first, then by date
  threads.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  
  res.json({ success: true, threads, count: threads.length });
});

/**
 * @route   GET /elearning/forum/:id
 * @desc    Fetches a specific forum thread with replies.
 * @access  Public
 */
router.get('/elearning/forum/:id', (req, res) => {
  const { id } = req.params;
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const thread = (data.forum || []).find(t => t.id === id);
  
  if (!thread) {
    return res.status(404).json({ success: false, message: 'Thread not found' });
  }
  
  // Increment view count
  const dataFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
  const threadIndex = data.forum.findIndex(t => t.id === id);
  if (threadIndex !== -1) {
    data.forum[threadIndex].views += 1;
    writeJSON(dataFile, data);
  }
  
  res.json({ success: true, thread });
});

/**
 * @route   POST /elearning/forum
 * @desc    Creates a new forum thread.
 * @access  Protected
 */
router.post('/elearning/forum', (req, res) => {
  const { title, category, content, tags } = req.body;
  const user = req.session?.user;
  
  if (!title?.trim() || !category?.trim() || !content?.trim()) {
    return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
  }
  
  const dataFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
  let data = readJSON(dataFile);
  
  if (!data.forum) data.forum = [];
  
  const newThread = {
    id: `thread-${Date.now()}`,
    title: title.trim(),
    category: category.trim(),
    author: user?.name || 'Anonymous',
    authorAvatar: user?.avatar || '/assets/images/defaults/default-student.png',
    date: new Date().toISOString(),
    replies: 0,
    views: 0,
    lastReply: null,
    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
    content: content.trim(),
    status: 'open',
    isPinned: false
  };
  
  data.forum.unshift(newThread);
  writeJSON(dataFile, data);
  
  console.log(`Forum Thread Created → ${newThread.author} created: ${newThread.title}`);
  res.json({ success: true, message: 'Thread created successfully!', threadId: newThread.id });
});

/**
 * @route   POST /elearning/forum/:id/reply
 * @desc    Adds a reply to a forum thread.
 * @access  Protected
 */
router.post('/elearning/forum/:id/reply', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.session?.user;
  
  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: 'Reply content is required' });
  }
  
  const dataFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
  let data = readJSON(dataFile);
  
  const threadIndex = (data.forum || []).findIndex(t => t.id === id);
  if (threadIndex === -1) {
    return res.status(404).json({ success: false, message: 'Thread not found' });
  }
  
  // Update thread
  data.forum[threadIndex].replies += 1;
  data.forum[threadIndex].lastReply = new Date().toISOString();
  
  writeJSON(dataFile, data);
  
  console.log(`Forum Reply → ${user?.name || 'User'} replied to thread ${id}`);
  res.json({ success: true, message: 'Reply posted successfully!' });
});

/**
 * @route   GET /elearning/progress
 * @desc    Fetches user's learning progress.
 * @access  Protected
 */
router.get('/elearning/progress', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  res.json({ success: true, progress: data.progress || {}, analytics: data.analytics || {} });
});

/**
 * @route   POST /elearning/progress/update
 * @desc    Updates user's learning progress.
 * @access  Protected
 */
router.post('/elearning/progress/update', (req, res) => {
  const { subjectId, lessonId, completed } = req.body;
  const user = req.session?.user;
  
  if (!subjectId || !lessonId) {
    return res.status(400).json({ success: false, message: 'Subject ID and Lesson ID are required' });
  }
  
  // In a real implementation, this would update user-specific progress
  console.log(`Progress Update → ${user?.name || 'User'} completed lesson ${lessonId} in ${subjectId}`);
  res.json({ success: true, message: 'Progress updated!' });
});

/**
 * @route   GET /elearning/calendar
 * @desc    Fetches calendar events.
 * @access  Public
 */
router.get('/elearning/calendar', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { month, year } = req.query;
  
  let events = data.calendar || [];
  
  if (month && year) {
    events = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === parseInt(month) - 1 && eventDate.getFullYear() === parseInt(year);
    });
  }
  
  res.json({ success: true, events, count: events.length });
});

/**
 * @route   GET /elearning/notifications
 * @desc    Fetches e-learning specific notifications.
 * @access  Public
 */
router.get('/elearning/notifications', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { unreadOnly } = req.query;
  
  let notifications = data.notifications || [];
  
  if (unreadOnly === 'true') {
    notifications = notifications.filter(n => !n.read);
  }
  
  res.json({ success: true, notifications, unreadCount: notifications.filter(n => !n.read).length });
});

/**
 * @route   POST /elearning/notifications/:id/read
 * @desc    Marks a notification as read.
 * @access  Protected
 */
router.post('/elearning/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  const dataFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
  let data = readJSON(dataFile);
  
  const notifIndex = (data.notifications || []).findIndex(n => n.id === id);
  if (notifIndex === -1) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  
  data.notifications[notifIndex].read = true;
  writeJSON(dataFile, data);
  
  res.json({ success: true, message: 'Notification marked as read' });
});

/**
 * @route   GET /elearning/study-plans
 * @desc    Fetches study plans.
 * @access  Public
 */
router.get('/elearning/study-plans', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  res.json({ success: true, studyPlans: data.studyPlan || [] });
});

/**
 * @route   GET /elearning/achievements
 * @desc    Fetches user achievements.
 * @access  Public
 */
router.get('/elearning/achievements', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  res.json({ success: true, achievements: data.achievements || [] });
});

/**
 * @route   GET /elearning/stats
 * @desc    Fetches e-learning portal statistics.
 * @access  Public
 */
router.get('/elearning/stats', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
    const subjects = data.subjects || [];
    const resources = data.resources || [];
    const quizzes = data.quizzes || [];
    const assignments = data.assignments || [];
    const sessions = data.liveSessions || [];
    
    const stats = {
      totalSubjects: subjects.length,
      totalResources: resources.length,
      totalQuizzes: quizzes.length,
      totalAssignments: assignments.length,
      totalLiveSessions: sessions.length,
      resourcesByType: resources.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        return acc;
      }, {}),
      upcomingSessions: sessions.filter(session => 
        new Date(session.scheduledTime) >= new Date()
      ).length,
      activeQuizzes: quizzes.filter(quiz => quiz.status === 'active').length,
      recentResources: resources.slice(0, 5).map(r => ({
        title: r.title,
        subject: r.subject,
        type: r.type,
        date: r.date
      }))
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching e-learning stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

/**
 * @route   POST /elearning/feedback
 * @desc    Handles e-learning portal feedback.
 * @access  Public
 */
router.post('/elearning/feedback', (req, res) => {
  try {
    const { email, category, rating, feedback, suggestions } = req.body;
    
    if (!email || !category || !rating || !feedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, category, rating, and feedback are required' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    const feedbackFile = path.join(__dirname, '..', 'data', 'elearning-feedback.json');
    let feedbackData = readJSON(feedbackFile);
    
    const newFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      email: email.toLowerCase().trim(),
      category: category.trim(),
      rating: parseInt(rating),
      feedback: feedback.trim(),
      suggestions: suggestions?.trim() || null,
      submittedAt: new Date().toISOString(),
      status: 'new'
    };
    
    feedbackData.unshift(newFeedback);
    
    if (!writeJSON(feedbackFile, feedbackData)) {
      throw new Error('Failed to save feedback');
    }
    
    console.log(`E-Learning Feedback → ${email} | ${category} | Rating: ${rating}`);
    
    res.json({ 
      success: true, 
      message: 'Thank you for your feedback! We appreciate your input.',
      feedbackId: newFeedback.id
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process feedback. Please try again.' 
    });
  }
});

/**
 * @route   POST /elearning/feature-request
 * @desc    Handles e-learning feature requests.
 * @access  Public
 */
router.post('/elearning/feature-request', (req, res) => {
  try {
    const { email, featureTitle, description, priority, useCase } = req.body;
    
    if (!email || !featureTitle || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, feature title, and description are required' 
      });
    }
    
    const requestsFile = path.join(__dirname, '..', 'data', 'elearning-feature-requests.json');
    let requestsData = readJSON(requestsFile);
    
    const newRequest = {
      id: `feature-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      email: email.toLowerCase().trim(),
      featureTitle: featureTitle.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      useCase: useCase?.trim() || null,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      votes: 0
    };
    
    requestsData.unshift(newRequest);
    
    if (!writeJSON(requestsFile, requestsData)) {
      throw new Error('Failed to save feature request');
    }
    
    console.log(`Feature Request → ${email} | ${featureTitle}`);
    
    res.json({ 
      success: true, 
      message: 'Feature request submitted successfully! We\'ll review it and get back to you.',
      requestId: newRequest.id
    });
  } catch (error) {
    console.error('Error processing feature request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feature request. Please try again.' 
    });
  }
});

/**
 * @route   GET /elearning/search
 * @desc    Searches across e-learning content.
 * @access  Public
 */
router.get('/elearning/search', (req, res) => {
  try {
    const { q: query, type, subject } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters long' 
      });
    }
    
    const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
    const searchTerm = query.toLowerCase().trim();
    
    let results = {
      subjects: [],
      resources: [],
      quizzes: [],
      assignments: []
    };
    
    // Search subjects
    if (!type || type === 'all' || type === 'subjects') {
      results.subjects = (data.subjects || []).filter(subject => 
        subject.name.toLowerCase().includes(searchTerm) ||
        subject.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Search resources
    if (!type || type === 'all' || type === 'resources') {
      let resources = data.resources || [];
      if (subject) {
        resources = resources.filter(r => r.subject.toLowerCase() === subject.toLowerCase());
      }
      results.resources = resources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.subject.toLowerCase().includes(searchTerm)
      );
    }
    
    // Search quizzes
    if (!type || type === 'all' || type === 'quizzes') {
      results.quizzes = (data.quizzes || []).filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm) ||
        quiz.description.toLowerCase().includes(searchTerm) ||
        quiz.subject.toLowerCase().includes(searchTerm)
      );
    }
    
    // Search assignments
    if (!type || type === 'all' || type === 'assignments') {
      results.assignments = (data.assignments || []).filter(assignment => 
        assignment.title.toLowerCase().includes(searchTerm) ||
        assignment.description.toLowerCase().includes(searchTerm) ||
        assignment.subject.toLowerCase().includes(searchTerm)
      );
    }
    
    const totalResults = results.subjects.length + results.resources.length + 
                        results.quizzes.length + results.assignments.length;
    
    console.log(`E-Learning Search → "${query}" | ${totalResults} results`);
    
    res.json({ 
      success: true, 
      query: searchTerm,
      results,
      totalResults,
      filters: { type, subject }
    });
  } catch (error) {
    console.error('Error searching e-learning content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Search failed. Please try again.' 
    });
  }
});

/**
 * @route   GET /elearning/media
 * @desc    Fetches media gallery items.
 * @access  Public
 */
router.get('/elearning/media', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json'));
  const { type, subject } = req.query;
  
  let media = data.media || [];
  
  if (type) {
    media = media.filter(m => m.type === type);
  }
  if (subject) {
    media = media.filter(m => m.subject.toLowerCase() === subject.toLowerCase());
  }
  
  res.json({ success: true, media, count: media.length });
});

/**
 * @route   GET /notifications
 * @desc    Fetches notifications with filtering, pagination, and user-specific options.
 * @access  Public
 */
router.get('/notifications', (req, res) => {
  try {
    const { 
      userId, 
      category, 
      type, 
      priority, 
      read, 
      limit = 50, 
      offset = 0,
      search 
    } = req.query;
    
    let notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json')) || [];
    
    // Apply filters
    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }
    
    if (category) {
      notifications = notifications.filter(n => n.category === category);
    }
    
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }
    
    if (priority) {
      notifications = notifications.filter(n => n.priority === priority);
    }
    
    if (read !== undefined) {
      const isRead = read === 'true';
      notifications = notifications.filter(n => n.read === isRead);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      notifications = notifications.filter(n => 
        n.title?.toLowerCase().includes(searchTerm) ||
        n.message?.toLowerCase().includes(searchTerm) ||
        n.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = notifications.length;
    const paginatedNotifications = notifications.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      stats: {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byCategory: notifications.reduce((acc, n) => {
          acc[n.category] = (acc[n.category] || 0) + 1;
          return acc;
        }, {}),
        byPriority: notifications.reduce((acc, n) => {
          acc[n.priority] = (acc[n.priority] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

/**
 * @route   GET /notifications/user/:userId
 * @desc    Fetches notifications for a specific user.
 * @access  Public
 */
router.get('/notifications/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    
    let notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json')) || [];
    
    // Filter by user ID
    notifications = notifications.filter(n => n.userId === userId);
    
    // Filter unread only if requested
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = notifications.length;
    const paginatedNotifications = notifications.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user notifications' });
  }
});

/**
 * @route   POST /notifications
 * @desc    Creates a new notification.
 * @access  Protected (Admin/Teacher)
 */
router.post('/notifications', requireAuth, (req, res) => {
  try {
    const { 
      title, 
      message, 
      icon = 'fa-bell', 
      type = 'administrative',
      category = 'general',
      priority = 'medium',
      userId = null,
      actions = []
    } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      });
    }
    
    const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
    let notifications = readJSON(notificationsFile);
    
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: title.trim(),
      message: message.trim(),
      icon,
      type,
      category,
      priority,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null,
      actions: Array.isArray(actions) ? actions : [],
      createdBy: req.session.user?.name || 'System'
    };
    
    notifications.unshift(newNotification); // Add to beginning
    
    if (!writeJSON(notificationsFile, notifications)) {
      throw new Error('Failed to save notification');
    }
    
    console.log(`Notification Created → ${newNotification.title} for user ${userId || 'all'}`);
    
    res.json({
      success: true,
      message: 'Notification created successfully',
      notification: newNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

/**
 * @route   PUT /notifications/:id
 * @desc    Updates an existing notification.
 * @access  Protected (Admin/Teacher)
 */
router.put('/notifications/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
    let notifications = readJSON(notificationsFile);
    
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    // Update notification
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: req.session.user?.name || 'System'
    };
    
    if (!writeJSON(notificationsFile, notifications)) {
      throw new Error('Failed to update notification');
    }
    
    console.log(`Notification Updated → ${id} by ${req.session.user?.name}`);
    
    res.json({
      success: true,
      message: 'Notification updated successfully',
      notification: notifications[notificationIndex]
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

/**
 * @route   POST /notifications/:id/read
 * @desc    Marks a notification as read.
 * @access  Public
 */
router.post('/notifications/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    
    const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
    let notifications = readJSON(notificationsFile);
    
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    // Mark as read
    notifications[notificationIndex].read = true;
    notifications[notificationIndex].readAt = new Date().toISOString();
    
    if (!writeJSON(notificationsFile, notifications)) {
      throw new Error('Failed to update notification');
    }
    
    console.log(`Notification Marked Read → ${id}`);
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: notifications[notificationIndex]
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

/**
 * @route   POST /notifications/mark-all-read
 * @desc    Marks all notifications as read for a user.
 * @access  Public
 */
router.post('/notifications/mark-all-read', (req, res) => {
  try {
    const { userId } = req.body;
    
    const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
    let notifications = readJSON(notificationsFile);
    
    let updatedCount = 0;
    const now = new Date().toISOString();
    
    notifications = notifications.map(notification => {
      if (!notification.read && (!userId || notification.userId === userId)) {
        updatedCount++;
        return {
          ...notification,
          read: true,
          readAt: now
        };
      }
      return notification;
    });
    
    if (!writeJSON(notificationsFile, notifications)) {
      throw new Error('Failed to update notifications');
    }
    
    console.log(`All Notifications Marked Read → ${updatedCount} notifications for user ${userId || 'all'}`);
    
    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      updatedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
});

/**
 * @route   DELETE /notifications/:id
 * @desc    Deletes a notification.
 * @access  Protected (Admin/Teacher or owner)
 */
router.delete('/notifications/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;
    
    const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');
    let notifications = readJSON(notificationsFile);
    
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    const notification = notifications[notificationIndex];
    
    // Check permissions (admin/teacher or owner)
    if (!['admin', 'teacher'].includes(user.role) && notification.userId !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this notification' 
      });
    }
    
    // Remove notification
    notifications.splice(notificationIndex, 1);
    
    if (!writeJSON(notificationsFile, notifications)) {
      throw new Error('Failed to delete notification');
    }
    
    console.log(`Notification Deleted → ${id} by ${user.name}`);
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

/**
 * @route   GET /notifications/stream
 * @desc    Server-Sent Events for real-time notification updates.
 * @access  Public
 */
router.get('/notifications/stream', (req, res) => {
  try {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    
    // Set up periodic check for new notifications
    let lastCheck = new Date();
    const interval = setInterval(() => {
      try {
        const notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json')) || [];
        const newNotifications = notifications.filter(n => 
          new Date(n.createdAt) > lastCheck && !n.read
        );
        
        if (newNotifications.length > 0) {
          newNotifications.forEach(notification => {
            res.write(`data: ${JSON.stringify({ 
              type: 'new_notification', 
              notification 
            })}\n\n`);
          });
          
          lastCheck = new Date();
        }
      } catch (error) {
        console.error('Error in notification stream:', error);
      }
    }, 5000); // Check every 5 seconds
    
    // Handle client disconnect
    req.on('close', () => {
      clearInterval(interval);
      console.log('Notification stream client disconnected');
    });
    
    req.on('error', () => {
      clearInterval(interval);
    });
    
  } catch (error) {
    console.error('Error setting up notification stream:', error);
    res.status(500).end();
  }
});

/**
 * @route   GET /notifications/stats
 * @desc    Gets notification statistics.
 * @access  Public
 */
router.get('/notifications/stats', (req, res) => {
  try {
    const { userId } = req.query;
    
    let notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json')) || [];
    
    if (userId) {
      notifications = notifications.filter(n => n.userId === userId);
    }
    
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      read: notifications.filter(n => n.read).length,
      byCategory: notifications.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {}),
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      byPriority: notifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification stats' });
  }
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

  const dataFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
  let data = readJSON(dataFile);
  
  if (!data.resources) data.resources = [];

  const newResources = req.files.map(file => ({
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    subject,
    type,
    description: description || "",
    teacher,
    date: new Date().toISOString(),
    url: `/uploads/elearning/${file.filename}`,
    size: formatFileSize(file.size),
    downloads: 0,
    rating: 0,
    color: getFileColor(type)
  }));

  data.resources = [...newResources, ...data.resources]; // Add new resources to the top
  writeJSON(dataFile, data);

  console.log(`E-Learning Upload → Teacher ${teacher} uploaded ${req.files.length} file(s) for ${subject}`);
  res.json({ success: true, message: "Upload successful!", uploadedFiles: newResources });
});


// =================================================================
// STUDENT LIFE API ROUTES
// =================================================================

/**
 * @route   GET /student-life/data
 * @desc    Fetches all data for the student life page.
 * @access  Public
 */
router.get('/student-life/data', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    console.log('🎓 Student life data fetched successfully');
    res.json({ 
      success: true, 
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching student life data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student life data' 
    });
  }
});

/**
 * @route   GET /student-life/clubs
 * @desc    Fetches clubs and activities data.
 * @access  Public
 */
router.get('/student-life/clubs', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    const clubs = data.clubs || [];
    console.log(`🏛️ Student life clubs fetched: ${clubs.length} clubs`);
    res.json({ 
      success: true, 
      data: clubs,
      count: clubs.length
    });
  } catch (error) {
    console.error('Error fetching student life clubs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch clubs data' 
    });
  }
});

/**
 * @route   GET /student-life/houses
 * @desc    Fetches house system data.
 * @access  Public
 */
router.get('/student-life/houses', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    const houses = data.houses || [];
    console.log(`🏠 Student life houses fetched: ${houses.length} houses`);
    res.json({ 
      success: true, 
      data: houses,
      count: houses.length
    });
  } catch (error) {
    console.error('Error fetching student life houses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch houses data' 
    });
  }
});

/**
 * @route   GET /student-life/events
 * @desc    Fetches student life events data.
 * @access  Public
 */
router.get('/student-life/events', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    const events = data.events || [];
    console.log(`📅 Student life events fetched: ${events.length} events`);
    res.json({ 
      success: true, 
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching student life events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events data' 
    });
  }
});

/**
 * @route   GET /student-life/sports
 * @desc    Fetches sports data.
 * @access  Public
 */
router.get('/student-life/sports', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    const sports = data.sports || [];
    console.log(`⚽ Student life sports fetched: ${sports.length} sports`);
    res.json({ 
      success: true, 
      data: sports,
      count: sports.length
    });
  } catch (error) {
    console.error('Error fetching student life sports:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sports data' 
    });
  }
});

/**
 * @route   GET /student-life/overview-cards
 * @desc    Fetches overview cards data.
 * @access  Public
 */
router.get('/student-life/overview-cards', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    const overviewCards = data.overviewCards || [];
    console.log(`📊 Student life overview cards fetched: ${overviewCards.length} cards`);
    res.json({ 
      success: true, 
      data: overviewCards,
      count: overviewCards.length
    });
  } catch (error) {
    console.error('Error fetching student life overview cards:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch overview cards data' 
    });
  }
});

/**
 * @route   GET /student-life/org-cards
 * @desc    Fetches organizational cards data.
 * @access  Public
 */
router.get('/student-life/org-cards', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    const orgCards = data.orgCards || [];
    console.log(`🏢 Student life org cards fetched: ${orgCards.length} cards`);
    res.json({ 
      success: true, 
      data: orgCards,
      count: orgCards.length
    });
  } catch (error) {
    console.error('Error fetching student life org cards:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch org cards data' 
    });
  }
});

/**
 * @route   GET /student-life/stats
 * @desc    Fetches student life statistics.
 * @access  Public
 */
router.get('/student-life/stats', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'static', 'clubs-data.json'));
    
    const stats = {
      totalClubs: (data.clubs || []).length,
      totalSports: (data.sports || []).length,
      totalHouses: (data.houses || []).length,
      totalEvents: (data.events || []).length,
      overviewCards: (data.overviewCards || []).length,
      orgCards: (data.orgCards || []).length,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Student life statistics calculated successfully');
    res.json({ 
      success: true, 
      data: stats
    });
  } catch (error) {
    console.error('Error fetching student life stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student life statistics' 
    });
  }
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
 * @route   GET /clubs/:id
 * @desc    Fetches a single club by ID.
 * @access  Protected
 */
router.get('/clubs/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const clubsFile = path.join(__dirname, '..', 'data', 'clubs', 'clubs.json');
    const clubs = readJSON(clubsFile);

    if (!Array.isArray(clubs)) {
      return res.status(500).json({
        success: false,
        message: "Invalid clubs data format"
      });
    }

    const club = clubs.find(c => c.id === id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found"
      });
    }

    console.log(`Club ${club.name} fetched by user: ${req.session.user?.name || 'Unknown'}`);

    res.json({
      success: true,
      data: club
    });
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load club data"
    });
  }
});

/**
 * @route   GET /clubs/applications
 * @desc    Fetches club join applications for a user.
 * @access  Protected
 */
router.get('/clubs/applications', requireAuth, (req, res) => {
  try {
    const applicationsFile = path.join(__dirname, '..', 'data', 'club-joins.json');
    let applications = readJSON(applicationsFile);

    // Filter applications for current user
    applications = applications.filter(app => 
      app.userId === req.session.user?.id || 
      app.email === req.session.user?.email
    );

    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load applications"
    });
  }
});

/**
 * @route   GET /clubs/applications/:id
 * @desc    Fetches a specific application by ID.
 * @access  Protected
 */
router.get('/clubs/applications/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const applicationsFile = path.join(__dirname, '..', 'data', 'club-joins.json');
    let applications = readJSON(applicationsFile);

    const application = applications.find(app => app.id === id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check if user owns this application or is admin
    if (application.userId !== req.session.user?.id && 
        application.email !== req.session.user?.email &&
        !['admin', 'teacher'].includes(req.session.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load application"
    });
  }
});

/**
 * @route   PUT /clubs/applications/:id
 * @desc    Updates a club application status (Admin/Teacher only).
 * @access  Protected
 */
router.put('/clubs/applications/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.session.user;

    // Only allow admin or teacher to update application status
    if (!['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only administrators and teachers can update application status"
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, approved, or rejected"
      });
    }

    const applicationsFile = path.join(__dirname, '..', 'data', 'club-joins.json');
    let applications = readJSON(applicationsFile);

    const applicationIndex = applications.findIndex(app => app.id === id);
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Update application
    applications[applicationIndex].status = status;
    applications[applicationIndex].updated_at = new Date().toISOString();
    applications[applicationIndex].updated_by = user.name;

    if (!writeJSON(applicationsFile, applications)) {
      throw new Error('Failed to save updated application');
    }

    console.log(`Application ${id} updated to ${status} by ${user.name}`);

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: applications[applicationIndex]
    });
  } catch (err) {
    console.error('Error updating application:', err);
    res.status(500).json({
      success: false,
      message: "Failed to update application"
    });
  }
});

/**
 * @route   GET /clubs/:id/members
 * @desc    Fetches members of a specific club.
 * @access  Protected
 */
router.get('/clubs/:id/members', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const applicationsFile = path.join(__dirname, '..', 'data', 'club-joins.json');
    let applications = readJSON(applicationsFile);

    // Get approved applications for this club
    const approvedApplications = applications.filter(app => 
      app.clubId === id && app.status === 'approved'
    );

    // Format member data
    const members = approvedApplications.map(app => ({
      id: app.id,
      name: app.name,
      email: app.email,
      form: app.form,
      phone: app.phone,
      joined_at: app.submitted_at
    }));

    res.json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (err) {
    console.error('Error fetching club members:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load club members"
    });
  }
});

/**
 * @route   GET /clubs/stats
 * @desc    Fetches clubs statistics and analytics.
 * @access  Public (for academics page stats display)
 */
router.get('/clubs/stats', (req, res) => {
  try {
    const clubsFile = path.join(__dirname, '..', 'data', 'clubs', 'clubs.json');
    const applicationsFile = path.join(__dirname, '..', 'data', 'club-joins.json');
    
    const clubs = readJSON(clubsFile);
    const applications = readJSON(applicationsFile);

    if (!Array.isArray(clubs)) {
      return res.status(500).json({
        success: false,
        message: "Invalid clubs data format"
      });
    }

    // Calculate statistics
    const stats = {
      totalClubs: clubs.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      clubsByCategory: clubs.reduce((acc, club) => {
        acc[club.category] = (acc[club.category] || 0) + 1;
        return acc;
      }, {}),
      mostPopularClubs: clubs.map(club => ({
        ...club,
        applicationCount: applications.filter(app => app.clubId === club.id).length
      })).sort((a, b) => b.applicationCount - a.applicationCount).slice(0, 5),
      recentActivity: applications
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, 10)
        .map(app => ({
          id: app.id,
          studentName: app.name,
          clubName: app.clubName,
          status: app.status,
          submitted_at: app.submitted_at
        }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Error fetching clubs stats:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load clubs statistics"
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
 * @access  Public
 */
router.post('/cocurriculum/join', (req, res) => {
  try {
    const { name, email, formClass, activitySelect, message } = req.body;

    // Validation
    if (!name?.trim() || !email?.trim() || !activitySelect?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and activity selection are required."
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

    const file = path.join(__dirname, '..', 'data', 'cocurriculum-joins.json');
    let joins = readJSON(file);

    const application = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      formClass: formClass || null,
      activity: activitySelect.trim(),
      message: message?.trim() || null,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    };

    joins.push(application);

    if (!writeJSON(file, joins)) {
      throw new Error('Failed to save application');
    }

    console.log(`Co-curricular Join Application → ${name} for ${activitySelect}`);

    res.json({
      success: true,
      message: "Application submitted successfully! We'll contact you soon.",
      applicationId: application.id
    });
  } catch (err) {
    console.error('Error processing co-curricular join:', err);
    res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again."
    });
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
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'science-data.json'));
  res.json(data);
});

router.get('/departments/science/forum', (req, res) => {
  const posts = readJSON(path.join(__dirname, '..', 'data', 'departments', 'science-forum.json'));
  res.json(posts.slice(0, 50)); // Return latest 50
});

router.post('/departments/science/forum', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false, message: "Post text cannot be empty." });
  const file = path.join(__dirname, '..', 'data', 'departments', 'science-forum.json');
  let posts = readJSON(file);
  posts.unshift({ id: Date.now(), text: text.trim(), timestamp: new Date().toISOString() });
  writeJSON(file, posts);
  res.json({ success: true });
});

router.post('/departments/science/poll', (req, res) => {
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: "Subject required." });
  const file = path.join(__dirname, '..', 'data', 'departments', 'science-poll.json');
  let poll = readJSON(file);
  poll[subject] = (poll[subject] || 0) + 1;
  writeJSON(file, poll);
  res.json({ success: true });
});

router.post('/departments/science/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

router.post('/departments/science/submit', uploadDepartmentFile.array('files', 10), (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "No files submitted" });
    }

    const { assignmentTitle, subject, description } = req.body;
    const submittedBy = req.session?.user?.name || "Student";
    const userEmail = req.session?.user?.email || "student@school.edu";

    // Read current science submissions
    const scienceFile = path.join(__dirname, '..', 'data', 'departments', 'science-data.json');
    let scienceData = readJSON(scienceFile);
    
    if (!scienceData.submissions) {
      scienceData.submissions = [];
    }

    // Process submitted files
    const newSubmissions = req.files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: assignmentTitle?.trim() || file.originalname,
      subject: subject?.trim() || "General Science",
      description: description?.trim() || "",
      uploadedBy: submittedBy,
      email: userEmail,
      date: new Date().toISOString().split('T')[0],
      url: `/uploads/departments/${file.filename}`,
      originalName: file.originalname,
      size: formatFileSize(file.size),
      status: "pending"
    }));

    // Add new submissions
    scienceData.submissions = [...newSubmissions, ...scienceData.submissions];

    // Save updated data
    if (!writeJSON(scienceFile, scienceData)) {
      throw new Error('Failed to save submission data');
    }

    console.log(`Science Submission → ${submittedBy} submitted ${req.files.length} file(s)`);

    res.json({
      success: true,
      message: "Assignment submitted successfully! Teachers will review it soon.",
      submittedFiles: newSubmissions
    });

  } catch (err) {
    console.error('Error processing science submission:', err);
    res.status(500).json({
      success: false,
      message: "Submission failed. Please try again."
    });
  }
});


// =================================================================
// GUIDANCE & WELFARE ROUTES
// =================================================================

// --- Guidance & Counseling ---
router.get('/guidance/data', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'guidance-data.json'));
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
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'welfare-data.json'));
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
// ADMINISTRATION ROUTES
// =================================================================

/**
 * @route   GET /admin/data
 * @desc    Fetches all administration data (BOM, leadership, departments)
 * @access  Public
 */
router.get('/admin/data', (req, res) => {
  try {
    const adminData = readJSON(path.join(__dirname, '..', 'data', 'static', 'admin-data.json'));
    console.log('🏛️ Administration data fetched successfully');
    res.json({ 
      success: true, 
      data: adminData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching administration data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch administration data' 
    });
  }
});

/**
 * @route   GET /admin/bom
 * @desc    Fetches Board of Management members
 * @access  Public
 */
router.get('/admin/bom', (req, res) => {
  try {
    const adminData = readJSON(path.join(__dirname, '..', 'data', 'static', 'admin-data.json'));
    const bomMembers = adminData.bom || [];
    console.log(`🏛️ BOM data fetched: ${bomMembers.length} members`);
    res.json({ 
      success: true, 
      data: bomMembers,
      count: bomMembers.length
    });
  } catch (error) {
    console.error('Error fetching BOM data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch BOM data' 
    });
  }
});

/**
 * @route   GET /admin/leadership
 * @desc    Fetches leadership team data
 * @access  Public
 */
router.get('/admin/leadership', (req, res) => {
  try {
    const adminData = readJSON(path.join(__dirname, '..', 'data', 'static', 'admin-data.json'));
    const leadership = adminData.leadership || [];
    console.log(`👨‍💼 Leadership data fetched: ${leadership.length} members`);
    res.json({ 
      success: true, 
      data: leadership,
      count: leadership.length
    });
  } catch (error) {
    console.error('Error fetching leadership data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leadership data' 
    });
  }
});

/**
 * @route   GET /admin/departments
 * @desc    Fetches administrative departments data
 * @access  Public
 */
router.get('/admin/departments', (req, res) => {
  try {
    const adminData = readJSON(path.join(__dirname, '..', 'data', 'static', 'admin-data.json'));
    const departments = adminData.departments || [];
    console.log(`🏢 Departments data fetched: ${departments.length} departments`);
    res.json({ 
      success: true, 
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('Error fetching departments data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch departments data' 
    });
  }
});

/**
 * @route   GET /admin/stats
 * @desc    Fetches administration statistics
 * @access  Public
 */
router.get('/admin/stats', (req, res) => {
  try {
    const adminData = readJSON(path.join(__dirname, '..', 'data', 'static', 'admin-data.json'));
    
    const stats = {
      bom: {
        total: (adminData.bom || []).length,
        byRepresenting: (adminData.bom || []).reduce((acc, member) => {
          const representing = member.representing || 'Unknown';
          acc[representing] = (acc[representing] || 0) + 1;
          return acc;
        }, {})
      },
      leadership: {
        total: (adminData.leadership || []).length,
        featured: (adminData.leadership || []).filter(l => l.featured).length,
        byRole: (adminData.leadership || []).reduce((acc, leader) => {
          const role = leader.role || 'Unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {})
      },
      departments: {
        total: (adminData.departments || []).length,
        byHead: (adminData.departments || []).reduce((acc, dept) => {
          const head = dept.head || 'Unknown';
          acc[head] = (acc[head] || 0) + 1;
          return acc;
        }, {})
      }
    };

    console.log('📊 Administration stats calculated successfully');
    res.json({ 
      success: true, 
      data: stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating administration stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch administration statistics' 
    });
  }
});

/**
 * @route   PUT /admin/bom/:index
 * @desc    Updates a BOM member (Admin only)
 * @access  Protected
 */
router.put('/admin/bom/:index', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    if (!['admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    const { index } = req.params;
    const updates = req.body;
    const adminDataFile = path.join(__dirname, '..', 'data', 'static', 'admin-data.json');
    let adminData = readJSON(adminDataFile);

    if (!adminData.bom || index >= adminData.bom.length) {
      return res.status(404).json({ success: false, message: 'BOM member not found' });
    }

    adminData.bom[index] = { ...adminData.bom[index], ...updates };
    
    if (!writeJSON(adminDataFile, adminData)) {
      throw new Error('Failed to save updated data');
    }

    console.log(`BOM member updated by ${user.name}`);
    res.json({ 
      success: true, 
      message: 'BOM member updated successfully',
      data: adminData.bom[index]
    });
  } catch (error) {
    console.error('Error updating BOM member:', error);
    res.status(500).json({ success: false, message: 'Failed to update BOM member' });
  }
});

/**
 * @route   PUT /admin/leadership/:index
 * @desc    Updates a leadership member (Admin only)
 * @access  Protected
 */
router.put('/admin/leadership/:index', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    if (!['admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    const { index } = req.params;
    const updates = req.body;
    const adminDataFile = path.join(__dirname, '..', 'data', 'static', 'admin-data.json');
    let adminData = readJSON(adminDataFile);

    if (!adminData.leadership || index >= adminData.leadership.length) {
      return res.status(404).json({ success: false, message: 'Leadership member not found' });
    }

    adminData.leadership[index] = { ...adminData.leadership[index], ...updates };
    
    if (!writeJSON(adminDataFile, adminData)) {
      throw new Error('Failed to save updated data');
    }

    console.log(`Leadership member updated by ${user.name}`);
    res.json({ 
      success: true, 
      message: 'Leadership member updated successfully',
      data: adminData.leadership[index]
    });
  } catch (error) {
    console.error('Error updating leadership member:', error);
    res.status(500).json({ success: false, message: 'Failed to update leadership member' });
  }
});

/**
 * @route   PUT /admin/departments/:index
 * @desc    Updates a department (Admin only)
 * @access  Protected
 */
router.put('/admin/departments/:index', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    if (!['admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    const { index } = req.params;
    const updates = req.body;
    const adminDataFile = path.join(__dirname, '..', 'data', 'static', 'admin-data.json');
    let adminData = readJSON(adminDataFile);

    if (!adminData.departments || index >= adminData.departments.length) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    adminData.departments[index] = { ...adminData.departments[index], ...updates };
    
    if (!writeJSON(adminDataFile, adminData)) {
      throw new Error('Failed to save updated data');
    }

    console.log(`Department updated by ${user.name}`);
    res.json({ 
      success: true, 
      message: 'Department updated successfully',
      data: adminData.departments[index]
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, message: 'Failed to update department' });
  }
});

/**
 * @route   POST /admin/bom
 * @desc    Adds a new BOM member (Admin only)
 * @access  Protected
 */
router.post('/admin/bom', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    if (!['admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    const { name, role, representing, photo } = req.body;
    
    if (!name || !role || !representing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, role, and representing field are required' 
      });
    }

    const adminDataFile = path.join(__dirname, '..', 'data', 'static', 'admin-data.json');
    let adminData = readJSON(adminDataFile);

    if (!adminData.bom) adminData.bom = [];

    const newBomMember = {
      name: name.trim(),
      role: role.trim(),
      representing: representing.trim(),
      photo: photo || '/assets/images/defaults/default-user.png'
    };

    adminData.bom.push(newBomMember);
    
    if (!writeJSON(adminDataFile, adminData)) {
      throw new Error('Failed to save new BOM member');
    }

    console.log(`New BOM member added by ${user.name}: ${name}`);
    res.json({ 
      success: true, 
      message: 'BOM member added successfully',
      data: newBomMember
    });
  } catch (error) {
    console.error('Error adding BOM member:', error);
    res.status(500).json({ success: false, message: 'Failed to add BOM member' });
  }
});

/**
 * @route   POST /admin/leadership
 * @desc    Adds a new leadership member (Admin only)
 * @access  Protected
 */
router.post('/admin/leadership', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    if (!['admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    const { name, role, bio, photo, featured = false } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and role are required' 
      });
    }

    const adminDataFile = path.join(__dirname, '..', 'data', 'static', 'admin-data.json');
    let adminData = readJSON(adminDataFile);

    if (!adminData.leadership) adminData.leadership = [];

    const newLeadershipMember = {
      name: name.trim(),
      role: role.trim(),
      bio: bio?.trim() || '',
      photo: photo || '/assets/images/defaults/default-user.png',
      featured: Boolean(featured)
    };

    adminData.leadership.push(newLeadershipMember);
    
    if (!writeJSON(adminDataFile, adminData)) {
      throw new Error('Failed to save new leadership member');
    }

    console.log(`New leadership member added by ${user.name}: ${name}`);
    res.json({ 
      success: true, 
      message: 'Leadership member added successfully',
      data: newLeadershipMember
    });
  } catch (error) {
    console.error('Error adding leadership member:', error);
    res.status(500).json({ success: false, message: 'Failed to add leadership member' });
  }
});

/**
 * @route   POST /admin/departments
 * @desc    Adds a new department (Admin only)
 * @access  Protected
 */
router.post('/admin/departments', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    if (!['admin'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required' 
      });
    }

    const { name, head, headTitle, icon, color, email, phone, note } = req.body;
    
    if (!name || !head) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department name and head are required' 
      });
    }

    const adminDataFile = path.join(__dirname, '..', 'data', 'static', 'admin-data.json');
    let adminData = readJSON(adminDataFile);

    if (!adminData.departments) adminData.departments = [];

    const newDepartment = {
      name: name.trim(),
      head: head.trim(),
      headTitle: headTitle?.trim() || 'Department Head',
      icon: icon || 'fas fa-building',
      color: color || '#0175C2',
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      note: note?.trim() || ''
    };

    adminData.departments.push(newDepartment);
    
    if (!writeJSON(adminDataFile, adminData)) {
      throw new Error('Failed to save new department');
    }

    console.log(`New department added by ${user.name}: ${name}`);
    res.json({ 
      success: true, 
      message: 'Department added successfully',
      data: newDepartment
    });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ success: false, message: 'Failed to add department' });
  }
});

// =================================================================
// SCHOOL-WIDE RESOURCES HUB
// =================================================================

/**
 * @route   GET /academics/stats
 * @desc    Fetches comprehensive academic statistics for the academics page.
 * @access  Public
 */
router.get('/academics/stats', (req, res) => {
  try {
    // Load data from multiple sources
    const clubsFile = path.join(__dirname, '..', 'data', 'clubs', 'clubs.json');
    const elearningFile = path.join(__dirname, '..', 'data', 'portal', 'elearning-data.json');
    const newsFile = path.join(__dirname, '..', 'data', 'static', 'news-data.json');
    const mathFile = path.join(__dirname, '..', 'data', 'departments', 'math-data.json');
    const scienceFile = path.join(__dirname, '..', 'data', 'departments', 'science-data.json');
    
    const clubs = readJSON(clubsFile);
    const elearning = readJSON(elearningFile);
    const news = readJSON(newsFile);
    const mathData = readJSON(mathFile);
    const scienceData = readJSON(scienceFile);
    
    const stats = {
      departments: {
        total: 9,
        withData: 0,
        subjects: 0,
        teachers: 0
      },
      students: {
        total: 1200,
        enrolled: 1185,
        graduated: 285,
        successRate: 98.5
      },
      academics: {
        meanScore: mathData.kcseTrend ? mathData.kcseTrend.scores[mathData.kcseTrend.scores.length - 1] : 4.96,
        universityAdmission: 46,
        technicalColleges: 38,
        otherPathways: 16
      },
      resources: {
        total: (elearning.resources || []).length + (elearning.subjects || []).length,
        downloads: 0,
        activeUsers: 245
      },
      performance: {
        ranking: 'Top 10 in County',
        awards: 25,
        competitions: 12,
        achievements: 48
      }
    };
    
    // Calculate real statistics where possible
    if (Array.isArray(clubs)) {
      stats.departments.withData = clubs.length;
    }
    
    if (elearning.subjects) {
      stats.departments.subjects = elearning.subjects.length;
    }
    
    if (elearning.resources) {
      stats.resources.downloads = elearning.resources.reduce((sum, r) => sum + (r.downloads || 0), 0);
    }
    
    res.json({
      success: true,
      data: stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching academics stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch academic statistics' 
    });
  }
});

/**
 * @route   GET /academics/dashboard
 * @desc    Fetches dashboard data for academic overview.
 * @access  Public
 */
router.get('/academics/dashboard', (req, res) => {
  try {
    const dashboardData = {
      overview: {
        totalStudents: 1200,
        totalTeachers: 85,
        totalSubjects: 45,
        totalClasses: 32
      },
      recentAchievements: [
        {
          title: "National Math Olympiad Gold Medal",
          student: "John Ochieng",
          date: "2025-11-20",
          category: "Mathematics"
        },
        {
          title: "County Science Fair First Place",
          student: "Mary Achieng",
          date: "2025-11-15",
          category: "Sciences"
        },
        {
          title: "Best School in County KCSE",
          event: "2024 KCSE Results",
          date: "2025-01-10",
          category: "Academic Performance"
        }
      ],
      upcomingEvents: [
        {
          title: "Inter-School Mathematics Competition",
          date: "2025-12-20",
          type: "Competition"
        },
        {
          title: "Science Exhibition",
          date: "2025-12-18",
          type: "Exhibition"
        },
        {
          title: "Parent-Teacher Meeting",
          date: "2025-12-15",
          type: "Meeting"
        }
      ],
      quickStats: {
        attendanceRate: 96.5,
        completionRate: 94.2,
        satisfactionRate: 4.8,
        improvementRate: 12.3
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching academics dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data' 
    });
  }
});

/**
 * @route   GET /academics/performance
 * @desc    Fetches academic performance metrics and trends.
 * @access  Public
 */
router.get('/academics/performance', (req, res) => {
  try {
    const performanceData = {
      kcseTrends: {
        years: ["2020", "2021", "2022", "2023", "2024", "2025"],
        meanScores: [6.8, 7.2, 7.5, 7.8, 8.1, 8.4],
        universityAdmission: [35, 38, 42, 44, 45, 46],
        gradeDistribution: {
          "A": 15,
          "A-": 22,
          "B+": 28,
          "B": 20,
          "B-": 10,
          "C+": 4,
          "C": 1
        }
      },
      subjectPerformance: {
        Mathematics: { mean: 8.2, improvement: 5.2 },
        English: { mean: 7.8, improvement: 3.1 },
        Kiswahili: { mean: 7.5, improvement: 2.8 },
        Physics: { mean: 7.9, improvement: 4.2 },
        Chemistry: { mean: 8.0, improvement: 4.5 },
        Biology: { mean: 7.7, improvement: 3.8 }
      },
      competitionResults: [
        {
          competition: "Kenya National Math Olympiad",
          year: "2025",
          position: "1st Place",
          participant: "John Ochieng"
        },
        {
          competition: "County Science Fair",
          year: "2025",
          position: "1st Place",
          participant: "Mary Achieng"
        },
        {
          competition: "National Drama Festival",
          year: "2025",
          position: "2nd Place",
          participant: "School Team"
        }
      ]
    };
    
    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch performance data' 
    });
  }
});

/**
 * @route   GET /resources/all
 * @desc    Fetches all data for the main resources hub.
 * @access  Public (changed from Protected for academics page)
 */
router.get('/resources/all', (req, res) => {
  try {
    const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'resources-data.json'));
    console.log(`Resources data fetched by user: ${req.session.user?.name || 'Unknown'}`);
    res.json(data);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ success: false, message: "Failed to load resources data" });
  }
});

/**
 * @route   POST /resources/upload
 * @desc    Handles uploads for the main resources hub with metadata storage.
 * @access  Protected (Teacher/Admin)
 */
router.post('/resources/upload', uploadMixed.array('files', 20), (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const { title, category, type, description } = req.body;
    const uploadedBy = req.session?.user?.name || "Unknown User";
    
    if (!title || !category || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, category, and type are required fields." 
      });
    }

    // Read current resources data
    const resourcesFile = path.join(__dirname, '..', 'data', 'departments', 'resources-data.json');
    let resourcesData = readJSON(resourcesFile);
    
    if (!resourcesData.resources) {
      resourcesData = { resources: [], submissions: [], featured: [], tags: [] };
    }

    // Process uploaded files
    const newResources = req.files.map(file => {
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileType = type.toLowerCase() || getFileTypeFromExtension(fileExt);
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: title.trim(),
        category: category.trim(),
        type: fileType,
        uploadedBy: uploadedBy,
        date: new Date().toISOString().split('T')[0], // Format as "YYYY-MM-DD"
        url: `/uploads/mixed/${file.filename}`,
        description: description?.trim() || "",
        icon: getFileIcon(fileType),
        color: getFileColor(fileType),
        size: formatFileSize(file.size),
        originalName: file.originalname,
        mimeType: file.mimetype
      };
    });

    // Add new resources to the top of the list
    resourcesData.resources = [...newResources, ...resourcesData.resources];
    
    // Update tags
    const newTags = new Set([...resourcesData.tags, category]);
    resourcesData.tags = Array.from(newTags);

    // Save updated data
    if (!writeJSON(resourcesFile, resourcesData)) {
      throw new Error('Failed to save resources data');
    }

    console.log(`Resource Upload → ${uploadedBy} uploaded ${req.files.length} file(s) for ${category}`);

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully!`,
      uploadedFiles: newResources.map(r => ({
        title: r.title,
        url: r.url,
        type: r.type,
        size: r.size
      }))
    });

  } catch (err) {
    console.error('Error processing resource upload:', err);
    res.status(500).json({
      success: false,
      message: "Upload failed. Please try again."
    });
  }
});

/**
 * @route   POST /resources/submit
 * @desc    Handles student assignment submissions.
 * @access  Protected
 */
router.post('/resources/submit', uploadMixed.array('files', 5), (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "No files submitted" });
    }

    const { assignmentTitle, subject } = req.body;
    const submittedBy = req.session?.user?.name || "Student";
    const userEmail = req.session?.user?.email || "student@school.edu";

    // Read current submissions
    const resourcesFile = path.join(__dirname, '..', 'data', 'departments', 'resources-data.json');
    let resourcesData = readJSON(resourcesFile);
    
    if (!resourcesData.submissions) {
      resourcesData.submissions = [];
    }

    // Process submitted files
    const newSubmissions = req.files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: assignmentTitle?.trim() || file.originalname,
      subject: subject?.trim() || "General",
      uploadedBy: submittedBy,
      email: userEmail,
      date: new Date().toISOString().split('T')[0],
      url: `/uploads/mixed/${file.filename}`,
      originalName: file.originalname,
      size: formatFileSize(file.size),
      status: "pending"
    }));

    // Add new submissions
    resourcesData.submissions = [...newSubmissions, ...resourcesData.submissions];

    // Save updated data
    if (!writeJSON(resourcesFile, resourcesData)) {
      throw new Error('Failed to save submission data');
    }

    console.log(`Student Submission → ${submittedBy} submitted ${req.files.length} file(s)`);

    res.json({
      success: true,
      message: "Assignment submitted successfully! Teachers will review it soon.",
      submittedFiles: newSubmissions
    });

  } catch (err) {
    console.error('Error processing submission:', err);
    res.status(500).json({
      success: false,
      message: "Submission failed. Please try again."
    });
  }
});

/**
 * @route   DELETE /resources/:id
 * @desc    Deletes a resource (Admin/Teacher only).
 * @access  Protected
 */
router.delete('/resources/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session?.user;
    
    // Only allow admin or teacher to delete resources
    if (!['admin', 'teacher'].includes(user?.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Only administrators and teachers can delete resources." 
      });
    }

    const resourcesFile = path.join(__dirname, '..', 'data', 'departments', 'resources-data.json');
    let resourcesData = readJSON(resourcesFile);

    const resourceIndex = resourcesData.resources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const deletedResource = resourcesData.resources.splice(resourceIndex, 1)[0];

    // Save updated data
    if (!writeJSON(resourcesFile, resourcesData)) {
      throw new Error('Failed to save updated resources data');
    }

    console.log(`Resource Deleted → ${user.name} deleted: ${deletedResource.title}`);

    res.json({
      success: true,
      message: "Resource deleted successfully"
    });

  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({
      success: false,
      message: "Failed to delete resource"
    });
  }
});

/**
 * @route   POST /resources/submissions/:id/approve
 * @desc    Approves a student submission (Teacher/Admin only).
 * @access  Protected
 */
router.post('/resources/submissions/:id/approve', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session?.user;
    
    // Only allow admin or teacher to approve submissions
    if (!['admin', 'teacher'].includes(user?.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Only administrators and teachers can approve submissions." 
      });
    }

    const resourcesFile = path.join(__dirname, '..', 'data', 'departments', 'resources-data.json');
    let resourcesData = readJSON(resourcesFile);

    const submissionIndex = (resourcesData.submissions || []).findIndex(s => s.id === id);
    if (submissionIndex === -1) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Update submission status
    resourcesData.submissions[submissionIndex].status = "approved";
    resourcesData.submissions[submissionIndex].approvedBy = user.name;
    resourcesData.submissions[submissionIndex].approvedAt = new Date().toISOString();

    // Save updated data
    if (!writeJSON(resourcesFile, resourcesData)) {
      throw new Error('Failed to save updated submission data');
    }

    console.log(`Submission Approved → ${user.name} approved submission: ${id}`);

    res.json({
      success: true,
      message: "Submission approved successfully"
    });

  } catch (err) {
    console.error('Error approving submission:', err);
    res.status(500).json({
      success: false,
      message: "Failed to approve submission"
    });
  }
});

/**
 * @route   DELETE /resources/submissions/:id
 * @desc    Deletes a student submission (Teacher/Admin only).
 * @access  Protected
 */
router.delete('/resources/submissions/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session?.user;
    
    // Only allow admin or teacher to delete submissions
    if (!['admin', 'teacher'].includes(user?.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Only administrators and teachers can delete submissions." 
      });
    }

    const resourcesFile = path.join(__dirname, '..', 'data', 'departments', 'resources-data.json');
    let resourcesData = readJSON(resourcesFile);

    const submissionIndex = (resourcesData.submissions || []).findIndex(s => s.id === id);
    if (submissionIndex === -1) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const deletedSubmission = resourcesData.submissions.splice(submissionIndex, 1)[0];

    // Save updated data
    if (!writeJSON(resourcesFile, resourcesData)) {
      throw new Error('Failed to save updated submission data');
    }

    console.log(`Submission Deleted → ${user.name} deleted submission: ${deletedSubmission.title}`);

    res.json({
      success: true,
      message: "Submission deleted successfully"
    });

  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({
      success: false,
      message: "Failed to delete submission"
    });
  }
});

// Helper functions for file type detection
function getFileTypeFromExtension(ext) {
  const typeMap = {
    '.pdf': 'pdf',
    '.doc': 'doc',
    '.docx': 'doc',
    '.txt': 'text',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.webp': 'image',
    '.mp4': 'video',
    '.mov': 'video',
    '.avi': 'video',
    '.mp3': 'audio',
    '.wav': 'audio',
    '.ogg': 'audio'
  };
  return typeMap[ext] || 'file';
}

function getFileIcon(type) {
  const iconMap = {
    pdf: 'fa-file-pdf',
    doc: 'fa-file-word',
    text: 'fa-file-alt',
    image: 'fa-file-image',
    video: 'fa-file-video',
    audio: 'fa-file-audio',
    file: 'fa-file'
  };
  return iconMap[type] || 'fa-file';
}

function getFileColor(type) {
  const colorMap = {
    pdf: '#dc3545',
    doc: '#0d6efd',
    text: '#6c757d',
    image: '#fd7e14',
    video: '#198754',
    audio: '#6610f2',
    file: '#6c757d'
  };
  return colorMap[type] || '#6c757d';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// =================================================================
// NEWS & EVENTS API ROUTES
// =================================================================

/**
 * @route   GET /news/data
 * @desc    Fetches all news data for the news & events page.
 * @access  Public
 */
router.get('/news/data', (req, res) => {
  try {
    const newsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'news-data.json'));
    console.log('📰 News data fetched successfully');
    res.json({ 
      success: true, 
      data: newsData,
      count: newsData.length 
    });
  } catch (error) {
    console.error('Error fetching news data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch news data' 
    });
  }
});

/**
 * @route   GET /news/blogs
 * @desc    Fetches all blog data for the news & events page.
 * @access  Public
 */
router.get('/news/blogs', (req, res) => {
  try {
    const blogsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'blogs.json'));
    console.log('📝 Blogs data fetched successfully');
    res.json({ 
      success: true, 
      data: blogsData,
      count: blogsData.length 
    });
  } catch (error) {
    console.error('Error fetching blogs data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch blogs data' 
    });
  }
});

/**
 * @route   POST /news/blog-submit
 * @desc    Handles student blog submissions (replaces Formspree).
 * @access  Public
 */
router.post('/news/blog-submit', uploadBlogImage.single('featured_image'), (req, res) => {
  try {
    const { 
      student_name, 
      grade, 
      blog_title, 
      topic, 
      blog_content,
      _gotcha // honeypot field
    } = req.body;

    // Honeypot check - if filled, likely a bot
    if (_gotcha) {
      console.log('🚫 Bot submission detected and rejected');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid submission' 
      });
    }

    // Validation
    if (!student_name?.trim() || !grade?.trim() || !blog_title?.trim() || !topic?.trim() || !blog_content?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled out.' 
      });
    }

    // Email validation (if provided)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.email && !emailRegex.test(req.body.email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      });
    }

    // Check submission limits (2 blogs per student per month)
    const pendingBlogsFile = path.join(__dirname, '..', 'data', 'pending-blogs.json');
    const pendingBlogs = readJSON(pendingBlogsFile);
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const studentSubmissionsThisMonth = pendingBlogs.filter(blog => 
      blog.student_name.toLowerCase() === student_name.toLowerCase() &&
      blog.submitted_at.slice(0, 7) === currentMonth
    );

    if (studentSubmissionsThisMonth.length >= 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have reached the maximum of 2 blog submissions for this month. Please try again next month.' 
      });
    }

    const blogSubmission = {
      id: `blog-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      student_name: student_name.trim(),
      grade: grade.trim(),
      email: req.body.email?.toLowerCase().trim() || null,
      blog_title: blog_title.trim(),
      topic: topic.trim().toLowerCase(),
      blog_content: blog_content.trim(),
      featured_image: req.file ? `/uploads/blogs/${req.file.filename}` : null,
      submitted_at: new Date().toISOString(),
      status: 'pending',
      reviewed_at: null,
      reviewed_by: null,
      published_at: null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    pendingBlogs.unshift(blogSubmission);

    if (!writeJSON(pendingBlogsFile, pendingBlogs)) {
      throw new Error('Failed to save blog submission');
    }

    console.log(`📝 New Blog Submission → ${student_name} | ${blog_title} | Grade: ${grade}`);
    
    res.json({ 
      success: true, 
      message: 'Blog submitted successfully! Your submission will be reviewed within 3-5 business days.',
      submissionId: blogSubmission.id
    });

  } catch (error) {
    console.error('Error processing blog submission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process blog submission. Please try again.' 
    });
  }
});

/**
 * @route   GET /news/events
 * @desc    Fetches upcoming events data.
 * @access  Public
 */
router.get('/news/events', (req, res) => {
  try {
    const eventsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'upcoming-events.json'));
    
    // Filter out past events and sort by date
    const now = new Date();
    const upcomingEvents = eventsData
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(`📅 Events data fetched: ${upcomingEvents.length} upcoming events`);
    
    res.json({ 
      success: true, 
      data: upcomingEvents,
      count: upcomingEvents.length 
    });
  } catch (error) {
    console.error('Error fetching events data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events data' 
    });
  }
});

/**
 * @route   GET /news/photos
 * @desc    Fetches event photos data.
 * @access  Public
 */
router.get('/news/photos', (req, res) => {
  try {
    const photosData = readJSON(path.join(__dirname, '..', 'data', 'static', 'event-photos.json'));
    console.log('📸 Event photos data fetched successfully');
    res.json({ 
      success: true, 
      data: photosData,
      count: photosData.length 
    });
  } catch (error) {
    console.error('Error fetching photos data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch photos data' 
    });
  }
});

/**
 * @route   GET /news/spotlight
 * @desc    Fetches spotlight profiles data.
 * @access  Public
 */
router.get('/news/spotlight', (req, res) => {
  try {
    const spotlightData = readJSON(path.join(__dirname, '..', 'data', 'static', 'spotlight.json'));
    console.log('⭐ Spotlight profiles data fetched successfully');
    res.json({ 
      success: true, 
      data: spotlightData,
      count: spotlightData.length 
    });
  } catch (error) {
    console.error('Error fetching spotlight data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch spotlight data' 
    });
  }
});

/**
 * @route   GET /news/media
 * @desc    Fetches media coverage data.
 * @access  Public
 */
router.get('/news/media', (req, res) => {
  try {
    const mediaData = readJSON(path.join(__dirname, '..', 'data', 'static', 'media-coverage.json'));
    console.log('📰 Media coverage data fetched successfully');
    res.json({ 
      success: true, 
      data: mediaData,
      count: mediaData.length 
    });
  } catch (error) {
    console.error('Error fetching media data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch media data' 
    });
  }
});

/**
 * @route   GET /news/downloads
 * @desc    Fetches downloads/resources data.
 * @access  Public
 */
router.get('/news/downloads', (req, res) => {
  try {
    const downloadsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'downloads.json'));
    console.log('📁 Downloads data fetched successfully');
    res.json({ 
      success: true, 
      data: downloadsData,
      count: downloadsData.length 
    });
  } catch (error) {
    console.error('Error fetching downloads data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch downloads data' 
    });
  }
});

/**
 * @route   GET /news/stats
 * @desc    Fetches news and blog statistics.
 * @access  Public
 */
router.get('/news/stats', (req, res) => {
  try {
    const newsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'news-data.json'));
    const blogsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'blogs.json'));
    const eventsData = readJSON(path.join(__dirname, '..', 'data', 'static', 'upcoming-events.json'));
    
    const now = new Date();
    const upcomingEvents = eventsData.filter(event => new Date(event.date) >= now);
    const achievements = newsData.filter(item => item.category === 'achievements');
    
    // Calculate blog statistics
    const authors = [...new Set(blogsData.map(blog => blog.author))].filter(Boolean);
    const topics = blogsData.reduce((acc, blog) => {
      const topic = (blog.topic || "general").toLowerCase();
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
    
    const popularTopic = Object.keys(topics).length > 0 
      ? Object.keys(topics).reduce((a, b) => topics[a] > topics[b] ? a : b)
      : 'general';

    const stats = {
      totalNews: newsData.length,
      totalEvents: upcomingEvents.length,
      totalAchievements: achievements.length,
      totalBlogs: blogsData.length,
      activeBloggers: authors.length,
      mostPopularTopic: popularTopic,
      categories: {
        achievements: achievements.length,
        events: newsData.filter(item => item.category === 'events').length,
        announcements: newsData.filter(item => item.category === 'announcements').length,
        holidays: newsData.filter(item => item.category === 'holidays').length
      }
    };

    console.log('📊 News statistics calculated successfully');
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error calculating news stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics' 
    });
  }
});

/**
 * @route   POST /news/event-register
 * @desc    Handles event registration.
 * @access  Public
 */
router.post('/news/event-register', (req, res) => {
  try {
    const { event_id, student_name, email, phone, grade } = req.body;

    if (!event_id || !student_name?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event ID, name, and email are required.' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      });
    }

    const eventRegistrationsFile = path.join(__dirname, '..', 'data', 'event-registrations.json');
    let registrations = readJSON(eventRegistrationsFile);

    // Check for duplicate registrations
    const existingRegistration = registrations.find(reg => 
      reg.event_id === event_id && 
      reg.email.toLowerCase() === email.toLowerCase()
    );

    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already registered for this event.' 
      });
    }

    const registration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      event_id: event_id.trim(),
      student_name: student_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      grade: grade?.trim() || null,
      registered_at: new Date().toISOString(),
      status: 'confirmed'
    };

    registrations.unshift(registration);

    if (!writeJSON(eventRegistrationsFile, registrations)) {
      throw new Error('Failed to save event registration');
    }

    console.log(`🎫 Event Registration → ${student_name} registered for event ${event_id}`);
    
    res.json({ 
      success: true, 
      message: 'Successfully registered for the event! You will receive confirmation details via email.',
      registrationId: registration.id
    });

  } catch (error) {
    console.error('Error processing event registration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process registration. Please try again.' 
    });
  }
});

// =================================================================
// ALUMNI NETWORK API ROUTES
// =================================================================

/**
 * @route   GET /alumni/data
 * @desc    Fetches alumni network data for the alumni page.
 * @access  Public
 */
router.get('/alumni/data', (req, res) => {
  try {
    const alumniData = readJSON(path.join(__dirname, '..', 'data', 'static', 'alumni-data.json'));
    console.log('🎓 Alumni data fetched successfully');
    res.json({ 
      success: true, 
      data: alumniData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alumni data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch alumni data' 
    });
  }
});

/**
 * @route   POST /alumni/register
 * @desc    Handles alumni registration and profile updates.
 * @access  Public
 */
router.post('/alumni/register', uploadMixed.array('photos', 2), (req, res) => {
  try {
    const { 
      name, 
      batch, 
      _replyto: email, 
      phone, 
      profession, 
      organization, 
      location, 
      message, 
      skills, 
      connect 
    } = req.body;

    // Validation
    if (!name?.trim() || !batch?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, batch year, and email are required.' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      });
    }

    // Phone validation (if provided)
    if (phone && !/^(\+254|0)[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format.' 
      });
    }

    const alumniRegistrationsFile = path.join(__dirname, '..', 'data', 'alumni-registrations.json');
    let registrations = readJSON(alumniRegistrationsFile);

    // Check for duplicate email submissions
    const existingRegistration = registrations.find(reg => 
      reg.email.toLowerCase() === email.toLowerCase()
    );

    if (existingRegistration) {
      return res.status(409).json({ 
        success: false, 
        message: 'An alumni profile with this email already exists. Please contact us to update your profile.' 
      });
    }

    // Process uploaded photos
    const photos = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const fieldName = index === 0 ? 'profile_photo' : 'passport_photo';
        photos[fieldName] = `/uploads/mixed/${file.filename}`;
      });
    }

    const registration = {
      id: `alumni-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      batch: batch.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      profession: profession?.trim() || null,
      organization: organization?.trim() || null,
      location: location?.trim() || null,
      favorite_memory: message?.trim() || null,
      skills_interests: skills?.trim() || null,
      connection_preferences: connect?.trim() || null,
      photos: photos,
      submitted_at: new Date().toISOString(),
      status: 'pending',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    registrations.unshift(registration);

    if (!writeJSON(alumniRegistrationsFile, registrations)) {
      throw new Error('Failed to save alumni registration');
    }

    console.log(`🎓 New Alumni Registration → ${name} | Batch: ${batch} | Email: ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Welcome to our alumni network! Your registration has been received and will be processed within 48 hours.',
      registrationId: registration.id
    });

  } catch (error) {
    console.error('Error processing alumni registration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process registration. Please try again.' 
    });
  }
});

/**
 * @route   GET /alumni/stats
 * @desc    Fetches alumni network statistics.
 * @access  Public
 */
router.get('/alumni/stats', (req, res) => {
  try {
    const alumniData = readJSON(path.join(__dirname, '..', 'data', 'static', 'alumni-data.json'));
    const registrations = readJSON(path.join(__dirname, '..', 'data', 'alumni-registrations.json'));
    
    const stats = {
      totalAlumni: alumniData.stats?.alumni || '0',
      totalCountries: alumniData.stats?.countries || '0',
      totalYears: alumniData.stats?.years || '0',
      registeredAlumni: registrations.length,
      recentRegistrations: registrations.filter(reg => {
        const submissionDate = new Date(reg.submitted_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return submissionDate >= weekAgo;
      }).length,
      notableAlumni: (alumniData.notable || []).length,
      upcomingEvents: (alumniData.events || []).length,
      batches: {
        recent: registrations.filter(reg => {
          const batchYear = parseInt(reg.batch);
          const currentYear = new Date().getFullYear();
          return currentYear - batchYear <= 5;
        }).length,
        veteran: registrations.filter(reg => {
          const batchYear = parseInt(reg.batch);
          const currentYear = new Date().getFullYear();
          return currentYear - batchYear > 20;
        }).length
      }
    };

    console.log('📊 Alumni statistics calculated successfully');
    res.json({ 
      success: true, 
      data: stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alumni stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch alumni statistics' 
    });
  }
});

/**
 * @route   GET /alumni/registrations
 * @desc    Fetches all alumni registrations (Admin only).
 * @access  Protected
 */
router.get('/alumni/registrations', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    
    // Only allow admin or teacher to view registrations
    if (!['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin or teacher privileges required.' 
      });
    }
    
    const registrationsFile = path.join(__dirname, '..', 'data', 'alumni-registrations.json');
    let registrations = readJSON(registrationsFile);
    
    // Sort by submission date (newest first)
    const sortedRegistrations = registrations.sort((a, b) => 
      new Date(b.submitted_at) - new Date(a.submitted_at)
    );
    
    res.json({ 
      success: true, 
      data: sortedRegistrations,
      count: sortedRegistrations.length 
    });
  } catch (error) {
    console.error('Error fetching alumni registrations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch alumni registrations' 
    });
  }
});

/**
 * @route   PUT /alumni/registrations/:id
 * @desc    Updates alumni registration status (Admin/Teacher only).
 * @access  Protected
 */
router.put('/alumni/registrations/:id', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Only allow admin or teacher to update registrations
    if (!['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin or teacher privileges required.' 
      });
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be pending, approved, or rejected.' 
      });
    }
    
    const registrationsFile = path.join(__dirname, '..', 'data', 'alumni-registrations.json');
    let registrations = readJSON(registrationsFile);
    
    const registrationIndex = registrations.findIndex(reg => reg.id === id);
    if (registrationIndex === -1) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    // Update the registration
    registrations[registrationIndex].status = status;
    registrations[registrationIndex].updated_at = new Date().toISOString();
    registrations[registrationIndex].updated_by = user.name;
    if (notes) {
      registrations[registrationIndex].admin_notes = notes;
    }
    
    if (!writeJSON(registrationsFile, registrations)) {
      throw new Error('Failed to save updated registration');
    }
    
    console.log(`Alumni Registration ${id} updated to ${status} by ${user.name}`);
    
    res.json({ 
      success: true, 
      message: `Registration marked as ${status}`,
      data: registrations[registrationIndex]
    });
  } catch (error) {
    console.error('Error updating alumni registration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update registration' 
    });
  }
});

/**
 * @route   POST /alumni/events/register
 * @desc    Handles registration for alumni events.
 * @access  Public
 */
router.post('/alumni/events/register', (req, res) => {
  try {
    const { event_title, name, email, phone, batch } = req.body;

    if (!event_title || !name?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event title, name, and email are required.' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      });
    }

    const eventRegistrationsFile = path.join(__dirname, '..', 'data', 'alumni-event-registrations.json');
    let registrations = readJSON(eventRegistrationsFile);

    // Check for duplicate registrations
    const existingRegistration = registrations.find(reg => 
      reg.event_title === event_title && 
      reg.email.toLowerCase() === email.toLowerCase()
    );

    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already registered for this event.' 
      });
    }

    const registration = {
      id: `alumni-event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      event_title: event_title.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      batch: batch?.trim() || null,
      registered_at: new Date().toISOString(),
      status: 'confirmed'
    };

    registrations.unshift(registration);

    if (!writeJSON(eventRegistrationsFile, registrations)) {
      throw new Error('Failed to save event registration');
    }

    console.log(`🎫 Alumni Event Registration → ${name} registered for ${event_title}`);
    
    res.json({ 
      success: true, 
      message: 'Successfully registered for the alumni event! You will receive confirmation details via email.',
      registrationId: registration.id
    });

  } catch (error) {
    console.error('Error processing alumni event registration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process registration. Please try again.' 
    });
  }
});

// =================================================================
// STAFF API ROUTES
// =================================================================

/**
 * @route   GET /staff/data
 * @desc    Fetches all staff data for the staff directory page.
 * @access  Public
 */
router.get('/staff/data', (req, res) => {
  try {
    const { category, department, search } = req.query;
    let staffData = readJSON(path.join(__dirname, '..', 'data', 'static', 'staff-data.json'));
    
    // Apply category filter
    if (category && category !== 'all') {
      staffData = staffData.filter(staff => staff.category === category);
    }
    
    // Apply department filter
    if (department && department !== 'all') {
      staffData = staffData.filter(staff => 
        staff.department?.toLowerCase() === department.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase().trim();
      staffData = staffData.filter(staff => 
        staff.name?.toLowerCase().includes(searchTerm) ||
        staff.designation?.toLowerCase().includes(searchTerm) ||
        staff.department?.toLowerCase().includes(searchTerm) ||
        staff.qualification?.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log(`👥 Staff data fetched: ${staffData.length} members`);
    
    res.json(staffData);
  } catch (error) {
    console.error('Error fetching staff data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff data' 
    });
  }
});

/**
 * @route   GET /staff/departments
 * @desc    Fetches unique departments from staff data.
 * @access  Public
 */
router.get('/staff/departments', (req, res) => {
  try {
    const staffData = readJSON(path.join(__dirname, '..', 'data', 'static', 'staff-data.json'));
    
    const departments = [...new Set(staffData
      .map(staff => staff.department)
      .filter(dept => dept && dept.trim())
    )].sort();
    
    console.log(`🏢 Staff departments fetched: ${departments.length} departments`);
    
    res.json({ 
      success: true, 
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('Error fetching staff departments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch departments' 
    });
  }
});

/**
 * @route   GET /staff/stats
 * @desc    Fetches staff statistics.
 * @access  Public
 */
router.get('/staff/stats', (req, res) => {
  try {
    const staffData = readJSON(path.join(__dirname, '..', 'data', 'static', 'staff-data.json'));
    
    const stats = {
      total: staffData.length,
      byCategory: {
        leadership: staffData.filter(s => s.category === 'leadership').length,
        teaching: staffData.filter(s => s.category === 'teaching').length,
        admin: staffData.filter(s => s.category === 'admin').length,
        support: staffData.filter(s => s.category === 'support').length
      },
      byDepartment: staffData.reduce((acc, staff) => {
        const dept = staff.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
      departments: [...new Set(staffData.map(s => s.department).filter(Boolean))].length
    };
    
    console.log('📊 Staff statistics calculated successfully');
    
    res.json({ 
      success: true, 
      data: stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff statistics' 
    });
  }
});

/**
 * @route   GET /staff/:id
 * @desc    Fetches a single staff member by index or name.
 * @access  Public
 */
router.get('/staff/:id', (req, res) => {
  try {
    const { id } = req.params;
    const staffData = readJSON(path.join(__dirname, '..', 'data', 'static', 'staff-data.json'));
    
    // Try to find by index first
    let staff = staffData[parseInt(id)];
    
    // If not found by index, try to find by name (URL encoded)
    if (!staff) {
      const decodedName = decodeURIComponent(id);
      staff = staffData.find(s => 
        s.name.toLowerCase() === decodedName.toLowerCase()
      );
    }
    
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch staff member' 
    });
  }
});

/**
 * @route   POST /staff
 * @desc    Adds a new staff member (Admin only).
 * @access  Protected
 */
router.post('/staff', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    
    // Only allow admin to add staff
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required.' 
      });
    }
    
    const { name, designation, qualification, experience, category, department, photo, bio, email, phone } = req.body;
    
    if (!name || !designation || !category || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, designation, category, and department are required.' 
      });
    }
    
    const staffFile = path.join(__dirname, '..', 'data', 'static', 'staff-data.json');
    let staffData = readJSON(staffFile);
    
    const newStaff = {
      name: name.trim(),
      designation: designation.trim(),
      qualification: qualification?.trim() || '',
      experience: experience?.trim() || '',
      category: category.trim(),
      department: department.trim(),
      photo: photo || '/assets/images/defaults/default-user.png',
      bio: bio?.trim() || '',
      email: email?.trim() || '',
      phone: phone?.trim() || ''
    };
    
    staffData.push(newStaff);
    
    if (!writeJSON(staffFile, staffData)) {
      throw new Error('Failed to save staff data');
    }
    
    console.log(`👤 New Staff Added → ${user.name} added: ${name}`);
    
    res.json({ 
      success: true, 
      message: 'Staff member added successfully!',
      data: newStaff
    });
  } catch (error) {
    console.error('Error adding staff member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add staff member.' 
    });
  }
});

/**
 * @route   PUT /staff/:index
 * @desc    Updates a staff member (Admin only).
 * @access  Protected
 */
router.put('/staff/:index', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    const { index } = req.params;
    
    // Only allow admin to update staff
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required.' 
      });
    }
    
    const staffFile = path.join(__dirname, '..', 'data', 'static', 'staff-data.json');
    let staffData = readJSON(staffFile);
    
    const staffIndex = parseInt(index);
    if (isNaN(staffIndex) || staffIndex < 0 || staffIndex >= staffData.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found.' 
      });
    }
    
    const updates = req.body;
    staffData[staffIndex] = { ...staffData[staffIndex], ...updates };
    
    if (!writeJSON(staffFile, staffData)) {
      throw new Error('Failed to save staff data');
    }
    
    console.log(`👤 Staff Updated → ${user.name} updated: ${staffData[staffIndex].name}`);
    
    res.json({ 
      success: true, 
      message: 'Staff member updated successfully!',
      data: staffData[staffIndex]
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update staff member.' 
    });
  }
});

/**
 * @route   DELETE /staff/:index
 * @desc    Deletes a staff member (Admin only).
 * @access  Protected
 */
router.delete('/staff/:index', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    const { index } = req.params;
    
    // Only allow admin to delete staff
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required.' 
      });
    }
    
    const staffFile = path.join(__dirname, '..', 'data', 'static', 'staff-data.json');
    let staffData = readJSON(staffFile);
    
    const staffIndex = parseInt(index);
    if (isNaN(staffIndex) || staffIndex < 0 || staffIndex >= staffData.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found.' 
      });
    }
    
    const deletedStaff = staffData.splice(staffIndex, 1)[0];
    
    if (!writeJSON(staffFile, staffData)) {
      throw new Error('Failed to save staff data');
    }
    
    console.log(`🗑️ Staff Deleted → ${user.name} deleted: ${deletedStaff.name}`);
    
    res.json({ 
      success: true, 
      message: 'Staff member deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete staff member.' 
    });
  }
});

// =================================================================
// GALLERY API ROUTES
// =================================================================

/**
 * @route   GET /gallery/photos
 * @desc    Fetches all gallery photos with optional category filtering.
 * @access  Public
 */
router.get('/gallery/photos', (req, res) => {
  try {
    const { category } = req.query;
    let photos = readJSON(path.join(__dirname, '..', 'data', 'static', 'gallery-data.json'));
    
    if (category && category !== 'all') {
      photos = photos.filter(photo => photo.category === category);
    }
    
    console.log(`📸 Gallery photos fetched: ${photos.length} photos${category ? ` (category: ${category})` : ''}`);
    
    res.json({ 
      success: true, 
      data: photos,
      count: photos.length,
      categories: ['all', 'campus', 'academics', 'sports', 'events', 'celebrations', 'alumni']
    });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch gallery photos' 
    });
  }
});

/**
 * @route   GET /gallery/videos
 * @desc    Fetches all gallery videos with optional category filtering.
 * @access  Public
 */
router.get('/gallery/videos', (req, res) => {
  try {
    const { category } = req.query;
    let videos = readJSON(path.join(__dirname, '..', 'data', 'static', 'video-gallery-data.json'));
    
    if (category && category !== 'all') {
      videos = videos.filter(video => video.category === category);
    }
    
    console.log(`🎬 Gallery videos fetched: ${videos.length} videos${category ? ` (category: ${category})` : ''}`);
    
    res.json({ 
      success: true, 
      data: videos,
      count: videos.length,
      categories: ['all', 'school-life', 'events', 'academics', 'sports', 'messages']
    });
  } catch (error) {
    console.error('Error fetching gallery videos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch gallery videos' 
    });
  }
});

/**
 * @route   GET /gallery/stats
 * @desc    Fetches gallery statistics.
 * @access  Public
 */
router.get('/gallery/stats', (req, res) => {
  try {
    const photos = readJSON(path.join(__dirname, '..', 'data', 'static', 'gallery-data.json'));
    const videos = readJSON(path.join(__dirname, '..', 'data', 'static', 'video-gallery-data.json'));
    
    const photoCategories = photos.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {});
    
    const videoCategories = videos.reduce((acc, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1;
      return acc;
    }, {});
    
    const stats = {
      totalPhotos: photos.length,
      totalVideos: videos.length,
      photosByCategory: photoCategories,
      videosByCategory: videoCategories,
      totalEvents: 50,
      yearsOfMemories: 10,
      participation: '100%'
    };
    
    console.log('📊 Gallery statistics calculated successfully');
    
    res.json({ 
      success: true, 
      data: stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch gallery statistics' 
    });
  }
});

/**
 * @route   POST /gallery/upload
 * @desc    Handles gallery photo uploads (Admin/Teacher only).
 * @access  Protected
 */
router.post('/gallery/upload', requireAuth, uploadImage.array('photos', 20), (req, res) => {
  try {
    const user = req.session.user;
    
    // Only allow admin or teacher to upload
    if (!['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin or teacher privileges required.' 
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No photos uploaded.' 
      });
    }
    
    const { title, category } = req.body;
    
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category is required.' 
      });
    }
    
    const galleryFile = path.join(__dirname, '..', 'data', 'static', 'gallery-data.json');
    let photos = readJSON(galleryFile);
    
    const newPhotos = req.files.map((file, index) => ({
      id: Date.now() + index,
      title: title || `Gallery Photo ${photos.length + index + 1}`,
      category: category,
      thumb: `/uploads/images/${file.filename}`,
      full: `/uploads/images/${file.filename}`,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString()
    }));
    
    photos = [...newPhotos, ...photos];
    
    if (!writeJSON(galleryFile, photos)) {
      throw new Error('Failed to save gallery data');
    }
    
    console.log(`📸 Gallery Upload → ${user.name} uploaded ${req.files.length} photo(s)`);
    
    res.json({ 
      success: true, 
      message: `${req.files.length} photo(s) uploaded successfully!`,
      uploadedPhotos: newPhotos
    });
  } catch (error) {
    console.error('Error uploading gallery photos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload photos. Please try again.' 
    });
  }
});

/**
 * @route   DELETE /gallery/photos/:id
 * @desc    Deletes a gallery photo (Admin only).
 * @access  Protected
 */
router.delete('/gallery/photos/:id', requireAuth, (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;
    
    // Only allow admin to delete
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin privileges required.' 
      });
    }
    
    const galleryFile = path.join(__dirname, '..', 'data', 'static', 'gallery-data.json');
    let photos = readJSON(galleryFile);
    
    const photoIndex = photos.findIndex(p => p.id === parseInt(id) || p.id === id);
    if (photoIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Photo not found.' 
      });
    }
    
    const deletedPhoto = photos.splice(photoIndex, 1)[0];
    
    if (!writeJSON(galleryFile, photos)) {
      throw new Error('Failed to save gallery data');
    }
    
    console.log(`🗑️ Gallery Photo Deleted → ${user.name} deleted: ${deletedPhoto.title}`);
    
    res.json({ 
      success: true, 
      message: 'Photo deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting gallery photo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete photo.' 
    });
  }
});

export default router;