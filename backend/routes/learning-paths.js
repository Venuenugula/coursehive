const express = require('express');
const { body, validationResult } = require('express-validator');
const LearningPath = require('../models/LearningPath');
const Link = require('../models/Link');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const cacheService = require('../services/cacheService');

const router = express.Router();

// @route   GET /api/learning-paths
// @desc    Get all learning paths with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Create cache key
    const cacheKey = `learning-paths:${JSON.stringify({ subject, difficulty, search, sortBy, sortOrder, page, limit })}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Build filter object
    const filter = { isPublic: true };
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (difficulty) filter.difficulty = difficulty;
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

    const paths = await LearningPath.find(filter)
      .populate('author', 'name email')
      .populate('links', 'title url difficulty categories')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LearningPath.countDocuments(filter);

    const response = {
      paths,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + paths.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    };

    // Cache the response for 10 minutes
    await cacheService.set(cacheKey, response, 600);

    res.json(response);
  } catch (error) {
    console.error('Get learning paths error:', error);
    res.status(500).json({ error: 'Failed to get learning paths' });
  }
});

// @route   GET /api/learning-paths/:id
// @desc    Get learning path by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id)
      .populate('author', 'name email')
      .populate('links', 'title url description difficulty categories tags qualityScore')
      .populate('completed', 'title url');

    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check if user has access (public or owner)
    if (!path.isPublic && (!req.user || path.author._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ path });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({ error: 'Failed to get learning path' });
  }
});

// @route   POST /api/learning-paths
// @desc    Create new learning path
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pathData = {
      ...req.body,
      author: req.user._id
    };

    const path = new LearningPath(pathData);
    await path.save();

    await path.populate('author', 'name email');

    // Clear cache
    await cacheService.del('learning-paths:*');

    res.status(201).json({
      message: 'Learning path created successfully',
      path
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({ error: 'Failed to create learning path' });
  }
});

// @route   PUT /api/learning-paths/:id
// @desc    Update learning path
// @access  Private (Owner only)
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const path = await LearningPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check ownership
    if (path.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own learning paths.' });
    }

    // Update path
    Object.assign(path, req.body);
    await path.save();

    await path.populate('author', 'name email');
    await path.populate('links', 'title url difficulty categories');

    // Clear cache
    await cacheService.del('learning-paths:*');

    res.json({
      message: 'Learning path updated successfully',
      path
    });
  } catch (error) {
    console.error('Update learning path error:', error);
    res.status(500).json({ error: 'Failed to update learning path' });
  }
});

// @route   DELETE /api/learning-paths/:id
// @desc    Delete learning path
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check ownership
    if (path.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own learning paths.' });
    }

    await LearningPath.findByIdAndDelete(req.params.id);

    // Clear cache
    await cacheService.del('learning-paths:*');

    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Delete learning path error:', error);
    res.status(500).json({ error: 'Failed to delete learning path' });
  }
});

// @route   POST /api/learning-paths/:id/add-link
// @desc    Add link to learning path
// @access  Private (Owner only)
router.post('/:id/add-link', [
  auth,
  body('linkId').isMongoId().withMessage('Valid link ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { linkId } = req.body;

    const path = await LearningPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check ownership
    if (path.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own learning paths.' });
    }

    // Check if link exists
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Add link if not already present
    if (!path.links.includes(linkId)) {
      path.links.push(linkId);
      await path.save();
    }

    await path.populate('links', 'title url difficulty categories');

    // Clear cache
    await cacheService.del('learning-paths:*');

    res.json({
      message: 'Link added to learning path successfully',
      path
    });
  } catch (error) {
    console.error('Add link to path error:', error);
    res.status(500).json({ error: 'Failed to add link to learning path' });
  }
});

// @route   POST /api/learning-paths/:id/remove-link
// @desc    Remove link from learning path
// @access  Private (Owner only)
router.post('/:id/remove-link', [
  auth,
  body('linkId').isMongoId().withMessage('Valid link ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { linkId } = req.body;

    const path = await LearningPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check ownership
    if (path.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own learning paths.' });
    }

    // Remove link
    path.links = path.links.filter(id => id.toString() !== linkId);
    path.completed = path.completed.filter(id => id.toString() !== linkId);
    await path.save();

    await path.populate('links', 'title url difficulty categories');

    // Clear cache
    await cacheService.del('learning-paths:*');

    res.json({
      message: 'Link removed from learning path successfully',
      path
    });
  } catch (error) {
    console.error('Remove link from path error:', error);
    res.status(500).json({ error: 'Failed to remove link from learning path' });
  }
});

// @route   POST /api/learning-paths/:id/complete-link
// @desc    Mark link as completed in learning path
// @access  Private
router.post('/:id/complete-link', [
  auth,
  body('linkId').isMongoId().withMessage('Valid link ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { linkId } = req.body;

    const path = await LearningPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check if user has access
    if (!path.isPublic && path.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if link is in the path
    if (!path.links.includes(linkId)) {
      return res.status(400).json({ error: 'Link is not part of this learning path' });
    }

    // Add to completed if not already there
    if (!path.completed.includes(linkId)) {
      path.completed.push(linkId);
      await path.save();
    }

    // Update progress
    const progress = Math.round((path.completed.length / path.links.length) * 100);
    path.progress = progress;
    await path.save();

    await path.populate('links', 'title url difficulty categories');
    await path.populate('completed', 'title url');

    res.json({
      message: 'Link marked as completed successfully',
      path,
      progress
    });
  } catch (error) {
    console.error('Complete link in path error:', error);
    res.status(500).json({ error: 'Failed to mark link as completed' });
  }
});

// @route   GET /api/learning-paths/:id/progress
// @desc    Get learning path progress for user
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id)
      .populate('links', 'title url difficulty categories')
      .populate('completed', 'title url');

    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Check if user has access
    if (!path.isPublic && path.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = {
      totalLinks: path.links.length,
      completedLinks: path.completed.length,
      progress: path.progress,
      remainingLinks: path.links.filter(link => !path.completed.includes(link._id)),
      completedLinksList: path.completed
    };

    res.json(progress);
  } catch (error) {
    console.error('Get path progress error:', error);
    res.status(500).json({ error: 'Failed to get learning path progress' });
  }
});

module.exports = router;
