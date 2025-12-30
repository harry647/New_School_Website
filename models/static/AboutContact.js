/**
 * MongoDB About Contact Model
 * Replaces JSON file storage for about page contacts
 * Corresponds to data/about-contact.json
 */

import mongoose from 'mongoose';

const aboutContactSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'new'
  }
}, {
  timestamps: true
});

export default mongoose.model('AboutContact', aboutContactSchema);