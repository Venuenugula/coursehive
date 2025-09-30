const express = require('express');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const Attempt = require('../models/Attempt');
const Analytics = require('../models/Analytics');
const { auth, optionalAuth, adminAuth } = require('../middleware/auth');
const axios = require('axios');
const NotificationService = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/tests
// @desc    Get all tests with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      subject, 
      isPublic = true, 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      viewType = 'all'
    } = req.query;

    // Build filter object
    const filter = {};
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (isPublic !== 'false') filter.isPublic = true;
    
    // Apply view type filters
    if (viewType === 'my' && req.user) {
      // Get user's created tests
      filter.createdBy = req.user._id;
    } else if (viewType === 'history' && req.user) {
      // Get tests the user has attempted
      const attempts = await Attempt.find({ userId: req.user._id }).select('testId');
      const testIds = attempts.map(attempt => attempt.testId);
      filter._id = { $in: testIds };
    }
    
    // Only show approved tests to regular users, admins can see all
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'approved';
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

    const tests = await Test.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Test.countDocuments(filter);

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
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/my-submissions
// @desc    Get user's submitted tests
// @access  Private
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tests = await Test.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Test.countDocuments({ createdBy: req.user._id });

    res.json({
      tests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/pending
// @desc    Get pending tests for admin review
// @access  Private (Admin only)
router.get('/pending', adminAuth, async (req, res) => {
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
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get pending tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/categories
// @desc    Get test categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'government-exams',
        name: 'Government Exams',
        description: 'UPSC, SSC, Banking, Railway, and other government competitive exams',
        subjects: ['General Knowledge', 'Current Affairs', 'Quantitative Aptitude', 'English', 'Reasoning'],
        icon: '🏛️'
      },
      {
        id: 'programming',
        name: 'Programming & Technology',
        description: 'Software development, web development, and computer science',
        subjects: ['JavaScript', 'Python', 'Java', 'C++', 'Data Structures', 'Algorithms', 'Web Development'],
        icon: '💻'
      },
      {
        id: 'engineering',
        name: 'Engineering',
        description: 'ECE, CSE, Mechanical, Civil, and other engineering disciplines',
        subjects: ['Electronics', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry'],
        icon: '⚙️'
      },
      {
        id: 'history',
        name: 'History & Social Sciences',
        description: 'World history, Indian history, geography, and social studies',
        subjects: ['Ancient History', 'Medieval History', 'Modern History', 'World History', 'Geography'],
        icon: '📚'
      },
      {
        id: 'science',
        name: 'Science & Mathematics',
        description: 'Physics, Chemistry, Biology, and Mathematics',
        subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Statistics'],
        icon: '🔬'
      },
      {
        id: 'language',
        name: 'Languages',
        description: 'English, Hindi, and other language proficiency tests',
        subjects: ['English Grammar', 'Hindi', 'Vocabulary', 'Comprehension', 'Literature'],
        icon: '📝'
      }
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/trending
// @desc    Get trending tests
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trendingTests = await Test.find({ 
      isPublic: true, 
      status: 'approved' 
    })
    .sort({ 'stats.totalAttempts': -1, 'stats.averageScore': -1 })
    .limit(parseInt(limit))
    .populate('createdBy', 'name email')
    .select('title description subject duration totalMarks stats tags');

    res.json({ tests: trendingTests });
  } catch (error) {
    console.error('Get trending tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/popular
// @desc    Get popular tests by category
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { category, limit = 5 } = req.query;
    
    const filter = { isPublic: true, status: 'approved' };
    if (category) {
      filter.subject = new RegExp(category, 'i');
    }
    
    const popularTests = await Test.find(filter)
      .sort({ 'stats.totalAttempts': -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .select('title description subject duration totalMarks stats tags');

    res.json({ tests: popularTests });
  } catch (error) {
    console.error('Get popular tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/history
// @desc    Get user's test history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user._id })
      .populate('testId', 'title description')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ attempts });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/:id
// @desc    Get test by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user can access this test
    if (!test.isPublic && (!req.user || test.createdBy._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ test });
  } catch (error) {
    console.error('Get test by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests
// @desc    Create new test
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
  body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const testData = {
      ...req.body,
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    };

    const test = new Test(testData);
    await test.save();

    res.status(201).json({
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests/:id/start
// @desc    Start a test attempt
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user can take this test
    if (!test.isPublic && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user has remaining attempts
    const existingAttempts = await Attempt.countDocuments({
      userId: req.user._id,
      testId: req.params.id
    });

    if (existingAttempts >= test.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached for this test' });
    }

    // Create new attempt
    const attempt = new Attempt({
      userId: req.user._id,
      testId: req.params.id,
      totalMarks: test.totalMarks,
      answers: test.questions.map((_, index) => ({
        questionIndex: index,
        selectedAnswer: -1,
        timeSpent: 0,
        isCorrect: false
      }))
    });

    await attempt.save();

    res.status(201).json({
      message: 'Test started successfully',
      attemptId: attempt._id,
      test: {
        _id: test._id,
        title: test.title,
        duration: test.duration,
        questions: test.questions.map(q => ({
          question: q.question,
          options: q.options,
          points: q.points
        }))
      }
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests/:id/submit
// @desc    Submit test answers
// @access  Private
router.post('/:id/submit', [
  auth,
  body('attemptId').isMongoId().withMessage('Valid attempt ID required'),
  body('answers').isArray().withMessage('Answers must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attemptId, answers } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    const test = await Test.findById(attempt.testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Calculate score
    let score = 0;
    const updatedAnswers = answers.map((answer, index) => {
      const question = test.questions[index];
      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) {
        score += question.points;
      }
      return {
        questionIndex: index,
        selectedAnswer: answer,
        timeSpent: answer.timeSpent || 0,
        isCorrect
      };
    });

    const percentage = Math.round((score / test.totalMarks) * 100);
    const timeSpent = Math.floor((Date.now() - attempt.startedAt) / 1000);

    // Update attempt
    attempt.answers = updatedAnswers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.timeSpent = timeSpent;
    attempt.status = 'completed';
    attempt.completedAt = new Date();

    await attempt.save();

    // Update test stats
    test.stats.totalAttempts += 1;
    test.stats.averageScore = ((test.stats.averageScore * (test.stats.totalAttempts - 1)) + score) / test.stats.totalAttempts;
    await test.save();

    // Update user analytics
    await updateUserAnalytics(req.user._id, test.subject, score, percentage, timeSpent);

    // Send notification for test completion
    await NotificationService.checkAndSendNotifications(req.user._id, 'test_completed', {
      testName: test.name,
      score,
      percentage,
      passed: percentage >= test.passingMarks
    });

    // Send to AI evaluator for feedback
    try {
      const aiResponse = await axios.post(`${process.env.AI_EVALUATOR_URL}/evaluate`, {
        attemptId: attempt._id,
        testId: test._id,
        userId: req.user._id,
        answers: updatedAnswers,
        questions: test.questions,
        score: score,
        percentage: percentage
      });

      if (aiResponse.data.success) {
        attempt.aiFeedbackId = aiResponse.data.feedbackId;
        await attempt.save();
      }
    } catch (aiError) {
      console.error('AI evaluator error:', aiError);
      // Continue without AI feedback
    }

    res.json({
      message: 'Test submitted successfully',
      result: {
        score,
        totalMarks: test.totalMarks,
        percentage,
        timeSpent,
        passed: percentage >= test.passingMarks
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/:id/attempts
// @desc    Get user's attempts for a test
// @access  Private
router.get('/:id/attempts', auth, async (req, res) => {
  try {
    const attempts = await Attempt.find({
      userId: req.user._id,
      testId: req.params.id
    }).sort({ createdAt: -1 });

    res.json({ attempts });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update user analytics
async function updateUserAnalytics(userId, subject, score, percentage, timeSpent) {
  try {
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new Analytics({ userId });
    }

    // Update subject stats
    let subjectStat = analytics.subjectStats.find(stat => stat.subject === subject);
    if (!subjectStat) {
      subjectStat = {
        subject,
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0
      };
      analytics.subjectStats.push(subjectStat);
    }

    subjectStat.totalTests += 1;
    subjectStat.averageScore = ((subjectStat.averageScore * (subjectStat.totalTests - 1)) + score) / subjectStat.totalTests;
    subjectStat.bestScore = Math.max(subjectStat.bestScore, score);
    subjectStat.totalTimeSpent += timeSpent;
    subjectStat.lastAttempt = new Date();

    // Update accuracy history
    analytics.accuracyHistory.push({
      date: new Date(),
      accuracy: percentage,
      subject
    });

    // Keep only last 30 days of accuracy history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    analytics.accuracyHistory = analytics.accuracyHistory.filter(
      entry => entry.date > thirtyDaysAgo
    );

    await analytics.save();
  } catch (error) {
    console.error('Update analytics error:', error);
  }
}


module.exports = router;
