const express = require('express');
const AIFeedback = require('../models/AIFeedback');
const { auth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/ai-feedback/:attemptId
// @desc    Get AI feedback for a test attempt
// @access  Private
router.get('/:attemptId', auth, async (req, res) => {
  try {
    const feedback = await AIFeedback.findOne({ attemptId: req.params.attemptId })
      .populate('recommendedContent.contentId', 'title type subject url')
      .populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'AI feedback not found' });
    }

    // Check if user can access this feedback
    if (feedback.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Get AI feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai-feedback/generate
// @desc    Generate AI feedback for a test attempt
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    const { attemptId, testId, answers, questions, score, percentage } = req.body;

    // Send to AI evaluator
    const aiResponse = await axios.post(`${process.env.AI_EVALUATOR_URL}/evaluate`, {
      attemptId,
      testId,
      userId: req.user._id,
      answers,
      questions,
      score,
      percentage
    });

    if (aiResponse.data.success) {
      // Save feedback to database
      const feedbackData = {
        ...aiResponse.data.feedback,
        attemptId,
        userId: req.user._id,
        testId
      };

      const feedback = new AIFeedback(feedbackData);
      await feedback.save();

      res.json({
        success: true,
        feedbackId: feedback._id,
        message: 'AI feedback generated successfully'
      });
    } else {
      res.status(500).json({ message: 'Failed to generate AI feedback' });
    }
  } catch (error) {
    console.error('Generate AI feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai-feedback/user/:userId
// @desc    Get all AI feedback for a user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user can access this data
    if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedbacks = await AIFeedback.find({ userId: req.params.userId })
      .populate('testId', 'title subject')
      .populate('recommendedContent.contentId', 'title type subject url')
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get user AI feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
