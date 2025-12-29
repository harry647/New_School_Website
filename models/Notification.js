/**
 * MongoDB Notification Model
 * Replaces JSON file storage for notifications
 * Corresponds to data/notifications.json
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  source: {
    type: String,
    required: true
  },
  action: String,
  isRead: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isAcknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ isPinned: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);