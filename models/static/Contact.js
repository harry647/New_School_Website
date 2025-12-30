/**
 * MongoDB Contact Model
 * Replaces JSON file storage for contacts
 * Corresponds to data/contacts.json and data/contactus.json
 */

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
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
    required: true
  },
  department: {
    type: String,
    default: 'General'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  preferred_contact: {
    type: String,
    default: 'Any'
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

export default mongoose.model('Contact', contactSchema);