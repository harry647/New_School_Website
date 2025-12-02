// common-portal.js 

// -------------------------------
// Helper Functions
// -------------------------------
const $ = (id) => document.getElementById(id);
const $all = (selector) => document.querySelectorAll(selector);

// Fetch wrapper
async function apiGet(url) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`GET ${url} failed`);
    return res.json();
}

async function apiPut(url, data) {
    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PUT ${url} failed`);
    return res.json();
}

// -------------------------------
// Load User Profile
// -------------------------------
async function populateProfile() {
    try {
        const user = await apiGet('/api/users/me'); // backend endpoint

        // Update UI
        if ($('userName')) $('userName').textContent = user.name;
        if ($('userEmail')) $('userEmail').textContent = user.email;

        $all('.user-photo').forEach(el => el.src = user.photo || "/assets/images/defaults/default-user.png");
        $all('.notif-count').forEach(el => el.textContent = user.notifications || 0);

    } catch (err) {
        console.error("Failed to load profile:", err);
    }
}

// -------------------------------
// Logout Handler
// -------------------------------
async function handleLogout() {
    try {
        await apiGet('/auth/logout'); // Calls real logout API
        window.location.href = "/login.html";
    } catch (err) {
        console.error("Logout failed:", err);
    }
}

// -------------------------------
// Save Settings
// -------------------------------
async function saveSettings() {
    const name = $('setName')?.value;
    const email = $('setEmail')?.value;
    const pass = $('setPass')?.value;

    try {
        const update = { name, email };
        if (pass.trim() !== "") update.password = pass;

        const res = await apiPut('/api/users/me', update);

        alert("Settings saved successfully!");
        populateProfile(); // Refresh UI

    } catch (err) {
        console.error("Failed to save settings:", err);
        alert("Error saving settings.");
    }
}

// -------------------------------
// Auto-run
// -------------------------------
window.addEventListener('DOMContentLoaded', populateProfile);

