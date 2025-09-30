const mongoose = require('mongoose');

const userFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedbackType: {
    type: String,
    enum: ['spam', 'wrong_category', 'broken', 'misclassified', 'low_quality'],
    required: true
  },
  comment: {
    type: String,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const versionHistorySchema = new mongoose.Schema({
  title: String,
  description: String,
  summary: String,
  categories: [String],
  difficulty: String,
  tags: [String],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const linkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 300
  },
  language: {
    type: String,
    default: 'en',
    index: true
  },
  categories: {
    primary: {
      type: String,
      required: true,
      index: true
    },
    secondary: [String]
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
    index: true
  },
  clickCount: {
    type: Number,
    default: 0,
    index: true
  },
  lastChecked: {
    type: Date,
    default: Date.now,
    index: true
  },
  validStatus: {
    type: Boolean,
    default: true,
    index: true
  },
  popularityScore: {
    type: Number,
    default: 0,
    index: true
  },
  sourceDomain: {
    type: String,
    required: true,
    index: true
  },
  userFeedback: [userFeedbackSchema],
  versionHistory: [versionHistorySchema],
  contentType: {
    type: String,
    enum: ['video', 'article', 'pdf', 'interactive', 'course', 'tutorial'],
    required: true,
    index: true
  },
  tags: [String],
  skillRelevance: [String],
  learningPath: [String],
  qualityScore: {
    type: Number,
    default: 0,
    index: true
  },
  trendingScore: {
    type: Number,
    default: 0,
    index: true
  },
  embeddings: {
    type: [Number], // Vector embeddings for semantic search
    index: '2dsphere'
  },
  metadata: {
    author: String,
    publishDate: Date,
    estimatedReadTime: Number, // in minutes
    wordCount: Number,
    imageCount: Number,
    videoDuration: Number, // in seconds
    hasCaptions: Boolean,
    accessibilityScore: Number
  },
  safetyChecks: {
    safeBrowsingStatus: {
      type: String,
      enum: ['safe', 'unsafe', 'unknown'],
      default: 'unknown'
    },
    virusTotalStatus: {
      type: String,
      enum: ['clean', 'malicious', 'unknown'],
      default: 'unknown'
    },
    lastSafetyCheck: Date
  },
  engagement: {
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    shares: {
      type: Number,
      default: 0
    },
    ratings: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    averageRating: {
      type: Number,
      default: 0
    }
  },
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    complexity: {
      type: Number,
      min: 1,
      max: 10
    },
    educationalValue: {
      type: Number,
      min: 1,
      max: 10
    },
    lastAnalyzed: Date
  },
  lastViewed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance (url and sourceDomain indexes are already created by index: true)
linkSchema.index({ 'categories.primary': 1, difficulty: 1 });
linkSchema.index({ popularityScore: -1 });
linkSchema.index({ trendingScore: -1 });
linkSchema.index({ qualityScore: -1 });
linkSchema.index({ createdAt: -1 });
linkSchema.index({ validStatus: 1, lastChecked: 1 });

// Compound indexes for complex queries
linkSchema.index({ 
  'categories.primary': 1, 
  difficulty: 1, 
  popularityScore: -1 
});

linkSchema.index({ 
  validStatus: 1, 
  qualityScore: -1, 
  trendingScore: -1 
});

// Methods
linkSchema.methods.updatePopularityScore = function() {
  const recency = Math.max(0, 1 - (Date.now() - this.createdAt) / (30 * 24 * 60 * 60 * 1000)); // 30 days
  const userRating = this.engagement.averageRating || 0;
  
  this.popularityScore = (this.clickCount * 0.6) + (recency * 0.3) + (userRating * 0.1);
  return this.popularityScore;
};

linkSchema.methods.updateTrendingScore = function() {
  // Calculate trending score based on recent clicks (last 24 hours)
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // This would be calculated based on recent click data
  // For now, using a simplified calculation
  this.trendingScore = this.clickCount * 0.1 + this.popularityScore * 0.9;
  return this.trendingScore;
};

linkSchema.methods.addFeedback = function(userId, feedbackType, comment) {
  this.userFeedback.push({
    userId,
    feedbackType,
    comment
  });
  
  // Update quality score based on feedback
  if (feedbackType === 'spam' || feedbackType === 'broken') {
    this.qualityScore = Math.max(0, this.qualityScore - 0.1);
  }
};

linkSchema.methods.addVersion = function(data) {
  this.versionHistory.push({
    title: this.title,
    description: this.description,
    summary: this.summary,
    categories: this.categories.secondary,
    difficulty: this.difficulty,
    tags: this.tags,
    updatedAt: new Date()
  });
  
  // Update current data
  Object.assign(this, data);
};

// Static methods
linkSchema.statics.findTrending = function(limit = 20) {
  return this.find({ validStatus: true })
    .sort({ trendingScore: -1 })
    .limit(limit);
};

linkSchema.statics.findByCategory = function(category, difficulty, limit = 20) {
  const query = { 
    validStatus: true,
    'categories.primary': category 
  };
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  return this.find(query)
    .sort({ popularityScore: -1 })
    .limit(limit);
};

linkSchema.statics.findSimilar = function(linkId, limit = 10) {
  return this.findById(linkId)
    .then(link => {
      if (!link) return [];
      
      return this.find({
        _id: { $ne: linkId },
        validStatus: true,
        'categories.primary': link.categories.primary,
        difficulty: link.difficulty
      })
      .sort({ popularityScore: -1 })
      .limit(limit);
    });
};

linkSchema.statics.findByEmbeddings = function(queryEmbeddings, limit = 10) {
  // This would use vector similarity search in a real implementation
  // For now, return links with similar categories
  return this.find({ validStatus: true })
    .sort({ qualityScore: -1 })
    .limit(limit);
};

linkSchema.statics.findTrendingByTimeframe = function(timeframe = '24h', limit = 20) {
  const now = new Date();
  let startTime;
  
  switch (timeframe) {
    case '1h':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return this.find({
    validStatus: true,
    lastViewed: { $gte: startTime }
  })
  .sort({ trendingScore: -1 })
  .limit(limit);
};

linkSchema.statics.findBySkillRelevance = function(skills, limit = 20) {
  return this.find({
    validStatus: true,
    skillRelevance: { $in: skills }
  })
  .sort({ qualityScore: -1 })
  .limit(limit);
};

linkSchema.statics.findBrokenLinks = function() {
  return this.find({
    validStatus: false,
    lastChecked: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
};

linkSchema.statics.findByDomainQuota = function(domain, maxPercentage = 10) {
  const totalLinks = this.countDocuments({ validStatus: true });
  const domainLinks = this.countDocuments({ sourceDomain: domain, validStatus: true });
  
  return Promise.all([totalLinks, domainLinks])
    .then(([total, domainCount]) => {
      const percentage = (domainCount / total) * 100;
      return percentage <= maxPercentage;
    });
};

module.exports = mongoose.model('Link', linkSchema);