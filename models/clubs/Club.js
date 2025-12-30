/**
 * MongoDB Club Model
 * Replaces JSON file storage for club data
 * Corresponds to data/clubs/clubs.json
 */

import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'sports', 'arts', 'technology', 'community'],
    required: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  events: [{
    title: String,
    date: Date,
    description: String,
    location: String,
    organizer: String
  }],
  meetingSchedule: {
    day: String,
    time: String,
    location: String
  },
  contactEmail: String,
  website: String,
  foundedYear: Number,
  achievements: [String],
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
clubSchema.index({ category: 1 });
clubSchema.index({ isActive: 1 });
clubSchema.index({ 'meetingSchedule.day': 1 });

export default mongoose.model('Club', clubSchema);