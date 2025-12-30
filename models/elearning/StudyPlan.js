/**
 * MongoDB StudyPlan Model
 * Replaces: data/portal/study-plans.json
 * Study plan management for e-learning portal
 */

import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
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
  
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  
  duration: {
    type: Number,
    required: true
  },
  
  timeSlots: [String],
  
  goals: [String],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endDate: Date,
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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
studyPlanSchema.index({ student: 1 });
studyPlanSchema.index({ isActive: 1 });
studyPlanSchema.index({ startDate: 1 });

// Text index for search functionality
studyPlanSchema.index({
  title: 'text',
  goals: 'text'
});

export default mongoose.model('StudyPlan', studyPlanSchema);