const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed'));
    }
  }
});

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

// ==================== SETTINGS ROUTES ====================

// @route   GET /api/users/settings
// @desc    Get user settings
// @access  Private
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('profile preferences');
    res.json({ 
      profile: user.profile,
      notifications: user.preferences.notifications,
      privacy: user.preferences.privacy,
      appearance: user.preferences.appearance,
      account: user.preferences.account
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/profile
// @desc    Update profile settings
// @access  Private
router.put('/settings/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, bio, location, website } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (bio !== undefined) updates['profile.bio'] = bio;
    if (location !== undefined) updates['profile.location'] = location;
    if (website !== undefined) updates['profile.website'] = website;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ message: 'Profile settings updated successfully', user });
  } catch (error) {
    console.error('Update profile settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/notifications
// @desc    Update notification settings
// @access  Private
router.put('/settings/notifications', [
  auth,
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('testReminders').optional().isBoolean(),
  body('achievementAlerts').optional().isBoolean(),
  body('weeklyReports').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`preferences.notifications.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Notification settings updated successfully', user });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/privacy
// @desc    Update privacy settings
// @access  Private
router.put('/settings/privacy', [
  auth,
  body('profileVisibility').optional().isIn(['public', 'friends', 'private']),
  body('showEmail').optional().isBoolean(),
  body('showLocation').optional().isBoolean(),
  body('allowMessages').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`preferences.privacy.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Privacy settings updated successfully', user });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/appearance
// @desc    Update appearance settings
// @access  Private
router.put('/settings/appearance', [
  auth,
  body('theme').optional().isIn(['light', 'dark']),
  body('fontSize').optional().isIn(['small', 'medium', 'large']),
  body('language').optional().isIn(['en', 'es', 'fr', 'de']),
  body('sidebarCollapsed').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`preferences.appearance.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Appearance settings updated successfully', user });
  } catch (error) {
    console.error('Update appearance settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/account
// @desc    Update account settings
// @access  Private
router.put('/settings/account', [
  auth,
  body('twoFactorAuth').optional().isBoolean(),
  body('loginNotifications').optional().isBoolean(),
  body('sessionTimeout').optional().isInt({ min: 15, max: 480 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`preferences.account.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Account settings updated successfully', user });
  } catch (error) {
    console.error('Update account settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/settings/avatar
// @desc    Upload avatar
// @access  Private
router.post('/settings/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old avatar if exists
    const user = await User.findById(req.user._id);
    if (user.profile.avatar) {
      try {
        await fs.unlink(path.join(__dirname, '../uploads/avatars', path.basename(user.profile.avatar)));
      } catch (error) {
        console.log('Old avatar file not found, continuing...');
      }
    }

    // Update user with new avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': avatarPath },
      { new: true }
    );

    res.json({ message: 'Avatar uploaded successfully', avatarPath });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/password
// @desc    Change password
// @access  Private
router.put('/settings/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    // Send email notification
    try {
      await sendEmail(user.email, 'passwordChanged', user.name);
    } catch (emailError) {
      console.error('Failed to send password change email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/settings/account
// @desc    Delete account
// @access  Private
router.delete('/settings/account', [
  auth,
  body('password').notEmpty().withMessage('Password is required for account deletion'),
  body('confirmDeletion').equals('DELETE').withMessage('Please type DELETE to confirm account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Delete avatar file if exists
    if (user.profile.avatar) {
      try {
        await fs.unlink(path.join(__dirname, '../uploads/avatars', path.basename(user.profile.avatar)));
      } catch (error) {
        console.log('Avatar file not found, continuing...');
      }
    }

    // Send email notification before deletion
    try {
      await sendEmail(user.email, 'accountDeleted', user.name);
    } catch (emailError) {
      console.error('Failed to send account deletion email:', emailError);
      // Continue with deletion even if email fails
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== TWO-FACTOR AUTHENTICATION ROUTES ====================

// @route   POST /api/users/settings/two-factor/setup
// @desc    Setup two-factor authentication
// @access  Private
router.post('/settings/two-factor/setup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `CourseHive (${user.email})`,
      issuer: 'CourseHive'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store temporary secret (in production, you might want to store this temporarily)
    user.tempTwoFactorSecret = secret.base32;
    await user.save();

    res.json({
      message: 'Two-factor authentication setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/settings/two-factor/verify
// @desc    Verify two-factor authentication setup
// @access  Private
router.post('/settings/two-factor/verify', [
  auth,
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.tempTwoFactorSecret) {
      return res.status(400).json({ message: 'No pending 2FA setup found' });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.tempTwoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Enable 2FA
    user.preferences.account.twoFactorAuth = true;
    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.tempTwoFactorSecret = undefined;
    await user.save();

    // Send email notification
    try {
      await sendEmail(user.email, 'twoFactorEnabled', user.name);
    } catch (emailError) {
      console.error('Failed to send 2FA enabled email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/settings/two-factor/disable
// @desc    Disable two-factor authentication
// @access  Private
router.post('/settings/two-factor/disable', [
  auth,
  body('password').notEmpty().withMessage('Password is required to disable 2FA')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Disable 2FA
    user.preferences.account.twoFactorAuth = false;
    user.twoFactorSecret = undefined;
    await user.save();

    // Send email notification
    try {
      await sendEmail(user.email, 'twoFactorDisabled', user.name);
    } catch (emailError) {
      console.error('Failed to send 2FA disabled email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Two-factor authentication disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/settings/avatar
// @desc    Remove avatar
// @access  Private
router.delete('/settings/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar file if exists
    if (user.profile.avatar) {
      try {
        await fs.unlink(path.join(__dirname, '../uploads/avatars', path.basename(user.profile.avatar)));
      } catch (error) {
        console.log('Avatar file not found, continuing...');
      }
    }

    // Remove avatar path from user
    await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': '' },
      { new: true }
    );

    res.json({ message: 'Avatar removed successfully' });
  } catch (error) {
    console.error('Avatar removal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PASSWORD RESET ROUTES ====================

// Request password reset
router.post('/password-reset/request', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      await sendEmail(user.email, 'passwordReset', user.name, resetLink);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with token
router.post('/password-reset/reset', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset token (for frontend to check if token is valid)
router.get('/password-reset/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        valid: false,
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({ 
      valid: true,
      message: 'Reset token is valid' 
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
