// =================================================================
// ULTRA-PREMIUM PROFILE SYSTEM (2025–2026)
// Bar Union Mixed Secondary School
// =================================================================

// =================================================================
// 1. PHOTO UPLOAD – Live Preview + Upload to Server
// =================================================================
document.getElementById('photoInput').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Show instant preview
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('userPhoto').src = e.target.result;
  };
  reader.readAsDataURL(file);

  // 2. Upload to server
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Profile photo updated successfully!', 'success');
    } else {
      showToast('Failed to update photo. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Network error. Please check your connection.', 'error');
  }
});

// =================================================================
// 2. LOAD PROFILE FROM API (Real Data with Enhanced Features)
// =================================================================
async function loadProfile() {
  const loadingElements = document.querySelectorAll('#userName, #userEmail, #userRole, .stat-item strong');
  loadingElements.forEach(el => el.textContent = 'Loading...');

  try {
    const res = await fetch('/auth/profile/enhanced', {
      credentials: 'include'
    });
    const data = await res.json();

    if (!data.success || !data.user) {
      window.location.href = '/user/login.html';
      return;
    }

    const user = data.user;
    const userRole = user.role || 'student'; // Get user role for role-based views

    // Populate basic profile
    document.getElementById('userName').textContent = user.name || 'Student';
    document.getElementById('userEmail').textContent = user.email || 'No email';
    document.getElementById('userRole').textContent = `${user.role || 'Student'} • ${user.grade || 'N/A'}`;
    document.getElementById('userPhoto').src = user.photo || '/assets/images/defaults/default-user.png';

    // Stats (fallback to 0 if not available)
    document.getElementById('achievementsCount').textContent = user.achievements || '0';
    document.getElementById('attendanceRate').textContent = user.attendance || '0%';
    document.getElementById('pointsEarned').textContent = user.points || '0';
    document.getElementById('clubsJoined').textContent = user.clubs?.length || '0';

    // Academic Snapshot
    document.getElementById('currentTerm').textContent = user.academic?.term || 'Term 2, 2025';
    document.getElementById('meanGrade').textContent = user.academic?.meanGrade || 'B+ (3.3)';
    document.getElementById('bestSubject').textContent = user.academic?.bestSubject || 'Mathematics';
    document.getElementById('subjectsTaken').textContent = user.academic?.subjectsTaken || '9';

    // Profile Completion
    const completion = calculateProfileCompletion(user);
    document.getElementById('completionPercent').textContent = `${completion}%`;
    document.getElementById('completionFill').style.width = `${completion}%`;

    // Personal Info
    document.getElementById('dob').textContent = user.personal?.dob || '15 January 2008';
    document.getElementById('gender').textContent = user.personal?.gender || 'Male';
    document.getElementById('parentContact').textContent = user.personal?.parentContact || '+254 712 345 678';
    document.getElementById('emergencyContact').textContent = user.personal?.emergencyContact || '+254 723 456 789';
    document.getElementById('residence').textContent = user.personal?.residence || 'Nairobi, Kenya';
    document.getElementById('studentId').textContent = user.personal?.studentId || 'S2025/0042';

    // Learning Preferences
    document.getElementById('learningStyle').textContent = user.preferences?.learningStyle || 'Practical / Hands-on';
    document.getElementById('favoriteSubjects').textContent = user.preferences?.favoriteSubjects || 'Mathematics, Physics, Robotics';
    document.getElementById('careerInterests').textContent = user.preferences?.careerInterests || 'Engineering, Robotics, Computer Science';
    document.getElementById('skillsToDevelop').textContent = user.preferences?.skillsToDevelop || 'Programming, Leadership, Public Speaking';

    // Security Info
    document.getElementById('lastLogin').textContent = user.security?.lastLogin || 'Today, 10:42 AM';
    document.getElementById('activeDevices').textContent = user.security?.activeDevices || '2 devices';
    document.getElementById('passwordStrength').textContent = user.security?.passwordStrength || 'Strong';
    document.getElementById('twoFactorStatus').textContent = user.security?.twoFactorEnabled ? 'Enabled' : 'Not Enabled';

    // Role-based views
    setupRoleBasedViews(userRole);

    // Setup event listeners
    setupActivityFilters();
    setupEditButtons();

  } catch (err) {
    console.error('Profile load error:', err);
    showToast('Failed to load profile. Redirecting...', 'error');
    setTimeout(() => window.location.href = '/user/login.html', 2000);
  }
}

// =================================================================
// 3. PROFILE COMPLETION CALCULATION
// =================================================================
function calculateProfileCompletion(user) {
  let completion = 0;
  const totalFields = 10;
  
  // Check which fields are populated
  if (user.name) completion++;
  if (user.email) completion++;
  if (user.photo && user.photo !== '/assets/images/defaults/default-user.png') completion++;
  if (user.personal?.dob) completion++;
  if (user.personal?.gender) completion++;
  if (user.personal?.parentContact) completion++;
  if (user.personal?.emergencyContact) completion++;
  if (user.preferences?.learningStyle) completion++;
  if (user.clubs?.length > 0) completion++;
  if (user.academic?.term) completion++;
  
  return Math.round((completion / totalFields) * 100);
}

// =================================================================
// 4. ROLE-BASED VIEWS
// =================================================================
function setupRoleBasedViews(userRole) {
  const adminElements = document.querySelectorAll('.admin-only');
  const studentElements = document.querySelectorAll('.student-only');
  const teacherElements = document.querySelectorAll('.teacher-only');
  
  // Hide all role-specific elements by default
  adminElements.forEach(el => el.style.display = 'none');
  studentElements.forEach(el => el.style.display = 'none');
  teacherElements.forEach(el => el.style.display = 'none');
  
  // Show elements based on role
  if (userRole === 'admin') {
    document.getElementById('adminAttendance')?.style.removeProperty('display');
    adminElements.forEach(el => el.style.display = '');
  } else if (userRole === 'teacher') {
    teacherElements.forEach(el => el.style.display = '');
  } else {
    // Student view (default)
    studentElements.forEach(el => el.style.display = '');
  }
}

// =================================================================
// 5. ACTIVITY FEED FILTERS
// =================================================================
function setupActivityFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const activityItems = document.querySelectorAll('.activity-item');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      // Show/hide activity items based on filter
      activityItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// =================================================================
// 6. EDIT BUTTON FUNCTIONALITY
// =================================================================
function setupEditButtons() {
  // Edit personal info
  window.editPersonalInfo = function() {
    showToast('Personal info editing coming soon!', 'info');
  };
  
  // Edit preferences
  window.editPreferences = function() {
    showToast('Preferences editing coming soon!', 'info');
  };
  
  // Change password
  window.changePassword = function() {
    showToast('Password change feature coming soon!', 'info');
  };
  
  // Enable 2FA
  window.enableTwoFactor = function() {
    showToast('Two-factor authentication coming soon!', 'info');
  };
  
  // View devices
  window.viewDevices = function() {
    showToast('Device management coming soon!', 'info');
  };
}

// =================================================================
// 7. TOAST NOTIFICATIONS – Beautiful Feedback
// =================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px; right: 30px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#1e40af'};
    color: white;
    padding: 1.2rem 2rem;
    border-radius: 16px;
    font-weight: 600;
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.5s ease, fadeOut 0.5s ease 3s forwards;
    transform: translateX(120%);
  `;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.style.transform = 'translateX(0)', 100);

  // Auto remove
  setTimeout(() => toast.remove(), 4000);
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);

// =================================================================
// 8. INIT – Load Profile on Page Load
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});

// =================================================================
// 9. UTILITY FUNCTIONS
// =================================================================

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Calculate grade points
function calculateGPA(grades) {
  const gradePoints = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  if (!grades || !Array.isArray(grades)) return '0.0';
  
  const totalPoints = grades.reduce((sum, grade) => sum + (gradePoints[grade] || 0), 0);
  const gpa = (totalPoints / grades.length).toFixed(2);
  
  return gpa;
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateProfileCompletion,
    formatDate,
    calculateGPA
  };
}