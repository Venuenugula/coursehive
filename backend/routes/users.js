const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('profile.bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('profile.subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('profile.grade').optional().trim().isLength({ max: 50 }).withMessage('Grade must be less than 50 characters'),
  body('profile.institution').optional().trim().isLength({ max: 100 }).withMessage('Institution must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/analytics
// @desc    Get user analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ userId: req.user._id });
    
    if (!analytics) {
      // Create analytics record if it doesn't exist
      analytics = new Analytics({ userId: req.user._id });
      await analytics.save();
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { subject, limit = 50 } = req.query;
    
    let matchStage = {};
    if (subject) {
      matchStage['subjectStats.subject'] = subject;
    }

    const leaderboard = await Analytics.aggregate([
      { $match: matchStage },
      { $sort: { leaderboardRank: 1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          name: '$user.name',
          email: '$user.email',
          leaderboardRank: 1,
          'streaks.current': 1,
          'streaks.longest': 1,
          subjectStats: subject ? {
            $filter: {
              input: '$subjectStats',
              cond: { $eq: ['$$this.subject', subject] }
            }
          } : '$subjectStats'
        }
      }
    ]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/badges
// @desc    Get user badges
// @access  Private
router.get('/badges', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('badges');
    res.json({ badges: user.badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/badges
// @desc    Award badge to user
// @access  Private (Admin only)
router.post('/badges', [
  auth,
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('badgeType').isIn(['streak_7', 'streak_30', 'top_10_percent', 'fast_learner', 'forum_contributor', 'test_master']).withMessage('Invalid badge type'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId, badgeType, description } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          badges: {
            type: badgeType,
            description: description || `Earned ${badgeType.replace('_', ' ')} badge`
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Badge awarded successfully', user: user.getPublicProfile() });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
