const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'book'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  topicCount: {
    type: Number,
    default: 0
  },
  linkCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries (name index is already created by unique: true)
subjectSchema.index({ isActive: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
