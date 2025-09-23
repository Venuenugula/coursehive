const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Content = require('../models/Content');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/content';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PPT, PPTX, and images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

// @route   GET /api/content
// @desc    Get all content with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      subject, 
      type, 
      status = 'approved', 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const content = await Content.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments(filter);

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
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content/my-submissions
// @desc    Get user's content submissions
// @access  Private
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { uploadedBy: req.user._id };
    if (status) filter.status = status;

    const content = await Content.find(filter)
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments(filter);

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
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content/pending
// @desc    Get pending content for admin review
// @access  Private (Admin only)
router.get('/pending', adminAuth, async (req, res) => {
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

// @route   GET /api/content/suggested
// @desc    Get suggested content for user
// @access  Private
router.get('/suggested', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's analytics to find weak topics
    const analytics = await Analytics.findOne({ user: req.user._id });
    
    let suggestedContent = [];
    
    if (analytics && analytics.aiInsights && analytics.aiInsights.suggestedContent) {
      const contentIds = analytics.aiInsights.suggestedContent.map(item => item.type);
      suggestedContent = await Content.find({ 
        _id: { $in: contentIds },
        status: 'approved' 
      })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    }

    const total = suggestedContent.length;

    res.json({
      content: suggestedContent,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + suggestedContent.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get suggested content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/content/:id
// @desc    Get content by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Increment view count
    content.stats.views += 1;
    await content.save();

    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private
router.post('/', [
  auth,
  upload.single('file'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('type').isIn(['notes', 'previous_paper', 'question_bank', 'video', 'article', 'book']).withMessage('Invalid content type'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Process tags if provided
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const contentData = {
      title: req.body.title,
      subject: req.body.subject,
      type: req.body.type,
      description: req.body.description,
      tags: tags,
      difficulty: req.body.difficulty || 'intermediate',
      url: `/uploads/content/${req.file.filename}`, // File path
      metadata: {
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      },
      uploadedBy: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    };

    const content = new Content(contentData);
    await content.save();

    res.status(201).json({
      message: 'Content uploaded successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user can edit this content
    if (content.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user can delete this content
    if (content.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Content.findByIdAndDelete(req.params.id);

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content/:id/like
// @desc    Like/unlike content
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const userId = req.user._id;
    const isLiked = content.stats.likes.includes(userId);

    if (isLiked) {
      content.stats.likes.pull(userId);
    } else {
      content.stats.likes.push(userId);
    }

    await content.save();

    res.json({
      message: isLiked ? 'Content unliked' : 'Content liked',
      likes: content.stats.likes.length
    });
  } catch (error) {
    console.error('Like content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content/:id/rate
// @desc    Rate content
// @access  Private
router.post('/:id/rate', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating } = req.body;
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Update rating (simplified - in production, you'd want to track individual user ratings)
    const newRatingCount = content.stats.ratingCount + 1;
    const newRating = ((content.stats.rating * content.stats.ratingCount) + rating) / newRatingCount;

    content.stats.rating = Math.round(newRating * 10) / 10;
    content.stats.ratingCount = newRatingCount;

    await content.save();

    res.json({
      message: 'Content rated successfully',
      rating: content.stats.rating,
      ratingCount: content.stats.ratingCount
    });
  } catch (error) {
    console.error('Rate content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/content/:id/approve
// @desc    Approve content
// @access  Private (Admin only)
router.post('/:id/approve', adminAuth, async (req, res) => {
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

// @route   POST /api/content/:id/reject
// @desc    Reject content
// @access  Private (Admin only)
router.post('/:id/reject', [
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

// @route   GET /api/content/suggested
// @desc    Get suggested content based on user performance
// @access  Private
router.get('/suggested', auth, async (req, res) => {
  try {
    const { attemptId, weakTopics } = req.query;
    
    // Get user's weak topics from AI feedback or use provided topics
    let topics = weakTopics ? weakTopics.split(',') : [];
    
    if (attemptId) {
      const AIFeedback = require('../models/AIFeedback');
      const feedback = await AIFeedback.findOne({ attemptId })
        .populate('recommendedContent.contentId');
      
      if (feedback && feedback.recommendedContent.length > 0) {
        const content = feedback.recommendedContent.map(rec => rec.contentId).filter(Boolean);
        return res.json({ content });
      }
      
      // Extract topics from feedback
      if (feedback && feedback.topicMistakes) {
        topics = [...topics, ...feedback.topicMistakes.map(mistake => mistake.topic)];
      }
    }
    
    // Find content related to weak topics
    const filter = {
      status: 'approved',
      $or: [
        { tags: { $in: topics } },
        { subject: { $in: topics } }
      ]
    };
    
    const content = await Content.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ 'stats.views': -1 })
      .limit(10);
    
    res.json({ content });
  } catch (error) {
    console.error('Get suggested content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
