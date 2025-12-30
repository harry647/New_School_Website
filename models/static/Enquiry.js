/**
 * MongoDB Enquiry Model
 * Replaces JSON file storage for enquiries
 * Corresponds to data/enquiries.json
 */

import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  parentPhone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  submittedAt: {
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

export default mongoose.model('Enquiry', enquirySchema);