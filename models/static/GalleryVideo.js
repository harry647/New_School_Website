/**
 * MongoDB Gallery Video Model
 * Replaces JSON file storage for gallery videos
 * Corresponds to data/gallery-videos.json
 */

import mongoose from 'mongoose';

const galleryVideoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  video_path: {
    type: String,
    required: true
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('GalleryVideo', galleryVideoSchema);