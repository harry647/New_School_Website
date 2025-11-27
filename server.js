import express from 'express';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Fix __dirname because it doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/includes', express.static(path.join(__dirname, 'includes')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// HTML pages now inside /static folder
const pages = [
    '',
    'about',
    'academics',
    'admissions',
    'gallery',
    'news',
    'contact',
    'administration',
    'staff',
    'student-life',
    'e-learning',
    'alumni',
    'career-guidance',
    'support-utilities'
];

// Dynamic clean URLs
pages.forEach(page => {
    const route = page === '' ? '/' : `/${page}`;
    app.get(route, (req, res) => {
        const fileName = page === '' ? 'index.html' : `${page}.html`;
        res.sendFile(path.join(__dirname, 'static', fileName));
    });
});

// Serve static folder
app.use('/static', express.static(path.join(__dirname, 'static')));

// Fallback for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Start server + auto-open browser
app.listen(PORT, () => {
    console.log(`School Website is running!`);
    console.log(`→ http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop`);

    const command = process.platform === 'win32'
        ? `start http://localhost:${PORT}`
        : process.platform === 'darwin'
            ? `open http://localhost:${PORT}`
            : `xdg-open http://localhost:${PORT}`;

    exec(command, err => {
        if (err) console.log('Tip: Open browser manually if auto-open failed');
    });
});
