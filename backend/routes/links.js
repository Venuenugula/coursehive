const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const AdvancedAIService = require('../services/advancedAIService');
const LinkValidationService = require('../services/linkValidationService');
const cacheService = require('../services/cacheService');
const GamificationService = require('../services/gamificationService');
const NotificationService = require('../services/notificationService');

// AI Evaluator service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

// Get all links with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      contentType,
      search,
      sortBy = 'popularityScore',
      sortOrder = 'desc',
      viewType = 'all'
    } = req.query;

    // Create cache key
    const cacheKey = cacheService.getLinksKey({ category, difficulty, contentType, search, sortBy, sortOrder, page, limit, viewType, userId: req.user?._id });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const query = { validStatus: true };
    
    // Apply view type filters
    if (viewType === 'bookmarked' && req.user) {
      // Get user's bookmarked links
      const user = await User.findById(req.user._id).select('bookmarkedLinks');
      if (user && user.bookmarkedLinks) {
        query._id = { $in: user.bookmarkedLinks };
      } else {
        query._id = { $in: [] }; // No bookmarks
      }
    } else if (viewType === 'recent' && req.user) {
      // Get recently viewed links (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.lastViewed = { $gte: thirtyDaysAgo };
    }
    
    // Apply filters
    if (category) {
      query['categories.primary'] = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (contentType) {
      query.contentType = contentType;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const links = await Link.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('engagement.bookmarks', 'name email')
      .exec();

    const total = await Link.countDocuments(query);

    const response = {
      links,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };

    // Cache the response for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.json(response);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Get trending links
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Create cache key
    const cacheKey = cacheService.getTrendingKey(`week_${limit}`);
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const trendingLinks = await Link.findTrending(parseInt(limit));
    
    // Cache the response for 10 minutes
    await cacheService.set(cacheKey, trendingLinks, 600);
    
    res.json(trendingLinks);
  } catch (error) {
    console.error('Error fetching trending links:', error);
    res.status(500).json({ error: 'Failed to fetch trending links' });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create cache key
    const cacheKey = cacheService.getRecommendationsKey(userId);
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's personalized recommendations
    const userProfile = user.getPersonalizedRecommendations();
    
    // Call AI service for personalized recommendations
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/personalized-recommendations`, {
      user_id: userId,
      user_interests: userProfile.interests,
      user_skills: userProfile.skills,
      click_history: user.clickHistory.map(h => h.link.toString()),
      preferred_difficulty: userProfile.difficulty,
      preferred_content_types: userProfile.contentType
    });

    // Get actual links based on AI recommendations
    const recommendations = await Link.find({
      _id: { $in: aiResponse.data.recommendations.map(r => r.linkId) },
      validStatus: true
    }).limit(20);

    const response = {
      recommendations,
      reasoning: aiResponse.data.reasoning,
      confidence: aiResponse.data.confidence
    };

    // Cache the response for 15 minutes
    await cacheService.set(cacheKey, response, 900);

    res.json(response);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Semantic search
router.post('/search', async (req, res) => {
  try {
    const { query, userContext, limit = 10 } = req.body;
    
    // Call AI service for semantic search
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/semantic-search`, {
      query,
      user_context: userContext || '',
      limit: parseInt(limit)
    });

    // Get actual links based on semantic search results
    const searchResults = await Link.find({
      _id: { $in: aiResponse.data.results.map(r => r.linkId) },
      validStatus: true
    }).limit(limit);

    res.json({
      results: searchResults,
      queryEmbeddings: aiResponse.data.query_embeddings,
      confidence: aiResponse.data.confidence
    });
  } catch (error) {
    console.error('Error in semantic search:', error);
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// Get user's bookmarks (must be before /:id route)
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const user = await User.findById(req.user._id).select('bookmarkedLinks');
    const bookmarkedLinks = await Link.find({
      _id: { $in: user.bookmarkedLinks },
      validStatus: true
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json({
      bookmarks: bookmarkedLinks,
      total: user.bookmarkedLinks.length,
      totalPages: Math.ceil(user.bookmarkedLinks.length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// Get link by ID
router.get('/:id', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id)
      .populate('engagement.bookmarks', 'name email')
      .populate('userFeedback.userId', 'name email');
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

// Track link click
router.post('/:id/click', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Update click count
    link.clickCount += 1;
    link.lastViewed = new Date(); // Track when link was last viewed
    link.updatePopularityScore();
    link.updateTrendingScore();
    await link.save();

    // Update user engagement
    const user = await User.findById(req.user._id);
    if (user) {
      user.updateEngagement(req.params.id, req.body.timeSpent || 0);
      user.checkBadges();
      await user.save();
    }

    res.json({ success: true, clickCount: link.clickCount });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Bookmark/unbookmark link
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const userId = req.user._id;
    const bookmarkIndex = link.engagement.bookmarks.indexOf(userId);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      link.engagement.bookmarks.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      link.engagement.bookmarks.push(userId);
    }

    await link.save();

    // Update user bookmarks
    const user = await User.findById(userId);
    if (user) {
      const userBookmarkIndex = user.bookmarkedLinks.findIndex(linkId => linkId.toString() === req.params.id);
      
      if (bookmarkIndex > -1) {
        // Remove from user bookmarks
        user.bookmarkedLinks.splice(userBookmarkIndex, 1);
      } else {
        // Add to user bookmarks
        user.bookmarkedLinks.push(req.params.id);
      }
      
      await user.save();
    }

    res.json({ 
      success: true, 
      bookmarked: bookmarkIndex === -1,
      bookmarkCount: link.engagement.bookmarks.length 
    });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

// Rate link
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const userId = req.user.id;
    
    // Remove existing rating
    link.engagement.ratings = link.engagement.ratings.filter(
      r => r.userId.toString() !== userId
    );

    // Add new rating
    link.engagement.ratings.push({
      userId,
      rating,
      date: new Date()
    });

    // Calculate average rating
    const totalRating = link.engagement.ratings.reduce((sum, r) => sum + r.rating, 0);
    link.engagement.averageRating = totalRating / link.engagement.ratings.length;

    // Update popularity score
    link.updatePopularityScore();
    await link.save();

    res.json({ 
      success: true, 
      averageRating: link.engagement.averageRating,
      totalRatings: link.engagement.ratings.length 
    });
  } catch (error) {
    console.error('Error rating link:', error);
    res.status(500).json({ error: 'Failed to rate link' });
  }
});

// Submit feedback for link
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { feedbackType, comment } = req.body;
    
    if (!['spam', 'wrong_category', 'broken', 'misclassified', 'low_quality'].includes(feedbackType)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    link.addFeedback(req.user.id, feedbackType, comment);
    await link.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get similar links
router.get('/:id/similar', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const similarLinks = await Link.findSimilar(req.params.id, parseInt(limit));
    
    res.json(similarLinks);
  } catch (error) {
    console.error('Error fetching similar links:', error);
    res.status(500).json({ error: 'Failed to fetch similar links' });
  }
});

// AI Tutor Mode
router.post('/tutor', auth, async (req, res) => {
  try {
    const { question, context, skillLevel, subjectArea } = req.body;
    
    // Call AI service for tutor mode
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/tutor-mode`, {
      user_question: question,
      user_context: context || '',
      user_skill_level: skillLevel || 'Beginner',
      subject_area: subjectArea || 'General'
    });

    // Get suggested links
    const suggestedLinks = await Link.find({
      _id: { $in: aiResponse.data.suggested_links },
      validStatus: true
    });

    res.json({
      answer: aiResponse.data.answer,
      suggestedLinks,
      followUpQuestions: aiResponse.data.follow_up_questions,
      learningSuggestions: aiResponse.data.learning_suggestions,
      confidence: aiResponse.data.confidence
    });
  } catch (error) {
    console.error('Error in tutor mode:', error);
    res.status(500).json({ error: 'Tutor mode failed' });
  }
});

// Bulk create links (for scraper)
router.post('/bulk', async (req, res) => {
  try {
    const links = req.body;
    
    if (!Array.isArray(links)) {
      return res.status(400).json({ error: 'Expected array of links' });
    }

    const createdLinks = [];
    
    for (const linkData of links) {
      try {
        // Check if link already exists
        const existingLink = await Link.findOne({ url: linkData.url });
        if (existingLink) {
          continue; // Skip if already exists
        }

        // Create new link
        const link = new Link(linkData);
        await link.save();
        createdLinks.push(link);
      } catch (error) {
        console.error(`Error creating link ${linkData.url}:`, error.message);
        continue; // Continue with other links
      }
    }

    res.status(201).json({
      message: `Successfully created ${createdLinks.length} links`,
      created: createdLinks.length,
      total: links.length
    });
    
  } catch (error) {
    console.error('Bulk link creation error:', error);
    res.status(500).json({ error: 'Failed to create links' });
  }
});

// Admin: Add new link
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { url, title, description, content } = req.body;

    // Validate link first
    const validationResponse = await axios.post(`${AI_SERVICE_URL}/validate-link`, {
      url,
      title,
      description
    });

    if (!validationResponse.data.is_valid) {
      return res.status(400).json({ 
        error: 'Link validation failed',
        details: validationResponse.data 
      });
    }

    // Analyze link with AI
    const analysisResponse = await axios.post(`${AI_SERVICE_URL}/analyze-link`, {
      url: validationResponse.data.final_url,
      title,
      description,
      content: content || ''
    });

    // Create new link
    const link = new Link({
      url: validationResponse.data.final_url,
      title,
      description,
      summary: analysisResponse.data.summary,
      language: analysisResponse.data.language,
      categories: {
        primary: analysisResponse.data.categories[0] || 'General',
        secondary: analysisResponse.data.categories.slice(1)
      },
      difficulty: analysisResponse.data.difficulty,
      contentType: analysisResponse.data.content_type,
      tags: analysisResponse.data.tags,
      skillRelevance: analysisResponse.data.skill_relevance,
      learningPath: analysisResponse.data.learning_path,
      qualityScore: analysisResponse.data.quality_score,
      embeddings: analysisResponse.data.embeddings,
      sourceDomain: new URL(validationResponse.data.final_url).hostname,
      validStatus: true,
      lastChecked: new Date(),
      aiAnalysis: {
        sentiment: analysisResponse.data.sentiment,
        complexity: analysisResponse.data.complexity,
        educationalValue: analysisResponse.data.educational_value,
        lastAnalyzed: new Date()
      }
    });

    await link.save();

    res.status(201).json(link);
  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

// Admin: Update link
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Add version to history
    link.addVersion(req.body);
    await link.save();

    res.json(link);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Admin: Delete link
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await Link.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Export learning paths
router.get('/export/learning-paths', auth, async (req, res) => {
  try {
    const { format = 'json', subject } = req.query;
    
    let query = { validStatus: true };
    if (subject) {
      query['categories.primary'] = subject;
    }
    
    const links = await Link.find(query)
      .select('title url summary categories difficulty tags learningPath')
      .sort({ qualityScore: -1 })
      .limit(1000);
    
    if (format === 'csv') {
      const csv = convertToCSV(links);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=learning-paths.csv');
      return res.send(csv);
    }
    
    res.json({
      learningPaths: links,
      total: links.length,
      exportedAt: new Date()
    });
  } catch (error) {
    console.error('Export learning paths error:', error);
    res.status(500).json({ error: 'Failed to export learning paths' });
  }
});

// Get trending links by timeframe
router.get('/trending/:timeframe', async (req, res) => {
  try {
    const { timeframe } = req.params;
    const { limit = 20 } = req.query;
    
    const trendingLinks = await Link.findTrendingByTimeframe(timeframe, parseInt(limit));
    
    res.json(trendingLinks);
  } catch (error) {
    console.error('Error fetching trending links:', error);
    res.status(500).json({ error: 'Failed to fetch trending links' });
  }
});

// Get links by skill relevance
router.get('/skills/:skills', async (req, res) => {
  try {
    const { skills } = req.params;
    const { limit = 20 } = req.query;
    
    const skillArray = skills.split(',');
    const skillLinks = await Link.findBySkillRelevance(skillArray, parseInt(limit));
    
    res.json(skillLinks);
  } catch (error) {
    console.error('Error fetching skill links:', error);
    res.status(500).json({ error: 'Failed to fetch skill links' });
  }
});

// Advanced search with filters
router.post('/advanced-search', async (req, res) => {
  try {
    const {
      query,
      categories,
      difficulty,
      contentType,
      skillRelevance,
      qualityScore,
      timeRange,
      language,
      limit = 20,
      page = 1
    } = req.body;

    const searchQuery = { validStatus: true };
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    // Category filter
    if (categories && categories.length > 0) {
      searchQuery['categories.primary'] = { $in: categories };
    }
    
    // Difficulty filter
    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }
    
    // Content type filter
    if (contentType) {
      searchQuery.contentType = contentType;
    }
    
    // Skill relevance filter
    if (skillRelevance && skillRelevance.length > 0) {
      searchQuery.skillRelevance = { $in: skillRelevance };
    }
    
    // Quality score filter
    if (qualityScore) {
      searchQuery.qualityScore = { $gte: qualityScore };
    }
    
    // Time range filter
    if (timeRange) {
      const timeRanges = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      
      if (timeRanges[timeRange]) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - timeRanges[timeRange]);
        searchQuery.createdAt = { $gte: daysAgo };
      }
    }
    
    // Language filter
    if (language) {
      searchQuery.language = language;
    }

    const skip = (page - 1) * limit;
    
    const links = await Link.find(searchQuery)
      .sort({ qualityScore: -1, popularityScore: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('engagement.bookmarks', 'name email');

    const total = await Link.countDocuments(searchQuery);

    res.json({
      links,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Advanced search failed' });
  }
});


// Get user's recent activity
router.get('/activity', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id).select('clickHistory');
    const recentActivity = user.clickHistory
      .sort((a, b) => new Date(b.clickedAt) - new Date(a.clickedAt))
      .slice(0, parseInt(limit));

    // Populate link details
    const activityWithLinks = await Promise.all(
      recentActivity.map(async (activity) => {
        const link = await Link.findById(activity.link).select('title url categories difficulty');
        return {
          ...activity.toObject(),
          link
        };
      })
    );

    res.json(activityWithLinks);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

// Admin: Run link validation
router.post('/admin/validate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const results = await LinkValidationService.runValidationJob();
    
    res.json({
      message: 'Link validation completed',
      results
    });
  } catch (error) {
    console.error('Admin validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Admin: Get broken links
router.get('/admin/broken', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const brokenLinks = await Link.findBrokenLinks();
    
    res.json(brokenLinks);
  } catch (error) {
    console.error('Get broken links error:', error);
    res.status(500).json({ error: 'Failed to get broken links' });
  }
});

// Helper function to convert to CSV
function convertToCSV(links) {
  const headers = ['Title', 'URL', 'Summary', 'Category', 'Difficulty', 'Tags', 'Learning Path'];
  const rows = links.map(link => [
    link.title,
    link.url,
    link.summary,
    link.categories.primary,
    link.difficulty,
    link.tags.join(';'),
    link.learningPath.join(';')
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
}

module.exports = router;