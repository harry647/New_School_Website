/**
 * MongoDB Testimonial Model
 * Replaces JSON file storage for club testimonials data
 * Corresponds to data/clubs/testimonials.json
 */

import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  testimonial: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  position: String,
  profileImage: String,
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

// Indexes for better query performance
testimonialSchema.index({ clubId: 1 });
testimonialSchema.index({ userId: 1 });
testimonialSchema.index({ isApproved: 1 });
testimonialSchema.index({ rating: 1 });

export default mongoose.model('Testimonial', testimonialSchema);