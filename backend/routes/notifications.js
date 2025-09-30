const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

const router = express.Router();

// ==================== NOTIFICATION PREFERENCES ====================

// Get user notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences.notifications preferences.account');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      notifications: user.preferences.notifications,
      account: user.preferences.account
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', [
  auth,
  body('notifications.emailNotifications').optional().isBoolean(),
  body('notifications.pushNotifications').optional().isBoolean(),
  body('notifications.testReminders').optional().isBoolean(),
  body('notifications.achievementAlerts').optional().isBoolean(),
  body('notifications.weeklyReports').optional().isBoolean(),
  body('account.loginNotifications').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { notifications, account } = req.body;

    // Update notification preferences
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }

    // Update account preferences
    if (account) {
      user.preferences.account = {
        ...user.preferences.account,
        ...account
      };
    }

    await user.save();

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: {
        notifications: user.preferences.notifications,
        account: user.preferences.account
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== NOTIFICATION HISTORY ====================

// Get notification history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Analytics.find({
      userId: req.user._id,
      action: { $in: ['test_reminder', 'achievement_earned', 'weekly_report', 'login_notification'] }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Analytics.countDocuments({
      userId: req.user._id,
      action: { $in: ['test_reminder', 'achievement_earned', 'weekly_report', 'login_notification'] }
    });

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/history/:id/read', auth, async (req, res) => {
  try {
    const notification = await Analytics.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user._id 
      },
      { 
        $set: { 'metadata.read': true, 'metadata.readAt': new Date() } 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/history/read-all', auth, async (req, res) => {
  try {
    await Analytics.updateMany(
      { 
        userId: req.user._id,
        action: { $in: ['test_reminder', 'achievement_earned', 'weekly_report', 'login_notification'] }
      },
      { 
        $set: { 'metadata.read': true, 'metadata.readAt': new Date() } 
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== MANUAL NOTIFICATION TRIGGERS ====================

// Send test reminder manually (for testing)
router.post('/test-reminder', auth, async (req, res) => {
  try {
    const { testId } = req.body;
    
    if (!testId) {
      return res.status(400).json({ message: 'Test ID is required' });
    }

    // This would typically be called by the system, but we allow manual triggering for testing
    await NotificationService.sendTestReminders();

    res.json({ message: 'Test reminders sent successfully' });
  } catch (error) {
    console.error('Error sending test reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send weekly report manually (for testing)
router.post('/weekly-report', auth, async (req, res) => {
  try {
    // This would typically be called by the system, but we allow manual triggering for testing
    await NotificationService.sendWeeklyReports();

    res.json({ message: 'Weekly reports sent successfully' });
  } catch (error) {
    console.error('Error sending weekly report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PUSH NOTIFICATIONS ====================

// Register device for push notifications
router.post('/push/register', [
  auth,
  body('deviceToken').notEmpty().withMessage('Device token is required'),
  body('deviceType').isIn(['web', 'android', 'ios']).withMessage('Invalid device type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceToken, deviceType } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add device token to user's push notification settings
    if (!user.preferences.pushDevices) {
      user.preferences.pushDevices = [];
    }

    // Remove existing token if it exists
    user.preferences.pushDevices = user.preferences.pushDevices.filter(
      device => device.token !== deviceToken
    );

    // Add new device
    user.preferences.pushDevices.push({
      token: deviceToken,
      type: deviceType,
      registeredAt: new Date()
    });

    await user.save();

    res.json({ message: 'Device registered for push notifications' });
  } catch (error) {
    console.error('Error registering device for push notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister device for push notifications
router.delete('/push/unregister', [
  auth,
  body('deviceToken').notEmpty().withMessage('Device token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceToken } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove device token
    if (user.preferences.pushDevices) {
      user.preferences.pushDevices = user.preferences.pushDevices.filter(
        device => device.token !== deviceToken
      );
    }

    await user.save();

    res.json({ message: 'Device unregistered from push notifications' });
  } catch (error) {
    console.error('Error unregistering device for push notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get registered devices
router.get('/push/devices', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences.pushDevices');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ devices: user.preferences.pushDevices || [] });
  } catch (error) {
    console.error('Error fetching registered devices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
