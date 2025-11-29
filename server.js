import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/portal', express.static(path.join(__dirname, 'portal')));
app.use('/clubs', express.static(path.join(__dirname, 'clubs')));
app.use('/blogs', express.static(path.join(__dirname, 'blogs')));
app.use('/departments', express.static(path.join(__dirname, 'departments')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));

// HTML pages
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

pages.forEach(page => {
    const route = page === '' ? '/' : `/${page}`;
    app.get(route, (req, res) => {
        const fileName = page === '' ? 'index.html' : `${page}.html`;
        res.sendFile(path.join(__dirname, 'static', fileName));
    });
});

app.use('/static', express.static(path.join(__dirname, 'static')));

// Fallback for non-file routes only
app.get(/^\/[^.]*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`School Website live at port ${PORT}`);
});
