/**
 * MongoDB Club Registration Model
 * Replaces JSON file storage for club registrations
 * Corresponds to data/club-registrations.json
 */

import mongoose from 'mongoose';

const clubRegistrationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  student_name: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  house: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  interested_clubs: [{
    type: String,
    required: true
  }],
  message: {
    type: String,
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

export default mongoose.model('ClubRegistration', clubRegistrationSchema);