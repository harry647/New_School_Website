/**
 * MongoDB Club Join Model
 * Replaces JSON file storage for club join applications
 * Corresponds to data/club-joins.json
 */

import mongoose from 'mongoose';

const clubJoinSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  form: String,
  phone: String,
  reason: String,
  submitted_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
clubJoinSchema.index({ clubId: 1 });
clubJoinSchema.index({ userId: 1 });
clubJoinSchema.index({ email: 1 });
clubJoinSchema.index({ status: 1 });
clubJoinSchema.index({ submitted_at: -1 });

export default mongoose.model('ClubJoin', clubJoinSchema);