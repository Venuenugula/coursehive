const express = require('express');
const Analytics = require('../models/Analytics');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get user dashboard analytics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ userId: req.user._id });
    
    if (!analytics) {
      analytics = new Analytics({ userId: req.user._id });
      await analytics.save();
    }

    // Get recent attempts for detailed stats
    const recentAttempts = await Attempt.find({ userId: req.user._id })
      .populate('testId', 'title subject')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate weekly and monthly stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyAttempts = await Attempt.find({
      userId: req.user._id,
      createdAt: { $gte: weekAgo }
    });

    const monthlyAttempts = await Attempt.find({
      userId: req.user._id,
      createdAt: { $gte: monthAgo }
    });

    // Calculate weekly stats
    const weeklyStats = {
      testsCompleted: weeklyAttempts.length,
      timeSpent: weeklyAttempts.reduce((total, attempt) => total + attempt.timeSpent, 0),
      averageAccuracy: weeklyAttempts.length > 0 
        ? Math.round(weeklyAttempts.reduce((total, attempt) => total + attempt.percentage, 0) / weeklyAttempts.length)
        : 0
    };

    // Calculate monthly stats
    const monthlyStats = {
      testsCompleted: monthlyAttempts.length,
      timeSpent: monthlyAttempts.reduce((total, attempt) => total + attempt.timeSpent, 0),
      averageAccuracy: monthlyAttempts.length > 0 
        ? Math.round(monthlyAttempts.reduce((total, attempt) => total + attempt.percentage, 0) / monthlyAttempts.length)
        : 0
    };

    // Update analytics with calculated stats
    analytics.weeklyStats = weeklyStats;
    analytics.monthlyStats = monthlyStats;
    await analytics.save();

    res.json({
      analytics,
      recentAttempts,
      weeklyStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/leaderboard
// @desc    Get leaderboard data
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { subject, timeRange = 'all', limit = 50 } = req.query;
    
    let matchStage = {};
    if (subject) {
      matchStage['subjectStats.subject'] = subject;
    }

    // Add time range filter if specified
    if (timeRange !== 'all') {
      const timeRanges = {
        'week': 7,
        'month': 30,
        'year': 365
      };
      
      if (timeRanges[timeRange]) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - timeRanges[timeRange]);
        matchStage.updatedAt = { $gte: daysAgo };
      }
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
          } : '$subjectStats',
          weeklyStats: 1,
          monthlyStats: 1
        }
      }
    ]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/subject/:subject
// @desc    Get analytics for specific subject
// @access  Private
router.get('/subject/:subject', auth, async (req, res) => {
  try {
    const { subject } = req.params;
    
    let analytics = await Analytics.findOne({ userId: req.user._id });
    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    const subjectStats = analytics.subjectStats.find(stat => stat.subject === subject);
    if (!subjectStats) {
      return res.json({
        subject,
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        lastAttempt: null
      });
    }

    // Get recent attempts for this subject
    const recentAttempts = await Attempt.find({ userId: req.user._id })
      .populate({
        path: 'testId',
        match: { subject: subject }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter out attempts where testId is null (due to populate match)
    const validAttempts = recentAttempts.filter(attempt => attempt.testId);

    res.json({
      subjectStats,
      recentAttempts: validAttempts
    });
  } catch (error) {
    console.error('Get subject analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/accuracy-history
// @desc    Get accuracy history over time
// @access  Private
router.get('/accuracy-history', auth, async (req, res) => {
  try {
    const { subject, days = 30 } = req.query;
    
    let analytics = await Analytics.findOne({ userId: req.user._id });
    if (!analytics) {
      return res.json({ history: [] });
    }

    let history = analytics.accuracyHistory;
    
    // Filter by subject if specified
    if (subject) {
      history = history.filter(entry => entry.subject === subject);
    }

    // Filter by days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    history = history.filter(entry => entry.date > daysAgo);

    // Sort by date
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ history });
  } catch (error) {
    console.error('Get accuracy history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/analytics/update-leaderboard
// @desc    Update leaderboard rankings (Admin only)
// @access  Private
router.post('/update-leaderboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Get all analytics sorted by performance
    const allAnalytics = await Analytics.find({})
      .populate('userId', 'name email')
      .sort({ 'streaks.current': -1, 'monthlyStats.averageAccuracy': -1 });

    // Update rankings
    for (let i = 0; i < allAnalytics.length; i++) {
      allAnalytics[i].leaderboardRank = i + 1;
      await allAnalytics[i].save();
    }

    res.json({ 
      message: 'Leaderboard updated successfully',
      totalUsers: allAnalytics.length
    });
  } catch (error) {
    console.error('Update leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ userId: req.user._id });
    
    if (!analytics) {
      analytics = new Analytics({ userId: req.user._id });
      await analytics.save();
    }

    // Check for new achievements
    const achievements = [];
    
    // Streak achievements
    if (analytics.streaks.current >= 7 && !analytics.achievements.find(a => a.type === 'streak_7')) {
      achievements.push({
        type: 'streak_7',
        description: '7-day study streak!',
        earnedAt: new Date()
      });
    }
    
    if (analytics.streaks.current >= 30 && !analytics.achievements.find(a => a.type === 'streak_30')) {
      achievements.push({
        type: 'streak_30',
        description: '30-day study streak!',
        earnedAt: new Date()
      });
    }

    // Add new achievements to analytics
    if (achievements.length > 0) {
      analytics.achievements.push(...achievements);
      await analytics.save();
    }

    res.json({ 
      achievements: analytics.achievements,
      newAchievements: achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
