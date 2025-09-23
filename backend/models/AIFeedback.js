const mongoose = require('mongoose');

const topicMistakeSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  },
  mistakeType: {
    type: String,
    enum: ['conceptual', 'calculation', 'application', 'memory'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  suggestedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }]
});

const aiFeedbackSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attempt',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  strengths: [String],
  weaknesses: [String],
  topicMistakes: [topicMistakeSchema],
  improvementSuggestions: [{
    area: String,
    suggestion: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  recommendedContent: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    reason: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  studyPlan: {
    nextTopics: [String],
    estimatedTime: Number, // in hours
    difficulty: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  modelVersion: String
}, {
  timestamps: true
});

// Index for efficient queries
aiFeedbackSchema.index({ userId: 1, testId: 1 });
aiFeedbackSchema.index({ generatedAt: -1 });

module.exports = mongoose.model('AIFeedback', aiFeedbackSchema);
