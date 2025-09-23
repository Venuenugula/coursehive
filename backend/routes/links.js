const express = require('express');
const { body, validationResult } = require('express-validator');
const Link = require('../models/Link');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const UserHistory = require('../models/UserHistory');
const { auth, optionalAuth } = require('../middleware/auth');
const openaiService = require('../services/openaiService');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/links
// @desc    Add a new link (scraped or manual)
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be 1-200 characters'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, description = '', sourceSite } = req.body;

    // Check if link already exists
    const existingLink = await Link.findOne({ url });
    if (existingLink) {
      return res.status(400).json({ message: 'Link already exists' });
    }

    // Use OpenAI to categorize the link
    const categorization = await openaiService.categorizeLink(title, description, url);

    // Find or create subject
    let subject = await Subject.findOne({ name: categorization.subject });
    if (!subject) {
      subject = new Subject({
        name: categorization.subject,
        description: `Resources related to ${categorization.subject}`,
        icon: 'book',
        color: '#3B82F6'
      });
      await subject.save();
    }

    // Find or create topic
    let topic = await Topic.findOne({ 
      name: categorization.topic, 
      subject: subject._id 
    });
    if (!topic) {
      topic = new Topic({
        name: categorization.topic,
        description: `Resources related to ${categorization.topic}`,
        subject: subject._id
      });
      await topic.save();
    }

    // Create the link
    const link = new Link({
      title,
      description,
      url,
      sourceSite: sourceSite || new URL(url).hostname,
      subject: subject._id,
      topic: topic._id,
      subtopic: categorization.subtopic,
      tags: categorization.tags,
      difficulty: categorization.difficulty,
      aiGenerated: true,
      aiConfidence: categorization.confidence,
      metadata: {
        language: 'en'
      }
    });

    await link.save();

    // Update counts
    await Subject.findByIdAndUpdate(subject._id, { $inc: { linkCount: 1 } });
    await Topic.findByIdAndUpdate(topic._id, { $inc: { linkCount: 1 } });

    res.status(201).json({
      message: 'Link added successfully',
      link: await Link.findById(link._id)
        .populate('subject', 'name color icon')
        .populate('topic', 'name')
    });
  } catch (error) {
    console.error('Add link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/links
// @desc    Get links by subject/topic/tags
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      subject, 
      topic, 
      tags, 
      difficulty, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    if (subject) {
      const subjectDoc = await Subject.findOne({ name: new RegExp(subject, 'i') });
      if (subjectDoc) filter.subject = subjectDoc._id;
    }
    
    if (topic) {
      const topicDoc = await Topic.findOne({ name: new RegExp(topic, 'i') });
      if (topicDoc) filter.topic = topicDoc._id;
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
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

    const links = await Link.find(filter)
      .populate('subject', 'name color icon')
      .populate('topic', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Link.countDocuments(filter);

    res.json({
      links,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/links/:id/click
// @desc    Increment click count and save history
// @access  Private
router.post('/:id/click', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Increment click count
    await Link.findByIdAndUpdate(req.params.id, { $inc: { clickCount: 1 } });
    await Topic.findByIdAndUpdate(link.topic, { $inc: { clickCount: 1 } });

    // Create user history record
    const userHistory = new UserHistory({
      user: req.user._id,
      link: req.params.id,
      action: 'click',
      clickedAt: new Date(),
      sessionId: req.headers['x-session-id'] || 'unknown',
      referrer: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || ''
    });

    await userHistory.save();

    res.json({ message: 'Click recorded successfully' });
  } catch (error) {
    console.error('Record click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/links/:id/save
// @desc    Save/unsave a link for user
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'save' or 'unsave'
    const link = await Link.findById(req.params.id);
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    if (action === 'save') {
      // Add user to savedByUsers if not already there
      if (!link.savedByUsers.includes(req.user._id)) {
        await Link.findByIdAndUpdate(req.params.id, { 
          $addToSet: { savedByUsers: req.user._id } 
        });
      }
    } else if (action === 'unsave') {
      // Remove user from savedByUsers
      await Link.findByIdAndUpdate(req.params.id, { 
        $pull: { savedByUsers: req.user._id } 
      });
    }

    // Create user history record
    const userHistory = new UserHistory({
      user: req.user._id,
      link: req.params.id,
      action: action,
      saved: action === 'save'
    });

    await userHistory.save();

    res.json({ message: `Link ${action}d successfully` });
  } catch (error) {
    console.error('Save/unsave link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/links/:id/rate
// @desc    Rate a link
// @access  Private
router.post('/:id/rate', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, review = '' } = req.body;
    const link = await Link.findById(req.params.id);
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Remove existing rating from this user
    link.userRatings = link.userRatings.filter(r => r.user.toString() !== req.user._id.toString());
    
    // Add new rating
    link.userRatings.push({
      user: req.user._id,
      rating,
      review
    });

    await link.save();

    // Create user history record
    const userHistory = new UserHistory({
      user: req.user._id,
      link: req.params.id,
      action: 'rate',
      rating,
      review
    });

    await userHistory.save();

    res.json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error('Rate link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/links/recommendations/:userId
// @desc    Get personalized recommendations for user
// @access  Private
router.get('/recommendations/:userId', auth, async (req, res) => {
  try {
    // Only allow users to get their own recommendations or admins
    if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user's click history
    const userHistory = await UserHistory.find({ user: req.params.userId })
      .populate('link', 'subject topic difficulty tags')
      .sort({ clickedAt: -1 })
      .limit(100);

    // Extract preferences from history
    const preferences = {
      subjects: [...new Set(userHistory.map(h => h.link?.subject?.name).filter(Boolean))],
      topics: [...new Set(userHistory.map(h => h.link?.topic?.name).filter(Boolean))],
      difficulties: [...new Set(userHistory.map(h => h.link?.difficulty).filter(Boolean))],
      tags: [...new Set(userHistory.flatMap(h => h.link?.tags || []))]
    };

    // Get AI recommendations
    const aiRecommendations = await openaiService.generateRecommendations(userHistory, preferences);

    // Find matching links
    const recommendations = [];
    for (const rec of aiRecommendations) {
      const filter = { status: 'active' };
      
      if (rec.subject) {
        const subject = await Subject.findOne({ name: new RegExp(rec.subject, 'i') });
        if (subject) filter.subject = subject._id;
      }
      
      if (rec.topic) {
        const topic = await Topic.findOne({ name: new RegExp(rec.topic, 'i') });
        if (topic) filter.topic = topic._id;
      }
      
      if (rec.difficulty) {
        filter.difficulty = rec.difficulty;
      }

      const links = await Link.find(filter)
        .populate('subject', 'name color icon')
        .populate('topic', 'name')
        .sort({ clickCount: -1 })
        .limit(5);

      recommendations.push({
        category: rec.reason || 'Recommended for you',
        links
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/links/subjects
// @desc    Get all subjects
// @access  Public
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .sort({ name: 1 });
    
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/links/topics
// @desc    Get topics by subject
// @access  Public
router.get('/topics', async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = { isActive: true };
    
    if (subject) {
      const subjectDoc = await Subject.findOne({ name: new RegExp(subject, 'i') });
      if (subjectDoc) filter.subject = subjectDoc._id;
    }

    const topics = await Topic.find(filter)
      .populate('subject', 'name color icon')
      .sort({ clickCount: -1 });
    
    res.json({ topics });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
