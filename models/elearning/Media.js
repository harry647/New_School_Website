/**
 * MongoDB Media Model
 * Replaces: data/portal/media.json
 * Media content for e-learning portal
 */

import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
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
  
  type: {
    type: String,
    required: true,
    enum: ['video', 'gallery', 'interactive']
  },
  
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  url: {
    type: String,
    required: true
  },
  
  thumbnail: String,
  
  duration: String,
  
  images: Number,
  
  interactions: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  
  description: String,
  
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
mediaSchema.index({ type: 1 });
mediaSchema.index({ teacher: 1 });
mediaSchema.index({ subject: 1 });
mediaSchema.index({ date: -1 });
mediaSchema.index({ views: -1 });

// Text index for search functionality
mediaSchema.index({
  title: 'text',
  description: 'text'
});

export default mongoose.model('Media', mediaSchema);