const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      default: 30 // in minutes
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    time: {
      type: String, // HH:MM format
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
studyPlanSchema.index({ user: 1, date: -1 });
studyPlanSchema.index({ 'tasks.completed': 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
