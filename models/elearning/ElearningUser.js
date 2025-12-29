/**
 * MongoDB ElearningUser Model
 * Replaces: data/portal/elearning-data.json
 * Comprehensive student e-learning profile and progress tracking
 */

import mongoose from 'mongoose';

const progressSubjectSchema = new mongoose.Schema({
  course: String,
  percent: Number,
  lessonsCompleted: Number,
  totalLessons: Number,
  quizScore: Number,
  timeSpent: Number,
  lastActivity: Date
});

const elearningUserSchema = new mongoose.Schema({
  // Reference to main User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic student information
  class: String,
  avatar: {
    type: String,
    default: '/assets/images/defaults/default-student.png'
  },
  lastLogin: Date,
  
  // Gamification elements
  streak: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  badges: [String],
  
  // Subject enrollment and progress
  subjects: [{
    id: String,
    name: String,
    icon: String,
    lessons: Number,
    quizzes: Number,
    completed: Number,
    color: String,
    teacher: String,
    nextLesson: String,
    subjectRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }
  }],
  
  // Learning resources
  resources: [{
    id: String,
    title: String,
    teacher: String,
    date: Date,
    type: { type: String, enum: ['pdf', 'video', 'gallery', 'interactive'] },
    subject: String,
    url: String,
    size: String,
    downloads: Number,
    rating: Number,
    description: String,
    duration: String,
    images: Number,
    views: Number,
    resourceRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }
  }],
  
  // Quiz and assessment data
  quizzes: [{
    id: String,
    title: String,
    subject: String,
    type: { type: String, enum: ['quiz', 'test', 'practical', 'assignment'] },
    dueDate: Date,
    duration: Number,
    attempts: Number,
    questions: Number,
    status: { type: String, enum: ['available', 'upcoming', 'completed', 'graded'] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    topics: [String],
    instructions: String,
    quizRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    }
  }],
  
  // Assignment tracking
  assignments: [{
    id: String,
    title: String,
    subject: String,
    assignedDate: Date,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in-progress', 'submitted', 'graded'] },
    grade: Number,
    feedback: String,
    points: Number,
    attachments: [String],
    description: String,
    progress: Number,
    assignmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    }
  }],
  
  // Live session participation
  liveSessions: [{
    id: String,
    title: String,
    subject: String,
    teacher: String,
    scheduledTime: Date,
    duration: Number,
    status: { type: String, enum: ['scheduled', 'completed', 'missed'] },
    maxParticipants: Number,
    registered: Boolean,
    description: String,
    meetingLink: String,
    attendance: Boolean,
    sessionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveSession'
    }
  }],
  
  // Calendar and scheduling
  calendar: [{
    id: String,
    title: String,
    date: Date,
    time: String,
    type: { type: String, enum: ['quiz', 'live', 'assignment', 'event'] },
    subject: String,
    color: String,
    reminder: Boolean,
    reminderSent: Boolean
  }],
  
  // Forum participation
  forum: [{
    id: String,
    title: String,
    category: String,
    author: String,
    authorAvatar: String,
    date: Date,
    replies: Number,
    views: Number,
    lastReply: Date,
    tags: [String],
    content: String,
    status: { type: String, enum: ['open', 'answered', 'closed'] },
    isPinned: Boolean,
    threadRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumThread'
    }
  }],
  
  // Comprehensive progress tracking
  progress: {
    overallCompletion: {
      type: Number,
      default: 0
    },
    weeklyGoal: {
      type: Number,
      default: 80
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    improvementRate: {
      type: Number,
      default: 0
    },
    mostActiveTime: String,
    preferredSubjects: [String],
    weeklyProgress: [Number],
    subjects: [progressSubjectSchema]
  },
  
  // Achievements and gamification
  achievements: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    color: String,
    earnedDate: Date,
    points: Number
  }],
  
  // Media interactions
  media: [{
    id: String,
    title: String,
    type: { type: String, enum: ['video', 'gallery', 'interactive'] },
    teacher: String,
    date: Date,
    url: String,
    thumbnail: String,
    duration: String,
    views: Number,
    subject: String,
    description: String,
    interactions: Number,
    mediaRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  }],
  
  // Notifications
  notifications: [{
    id: String,
    title: String,
    message: String,
    date: Date,
    type: { type: String, enum: ['assignment', 'quiz', 'live', 'achievement', 'forum'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
    subject: String,
    link: String,
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  // Study plans
  studyPlan: [{
    id: String,
    title: String,
    subjects: [String],
    duration: Number,
    timeSlots: [String],
    goals: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Learning analytics
  analytics: {
    studyTimeToday: {
      type: Number,
      default: 0
    },
    studyTimeWeek: {
      type: Number,
      default: 0
    },
    studyTimeMonth: {
      type: Number,
      default: 0
    },
    quizzesTaken: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    improvementRate: {
      type: Number,
      default: 0
    },
    mostActiveTime: String,
    preferredSubjects: [String],
    weeklyProgress: [Number],
    subjectPerformance: Object
  },
  
  // System metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: Date
}, {
  timestamps: true
});

// Indexes for performance optimization
elearningUserSchema.index({ userId: 1 }, { unique: true });
elearningUserSchema.index({ 'subjects.name': 1 });
elearningUserSchema.index({ 'progress.overallCompletion': 1 });
elearningUserSchema.index({ 'analytics.studyTimeToday': 1 });
elearningUserSchema.index({ 'notifications.read': 1 });

export default mongoose.model('ElearningUser', elearningUserSchema);