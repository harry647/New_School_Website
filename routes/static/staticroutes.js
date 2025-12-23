// =================================================================
// FORM SUBMISSION ENDPOINTS
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

const uploadResume = createUploader('resumes/', [...documentExtensions, ...imageExtensions]);
const uploadBlogImage = createUploader('blogs/', imageExtensions);
const uploadDonationDoc = createUploader('donations/', [...documentExtensions, ...imageExtensions]);
const uploadDepartmentFile = createUploader('departments/', [...documentExtensions, ...mediaExtensions, ...imageExtensions]);

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

  const file = path.join(__dirname, '..', '..', 'data', 'enquiries.json');
  const enquiries = readJSON(file);

  enquiries.push({
    id: Date.now().toString(),
    studentName: studentName.trim(),
    parentPhone: parentPhone.trim(),
    email: email?.trim() || null,
    submittedAt: new Date().toISOString(),
    status: 'new'
  });

  console.log('Attempting to write to file:', file);
  if (writeJSON(file, enquiries)) {
    console.log(`Enquiry → ${studentName} | ${parentPhone}`);
    res.json({ success: true, message: 'Enquiry received!' });
  } else {
    console.error('writeJSON returned false for file:', file);
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

  const file = path.join(__dirname, '..', '..', 'data', 'applications.json');
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

  const file = path.join(__dirname, '..', '..', 'data', 'contacts.json');
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

  const file = path.join(__dirname, '..', '..', 'data', 'pending-blogs.json');
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

  const file = path.join(__dirname, '..', '..', 'data', 'counseling-bookings.json');
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

  const file = path.join(__dirname, '..', '..', 'data', 'donations.json');
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

  const file = path.join(__dirname, '..', '..', 'data', 'subscribers.json');
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

/**
 * @route   POST /contact
 * @desc    Handles the contact form submission from the About page.
 * @access  Public
 */
router.post('/contact', (req, res) => {
  const { name, _replyto: email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'about-contact.json');
  const contacts = readJSON(file);

  contacts.push({
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || null,
    subject,
    message: message.trim(),
    submitted_at: new Date().toISOString(),
    status: "new"
  });

  writeJSON(file, contacts);
  console.log(`About Contact → ${name} | ${subject}`);
  res.json({ success: true, message: "Message received! We will get back to you soon." });
});

/**
 * @route   POST /feedback
 * @desc    Handles the feedback form submission from the About page.
 * @access  Public
 */
router.post('/feedback', (req, res) => {
  const { email, category, rating, feedback, suggestions } = req.body;

  if (!email || !category || !rating || !feedback) {
    return res.status(400).json({ success: false, message: 'Email, category, rating, and feedback are required.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'about-feedback.json');
  const feedbacks = readJSON(file);

  feedbacks.push({
    id: Date.now().toString(),
    email: email.toLowerCase().trim(),
    category,
    rating: parseInt(rating),
    feedback: feedback.trim(),
    suggestions: suggestions?.trim() || null,
    submitted_at: new Date().toISOString(),
    status: "new"
  });

  writeJSON(file, feedbacks);
  console.log(`About Feedback → ${email} | Rating: ${rating}`);
  res.json({ success: true, message: "Thank you for your feedback! We appreciate your input." });
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
  const notifications = readJSON(path.join(__dirname, '..', '..', 'data', 'notifications.json'));
  res.json(notifications || []);
});

export default router;