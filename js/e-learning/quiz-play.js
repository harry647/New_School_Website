// JavaScript for quiz-play.html
console.log('Quiz play page loaded');

// Extract quiz ID from URL
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

// Display quiz details
document.addEventListener('DOMContentLoaded', function() {
  const quizDetails = document.getElementById('quizDetails');
  
  if (quizId) {
    // Sample quiz data
    const quiz = {
      id: quizId,
      title: 'Algebra Quiz',
      description: 'This quiz covers the key concepts of Algebra Chapter 4.',
      questions: [
        { id: 1, question: 'What is the solution to x + 5 = 10?', options: ['x = 5', 'x = 10', 'x = 15', 'x = 20'] },
        { id: 2, question: 'Simplify: 3x + 2x', options: ['5x', '6x', 'x', 'None of the above'] },
      ]
    };

    let quizHTML = `
      <h1 class="display-5 fw-bold mb-4">${quiz.title}</h1>
      <p>${quiz.description}</p>
      <form id="quizForm">
    `;

    quiz.questions.forEach((q, index) => {
      quizHTML += `
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title">Question ${index + 1}: ${q.question}</h5>
            <div class="form-check">
              ${q.options.map((option, i) => `
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="question${q.id}" id="question${q.id}option${i}" value="${option}">
                  <label class="form-check-label" for="question${q.id}option${i}">${option}</label>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    });

    quizHTML += `
      <button type="submit" class="btn btn-primary">Submit Quiz</button>
      </form>
    `;

    quizDetails.innerHTML = quizHTML;
  } else {
    quizDetails.innerHTML = '<p>No quiz specified.</p>';
  }
});