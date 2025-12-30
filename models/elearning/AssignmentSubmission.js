/**
 * MongoDB AssignmentSubmission Model
 * Replaces: data/portal/assignment-submissions.json
 * Assignment submission tracking for e-learning portal
 */

import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
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
  
  files: [{
    filename: String,
    url: String,
    type: String,
    size: String
  }],
  
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  },
  
  grade: Number,
  
  feedback: String,
  
  isLate: {
    type: Boolean,
    default: false
  },
  
  latePenalty: Number,
  
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
assignmentSubmissionSchema.index({ assignment: 1 });
assignmentSubmissionSchema.index({ student: 1 });
assignmentSubmissionSchema.index({ status: 1 });
assignmentSubmissionSchema.index({ submittedAt: -1 });

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);