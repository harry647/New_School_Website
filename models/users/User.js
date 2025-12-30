/**
 * MongoDB User Model
 * Replaces JSON file storage for user data
 * Corresponds to data/users.json
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
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
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'parent'],
    default: 'student'
  },
  photo: {
    type: String,
    default: '/assets/images/defaults/default-user.png'
  },
  personal: {
    dob: String,
    gender: String,
    parentContact: String,
    emergencyContact: String,
    residence: String,
    studentId: String
  },
  preferences: {
    learningStyle: String,
    favoriteSubjects: String,
    careerInterests: String,
    skillsToDevelop: String
  },
  academic: {
    term: String,
    meanGrade: String,
    bestSubject: String,
    subjectsTaken: Number,
    subjectGrades: [String]
  },
  security: {
    lastLogin: String,
    activeDevices: Number,
    passwordStrength: String,
    twoFactorEnabled: Boolean
  },
  securityQuestions: [{
    question: String,
    answer: String
  }],
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deletion_requested'],
    default: 'active'
  },
  deletionRequestedAt: Date,
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
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'academic.meanGrade': 1 });

export default mongoose.model('User', userSchema);