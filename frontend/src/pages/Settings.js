import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Upload,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, fontSize, sidebarCollapsed, updateTheme, updateFontSize, updateSidebarCollapsed } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmDeletion: ''
  });
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      location: '',
      website: '',
      avatar: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      testReminders: true,
      achievementAlerts: true,
      weeklyReports: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessages: true
    },
    appearance: {
      theme: theme,
      fontSize: fontSize,
      language: 'en',
      sidebarCollapsed: sidebarCollapsed
    },
    account: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30
    }
  });

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, ...data.profile },
          notifications: { ...prev.notifications, ...data.notifications },
          privacy: { ...prev.privacy, ...data.privacy },
          appearance: { ...prev.appearance, ...data.appearance },
          account: { ...prev.account, ...data.account }
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/users/settings/${section}`;
      const dataToSend = settings[section];

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          updateUser(result.user);
        }
        toast.success(`${section} settings saved successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/settings/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, avatar: result.avatarPath }
        }));
        toast.success('Avatar uploaded successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const removeAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/settings/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, avatar: '' }
        }));
        toast.success('Avatar removed successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove avatar');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    }
  };

  const requestPasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email address found for your account');
      return;
    }

    try {
      const response = await fetch('/api/users/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link sent to your email! Check your inbox and spam folder.');
        setShowPasswordModal(false);
      } else {
        toast.error(data.message || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const setupTwoFactor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/settings/two-factor/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Two-factor authentication setup initiated. Please check your authenticator app.');
        setShowTwoFactorModal(true);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to setup two-factor authentication');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to setup two-factor authentication');
    }
  };

  const verifyTwoFactor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/settings/two-factor/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: twoFactorCode })
      });

      if (response.ok) {
        toast.success('Two-factor authentication enabled successfully! You will receive an email confirmation.');
        setShowTwoFactorModal(false);
        setTwoFactorCode('');
        // Update settings
        setSettings(prev => ({
          ...prev,
          account: { ...prev.account, twoFactorAuth: true }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Failed to verify two-factor authentication');
    }
  };

  const disableTwoFactor = async () => {
    const password = prompt('Enter your password to disable two-factor authentication:');
    if (!password) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/settings/two-factor/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        toast.success('Two-factor authentication disabled successfully! You will receive an email notification.');
        setSettings(prev => ({
          ...prev,
          account: { ...prev.account, twoFactorAuth: false }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to disable two-factor authentication');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable two-factor authentication');
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/settings/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deleteData)
      });

      if (response.ok) {
        toast.success('Account deleted successfully. You will receive an email confirmation.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleSave = (section) => {
    saveSettings(section);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'account', name: 'Account', icon: Lock }
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-coursehive-primary rounded-full flex items-center justify-center overflow-hidden shadow-lg">
          {settings.profile.avatar ? (
            <img 
              src={settings.profile.avatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-white" />
          )}
        </div>
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <label className="coursehive-button-secondary px-4 py-2 text-sm cursor-pointer hover:bg-coursehive-secondary hover:bg-opacity-90 transition-colors">
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('File size must be less than 2MB');
                      return;
                    }
                    uploadAvatar(file);
                  }
                }}
                className="hidden"
              />
            </label>
            {settings.profile.avatar && (
              <button
                onClick={removeAvatar}
                className="coursehive-button px-4 py-2 text-sm bg-coursehive-warm hover:bg-coursehive-warm hover:bg-opacity-90 transition-colors"
              >
                <Trash2 className="h-4 w-4 inline mr-2" />
                Remove Avatar
              </button>
            )}
          </div>
          <p className="text-xs text-dark-gray">JPG, PNG, GIF up to 2MB</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, name: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, email: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Location</label>
          <input
            type="text"
            value={settings.profile.location}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, location: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Website</label>
          <input
            type="url"
            value={settings.profile.website}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, website: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">Bio</label>
        <textarea
          value={settings.profile.bio}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, bio: e.target.value }
          }))}
          rows={4}
          className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-coursehive-light-blue rounded-lg">
            <div>
              <h4 className="font-medium text-charcoal capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm text-dark-gray">
                {key === 'emailNotifications' && 'Receive notifications via email'}
                {key === 'pushNotifications' && 'Get push notifications on your device'}
                {key === 'testReminders' && 'Reminders for upcoming tests'}
                {key === 'achievementAlerts' && 'Alerts when you earn achievements'}
                {key === 'weeklyReports' && 'Weekly learning progress reports'}
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, [key]: !value }
              }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                value ? 'bg-coursehive-primary' : 'bg-medium-gray'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Profile Visibility</label>
          <select
            value={settings.privacy.profileVisibility}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              privacy: { ...prev.privacy, profileVisibility: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {Object.entries(settings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-coursehive-light-blue rounded-lg">
            <div>
              <h4 className="font-medium text-charcoal capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm text-dark-gray">
                {key === 'showEmail' && 'Display email address on profile'}
                {key === 'showLocation' && 'Show location on profile'}
                {key === 'allowMessages' && 'Allow other users to message you'}
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                privacy: { ...prev.privacy, [key]: !value }
              }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                value ? 'bg-coursehive-primary' : 'bg-medium-gray'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Theme</label>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                updateTheme('light');
                setSettings(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, theme: 'light' }
                }));
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                theme === 'light' 
                  ? 'border-coursehive-primary bg-coursehive-light-blue' 
                  : 'border-medium-gray hover:border-coursehive-primary'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                updateTheme('dark');
                setSettings(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, theme: 'dark' }
                }));
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                theme === 'dark' 
                  ? 'border-coursehive-primary bg-coursehive-light-blue' 
                  : 'border-medium-gray hover:border-coursehive-primary'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => {
              updateFontSize(e.target.value);
              setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, fontSize: e.target.value }
              }));
            }}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Language</label>
          <select
            value={settings.appearance.language}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              appearance: { ...prev.appearance, language: e.target.value }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Sidebar</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                updateSidebarCollapsed(!sidebarCollapsed);
                setSettings(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, sidebarCollapsed: !sidebarCollapsed }
                }));
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                sidebarCollapsed ? 'bg-medium-gray' : 'bg-coursehive-primary'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                sidebarCollapsed ? 'translate-x-1' : 'translate-x-6'
              }`} />
            </button>
            <span className="text-sm text-dark-gray">Auto-collapse</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-coursehive-light-blue rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-charcoal">Two-Factor Authentication</h4>
              <p className="text-sm text-dark-gray">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => {
                if (!settings.account.twoFactorAuth) {
                  setupTwoFactor();
                } else {
                  disableTwoFactor();
                }
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.account.twoFactorAuth ? 'bg-coursehive-primary' : 'bg-medium-gray'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.account.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-coursehive-light-blue rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-charcoal">Login Notifications</h4>
              <p className="text-sm text-dark-gray">Get notified when someone logs into your account</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                account: { ...prev.account, loginNotifications: !prev.account.loginNotifications }
              }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.account.loginNotifications ? 'bg-coursehive-primary' : 'bg-medium-gray'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.account.loginNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Session Timeout (minutes)</label>
          <select
            value={settings.account.sessionTimeout}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              account: { ...prev.account, sessionTimeout: parseInt(e.target.value) }
            }))}
            className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
      </div>

      <div className="border-t border-medium-gray pt-6">
        <h4 className="font-medium text-charcoal mb-4">Danger Zone</h4>
        <div className="space-y-2">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-left p-4 bg-coursehive-light-red text-coursehive-warm rounded-lg hover:bg-coursehive-light-red hover:bg-opacity-80 transition-colors"
          >
            Reset Password
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-left p-4 bg-coursehive-light-red text-coursehive-warm rounded-lg hover:bg-coursehive-light-red hover:bg-opacity-80 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'appearance': return renderAppearanceSettings();
      case 'account': return renderAccountSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Settings
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your account settings and preferences
                </p>
              </div>
              <button
                onClick={() => handleSave(activeTab)}
                disabled={saving}
                className="coursehive-button px-6 py-3 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="coursehive-card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-coursehive-primary text-white'
                          : 'text-dark-gray hover:bg-coursehive-light-blue hover:text-coursehive-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="coursehive-card p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <div className="space-y-4">
              <div className="bg-coursehive-light-blue p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-5 w-5 text-coursehive-primary" />
                  <span className="font-medium text-charcoal">Email Reset</span>
                </div>
                <p className="text-sm text-dark-gray">
                  We'll send a secure password reset link to your email address: <strong>{user?.email}</strong>
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Security Notice</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• The reset link will expire in 1 hour</li>
                  <li>• You can only use the link once</li>
                  <li>• Check your spam folder if you don't see the email</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-dark-gray hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={requestPasswordReset}
                className="coursehive-button px-4 py-2"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-500">Delete Account</h3>
            </div>
            <p className="text-sm text-dark-gray mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Password</label>
                <input
                  type="password"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Type DELETE to confirm</label>
                <input
                  type="text"
                  value={deleteData.confirmDeletion}
                  onChange={(e) => setDeleteData(prev => ({ ...prev, confirmDeletion: e.target.value }))}
                  className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary"
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-dark-gray hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteData.confirmDeletion !== 'DELETE'}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Setup Two-Factor Authentication</h3>
            <p className="text-sm text-dark-gray mb-4">
              Scan the QR code with your authenticator app and enter the verification code below.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Verification Code</label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowTwoFactorModal(false);
                  setTwoFactorCode('');
                }}
                className="px-4 py-2 text-dark-gray hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={verifyTwoFactor}
                disabled={twoFactorCode.length !== 6}
                className="coursehive-button px-4 py-2 disabled:opacity-50"
              >
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
