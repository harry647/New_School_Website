/**
 * MongoDB Notification Model
 * Replaces JSON file storage for notifications
 * Corresponds to data/notifications.json
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'fa-bell'
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    default: 'medium'
  },
  userId: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date,
    default: null
  },
  actions: [{
    label: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);