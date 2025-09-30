const nodemailer = require('nodemailer');
const webpush = require('web-push');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Configure web push (only if VAPID keys are provided)
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && 
        process.env.VAPID_PUBLIC_KEY !== 'your_vapid_public_key_here' &&
        process.env.VAPID_PRIVATE_KEY !== 'your_vapid_private_key_here') {
      webpush.setVapidDetails(
        'mailto:admin@coursehive.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      console.warn('VAPID keys not configured. Push notifications will be disabled.');
    }
  }

  // Email Notifications
  async sendEmail(to, template, data = {}) {
    try {
      const emailContent = this.getEmailTemplate(template, data);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@coursehive.com',
        to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${template}`);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  // Push Notifications
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Check if VAPID is configured
      if (!process.env.VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY === 'your_vapid_public_key_here') {
        console.warn('Push notifications disabled: VAPID keys not configured');
        return;
      }

      const User = require('../models/User');
      const user = await User.findById(userId).select('pushDevices');
      
      if (!user || !user.pushDevices.length) return;

      const payload = JSON.stringify({
        title,
        body,
        data,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        actions: [
          {
            action: 'view',
            title: 'View'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      const promises = user.pushDevices.map(device => {
        return webpush.sendNotification(device.token, payload)
          .catch(error => {
            console.error(`Push notification failed for device ${device.token}:`, error);
            // Remove invalid device tokens
            if (error.statusCode === 410) {
              user.pushDevices.pull(device._id);
              user.save();
            }
          });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  // In-app Notifications
  async createInAppNotification(userId, type, title, message, data = {}) {
    try {
      const Notification = require('../models/Notification');
      
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data,
        read: false
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('In-app notification error:', error);
    }
  }

  // Notification Templates
  getEmailTemplate(template, data) {
    const templates = {
      welcome: {
        subject: 'Welcome to CourseHive! 🐝',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3B82F6;">Welcome to CourseHive!</h1>
            <p>Hi ${data.name},</p>
            <p>Welcome to CourseHive, your AI-powered learning companion! We're excited to help you discover and learn from the best educational resources.</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Get Started:</h3>
              <ul>
                <li>Explore our curated learning resources</li>
                <li>Take personalized tests and quizzes</li>
                <li>Join our community forum</li>
                <li>Track your learning progress</li>
              </ul>
            </div>
            <p>Happy learning!</p>
            <p>The CourseHive Team</p>
          </div>
        `,
        text: `Welcome to CourseHive! Hi ${data.name}, welcome to CourseHive, your AI-powered learning companion!`
      },
      testCompleted: {
        subject: 'Test Completed - Check Your Results!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3B82F6;">Test Completed!</h1>
            <p>Hi ${data.name},</p>
            <p>You've completed the test: <strong>${data.testName}</strong></p>
            <div style="background: ${data.passed ? '#D1FAE5' : '#FEE2E2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Your Results:</h3>
              <p><strong>Score:</strong> ${data.score}/${data.totalMarks}</p>
              <p><strong>Percentage:</strong> ${data.percentage}%</p>
              <p><strong>Status:</strong> ${data.passed ? '✅ Passed' : '❌ Failed'}</p>
            </div>
            <p>Check your detailed results and AI feedback in the app!</p>
          </div>
        `,
        text: `Test Completed! You scored ${data.score}/${data.totalMarks} (${data.percentage}%) on ${data.testName}.`
      },
      achievementUnlocked: {
        subject: '🎉 Achievement Unlocked!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #F59E0B;">🎉 Achievement Unlocked!</h1>
            <p>Hi ${data.name},</p>
            <p>Congratulations! You've earned a new achievement:</p>
            <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="color: #D97706;">${data.achievementName}</h2>
              <p>${data.achievementDescription}</p>
            </div>
            <p>Keep up the great work!</p>
          </div>
        `,
        text: `Achievement Unlocked! You earned: ${data.achievementName} - ${data.achievementDescription}`
      },
      newRecommendations: {
        subject: 'New Personalized Recommendations Available!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3B82F6;">New Recommendations for You!</h1>
            <p>Hi ${data.name},</p>
            <p>We've found some new learning resources that match your interests and skill level:</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Recommended Resources:</h3>
              <ul>
                ${data.recommendations.map(rec => `<li>${rec.title}</li>`).join('')}
              </ul>
            </div>
            <p>Check them out in the app!</p>
          </div>
        `,
        text: `New Recommendations! We found ${data.recommendations.length} new resources for you.`
      },
      weeklyReport: {
        subject: 'Your Weekly Learning Report',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3B82F6;">Weekly Learning Report</h1>
            <p>Hi ${data.name},</p>
            <p>Here's your learning progress for this week:</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>This Week's Stats:</h3>
              <ul>
                <li><strong>Resources Viewed:</strong> ${data.resourcesViewed}</li>
                <li><strong>Tests Completed:</strong> ${data.testsCompleted}</li>
                <li><strong>Time Spent:</strong> ${data.timeSpent} minutes</li>
                <li><strong>Current Streak:</strong> ${data.streakDays} days</li>
              </ul>
            </div>
            <p>Keep up the great work!</p>
          </div>
        `,
        text: `Weekly Report: ${data.resourcesViewed} resources viewed, ${data.testsCompleted} tests completed, ${data.timeSpent} minutes spent.`
      },
      passwordReset: {
        subject: 'Reset Your CourseHive Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3B82F6;">Password Reset Request</h1>
            <p>Hi ${data.name},</p>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
        text: `Password Reset: Click this link to reset your password: ${data.resetLink}`
      }
    };

    return templates[template] || templates.welcome;
  }

  // Check and send notifications based on user activity
  async checkAndSendNotifications(userId, eventType, data) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId).select('preferences email name');
      
      if (!user) return;

      switch (eventType) {
        case 'test_completed':
          if (user.preferences.notifications.testReminders) {
            await this.sendEmail(user.email, 'testCompleted', {
              name: user.name,
              ...data
            });
            await this.createInAppNotification(userId, 'test_completed', 
              'Test Completed!', 
              `You scored ${data.score}/${data.totalMarks} on ${data.testName}`);
          }
          break;

        case 'achievement_unlocked':
          if (user.preferences.notifications.achievementAlerts) {
            await this.sendEmail(user.email, 'achievementUnlocked', {
              name: user.name,
              ...data
            });
            await this.createInAppNotification(userId, 'achievement', 
              'Achievement Unlocked!', 
              `You earned: ${data.achievementName}`);
          }
          break;

        case 'new_recommendations':
          if (user.preferences.notifications.recommendations) {
            await this.sendEmail(user.email, 'newRecommendations', {
              name: user.name,
              ...data
            });
            await this.createInAppNotification(userId, 'recommendations', 
              'New Recommendations!', 
              `We found ${data.recommendations.length} new resources for you`);
          }
          break;

        case 'weekly_report':
          if (user.preferences.notifications.weeklyReports) {
            await this.sendEmail(user.email, 'weeklyReport', {
              name: user.name,
              ...data
            });
          }
          break;

        case 'streak_milestone':
          await this.createInAppNotification(userId, 'streak', 
            'Streak Milestone!', 
            `You've maintained a ${data.streakDays}-day learning streak!`);
          break;

        case 'broken_link_replaced':
          await this.createInAppNotification(userId, 'link_update', 
            'Link Updated', 
            `A broken link in your bookmarks has been replaced with a working alternative`);
          break;
      }
    } catch (error) {
      console.error('Notification check error:', error);
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(userIds, title, message, data = {}) {
    try {
      const promises = userIds.map(userId => 
        this.createInAppNotification(userId, 'bulk', title, message, data)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Bulk notification error:', error);
    }
  }

  // Send login notification
  async sendLoginNotification(userId, loginTime, location) {
    try {
      await this.createInAppNotification(
        userId, 
        'login', 
        'New Login Detected', 
        `You logged in at ${loginTime} from ${location}`
      );
    } catch (error) {
      console.error('Login notification error:', error);
    }
  }

  // Schedule notifications
  async scheduleNotification(userId, scheduledTime, type, title, message, data = {}) {
    try {
      const ScheduledNotification = require('../models/ScheduledNotification');
      
      const scheduledNotification = new ScheduledNotification({
        userId,
        scheduledTime,
        type,
        title,
        message,
        data,
        sent: false
      });

      await scheduledNotification.save();
      return scheduledNotification;
    } catch (error) {
      console.error('Schedule notification error:', error);
    }
  }

  // Process scheduled notifications
  async processScheduledNotifications() {
    try {
      const ScheduledNotification = require('../models/ScheduledNotification');
      const now = new Date();
      
      const scheduledNotifications = await ScheduledNotification.find({
        scheduledTime: { $lte: now },
        sent: false
      });

      for (const notification of scheduledNotifications) {
        await this.createInAppNotification(
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          notification.data
        );
        
        notification.sent = true;
        await notification.save();
      }
    } catch (error) {
      console.error('Process scheduled notifications error:', error);
    }
  }

  // Schedule recurring notifications
  static scheduleRecurringNotifications() {
    console.log('Setting up recurring notification schedules...');
    
    // Process scheduled notifications every minute
    setInterval(async () => {
      try {
        const notificationService = new NotificationService();
        await notificationService.processScheduledNotifications();
      } catch (error) {
        console.error('Error processing scheduled notifications:', error);
      }
    }, 60000); // Every minute

    // Send weekly reports every Monday at 9 AM
    const scheduleWeeklyReports = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      nextMonday.setHours(9, 0, 0, 0);
      
      const timeUntilNextMonday = nextMonday.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          const User = require('../models/User');
          const users = await User.find({ 'preferences.notifications.weeklyReports': true });
          
          for (const user of users) {
            // Get user's weekly stats (this would need to be implemented)
            const weeklyStats = {
              resourcesViewed: 0, // Placeholder
              testsCompleted: 0, // Placeholder
              timeSpent: 0, // Placeholder
              streakDays: 0 // Placeholder
            };
            
            const notificationService = new NotificationService();
            await notificationService.checkAndSendNotifications(user._id, 'weekly_report', {
              name: user.name,
              ...weeklyStats
            });
          }
          
          // Schedule next week
          scheduleWeeklyReports();
        } catch (error) {
          console.error('Error sending weekly reports:', error);
        }
      }, timeUntilNextMonday);
    };

    scheduleWeeklyReports();
    console.log('Recurring notification schedules set up successfully');
  }
}

const notificationServiceInstance = new NotificationService();

// Export both the instance and the class for static methods
module.exports = notificationServiceInstance;
module.exports.NotificationService = NotificationService;