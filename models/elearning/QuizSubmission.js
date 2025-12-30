/**
 * MongoDB QuizSubmission Model
 * Replaces: data/portal/quiz-submissions.json
 * Quiz submission tracking for e-learning portal
 */

import mongoose from 'mongoose';

const quizSubmissionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  answers: [{
    questionId: String,
    selectedAnswer: String,
    isCorrect: Boolean
  }],
  
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'graded', 'reviewed'],
    default: 'submitted'
  },
  
  timeTaken: Number,
  
  // System metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
quizSubmissionSchema.index({ quiz: 1 });
quizSubmissionSchema.index({ student: 1 });
quizSubmissionSchema.index({ status: 1 });
quizSubmissionSchema.index({ submittedAt: -1 });
quizSubmissionSchema.index({ score: -1 });

export default mongoose.model('QuizSubmission', quizSubmissionSchema);