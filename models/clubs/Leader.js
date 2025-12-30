/**
 * MongoDB Leader Model
 * Replaces JSON file storage for club leaders data
 * Corresponds to data/clubs/leaders.json
 */

import mongoose from 'mongoose';

const leaderSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  position: {
    type: String,
    required: true,
    enum: ['president', 'vice president', 'secretary', 'treasurer', 'coordinator']
  },
  phone: String,
  bio: String,
  profileImage: String,
  termStart: {
    type: Date,
    required: true
  },
  termEnd: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
leaderSchema.index({ clubId: 1 });
leaderSchema.index({ userId: 1 });
leaderSchema.index({ position: 1 });
leaderSchema.index({ isActive: 1 });

export default mongoose.model('Leader', leaderSchema);