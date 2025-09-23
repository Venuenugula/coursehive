const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sourceSite: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  subtopic: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  clickCount: {
    type: Number,
    default: 0
  },
  userRatings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  savedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastCheckedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'broken', 'pending'],
    default: 'active'
  },
  metadata: {
    imageUrl: String,
    author: String,
    publishDate: Date,
    estimatedReadTime: Number, // in minutes
    language: {
      type: String,
      default: 'en'
    }
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  }
}, {
  timestamps: true
});

// Index for efficient queries
linkSchema.index({ subject: 1, topic: 1 });
linkSchema.index({ tags: 1 });
linkSchema.index({ difficulty: 1 });
linkSchema.index({ clickCount: -1 });
linkSchema.index({ status: 1 });
linkSchema.index({ lastCheckedAt: 1 });
linkSchema.index({ createdAt: -1 });

// Virtual for average rating
linkSchema.virtual('averageRating').get(function() {
  if (this.userRatings.length === 0) return 0;
  const sum = this.userRatings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / this.userRatings.length;
});

// Virtual for save count
linkSchema.virtual('saveCount').get(function() {
  return this.savedByUsers.length;
});

module.exports = mongoose.model('Link', linkSchema);
