const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'complete_test',
      'view_resources',
      'forum_posts',
      'study_time',
      'streak_days',
      'perfect_score',
      'explore_subjects'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 300
  },
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: {
    type: Date
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special'],
    default: 'daily'
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ userId: 1, completed: 1, endDate: 1 });
challengeSchema.index({ type: 1, startDate: 1 });
challengeSchema.index({ endDate: 1, completed: 1 });

// Methods
challengeSchema.methods.updateProgress = function(increment = 1) {
  this.current = Math.min(this.current + increment, this.target);
  
  if (this.current >= this.target && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  
  return this.save();
};

challengeSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

challengeSchema.methods.getProgressPercentage = function() {
  return Math.round((this.current / this.target) * 100);
};

// Static methods
challengeSchema.statics.getActiveChallenges = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    completed: false,
    endDate: { $gt: now }
  }).sort({ endDate: 1 });
};

challengeSchema.statics.getCompletedChallenges = function(userId, limit = 20) {
  return this.find({
    userId,
    completed: true
  })
  .sort({ completedAt: -1 })
  .limit(limit);
};

challengeSchema.statics.getExpiredChallenges = function() {
  const now = new Date();
  return this.find({
    completed: false,
    endDate: { $lt: now }
  });
};

challengeSchema.statics.cleanupExpiredChallenges = function() {
  const now = new Date();
  return this.updateMany(
    {
      completed: false,
      endDate: { $lt: now }
    },
    {
      completed: true,
      completedAt: now
    }
  );
};

module.exports = mongoose.model('Challenge', challengeSchema);

