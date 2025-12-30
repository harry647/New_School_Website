/**
 * MongoDB Counseling Booking Model
 * Replaces JSON file storage for counseling bookings
 * Corresponds to data/counseling-bookings.json
 */

import mongoose from 'mongoose';

const counselingBookingSchema = new mongoose.Schema({
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
    required: true
  },
  parent_name: {
    type: String,
    trim: true
  },
  phone: {
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
  preferred_date: {
    type: String,
    required: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  resume_path: {
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

export default mongoose.model('CounselingBooking', counselingBookingSchema);