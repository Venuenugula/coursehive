const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subtopics: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  linkCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
topicSchema.index({ subject: 1, name: 1 });
topicSchema.index({ isActive: 1 });
topicSchema.index({ clickCount: -1 });

module.exports = mongoose.model('Topic', topicSchema);
