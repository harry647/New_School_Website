/**
 * MongoDB Gallery Photo Model
 * Replaces JSON file storage for gallery photos
 * Corresponds to data/gallery-photos.json
 */

import mongoose from 'mongoose';

const galleryPhotoSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true
  },
  event_date: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  photo_path: {
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

export default mongoose.model('GalleryPhoto', galleryPhotoSchema);