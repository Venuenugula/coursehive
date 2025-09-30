import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Mail, Calendar, Trophy, BarChart3, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadPreferences();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/history?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/history/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, metadata: { ...notif.metadata, read: true } }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/history/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            metadata: { ...notif.metadata, read: true } 
          }))
        );
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const updatePreference = async (category, key, value) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          [category]: {
            [key]: value
          }
        })
      });

      if (response.ok) {
        setPreferences(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value
          }
        }));
        toast.success('Notification preference updated');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    }
  };

  const getNotificationIcon = (action) => {
    switch (action) {
      case 'test_reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'achievement_earned':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'weekly_report':
        return <BarChart3 className="h-5 w-5 text-green-500" />;
      case 'login_notification':
        return <Mail className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTitle = (action) => {
    switch (action) {
      case 'test_reminder':
        return 'Test Reminder';
      case 'achievement_earned':
        return 'Achievement Unlocked';
      case 'weekly_report':
        return 'Weekly Report';
      case 'login_notification':
        return 'Login Alert';
      default:
        return 'Notification';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.metadata?.read;
    return notif.action === activeTab;
  });

  const unreadCount = notifications.filter(notif => !notif.metadata?.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-coursehive-primary" />
            <h2 className="text-xl font-semibold text-charcoal">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-coursehive-primary hover:text-coursehive-secondary"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-coursehive-primary border-b-2 border-coursehive-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'unread'
                ? 'text-coursehive-primary border-b-2 border-coursehive-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('test_reminder')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'test_reminder'
                ? 'text-coursehive-primary border-b-2 border-coursehive-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Test Reminders
          </button>
          <button
            onClick={() => setActiveTab('achievement_earned')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'achievement_earned'
                ? 'text-coursehive-primary border-b-2 border-coursehive-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications found</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 ${
                      !notification.metadata?.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-charcoal">
                            {getNotificationTitle(notification.action)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                            {!notification.metadata?.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-xs text-coursehive-primary hover:text-coursehive-secondary"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.metadata?.message || 'You have a new notification'}
                        </p>
                        {notification.metadata?.details && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(notification.metadata.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium text-charcoal">Notification Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  {Object.entries(preferences.notifications || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <button
                        onClick={() => updatePreference('notifications', key, !value)}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          value ? 'bg-coursehive-primary' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-charcoal mb-3">Account Notifications</h4>
                <div className="space-y-2">
                  {Object.entries(preferences.account || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <button
                        onClick={() => updatePreference('account', key, !value)}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          value ? 'bg-coursehive-primary' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
