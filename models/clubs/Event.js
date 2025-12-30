/**
 * MongoDB Event Model
 * Replaces JSON file storage for club events data
 * Corresponds to data/clubs/events.json
 */

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  startTime: String,
  endTime: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
eventSchema.index({ clubId: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ isPublic: 1 });

export default mongoose.model('Event', eventSchema);