import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const router = express.Router();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== MULTER CONFIG (Resumes, Blogs, Donations) ====================
const createUploader = (folder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `public/uploads/${folder}`;
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
    limits: { fileSize: folder === 'resumes/' ? 10 * 1024 * 1024 : 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = folder === 'blogs/' 
        ? ['.jpg', '.jpeg', '.png', '.webp']
        : ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, allowed.includes(ext));
    }
  });
};

const uploadResume = createUploader('resumes/');
const uploadBlogImage = createUploader('blogs/');
const uploadDonationDoc = createUploader('donations/');

// ==================== HELPER FUNCTIONS ====================
const readJSON = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Read JSON error:', err.message);
    return [];
  }
};

const writeJSON = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Write JSON error:', err.message);
    return false;
  }
};

// ==================== FORM ENDPOINTS ====================

// 1. Homepage Quick Enquiry
router.post('/api/submit-enquiry', (req, res) => {
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
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 2. Full Admission Application
router.post('/api/submit-application', (req, res) => {
  const { student_name, dob, gender, grade, parent_name, _replyto: email, phone, previous_school, message } = req.body;

  if (!student_name || !dob || !gender || !grade || !parent_name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'All required fields needed.' });
  }

  if (!/^0[71]\d{8}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ success: false, message: 'Invalid phone.' });
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

// 3. Contact Form
router.post('/api/contact', (req, res) => {
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

// 4. Student Blog Submission
router.post('/api/submit-blog', uploadBlogImage.single('image'), (req, res) => {
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
  console.log(`Blog → ${author_name} | ${title}`);
  res.json({ success: true, message: "Blog submitted for review!" });
});

// 5. Counseling Booking
router.post('/api/book-counseling', uploadResume.single('resume'), (req, res) => {
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
    resume_path: req.file ? `/api/uploads/resumes/${req.file.filename}` : null,
    submitted_at: new Date().toISOString(),
    status: "pending"
  });

  writeJSON(file, bookings);
  console.log(`Counseling → ${student_name} on ${preferred_date}`);
  res.json({ success: true, message: "Booking received!" });
});

// 6. Donation
router.post('/api/donate', uploadDonationDoc.single('attachment'), (req, res) => {
  const { donor_name, _replyto: email, phone, amount, purpose, organization, message } = req.body;

  if (!donor_name || !email || !amount || !purpose) {
    return res.status(400).json({ success: false, message: "Required fields missing." });
  }

  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum < 50) {
    return res.status(400).json({ success: false, message: "Minimum Ksh 50." });
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
  res.json({ success: true, message: "Donation recorded!" });
});

// 7. Newsletter Subscription
router.post('/api/subscribe', (req, res) => {
  let { _replyto: email, name, 'preferences[]': prefs } = req.body;

  const preferences = Array.isArray(prefs) ? prefs : prefs ? [prefs] : [];

  if (!email?.trim()) {
    return res.status(400).json({ success: false, message: "Email required." });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: "Invalid email." });
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
  console.log(`Subscriber → ${cleanEmail}`);
  res.json({ success: true, message: "Subscribed!" });
});

// --------------------
// Existing Routes – Clean & Fixed (2025+)
// --------------------
router.get('/api/notifications', (req, res) => {
  const notifications = readJSON(path.join(__dirname, '..', 'data', 'notifications.json'));
  res.json(notifications || []);
});

router.get('/api/clubs/:clubName/events', (req, res) => {
  const { clubName } = req.params;
  const events = readJSON(path.join(__dirname, '..', 'data', 'clubEvents.json'));
  const filtered = events.filter(ev => 
    ev.club?.toLowerCase() === clubName.toLowerCase()
  );
  res.json(filtered);
});

router.get('/api/e-learning/assignments', (req, res) => {
  const assignments = readJSON(path.join(__dirname, '..', 'data', 'assignments.json'));
  res.json(assignments || []);
});

router.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const users = readJSON(path.join(__dirname, '..', 'data', 'users.json'));
  const user = users.find(u => u.id.toString() === id.toString());

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Never send password in response
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

router.put('/api/users/:id', (req, res) => {
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
  if (password) users[index].password = password; // hash in production!
  if (role) users[index].role = role;

  if (!writeJSON(usersFile, users)) {
    return res.status(500).json({ success: false, message: 'Failed to save changes.' });
  }

  const { password: _, ...updatedUser } = users[index];

  console.log(`User updated → ID: ${id} | ${name || email || role}`);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

router.get('/api/dashboard', (req, res) => {
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized – Please log in' });
  }

  const redirects = {
    clubs: '/portal/clubs',
    'e-learning': '/portal/e-learning',
    admin: '/admin/dashboard',
    teacher: '/portal/teacher',
    parent: '/portal/parent',
    student: '/portal/student'
  };

  const redirectUrl = redirects[user.role] || '/';

  res.json({
    success: true,
    redirect: redirectUrl,
    message: `Welcome back, ${user.name || user.email}!`
  });
});

export default router;