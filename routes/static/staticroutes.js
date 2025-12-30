// =================================================================
// FORM SUBMISSION ENDPOINTS
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
let EnquiryModel, ApplicationModel, ContactModel, NotificationModel, GalleryPhotoModel, GalleryVideoModel;

// Dynamic import of MongoDB models with error handling
try {
  EnquiryModel = (await import('../../models/static/Enquiry.js')).default;
  ApplicationModel = (await import('../../models/static/Application.js')).default;
  ContactModel = (await import('../../models/static/Contact.js')).default;
  NotificationModel = (await import('../../models/Notification.js')).default;
} catch (error) {
  console.log('MongoDB models not available, using JSON fallback');
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

// Helper: Save data to MongoDB with JSON fallback
const saveWithFallback = async (model, filePath, data) => {
  try {
    // Try MongoDB first
    if (model && mongoose.connection.readyState === 1) {
      await model.create(data);
      console.log('✅ Saved to MongoDB');
    }
  } catch (error) {
    console.error('❌ MongoDB save error:', error.message);
  }

  // Always save to JSON as backup
  let existingData = readJSON(filePath);
  existingData.push(data);
  writeJSON(filePath, existingData);
  console.log('🔄 JSON backup saved');
};

// Helper: Get data from MongoDB with JSON fallback
const getWithFallback = async (model, filePath) => {
  try {
    // Try MongoDB first
    if (model && mongoose.connection.readyState === 1) {
      const data = await model.find({}).lean();
      console.log(`✅ Retrieved ${data.length} records from MongoDB`);
      return data;
    }
  } catch (error) {
    console.error('❌ MongoDB error:', error.message);
  }

  // Fallback to JSON
  console.log('🔄 Using JSON fallback');
  return readJSON(filePath);
};

// Multer configuration
const createUploader = (folder, allowedExtensions = [], maxSize = 15 * 1024 * 1024) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${unique}${ext}`);
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
const uploadAlumniPhotos = createUploader('alumni/', imageExtensions);
const uploadGalleryPhotos = createUploader('gallery/photos', imageExtensions);
const uploadGalleryVideos = createUploader('gallery/videos', mediaExtensions);

/**
 * @route   POST /upload-photos
 * @desc    Handles photo uploads for the gallery.
 * @access  Public
 */
router.post('/upload-photos', uploadGalleryPhotos.array('photos', 10), (req, res) => {
  const { name, email, category, event_date, description } = req.body;

  if (!name || !email || !category || !description) {
    return res.status(400).json({ success: false, message: 'Name, email, category, and description are required.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No photos uploaded.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'gallery-photos.json');
  const photos = readJSON(file);

  req.files.forEach(file => {
    photos.push({
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      category,
      event_date: event_date || null,
      description: description.trim(),
      photo_path: `/uploads/gallery/photos/${file.filename}`,
      submitted_at: new Date().toISOString(),
      status: "pending"
    });
  });

  writeJSON(file, photos);
  console.log(`Photo Upload → ${name} | ${req.files.length} photos`);
  res.json({ success: true, message: "Photos uploaded successfully! They will be reviewed before being added to the gallery." });
});

/**
 * @route   POST /upload-video
 * @desc    Handles video uploads for the gallery.
 * @access  Public
 */
router.post('/upload-video', uploadGalleryVideos.single('video'), (req, res) => {
  const { name, email, title, category, description } = req.body;

  if (!name || !email || !title || !category || !description) {
    return res.status(400).json({ success: false, message: 'Name, email, title, category, and description are required.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video uploaded.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'gallery-videos.json');
  const videos = readJSON(file);

  videos.push({
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    title: title.trim(),
    category,
    description: description.trim(),
    video_path: `/uploads/gallery/videos/${req.file.filename}`,
    submitted_at: new Date().toISOString(),
    status: "pending"
  });

  writeJSON(file, videos);
  console.log(`Video Upload → ${name} | ${title}`);
  res.json({ success: true, message: "Video uploaded successfully! It will be reviewed before being added to the gallery." });
});

/**
 * @route   POST /submit-enquiry
 * @desc    Handles homepage quick enquiry form submissions.
 * @access  Public
 */
router.post('/submit-enquiry', async (req, res) => {
  const { studentName, parentPhone, email } = req.body;

  if (!studentName || !parentPhone) {
    return res.status(400).json({ success: false, message: 'Name and phone required.' });
  }

  if (!/^0[0-9]{9}$/.test(parentPhone)) {
    return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'enquiries.json');
  const enquiryData = {
    id: Date.now().toString(),
    studentName: studentName.trim(),
    parentPhone: parentPhone.trim(),
    email: email?.trim() || null,
    submittedAt: new Date().toISOString(),
    status: 'new'
  };

  try {
    await saveWithFallback(EnquiryModel, file, enquiryData);
    console.log(`Enquiry → ${studentName} | ${parentPhone}`);
    res.json({ success: true, message: 'Enquiry received!' });
  } catch (error) {
    console.error('Error saving enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error saving enquiry.' });
  }
});

/**
 * @route   POST /submit-application
 * @desc    Handles the full admission application form.
 * @access  Public
 */
const uploadAdmissionDocs = createUploader('admissions/', [...documentExtensions, ...imageExtensions]);
router.post('/submit-application', uploadAdmissionDocs.fields([
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'academic_results', maxCount: 1 },
  { name: 'school_report', maxCount: 1 },
  { name: 'medical_report', maxCount: 1 },
  { name: 'passport_photo', maxCount: 1 }
]), async (req, res) => {
  const { student_name, dob, gender, grade, parent_name, _replyto: email, phone, previous_school, message } = req.body;

  if (!student_name || !dob || !gender || !grade || !parent_name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'All required fields needed.' });
  }

  if (!/^(\+254|0)[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number.' });
  }

  // Check if required documents are uploaded
  if (!req.files || !req.files.birth_certificate || !req.files.academic_results) {
    return res.status(400).json({ success: false, message: 'Birth certificate and academic results are required documents.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'applications.json');
  const applicationData = {
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
    birth_certificate: req.files.birth_certificate ? `/uploads/admissions/${req.files.birth_certificate[0].filename}` : null,
    academic_results: req.files.academic_results ? `/uploads/admissions/${req.files.academic_results[0].filename}` : null,
    school_report: req.files.school_report ? `/uploads/admissions/${req.files.school_report[0].filename}` : null,
    medical_report: req.files.medical_report ? `/uploads/admissions/${req.files.medical_report[0].filename}` : null,
    passport_photo: req.files.passport_photo ? `/uploads/admissions/${req.files.passport_photo[0].filename}` : null,
    submitted_at: new Date().toISOString(),
    status: "pending"
  };

  try {
    await saveWithFallback(ApplicationModel, file, applicationData);
    console.log(`Application → ${student_name} | ${grade}`);
    res.json({ success: true, message: "Application received!" });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({ success: false, message: 'Server error saving application.' });
  }
});

/**
 * @route   POST /contact
 * @desc    Handles the main contact form.
 * @access  Public
 */
router.post('/contact', async (req, res) => {
  const { name, _replyto: email, phone, subject, department, message, followup } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Required fields missing.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'contacts.json');
  const contactData = {
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
  };

  try {
    await saveWithFallback(ContactModel, file, contactData);
    console.log(`Contact → ${name} | ${subject}`);
    res.json({ success: true, message: "Message received!" });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ success: false, message: 'Server error saving contact.' });
  }
});

/**
 * @route   POST /contactus
 * @desc    Handles the contact form submission from the contact page.
 * @access  Public
 */
const uploadContactAttachment = createUploader('contact/', [...documentExtensions, ...imageExtensions]);
router.post('/contactus', uploadContactAttachment.single('attachment'), async (req, res) => {
  const { name, _replyto: email, phone, subject, department, message, followup } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Required fields missing.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'contactus.json');
  const contactData = {
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
  };

  try {
    await saveWithFallback(ContactModel, file, contactData);
    console.log(`Contact Us → ${name} | ${subject}`);
    res.json({ success: true, message: "Message received!" });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ success: false, message: 'Server error saving contact.' });
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
router.get('/notifications', async (req, res) => {
  try {
    const file = path.join(__dirname, '..', '..', 'data', 'notifications.json');
    const notifications = await getWithFallback(NotificationModel, file);
    res.json(notifications || []);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json([]);
  }
});

/**
 * @route   POST /register-club
 * @desc    Handles student club registration form submissions.
 * @access  Public
 */
router.post('/register-club', (req, res) => {
  const { student_name, grade, house, email, message, interested_clubs } = req.body;

  if (!student_name || !grade || !house || !interested_clubs) {
    return res.status(400).json({ success: false, message: 'Student name, grade, house, and at least one club selection are required.' });
  }

  // Ensure interested_clubs is an array
  const clubs = Array.isArray(interested_clubs) ? interested_clubs : [interested_clubs];

  if (clubs.length === 0 || clubs.length > 3) {
    return res.status(400).json({ success: false, message: 'Please select between 1-3 clubs.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'club-registrations.json');
  const registrations = readJSON(file);

  registrations.push({
    id: Date.now().toString(),
    student_name: student_name.trim(),
    grade: grade.trim(),
    house: house.trim(),
    email: email?.trim() || null,
    interested_clubs: clubs,
    message: message?.trim() || null,
    submitted_at: new Date().toISOString(),
    status: "new"
  });

  writeJSON(file, registrations);
  console.log(`Club Registration → ${student_name} | ${grade} | Clubs: ${clubs.join(', ')}`);
  res.json({ success: true, message: "Club registration received! Coordinators will contact you soon." });
});

/**
 * @route   POST /register-alumni
 * @desc    Handles alumni registration and profile updates with photo uploads.
 * @access  Public
 */
router.post('/register-alumni', uploadAlumniPhotos.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'passport_photo', maxCount: 1 }
]), (req, res) => {
  const { name, batch, _replyto: email, phone, profession, organization, location, message, skills, connect } = req.body;

  if (!name || !batch || !email) {
    return res.status(400).json({ success: false, message: 'Name, batch year, and email are required.' });
  }

  const file = path.join(__dirname, '..', '..', 'data', 'alumni-registrations.json');
  const registrations = readJSON(file);

  registrations.push({
    id: Date.now().toString(),
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
    profile_photo: req.files?.profile_photo?.[0] ? `/uploads/alumni/${req.files.profile_photo[0].filename}` : null,
    passport_photo: req.files?.passport_photo?.[0] ? `/uploads/alumni/${req.files.passport_photo[0].filename}` : null,
    registration_date: new Date().toISOString(),
    status: "new"
  });

  writeJSON(file, registrations);
  console.log(`Alumni Registration → ${name} | Batch ${batch}`);
  res.json({ success: true, message: "Thank you for joining our alumni network! We'll contact you soon." });
});

export default router;