const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  action: {
    type: String,
    enum: ['click', 'save', 'unsave', 'rate'],
    required: true
  },
  clickedAt: {
    type: Date,
    default: Date.now
  },
  saved: {
    type: Boolean,
    default: false
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
  sessionId: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
userHistorySchema.index({ user: 1, clickedAt: -1 });
userHistorySchema.index({ link: 1, clickedAt: -1 });
userHistorySchema.index({ action: 1 });
userHistorySchema.index({ user: 1, link: 1 });

module.exports = mongoose.model('UserHistory', userHistorySchema);
