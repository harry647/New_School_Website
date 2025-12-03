# Bar Union Mixed Secondary School Website

A modern, responsive, and professional website for Bar Union Mixed Secondary School built with Node.js, Express, and vanilla JavaScript. Features include student portal, e-learning platform, news & events, gallery, and comprehensive school information.

## 🌐 Live Website

**Visit the live website:** [https://barunion.onrender.com](https://barunion.onrender.com)

*Deployed on Render.com - A modern cloud platform for static sites and web services.*

## 🚀 Features

- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Student Portal**: E-learning platform with course management
- **News & Events**: Dynamic news feed with filtering and search
- **Gallery**: Photo and video gallery with 360° virtual tours
- **Administration**: Leadership team and department information
- **Modern UI**: Clean, professional design with smooth animations
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Performance**: Optimized loading with lazy loading and caching

## 📚 Departments, Clubs & Portal

### Academic Departments

The website features comprehensive department pages with interactive features:

#### **Applied Sciences**
- Subjects: Chemistry, Physics, Biology, Computer Science
- Features: Lab reports, project uploads, experiment documentation
- Interactive: File uploads, session filtering, teacher profiles

#### **Humanities**
- Subjects: History, Geography, Literature, Religious Studies, Languages, Social Studies
- Features: Essay competitions, field trips, literature analysis
- Interactive: Discussion forum, subject polls, resource sharing

#### **Languages**
- Subjects: English, Kiswahili, French, German, Arabic
- Features: Language immersion, cultural events, translation exercises
- Interactive: Dual filtering (session/language), audio uploads, RSVP events

#### **Mathematics**
- Subjects: Algebra, Geometry, Calculus, Statistics
- Features: Math Olympiad, problem-solving competitions
- Interactive: Topic explorer tree, progress tracking, KCSE trend charts

#### **Sciences**
- Subjects: Physics, Chemistry, Biology
- Features: Science fairs, research projects, lab experiments
- Interactive: Achievement carousel, competition registration

#### **Guidance & Counselling**
- Features: Anonymous support forum, appointment booking
- Interactive: Resource uploads, counsellor profiles, private messaging

#### **Welfare**
- Features: Support request system, wellness resources
- Interactive: Anonymous submissions, team coordination

#### **Resources Hub**
- Features: School-wide document repository
- Interactive: Search, filtering, preview, pagination, role-based access

### Student Clubs & Co-Curricular Activities

12 active clubs with full management system:

#### **Arts & STEM Clubs**
- **Art & Design Club**: Painting, sculpture, exhibitions
- **Robotics & Innovation**: Arduino, coding, 3D printing
- **Mathematics Club**: Olympiad, puzzles, problem-solving
- **Science Club**: Experiments, science fairs, research

#### **Leadership & Communication**
- **Debate & Public Speaking**: Debate, Model UN, eloquence
- **Journalism & Media Club**: Reporting, photography, school magazine
- **Drama & Performing Arts**: Theatre, acting, scriptwriting

#### **Cultural & Spiritual**
- **Music & Choir**: Choir, band, traditional dance
- **Christian Union**: Fellowship, worship, spiritual growth
- **Humanities & Languages Club**: History, Geography, culture

#### **Outdoor & Environmental**
- **Scouts & Girl Guides**: Camping, first aid, leadership
- **Wildlife & Environmental Club**: Conservation, tree planting

**Club Features:**
- Application system with validation
- File upload for submissions
- Event registration and RSVP
- Photo galleries with Fancybox
- Session-based filtering

### Student Portal & E-Learning

Comprehensive learning management system:

#### **Core Features**
- **16 Subject Areas**: Mathematics, Sciences, Languages, Humanities, Applied Sciences, Clubs & Co-Curriculum, Guidance, Welfare
- **Interactive Lessons**: Video content, quizzes, assignments
- **Progress Tracking**: Completion percentages, mastery levels
- **Resource Library**: PDFs, videos, interactive materials

#### **Advanced Features**
- **Forum System**: Student-teacher discussions, Q&A
- **Quiz Engine**: Automated testing with due dates
- **Media Gallery**: Experiment videos, lecture screenshots
- **Notification System**: Updates, deadlines, announcements

#### **Teacher Dashboard**
- Content upload and management
- Student progress monitoring
- Assignment grading
- Resource sharing

#### **Student Dashboard**
- Personalized learning paths
- Progress analytics
- Assignment submissions
- Discussion participation

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

## 🛠️ Installation

### Step 1: Clone or Download the Project

```bash
git clone <repository-url>
cd New_School_Website
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies:
- `express` - Web framework
- `connect-sqlite3` - SQLite session store
- `express-session` - Session management
- `express-validator` - Input validation
- `multer` - File upload handling
- `session-file-store` - File-based session storage

## ⚙️ Environment Configuration

### Environment Variables

Create a `.env` file in the root directory (optional for basic setup):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-super-secret-key-change-in-production

# Database Configuration (if using external DB)
DATABASE_URL=sqlite:///./database/sessions.db
```

### Default Configuration

The application runs with sensible defaults:
- **Port**: 3000 (configurable via `PORT` environment variable)
- **Session Secret**: Built-in secret (change in production)
- **Database**: SQLite database in `/database/sessions.db`

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Production Mode

```bash
npm start
```

### Accessing the Application

Once running, open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
New_School_Website/
│
├── server.js                 # Main application server
├── package.json              # Dependencies and scripts
├── README.md                 # This file
│
├── routes/                   # Express routes
│   ├── auth.js              # Authentication routes
│   ├── portal.js            # Student portal routes
│   └── api.js               # API endpoints
│
├── middleware/               # Custom middleware
│   ├── authMiddleware.js    # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   └── logger.js            # Request logging
│
├── validators/               # Input validation
│   ├── authValidator.js     # Auth validation rules
│   └── portalValidator.js   # Portal validation rules
│
├── static/                   # Static HTML pages
│   ├── index.html           # Homepage
│   ├── about.html           # About page
│   ├── academics.html       # Academics page
│   └── ...                  # Other pages
│
├── css/                     # Stylesheets
│   ├── static/              # Page-specific styles
│   └── user/                # User-specific styles
│
├── js/                      # JavaScript files
│   ├── static/              # Page-specific scripts
│   └── user/                # User-specific scripts
│
├── assets/                  # Images, fonts, documents
│   ├── images/              # Image assets
│   ├── fonts/               # Font files
│   └── docs/                # Documents
│
├── data/                    # JSON data files
│   ├── static/              # Static data
│   └── portal/              # Portal data
│
├── includes/                # Reusable HTML components
│   ├── header.html          # Site header
│   └── footer.html          # Site footer
│
├── database/                # SQLite databases
│   └── sessions.db          # Session storage
│
├── admin/                   # Admin panel files
├── portal/                  # Student portal files
├── clubs/                   # Clubs section
├── blogs/                   # Blog system
└── departments/             # Department pages
```

## 🔧 Build Commands

### Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Install dependencies
npm install

# Run tests (if implemented)
npm test
```

### Manual Build (if needed)

No build process is required as this is a server-side rendered application. All assets are served statically.

## 🌐 Deployment

### Local Development

1. Follow the installation steps above
2. Run `npm run dev` for development
3. Access at `http://localhost:3000`

### Production Deployment

#### Option 1: Direct Node.js Deployment

1. **Prepare the server**:
   ```bash
   # Set production environment
   export NODE_ENV=production
   export PORT=3000
   export SESSION_SECRET=your-production-secret-key
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Use a process manager** (recommended):
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "school-website"
   pm2 startup
   pm2 save
   ```

#### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t school-website .
docker run -p 3000:3000 school-website
```

#### Option 3: Cloud Platforms

**Render.com** (Currently Deployed):
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Configure environment variables in Render dashboard
5. Deploy automatically on git push

**Heroku**:
1. Create a `Procfile`:
   ```
   web: npm start
   ```
2. Deploy via Heroku CLI or Git integration

**Vercel/Netlify**:
- For static sites, you may need to convert to static generation
- Current setup is server-side rendered

**AWS/Google Cloud/Azure**:
- Deploy as a Node.js application
- Configure environment variables
- Set up load balancer and auto-scaling if needed

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=dev-secret-key
```

#### Production
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-production-secret-key-here
```

## 🔒 Security Considerations

1. **Change Session Secret**: Update `SESSION_SECRET` in production
2. **HTTPS**: Enable HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **Input Validation**: All forms include server-side validation
5. **File Uploads**: Configure proper file type restrictions
6. **Database**: Regularly backup SQLite database

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   # Or change port
   PORT=3001 npm start
   ```

2. **Database Permission Issues**:
   ```bash
   # Ensure database folder is writable
   chmod 755 database/
   ```

3. **Module Not Found**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Session Issues**:
   - Check database folder permissions
   - Ensure SQLite is properly installed

### Logs

Check server logs for errors:
```bash
# With PM2
pm2 logs school-website

# Direct output
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions:
- Email: harryoginga@gmail.com
- Phone: +254 706 259 403
- Address: 8021-Dago Bar Union Mixed Secondary School

## 🔄 Updates

- **Version**: 1.0.0
- **Last Updated**: December 2025
- **Node.js Version**: 16+
- **Database**: SQLite

---

**Built with ❤️ for Bar Union Mixed Secondary School**
