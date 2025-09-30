const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const GamificationService = require('../services/gamificationService');
const NotificationService = require('../services/notificationService');
const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');

// Get user's gamification stats
router.get('/gamification/stats', auth, async (req, res) => {
  try {
    const stats = await GamificationService.getUserStats(req.user._id);
    res.json(stats);
  } catch (error) {
    console.error('Get gamification stats error:', error);
    res.status(500).json({ error: 'Failed to get gamification stats' });
  }
});

// Get leaderboard
router.get('/gamification/leaderboard', async (req, res) => {
  try {
    const { limit = 50, timeframe = 'all' } = req.query;
    const leaderboard = await GamificationService.getLeaderboard(parseInt(limit), timeframe);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Check and award badges
router.post('/gamification/check-badges', auth, async (req, res) => {
  try {
    const newBadges = await GamificationService.checkAndAwardBadges(req.user._id);
    res.json({ newBadges });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// Get user's challenges
router.get('/challenges', auth, async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    let challenges;
    if (status === 'active') {
      challenges = await Challenge.getActiveChallenges(req.user._id);
    } else if (status === 'completed') {
      challenges = await Challenge.getCompletedChallenges(req.user._id);
    } else {
      challenges = await Challenge.find({ userId: req.user._id }).sort({ createdAt: -1 });
    }
    
    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// Generate daily challenge
router.post('/challenges/daily', auth, async (req, res) => {
  try {
    const challenge = await GamificationService.generateDailyChallenge(req.user._id);
    res.json({ challenge });
  } catch (error) {
    console.error('Generate daily challenge error:', error);
    res.status(500).json({ error: 'Failed to generate daily challenge' });
  }
});

// Update challenge progress
router.patch('/challenges/:challengeId/progress', auth, async (req, res) => {
  try {
    const { increment = 1 } = req.body;
    
    const challenge = await Challenge.findOne({
      _id: req.params.challengeId,
      userId: req.user._id
    });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    await challenge.updateProgress(increment);
    
    res.json({ challenge });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ error: 'Failed to update challenge progress' });
  }
});

// Get user's notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      notifications,
      total,
      unreadCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await notification.markAsRead();
    
    res.json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get notification count
router.get('/notifications/count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    res.json({ unreadCount });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Failed to get notification count' });
  }
});

// Subscribe to push notifications
router.post('/notifications/subscribe', auth, async (req, res) => {
  try {
    const { token, type = 'web' } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }
    
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    // Remove existing token if it exists
    user.preferences.pushDevices = user.preferences.pushDevices.filter(
      device => device.token !== token
    );
    
    // Add new token
    user.preferences.pushDevices.push({
      token,
      type,
      registeredAt: new Date()
    });
    
    await user.save();
    
    res.json({ message: 'Successfully subscribed to push notifications' });
  } catch (error) {
    console.error('Subscribe to push notifications error:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});

// Unsubscribe from push notifications
router.delete('/notifications/unsubscribe', auth, async (req, res) => {
  try {
    const { token } = req.body;
    
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (token) {
      // Remove specific token
      user.preferences.pushDevices = user.preferences.pushDevices.filter(
        device => device.token !== token
      );
    } else {
      // Remove all tokens
      user.preferences.pushDevices = [];
    }
    
    await user.save();
    
    res.json({ message: 'Successfully unsubscribed from push notifications' });
  } catch (error) {
    console.error('Unsubscribe from push notifications error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
});

// Update notification preferences
router.put('/notifications/preferences', auth, async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      testReminders,
      achievementAlerts,
      weeklyReports,
      newLinks,
      trending,
      recommendations
    } = req.body;
    
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (emailNotifications !== undefined) {
      user.preferences.notifications.emailNotifications = emailNotifications;
    }
    if (pushNotifications !== undefined) {
      user.preferences.notifications.pushNotifications = pushNotifications;
    }
    if (testReminders !== undefined) {
      user.preferences.notifications.testReminders = testReminders;
    }
    if (achievementAlerts !== undefined) {
      user.preferences.notifications.achievementAlerts = achievementAlerts;
    }
    if (weeklyReports !== undefined) {
      user.preferences.notifications.weeklyReports = weeklyReports;
    }
    if (newLinks !== undefined) {
      user.preferences.notifications.newLinks = newLinks;
    }
    if (trending !== undefined) {
      user.preferences.notifications.trending = trending;
    }
    if (recommendations !== undefined) {
      user.preferences.notifications.recommendations = recommendations;
    }
    
    await user.save();
    
    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Send test notification
router.post('/notifications/test', auth, async (req, res) => {
  try {
    const { type = 'in-app', title = 'Test Notification', message = 'This is a test notification' } = req.body;
    
    if (type === 'in-app') {
      await NotificationService.createInAppNotification(
        req.user._id,
        'system',
        title,
        message
      );
    } else if (type === 'email') {
      const user = await User.findById(req.user._id).select('email name');
      await NotificationService.sendEmail(user.email, 'test', { name: user.name });
    } else if (type === 'push') {
      await NotificationService.sendPushNotification(
        req.user._id,
        title,
        message
      );
    }
    
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Admin: Send bulk notification
router.post('/admin/notifications/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userIds, title, message, data = {} } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    await NotificationService.sendBulkNotifications(userIds, title, message, data);
    
    res.json({ 
      message: `Bulk notification sent to ${userIds.length} users`,
      sentTo: userIds.length
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({ error: 'Failed to send bulk notification' });
  }
});

// Admin: Schedule notification
router.post('/admin/notifications/schedule', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const {
      userIds,
      scheduledTime,
      type,
      title,
      message,
      data = {},
      recurring = 'none',
      recurringEndDate
    } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    if (!scheduledTime || !type || !title || !message) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const scheduledNotifications = [];
    
    for (const userId of userIds) {
      if (recurring !== 'none' && recurringEndDate) {
        const notifications = await Notification.createRecurringNotification(
          userId,
          new Date(scheduledTime),
          type,
          title,
          message,
          data,
          recurring,
          new Date(recurringEndDate)
        );
        scheduledNotifications.push(...notifications);
      } else {
        const notification = await NotificationService.scheduleNotification(
          userId,
          new Date(scheduledTime),
          type,
          title,
          message,
          data
        );
        scheduledNotifications.push(notification);
      }
    }
    
    res.json({ 
      message: `Scheduled ${scheduledNotifications.length} notifications`,
      scheduled: scheduledNotifications.length
    });
  } catch (error) {
    console.error('Schedule notification error:', error);
    res.status(500).json({ error: 'Failed to schedule notification' });
  }
});

module.exports = router;
