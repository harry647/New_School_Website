/**
 * MongoDB Donation Model
 * Replaces JSON file storage for donations
 * Corresponds to data/donations.json
 */

import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  donor_name: {
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
  amount: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  attachment: {
    type: String
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  payment_status: {
    type: String,
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Donation', donationSchema);