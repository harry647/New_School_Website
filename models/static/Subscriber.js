/**
 * MongoDB Subscriber Model
 * Replaces JSON file storage for subscribers
 * Corresponds to data/subscribers.json
 */

import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  preferences: [{
    type: String
  }],
  subscribed_at: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website'
  },
  status: {
    type: String,
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Subscriber', subscriberSchema);