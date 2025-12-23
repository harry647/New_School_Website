// JavaScript for quizzes.html

// DOMContentLoaded listener to ensure all functions are wrapped
document.addEventListener('DOMContentLoaded', function() {
  const quizzesGrid = document.getElementById('quizzesGrid');
  const backToTop = document.getElementById('backToTop');
  const quizSearch = document.getElementById('quizSearch');

  // Sample quizzes data with thumbnails and descriptions
  const quizzes = [
    { id: 1, title: 'Algebra Quiz', subject: 'Mathematics', questions: 10, thumbnail: '/assets/images/elearning/portal-dashboard.jpg', description: 'Test your knowledge of algebra basics.', isNew: true },
    { id: 2, title: 'Biology Basics', subject: 'Biology', questions: 15, thumbnail: '/assets/images/elearning/portal-dashboard.png', description: 'Learn the fundamentals of biology.', isNew: false },
    { id: 3, title: 'English Grammar', subject: 'English', questions: 12, thumbnail: '/assets/images/common/hero-bg.jpg', description: 'Improve your grammar skills.', isNew: true },
    { id: 4, title: 'Physics Fundamentals', subject: 'Physics', questions: 20, thumbnail: '/assets/images/common/hero-bg.jpg', description: 'Understand the basics of physics.', isNew: false },
    { id: 5, title: 'Chemistry Basics', subject: 'Chemistry', questions: 18, thumbnail: '/assets/images/common/hero-bg.jpg', description: 'Explore the world of chemistry.', isNew: true },
    { id: 6, title: 'History Quiz', subject: 'History', questions: 14, thumbnail: '/assets/images/common/hero-bg.jpg', description: 'Test your knowledge of history.', isNew: false },
  ];

  // Function to sanitize HTML content to prevent XSS
  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Function to render quizzes
  function renderQuizzes(quizzesToRender) {
    quizzesGrid.innerHTML = '';
    quizzesToRender.forEach(quiz => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${sanitizeHTML(quiz.thumbnail)}" class="card-img-top" alt="${sanitizeHTML(quiz.title)}" loading="lazy">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="card-title">${sanitizeHTML(quiz.title)}</h5>
              ${quiz.isNew ? '<span class="badge bg-success">New</span>' : ''}
            </div>
            <p class="card-text">${sanitizeHTML(quiz.description)}</p>
            <p class="card-text"><strong>Subject:</strong> ${sanitizeHTML(quiz.subject)}</p>
            <p class="card-text"><strong>Questions:</strong> ${sanitizeHTML(quiz.questions)}</p>
            <a href="/e-learning/quiz-play.html?id=${quiz.id}" class="btn btn-primary mt-auto" aria-label="Start ${sanitizeHTML(quiz.title)}">Start Quiz</a>
          </div>
        </div>
      `;
      quizzesGrid.appendChild(col);
    });
  }

  // Function to filter quizzes based on search input
  function filterQuizzes() {
    const searchTerm = quizSearch.value.toLowerCase();
    const filteredQuizzes = quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchTerm) ||
      quiz.subject.toLowerCase().includes(searchTerm) ||
      quiz.description.toLowerCase().includes(searchTerm)
    );
    renderQuizzes(filteredQuizzes);
  }

  // Event listener for search input
  quizSearch.addEventListener('input', filterQuizzes);

  // Back to top button functionality
  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initial render
  renderQuizzes(quizzes);
});