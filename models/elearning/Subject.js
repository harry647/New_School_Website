/**
 * MongoDB Subject Model
 * Replaces: data/portal/subjects.json
 * Comprehensive subject catalog for e-learning portal
 */

import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  topics: {
    type: Number,
    required: true,
    min: 1
  },
  
  resources: {
    type: Number,
    required: true,
    min: 0
  },
  
  duration: {
    type: String,
    required: true
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  image: {
    type: String,
    default: '/assets/images/elearning/subjects.png'
  },
  
  group: {
    type: String,
    required: true,
    enum: [
      'Compulsory Core Subjects',
      'Science Subjects',
      'Humanities & Social Sciences',
      'Applied & Practical Subjects',
      'Languages, Arts & Other Electives',
      'CBC Senior Secondary'
    ]
  },
  
  // Teacher reference
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Students enrolled in this subject
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Subject curriculum
  curriculum: [{
    unit: String,
    topics: [{
      title: String,
      description: String,
      resources: [{
        type: { type: String, enum: ['video', 'pdf', 'quiz', 'assignment'] },
        title: String,
        url: String,
        duration: String
      }],
      completed: {
        type: Boolean,
        default: false
      }
    }],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Subject resources
  subjectResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  
  // Subject quizzes
  subjectQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  
  // Subject assignments
  subjectAssignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  
  // Subject settings
  settings: {
    isActive: {
      type: Boolean,
      default: true
    },
    enrollmentType: {
      type: String,
      enum: ['open', 'restricted', 'invite-only'],
      default: 'open'
    },
    maxStudents: Number,
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
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
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
subjectSchema.index({ slug: 1 }, { unique: true });
subjectSchema.index({ name: 1 });
subjectSchema.index({ group: 1 });
subjectSchema.index({ progress: 1 });
subjectSchema.index({ teacher: 1 });
subjectSchema.index({ 'settings.isActive': 1 });

// Text index for search functionality
subjectSchema.index({
  name: 'text',
  description: 'text',
  group: 'text'
}, {
  weights: {
    name: 3,
    description: 2,
    group: 1
  }
});

export default mongoose.model('Subject', subjectSchema);