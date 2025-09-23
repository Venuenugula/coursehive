const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // total time in seconds
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  aiFeedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIFeedback'
  }
}, {
  timestamps: true
});

// Index for efficient queries
attemptSchema.index({ userId: 1, testId: 1 });
attemptSchema.index({ userId: 1, status: 1 });
attemptSchema.index({ score: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
