/**
 * MongoDB Alumni Registration Model
 * Replaces JSON file storage for alumni registrations
 * Corresponds to data/alumni-registrations.json
 */

import mongoose from 'mongoose';

const alumniRegistrationSchema = new mongoose.Schema({
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
  batch: {
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
  profession: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  favorite_memory: {
    type: String,
    trim: true
  },
  skills_interests: {
    type: String,
    trim: true
  },
  connection_preferences: {
    type: String,
    trim: true
  },
  profile_photo: {
    type: String
  },
  passport_photo: {
    type: String
  },
  registration_date: {
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

export default mongoose.model('AlumniRegistration', alumniRegistrationSchema);