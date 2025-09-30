const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }],
  completed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  prerequisites: [String],
  learningOutcomes: [String],
  targetAudience: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
learningPathSchema.index({ subject: 1, difficulty: 1 });
learningPathSchema.index({ author: 1 });
learningPathSchema.index({ isPublic: 1, isFeatured: 1 });
learningPathSchema.index({ 'stats.totalViews': -1 });
learningPathSchema.index({ 'stats.averageRating': -1 });
learningPathSchema.index({ createdAt: -1 });

// Virtual for completion percentage
learningPathSchema.virtual('completionPercentage').get(function() {
  if (this.links.length === 0) return 0;
  return Math.round((this.completed.length / this.links.length) * 100);
});

// Method to update progress
learningPathSchema.methods.updateProgress = function() {
  if (this.links.length === 0) {
    this.progress = 0;
  } else {
    this.progress = Math.round((this.completed.length / this.links.length) * 100);
  }
  return this.progress;
};

// Method to add link
learningPathSchema.methods.addLink = function(linkId) {
  if (!this.links.includes(linkId)) {
    this.links.push(linkId);
    this.updateProgress();
  }
  return this;
};

// Method to remove link
learningPathSchema.methods.removeLink = function(linkId) {
  this.links = this.links.filter(id => id.toString() !== linkId.toString());
  this.completed = this.completed.filter(id => id.toString() !== linkId.toString());
  this.updateProgress();
  return this;
};

// Method to mark link as completed
learningPathSchema.methods.completeLink = function(linkId) {
  if (this.links.includes(linkId) && !this.completed.includes(linkId)) {
    this.completed.push(linkId);
    this.updateProgress();
  }
  return this;
};

// Method to get remaining links
learningPathSchema.methods.getRemainingLinks = function() {
  return this.links.filter(linkId => !this.completed.includes(linkId));
};

// Static method to find featured paths
learningPathSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ isPublic: true, isFeatured: true })
    .populate('author', 'name email')
    .populate('links', 'title url difficulty categories')
    .sort({ 'stats.totalViews': -1, 'stats.averageRating': -1 })
    .limit(limit);
};

// Static method to find trending paths
learningPathSchema.statics.findTrending = function(limit = 10) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return this.find({ 
    isPublic: true, 
    createdAt: { $gte: weekAgo } 
  })
    .populate('author', 'name email')
    .populate('links', 'title url difficulty categories')
    .sort({ 'stats.totalViews': -1, 'stats.totalCompletions': -1 })
    .limit(limit);
};

// Static method to find paths by subject
learningPathSchema.statics.findBySubject = function(subject, limit = 20) {
  return this.find({ 
    isPublic: true, 
    subject: new RegExp(subject, 'i') 
  })
    .populate('author', 'name email')
    .populate('links', 'title url difficulty categories')
    .sort({ 'stats.averageRating': -1, 'stats.totalCompletions': -1 })
    .limit(limit);
};

// Static method to find paths by difficulty
learningPathSchema.statics.findByDifficulty = function(difficulty, limit = 20) {
  return this.find({ 
    isPublic: true, 
    difficulty 
  })
    .populate('author', 'name email')
    .populate('links', 'title url difficulty categories')
    .sort({ 'stats.averageRating': -1, 'stats.totalCompletions': -1 })
    .limit(limit);
};

// Pre-save middleware to update progress
learningPathSchema.pre('save', function(next) {
  this.updateProgress();
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
