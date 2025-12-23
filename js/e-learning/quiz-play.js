// JavaScript for quiz-play.html
console.log('Quiz play page loaded');

// Extract quiz ID from URL
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

// DOM Elements
const quizDetails = document.getElementById('quizDetails');
const quizTimer = document.getElementById('quizTimer');
const quizProgress = document.getElementById('quizProgress');
const backToTop = document.getElementById('backToTop');

// Back to Top functionality
window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Load quiz dynamically
async function loadQuiz(quizId) {
  quizDetails.innerHTML = `<div class="text-center my-5"><div class="spinner-border text-primary"></div><p>Loading quiz...</p></div>`;
  
  try {
    // Simulate API call (replace with actual fetch in production)
    const res = await fetch(`/api/quiz/${quizId}`);
    if (!res.ok) throw new Error('Failed to load quiz.');
    const quiz = await res.json();
    
    renderQuiz(quiz);
  } catch (err) {
    quizDetails.innerHTML = `<p class="text-danger text-center my-5">${err.message}</p>`;
  }
}

// Render quiz with all enhancements
function renderQuiz(quiz) {
  // Store quiz data for later use
  localStorage.setItem(`quiz_${quizId}_data`, JSON.stringify(quiz));
  
  // Initialize quiz state
  const quizState = {
    currentQuestion: 0,
    answers: {},
    startedAt: new Date(),
    timeLimit: quiz.timeLimit || 30 * 60 * 1000, // Default: 30 minutes
    score: 0
  };
  localStorage.setItem(`quiz_${quizId}_state`, JSON.stringify(quizState));
  
  // Start timer
  startTimer(quizState.timeLimit);
  
  // Render quiz interface
  quizDetails.innerHTML = `
    <h2 class="mb-3">${sanitizeHTML(quiz.title)}</h2>
    <p class="mb-4">${sanitizeHTML(quiz.description)}</p>
    <div id="quizQuestions" aria-live="polite"></div>
    <button class="btn btn-success mt-3" id="submitQuiz">Submit Quiz</button>
    <button class="btn btn-outline-secondary mt-3 ms-2" id="saveProgress">Save Progress</button>
  `;
  
  // Update progress
  updateProgress(quiz.questions.length);
  
  // Render questions
  const questionsContainer = document.getElementById('quizQuestions');
  quiz.questions.forEach((q, index) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'mb-4 p-3 border rounded shadow-sm question-card';
    qDiv.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    qDiv.innerHTML = `
      <p><strong>Q${index + 1}:</strong> ${sanitizeHTML(q.question)}</p>
      ${q.options.map((opt, i) => `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="question${index}" id="q${index}o${i}" value="${sanitizeHTML(opt)}">
          <label class="form-check-label" for="q${index}o${i}">${sanitizeHTML(opt)}</label>
        </div>`).join('')}
    `;
    questionsContainer.appendChild(qDiv);
  });
  
  // Add event listeners
  document.getElementById('submitQuiz').addEventListener('click', () => submitQuiz(quiz));
  document.getElementById('saveProgress').addEventListener('click', () => saveProgress(quiz));
  
  // Add hover effects for question cards
  document.querySelectorAll('.question-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// Timer functionality
function startTimer(duration) {
  let timer = duration;
  const interval = setInterval(() => {
    const minutes = Math.floor(timer / 60000);
    const seconds = Math.floor((timer % 60000) / 1000);
    
    quizTimer.textContent = `Time remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (timer <= 0) {
      clearInterval(interval);
      quizTimer.textContent = 'Time is up! Submitting your quiz...';
      const quizData = JSON.parse(localStorage.getItem(`quiz_${quizId}_data`));
      submitQuiz(quizData);
    }
    
    timer -= 1000;
  }, 1000);
}

// Update progress indicator
function updateProgress(totalQuestions) {
  const state = JSON.parse(localStorage.getItem(`quiz_${quizId}_state`)) || { currentQuestion: 0 };
  quizProgress.textContent = `Question ${state.currentQuestion + 1} of ${totalQuestions}`;
}

// Submit quiz with instant feedback
function submitQuiz(quiz) {
  const state = JSON.parse(localStorage.getItem(`quiz_${quizId}_state`)) || { answers: {} };
  
  // Collect answers
  quiz.questions.forEach((q, index) => {
    const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
    if (selectedOption) {
      state.answers[index] = selectedOption.value;
    }
  });
  
  // Calculate score and provide feedback
  let score = 0;
  quiz.questions.forEach((q, index) => {
    const questionElement = document.querySelector(`.question-card:nth-child(${index + 1})`);
    const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
    
    if (selectedOption && selectedOption.value === q.correctAnswer) {
      score++;
      questionElement.classList.add('border-success');
    } else {
      questionElement.classList.add('border-danger');
      // Highlight correct answer
      const correctOption = Array.from(document.querySelectorAll(`input[name="question${index}"]`))
        .find(input => input.value === q.correctAnswer);
      if (correctOption) {
        correctOption.parentElement.classList.add('text-success', 'fw-bold');
      }
    }
  });
  
  state.score = score;
  localStorage.setItem(`quiz_${quizId}_state`, JSON.stringify(state));
  
  // Show results
  quizDetails.innerHTML += `
    <div class="mt-4 p-4 bg-light rounded">
      <h3>Quiz Completed!</h3>
      <p>Your score: ${score} out of ${quiz.questions.length}</p>
      <div class="progress mt-3">
        <div class="progress-bar bg-success" style="width: ${(score / quiz.questions.length) * 100}%">
          ${Math.round((score / quiz.questions.length) * 100)}%
        </div>
      </div>
      <p class="mt-2">Great job! Keep learning!</p>
    </div>
  `;
  
  // Disable submit button
  document.getElementById('submitQuiz').disabled = true;
}

// Save progress to localStorage
function saveProgress(quiz) {
  const state = JSON.parse(localStorage.getItem(`quiz_${quizId}_state`)) || { answers: {} };
  
  // Collect current answers
  quiz.questions.forEach((q, index) => {
    const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
    if (selectedOption) {
      state.answers[index] = selectedOption.value;
    }
  });
  
  localStorage.setItem(`quiz_${quizId}_state`, JSON.stringify(state));
  alert('Progress saved! You can resume later.');
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (quizId) {
    // Check if there's saved progress
    const savedState = localStorage.getItem(`quiz_${quizId}_state`);
    if (savedState) {
      const state = JSON.parse(savedState);
      if (confirm('You have saved progress for this quiz. Would you like to resume?')) {
        // Load saved quiz data
        const savedQuizData = JSON.parse(localStorage.getItem(`quiz_${quizId}_data`));
        if (savedQuizData) {
          renderQuiz(savedQuizData);
          return;
        }
      }
    }
    
    // Load fresh quiz
    loadQuiz(quizId);
  } else {
    quizDetails.innerHTML = '<p>No quiz specified.</p>';
  }
});