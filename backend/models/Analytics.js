const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  leaderboardRank: {
    type: Number,
    default: 0
  },
  accuracyHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    accuracy: {
      type: Number,
      required: true
    },
    subject: String
  }],
  subjectStats: [{
    subject: {
      type: String,
      required: true
    },
    totalTests: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date
    }
  }],
  achievements: [{
    type: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  weeklyStats: {
    testsCompleted: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    }
  },
  monthlyStats: {
    testsCompleted: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    }
  },
  aiInsights: {
    weakTopics: [{
      topic: String,
      accuracy: Number,
      lastAttempt: Date,
      improvement: Number // percentage improvement over time
    }],
    strongTopics: [{
      topic: String,
      accuracy: Number,
      lastAttempt: Date
    }],
    suggestedContent: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      reason: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ leaderboardRank: 1 });
analyticsSchema.index({ 'streaks.current': -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
