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
const createUploader = (folder, allowedExtensions) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Use path.join for robust path creation
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${folder.slice(0, -1)}-${unique}${path.extname(file.originalname)}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit for all files
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} are allowed.`), false);
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
router.get('/clubs/list', (req, res) => {
  const clubs = readJSON(path.join(__dirname, '..', 'data', 'clubs', 'clubs.json'));
  res.json(clubs);
});

/**
 * @route   GET /clubs/events
 * @desc    Fetches all scheduled club events.
 * @access  Protected
 */
router.get('/clubs/events', (req, res) => {
  const events = readJSON(path.join(__dirname, '..', 'data', 'clubs', 'events.json'));
  res.json(events);
});

/**
 * @route   POST /clubs/join
 * @desc    Handles a student's application to join a club.
 * @access  Protected
 */
router.post('/clubs/join', (req, res) => {
  const data = req.body;
  if (!data.name || !data.clubName) {
    return res.status(400).json({ success: false, message: "Name and Club Name are required." });
  }
  const file = path.join(__dirname, '..', 'data', 'club-joins.json');
  let joins = readJSON(file);
  joins.push({ ...data, submitted_at: new Date().toISOString(), status: 'pending' });
  writeJSON(file, joins);
  console.log(`Club Join Application → ${data.name} for ${data.clubName}`);
  res.json({ success: true, message: "Application submitted!" });
});

/**
 * @route   POST /clubs/upload
 * @desc    Handles file submissions for a specific club.
 * @access  Protected
 */
router.post('/clubs/upload', uploadClubSubmission.array('files', 20), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }
  console.log(`Club Upload → Club ID: ${req.body.clubId} | ${req.files.length} files received.`);
  res.json({ success: true, message: "Files submitted." });
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
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'applied-sciences.json'));
  res.json(data);
});
router.post('/departments/applied-sciences/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Applied Sciences Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Humanities ---
router.get('/departments/humanities', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'humanities.json'));
  res.json(data);
});
router.post('/departments/humanities/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Humanities Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Languages ---
router.get('/departments/languages', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'languages.json'));
  res.json(data);
});
router.post('/departments/languages/upload', uploadDepartmentFile.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: "No files" });
  console.log(`Languages Upload → ${req.files.length} files`);
  res.json({ success: true });
});

// --- Mathematics ---
router.get('/departments/mathematics', (req, res) => {
  const data = readJSON(path.join(__dirname, '..', 'data', 'departments', 'mathematics.json'));
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