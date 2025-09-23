const express = require('express');
const { body, validationResult } = require('express-validator');
const ForumThread = require('../models/ForumThread');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/forum/threads
// @desc    Get all forum threads with filters
// @access  Public
router.get('/threads', optionalAuth, async (req, res) => {
  try {
    const { 
      subject, 
      topic, 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active'
    } = req.query;

    // Build filter object
    const filter = { status };
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const threads = await ForumThread.find(filter)
      .populate('author', 'name email')
      .populate('posts.author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumThread.countDocuments(filter);

    res.json({
      threads,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + threads.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get forum threads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/forum/threads/:id
// @desc    Get forum thread by ID
// @access  Public
router.get('/threads/:id', optionalAuth, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id)
      .populate('author', 'name email')
      .populate('posts.author', 'name email')
      .populate('relatedContent', 'title url type');

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Increment view count
    thread.views += 1;
    await thread.save();

    res.json({ thread });
  } catch (error) {
    console.error('Get forum thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/threads
// @desc    Create new forum thread
// @access  Private
router.post('/threads', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const threadData = {
      ...req.body,
      author: req.user._id
    };

    const thread = new ForumThread(threadData);
    await thread.save();

    await thread.populate('author', 'name email');

    res.status(201).json({
      message: 'Thread created successfully',
      thread
    });
  } catch (error) {
    console.error('Create forum thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/threads/:id/posts
// @desc    Add post to thread
// @access  Private
router.post('/threads/:id/posts', [
  auth,
  body('content').trim().isLength({ min: 5, max: 2000 }).withMessage('Content must be 5-2000 characters'),
  body('parentPost').optional().isMongoId().withMessage('Valid parent post ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, parentPost } = req.body;

    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.isLocked) {
      return res.status(400).json({ message: 'Thread is locked' });
    }

    const post = {
      content,
      author: req.user._id,
      parentPost: parentPost || null
    };

    thread.posts.push(post);
    await thread.save();

    await thread.populate('posts.author', 'name email');

    const newPost = thread.posts[thread.posts.length - 1];

    res.status(201).json({
      message: 'Post added successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Add post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/threads/:id/like
// @desc    Like/unlike thread
// @access  Private
router.post('/threads/:id/like', auth, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const userId = req.user._id;
    const isLiked = thread.likes.includes(userId);

    if (isLiked) {
      thread.likes.pull(userId);
    } else {
      thread.likes.push(userId);
    }

    await thread.save();

    res.json({
      message: isLiked ? 'Thread unliked' : 'Thread liked',
      likes: thread.likes.length
    });
  } catch (error) {
    console.error('Like thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/posts/:postId/like
// @desc    Like/unlike post
// @access  Private
router.post('/posts/:postId/like', auth, async (req, res) => {
  try {
    const thread = await ForumThread.findOne({ 'posts._id': req.params.postId });
    if (!thread) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = thread.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await thread.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/posts/:postId/mark-answer
// @desc    Mark post as answer
// @access  Private
router.post('/posts/:postId/mark-answer', auth, async (req, res) => {
  try {
    const thread = await ForumThread.findOne({ 'posts._id': req.params.postId });
    if (!thread) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is thread author
    if (thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only thread author can mark answers' });
    }

    const post = thread.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Unmark all other answers
    thread.posts.forEach(p => {
      p.isAccepted = false;
    });

    // Mark this post as answer
    post.isAccepted = true;
    post.isAnswer = true;

    await thread.save();

    res.json({
      message: 'Post marked as answer',
      post
    });
  } catch (error) {
    console.error('Mark answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/posts/:postId/report
// @desc    Report post
// @access  Private
router.post('/posts/:postId/report', [
  auth,
  body('reason').isIn(['spam', 'inappropriate', 'off-topic', 'harassment']).withMessage('Valid reason required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;

    const thread = await ForumThread.findOne({ 'posts._id': req.params.postId });
    if (!thread) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = thread.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reported this post
    const existingReport = post.reports.find(report => 
      report.reportedBy.toString() === req.user._id.toString()
    );

    if (existingReport) {
      return res.status(400).json({ message: 'Post already reported by you' });
    }

    post.reports.push({
      reportedBy: req.user._id,
      reason
    });

    await thread.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/forum/subjects
// @desc    Get all subjects
// @access  Public
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await ForumThread.distinct('subject');
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/forum/topics/:subject
// @desc    Get topics for a subject
// @access  Public
router.get('/topics/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const topics = await ForumThread.distinct('topic', { subject });
    res.json({ topics });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
