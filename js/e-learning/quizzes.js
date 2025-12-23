// JavaScript for quizzes.html
console.log('Quizzes page loaded');

// Load quizzes dynamically
document.addEventListener('DOMContentLoaded', function() {
  const quizzesGrid = document.getElementById('quizzesGrid');
  
  // Sample quizzes data
  const quizzes = [
    { id: 1, title: 'Algebra Quiz', subject: 'Mathematics', questions: 10 },
    { id: 2, title: 'Biology Basics', subject: 'Biology', questions: 15 },
    { id: 3, title: 'English Grammar', subject: 'English', questions: 12 },
  ];

  quizzes.forEach(quiz => {
    quizzesGrid.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${quiz.title}</h5>
            <p class="card-text"><strong>Subject:</strong> ${quiz.subject}</p>
            <p class="card-text"><strong>Questions:</strong> ${quiz.questions}</p>
            <a href="/e-learning/quiz-play.html?id=${quiz.id}" class="btn btn-primary">Take Quiz</a>
          </div>
        </div>
      </div>
    `;
  });
});