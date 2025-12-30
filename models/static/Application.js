/**
 * MongoDB Application Model
 * Replaces JSON file storage for applications
 * Corresponds to data/applications.json
 */

import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
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
  date_of_birth: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  grade_pathway: {
    type: String,
    required: true
  },
  parent_name: {
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
    required: true,
    trim: true
  },
  previous_school: {
    type: String,
    trim: true
  },
  special_notes: {
    type: String,
    trim: true
  },
  birth_certificate: {
    type: String
  },
  academic_results: {
    type: String
  },
  school_report: {
    type: String
  },
  medical_report: {
    type: String
  },
  passport_photo: {
    type: String
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

export default mongoose.model('Application', applicationSchema);