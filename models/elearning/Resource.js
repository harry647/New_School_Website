/**
 * MongoDB Resource Model
 * Replaces: data/portal/resources.json
 * Learning resources for e-learning portal
 */

import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
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
  
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'video', 'gallery', 'interactive']
  },
  
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  
  url: {
    type: String,
    required: true
  },
  
  // Type-specific fields
  size: String, // For PDFs and downloads
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  description: String,
  duration: String, // For videos
  images: Number, // For galleries
  views: {
    type: Number,
    default: 0
  },
  interactions: {
    type: Number,
    default: 0
  },
  
  // Resource metadata
  thumbnail: String,
  tags: [String],
  category: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  
  // Access control
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Related content
  relatedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  
  // User interactions
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Comments and discussions
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    date: Date,
    likes: Number
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
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
resourceSchema.index({ subject: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ teacher: 1 });
resourceSchema.index({ date: -1 });
resourceSchema.index({ downloads: -1 });
resourceSchema.index({ views: -1 });
resourceSchema.index({ rating: -1 });

// Text index for search functionality
resourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 3,
    description: 2,
    tags: 1
  }
});

export default mongoose.model('Resource', resourceSchema);