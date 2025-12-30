/**
 * MongoDB Pending Blog Model
 * Replaces JSON file storage for pending blogs
 * Corresponds to data/pending-blogs.json
 */

import mongoose from 'mongoose';

const pendingBlogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  author_name: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
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

export default mongoose.model('PendingBlog', pendingBlogSchema);