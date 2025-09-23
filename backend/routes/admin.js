const express = require('express');
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const Test = require('../models/Test');
const User = require('../models/User');
const ForumThread = require('../models/ForumThread');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalContent = await Content.countDocuments();
    const pendingContent = await Content.countDocuments({ status: 'pending' });
    const totalTests = await Test.countDocuments();
    const pendingTests = await Test.countDocuments({ status: 'pending' });
    const totalThreads = await ForumThread.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });

    // Get recent activity
    const recentContent = await Content.find({ status: 'pending' })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentTests = await Test.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt role');

    res.json({
      stats: {
        totalUsers,
        totalContent,
        pendingContent,
        totalTests,
        pendingTests,
        totalThreads,
        activeUsers
      },
      recentContent,
      recentTests,
      recentUsers
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/content/pending
// @desc    Get pending content for review
// @access  Private (Admin only)
router.get('/content/pending', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const content = await Content.find({ status: 'pending' })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments({ status: 'pending' });

    res.json({
      content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + content.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/content/:id/approve
// @desc    Approve content
// @access  Private (Admin only)
router.post('/content/:id/approve', adminAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.status !== 'pending') {
      return res.status(400).json({ message: 'Content is not pending approval' });
    }

    content.status = 'approved';
    content.approvedBy = req.user._id;
    content.approvedAt = new Date();

    await content.save();

    res.json({ message: 'Content approved successfully', content });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/content/:id/reject
// @desc    Reject content
// @access  Private (Admin only)
router.post('/content/:id/reject', [
  adminAuth,
  body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Rejection reason must be 5-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.status !== 'pending') {
      return res.status(400).json({ message: 'Content is not pending approval' });
    }

    content.status = 'rejected';
    content.rejectionReason = reason;
    content.approvedBy = req.user._id;
    content.approvedAt = new Date();

    await content.save();

    res.json({ message: 'Content rejected successfully', content });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  adminAuth,
  body('role').isIn(['student', 'admin', 'moderator']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.put('/users/:id/status', [
  adminAuth,
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, 
      user 
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/forum/reports
// @desc    Get reported posts
// @access  Private (Admin only)
router.get('/forum/reports', adminAuth, async (req, res) => {
  try {
    const threads = await ForumThread.find({
      'posts.reports': { $exists: true, $not: { $size: 0 } }
    })
      .populate('author', 'name email')
      .populate('posts.author', 'name email')
      .populate('posts.reports.reportedBy', 'name email');

    // Filter threads with reported posts
    const reportedPosts = [];
    threads.forEach(thread => {
      thread.posts.forEach(post => {
        if (post.reports && post.reports.length > 0) {
          reportedPosts.push({
            threadId: thread._id,
            threadTitle: thread.title,
            postId: post._id,
            postContent: post.content,
            author: post.author,
            reports: post.reports
          });
        }
      });
    });

    res.json({ reportedPosts });
  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/forum/posts/:postId
// @desc    Delete reported post
// @access  Private (Admin only)
router.delete('/forum/posts/:postId', adminAuth, async (req, res) => {
  try {
    const thread = await ForumThread.findOne({ 'posts._id': req.params.postId });
    if (!thread) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = thread.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove the post
    thread.posts.pull(req.params.postId);
    await thread.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/forum/threads/:id/lock
// @desc    Lock/unlock thread
// @access  Private (Admin only)
router.post('/forum/threads/:id/lock', [
  adminAuth,
  body('isLocked').isBoolean().withMessage('isLocked must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isLocked } = req.body;

    const thread = await ForumThread.findByIdAndUpdate(
      req.params.id,
      { isLocked },
      { new: true }
    );

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    res.json({ 
      message: `Thread ${isLocked ? 'locked' : 'unlocked'} successfully`, 
      thread 
    });
  } catch (error) {
    console.error('Lock thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/tests/pending
// @desc    Get pending tests for review
// @access  Private (Admin only)
router.get('/tests/pending', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tests = await Test.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Test.countDocuments({ status: 'pending' });

    res.json({
      tests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + tests.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get pending tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/tests/:id/approve
// @desc    Approve test
// @access  Private (Admin only)
router.post('/tests/:id/approve', adminAuth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.status !== 'pending') {
      return res.status(400).json({ message: 'Test is not pending approval' });
    }

    test.status = 'approved';
    test.approvedBy = req.user._id;
    test.approvedAt = new Date();

    await test.save();

    res.json({ message: 'Test approved successfully', test });
  } catch (error) {
    console.error('Approve test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/tests/:id/reject
// @desc    Reject test
// @access  Private (Admin only)
router.post('/tests/:id/reject', [
  adminAuth,
  body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Rejection reason must be 5-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.status !== 'pending') {
      return res.status(400).json({ message: 'Test is not pending approval' });
    }

    test.status = 'rejected';
    test.rejectionReason = reason;
    test.approvedBy = req.user._id;
    test.approvedAt = new Date();

    await test.save();

    res.json({ message: 'Test rejected successfully', test });
  } catch (error) {
    console.error('Reject test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
