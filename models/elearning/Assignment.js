/**
 * MongoDB Assignment Model
 * Replaces: data/portal/assignments.json
 * Assignment management system for e-learning portal
 */

import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
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
  
  assignedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  dueDate: {
    type: Date,
    required: true
  },
  
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'submitted', 'graded', 'returned'],
    default: 'pending'
  },
  
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  
  feedback: String,
  
  points: {
    type: Number,
    required: true,
    min: 1
  },
  
  description: String,
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Assignment files and attachments
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }],
  
  // Student submissions
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: Date,
    files: [{
      filename: String,
      url: String,
      type: String,
      size: String
    }],
    status: { type: String, enum: ['submitted', 'graded', 'returned'] },
    grade: Number,
    feedback: String,
    isLate: Boolean
  }],
  
  // Assignment settings
  settings: {
    allowLateSubmission: {
      type: Boolean,
      default: true
    },
    latePenalty: {
      type: Number,
      default: 10 // Percentage per day
    },
    maxFileSize: {
      type: Number,
      default: 10 // MB
    },
    allowedFileTypes: [String],
    requireOriginalityReport: {
      type: Boolean,
      default: false
    }
  },
  
  // Assignment statistics
  statistics: {
    submittedCount: {
      type: Number,
      default: 0
    },
    gradedCount: {
      type: Number,
      default: 0
    },
    averageGrade: {
      type: Number,
      default: 0
    },
    onTimeSubmissionRate: {
      type: Number,
      default: 100
    }
  },
  
  // Creator and assignment metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Related resources
  relatedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  
  // System metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivity: Date
}, {
  timestamps: true
});

// Indexes for performance optimization
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ 'statistics.averageGrade': -1 });

// Text index for search functionality
assignmentSchema.index({
  title: 'text',
  description: 'text'
});

export default mongoose.model('Assignment', assignmentSchema);