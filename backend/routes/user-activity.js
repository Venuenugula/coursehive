const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Link = require('../models/Link');
const { auth } = require('../middleware/auth');

// Get user's recent activity
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent click history with link details
    const recentClicks = await Link.find({
      _id: { $in: user.clickHistory.slice(-10).map(h => h.link) }
    }).select('title url difficulty categories contentType clickCount');

    // Format activity data
    const activities = recentClicks.map((link, index) => {
      const clickData = user.clickHistory.find(h => h.link.toString() === link._id.toString());
      return {
        id: link._id,
        type: 'link_click',
        description: `Visited "${link.title}"`,
        timestamp: clickData ? clickData.clickedAt : new Date(),
        metadata: {
          difficulty: link.difficulty,
          category: link.categories.primary,
          contentType: link.contentType
        }
      };
    });

    // Add other activities (test completions, forum posts, etc.)
    const otherActivities = [
      {
        id: 'streak',
        type: 'streak',
        description: `${user.engagement.streakDays} day learning streak!`,
        timestamp: user.engagement.lastActivity,
        metadata: { streakDays: user.engagement.streakDays }
      }
    ];

    // Combine and sort by timestamp
    const allActivities = [...activities, ...otherActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(allActivities);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get user's bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('bookmarks.link');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format bookmarks with link details
    const bookmarks = user.bookmarks.map(bookmark => ({
      _id: bookmark.link._id,
      title: bookmark.link.title,
      url: bookmark.link.url,
      summary: bookmark.link.summary,
      difficulty: bookmark.link.difficulty,
      categories: bookmark.link.categories,
      contentType: bookmark.link.contentType,
      addedAt: bookmark.addedAt,
      tags: bookmark.tags,
      notes: bookmark.notes
    }));

    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch user bookmarks' });
  }
});

// Get user's learning statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = {
      totalClicks: user.engagement.totalClicks,
      totalTimeSpent: user.engagement.totalTimeSpent,
      streakDays: user.engagement.streakDays,
      skillsLearned: user.skills.length,
      bookmarksCount: user.bookmarks.length,
      favoriteCategories: user.engagement.favoriteCategories,
      favoriteTopics: user.engagement.favoriteTopics,
      lastActivity: user.engagement.lastActivity,
      badgesEarned: user.badges.length,
      learningPaths: user.learningPaths.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Update user's learning goals
router.put('/goals', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goals } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 'profile.learningGoals': goals },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, goals: user.profile.learningGoals });
  } catch (error) {
    console.error('Error updating user goals:', error);
    res.status(500).json({ error: 'Failed to update user goals' });
  }
});

// Get user's skill progress
router.get('/skills', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.skills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ error: 'Failed to fetch user skills' });
  }
});

// Update user's skill level
router.put('/skills/:skillId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;
    const { level, confidence } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const skill = user.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    skill.level = level;
    skill.confidence = confidence;
    skill.lastUpdated = new Date();

    await user.save();

    res.json({ success: true, skill });
  } catch (error) {
    console.error('Error updating user skill:', error);
    res.status(500).json({ error: 'Failed to update user skill' });
  }
});

module.exports = router;
