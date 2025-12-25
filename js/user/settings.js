async function loadUserData() {
  try {
    const res = await fetch('/auth/profile', { method: 'GET', credentials: 'include' });
    const data = await res.json();

    if (data.success && data.user) {
      document.getElementById('fullName').value = data.user.name || '';
      document.getElementById('email').value = data.user.email || '';
      document.getElementById('username').value = data.user.username || '';
      document.getElementById('defaultDashboard').value = data.user.defaultDashboard || 'profile';
      document.getElementById('language').value = data.user.language || 'en';
      document.getElementById('timezone').value = data.user.timezone || 'Africa/Nairobi';
      document.getElementById('theme').value = data.user.theme || 'light';
      document.getElementById('reduceMotion').checked = data.user.reduceMotion || false;
      document.getElementById('emailAlerts').checked = data.user.emailAlerts || false;
      document.getElementById('clubUpdates').checked = data.user.clubUpdates || false;
      document.getElementById('hideEmail').checked = data.user.hideEmail || false;
    } else {
      alert("Failed to load profile. Redirecting to login.");
      window.location.href = '/user/login.html';
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
    window.location.href = '/user/login.html';
  }
}

document.getElementById('settingsForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('newPassword').value;
  const defaultDashboard = document.getElementById('defaultDashboard').value;
  const language = document.getElementById('language').value;
  const timezone = document.getElementById('timezone').value;
  const theme = document.getElementById('theme').value;
  const reduceMotion = document.getElementById('reduceMotion').checked;
  const emailAlerts = document.getElementById('emailAlerts').checked;
  const clubUpdates = document.getElementById('clubUpdates').checked;
  const hideEmail = document.getElementById('hideEmail').checked;

  if (!name || !email) {
    alert("Name and email are required.");
    return;
  }

  try {
    const res = await fetch('/auth/profile', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      body: JSON.stringify({
        name,
        email,
        password,
        defaultDashboard,
        language,
        timezone,
        theme,
        reduceMotion,
        emailAlerts,
        clubUpdates,
        hideEmail
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Profile updated successfully!");
      if (data.user) {
        localStorage.setItem("userName", data.user.name);
      }
    } else {
      alert(data.message || "Failed to update profile.");
    }
  } catch (err) {
    console.error("Update error:", err);
    alert("Error updating profile. Please try again.");
  }
});

// Add event listeners for additional buttons
document.querySelector('button.btn-outline-danger').addEventListener('click', function() {
  if (confirm("Are you sure you want to log out of all devices?")) {
    fetch('/auth/logout-all', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Logged out of all devices successfully.");
        } else {
          alert("Failed to log out of all devices.");
        }
      })
      .catch(err => console.error("Error logging out of all devices:", err));
  }
});

document.querySelector('button.btn-outline-secondary.btn-sm').addEventListener('click', function() {
  window.location.href = '/auth/download-data';
});

document.querySelector('button.btn-outline-warning.btn-sm').addEventListener('click', function() {
  if (confirm("Are you sure you want to clear cached data?")) {
    fetch('/auth/clear-cache', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Cached data cleared successfully.");
        } else {
          alert("Failed to clear cached data.");
        }
      })
      .catch(err => console.error("Error clearing cached data:", err));
  }
});

document.querySelector('button.btn-danger.btn-sm').addEventListener('click', function() {
  if (confirm("Are you sure you want to request account deletion? This action cannot be undone.")) {
    fetch('/auth/request-deletion', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Account deletion requested successfully. You will be logged out.");
          window.location.href = '/user/login.html';
        } else {
          alert("Failed to request account deletion.");
        }
      })
      .catch(err => console.error("Error requesting account deletion:", err));
  }
});

// Ensure user is logged in
if (!localStorage.getItem("userLoggedIn")) {
  window.location.href = '/user/login.html';
} else {
  loadUserData();
}