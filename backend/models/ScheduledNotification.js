const mongoose = require('mongoose');

const scheduledNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'test_completed',
      'achievement',
      'recommendations',
      'streak',
      'link_update',
      'forum_reply',
      'bulk',
      'system',
      'reminder'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sent: {
    type: Boolean,
    default: false,
    index: true
  },
  sentAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  recurringEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
scheduledNotificationSchema.index({ scheduledTime: 1, sent: 1 });
scheduledNotificationSchema.index({ userId: 1, scheduledTime: 1 });

// Methods
scheduledNotificationSchema.methods.markAsSent = function() {
  this.sent = true;
  this.sentAt = new Date();
  return this.save();
};

// Static methods
scheduledNotificationSchema.statics.getPendingNotifications = function() {
  const now = new Date();
  return this.find({
    scheduledTime: { $lte: now },
    sent: false
  });
};

scheduledNotificationSchema.statics.createRecurringNotification = function(
  userId, 
  scheduledTime, 
  type, 
  title, 
  message, 
  data, 
  recurring, 
  recurringEndDate
) {
  const notifications = [];
  let currentTime = new Date(scheduledTime);
  const endDate = new Date(recurringEndDate);
  
  while (currentTime <= endDate) {
    notifications.push({
      userId,
      scheduledTime: new Date(currentTime),
      type,
      title,
      message,
      data,
      recurring,
      recurringEndDate
    });
    
    // Increment based on recurring type
    switch (recurring) {
      case 'daily':
        currentTime.setDate(currentTime.getDate() + 1);
        break;
      case 'weekly':
        currentTime.setDate(currentTime.getDate() + 7);
        break;
      case 'monthly':
        currentTime.setMonth(currentTime.getMonth() + 1);
        break;
      default:
        break;
    }
  }
  
  return this.insertMany(notifications);
};

module.exports = mongoose.model('ScheduledNotification', scheduledNotificationSchema);

