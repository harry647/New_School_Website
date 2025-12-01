<!-- common-portal.js -->
<script>
// Simulated user data (replace with backend API)
const USER = {
name: "John Doe",
email: "john@example.com",
photo: "/assets/images/defaults/default-user.png",
notifications: 3
};



// Populate profile details
function populateProfile() {
const nameEl = document.getElementById('userName');
const emailEl = document.getElementById('userEmail');
const photoEls = document.querySelectorAll('.user-photo');
const notifBadges = document.querySelectorAll('.notif-count');


if (nameEl) nameEl.textContent = USER.name;
if (emailEl) emailEl.textContent = USER.email;


photoEls.forEach(el => el.src = USER.photo);
notifBadges.forEach(el => el.textContent = USER.notifications);
}


// Handle logout logic (backend-ready)
function handleLogout() {
// Replace with your backend logout API
console.log("Logging out...");
window.location.href = "/user/logout.html";
}


// Handle settings save
function saveSettings() {
const name = document.getElementById('setName').value;
const email = document.getElementById('setEmail').value;
const pass = document.getElementById('setPass').value;


// Ready for backend: send to API
console.log("Saving settings", { name, email, pass });
alert("Settings saved successfully!");
}


// Auto-run on load
window.addEventListener('DOMContentLoaded', populateProfile);
</script>