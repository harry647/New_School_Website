/**
 * MongoDB Quiz Model
 * Replaces: data/portal/quizzes.json
 * Quiz and assessment system for e-learning portal
 */

import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['quiz', 'test', 'practical', 'assignment']
  },
  
  dueDate: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 180
  },
  
  attempts: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  questions: {
    type: Number,
    required: true,
    min: 1
  },
  
  status: {
    type: String,
    required: true,
    enum: ['available', 'upcoming', 'completed', 'graded'],
    default: 'upcoming'
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  topics: [String],
  
  instructions: String,
  
  // Creator reference
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Quiz questions (can be embedded or referenced)
  questionsList: [{
    questionId: String,
    type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'] },
    text: String,
    options: [String],
    correctAnswer: String,
    points: Number,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
  }],
  
  // Students who have taken this quiz
  takenBy: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    completedAt: Date,
    attempts: Number,
    status: { type: String, enum: ['in-progress', 'completed', 'graded'] }
  }],
  
  // Quiz settings
  settings: {
    isTimed: {
      type: Boolean,
      default: true
    },
    showResultsImmediately: {
      type: Boolean,
      default: false
    },
    allowRetakes: {
      type: Boolean,
      default: true
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    password: String
  },
  
  // Quiz statistics
  statistics: {
    averageScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    lowestScore: {
      type: Number,
      default: 100
    }
  },
  
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
quizSchema.index({ subject: 1 });
quizSchema.index({ dueDate: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ 'statistics.averageScore': -1 });

// Text index for search functionality
quizSchema.index({
  title: 'text',
  topics: 'text',
  instructions: 'text'
});

export default mongoose.model('Quiz', quizSchema);