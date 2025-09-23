const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['notes', 'previous_paper', 'question_bank', 'video', 'article', 'book'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  metadata: {
    source: String,
    author: String,
    publishDate: Date,
    fileSize: Number,
    pageCount: Number,
    duration: Number // for videos
  },
  stats: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Virtual for backward compatibility
contentSchema.virtual('creator').get(function() {
  return this.uploadedBy;
});

// Index for efficient queries
contentSchema.index({ subject: 1, type: 1, status: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ 'stats.views': -1 });
contentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Content', contentSchema);
