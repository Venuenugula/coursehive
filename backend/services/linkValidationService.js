const axios = require('axios');
const Link = require('../models/Link');
const AdvancedAIService = require('./advancedAIService');

class LinkValidationService {
  constructor() {
    this.batchSize = 50;
    this.timeout = 10000;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Validate single link
  async validateSingleLink(linkId) {
    try {
      const link = await Link.findById(linkId);
      if (!link) {
        throw new Error('Link not found');
      }

      const validationResult = await this.performValidation(link.url, link.title, link.description);
      
      // Update link with validation results
      link.validStatus = validationResult.is_valid;
      link.lastChecked = new Date();
      
      if (validationResult.status_code) {
        link.metadata = link.metadata || {};
        link.metadata.statusCode = validationResult.status_code;
        link.metadata.contentType = validationResult.content_type;
        link.metadata.contentLength = validationResult.content_length;
        link.metadata.lastModified = validationResult.last_modified;
      }

      // If URL was redirected, update it
      if (validationResult.final_url && validationResult.final_url !== link.url) {
        link.addVersion({
          url: validationResult.final_url,
          title: link.title,
          description: link.description
        });
        link.url = validationResult.final_url;
      }

      await link.save();
      return validationResult;
    } catch (error) {
      console.error(`Error validating link ${linkId}:`, error);
      throw error;
    }
  }

  // Perform comprehensive validation
  async performValidation(url, title, description) {
    try {
      // Step 1: Basic HTTP validation
      const httpResult = await this.validateHttp(url);
      
      if (!httpResult.is_valid) {
        return httpResult;
      }

      // Step 2: Content validation
      const contentResult = await this.validateContent(url, title, description);
      
      // Step 3: Safety checks
      const safetyResult = await this.validateSafety(url);
      
      // Step 4: Domain quota check
      const domainResult = await this.validateDomainQuota(url);

      return {
        is_valid: httpResult.is_valid && contentResult.is_valid && safetyResult.is_safe,
        final_url: httpResult.final_url,
        status_code: httpResult.status_code,
        content_type: httpResult.content_type,
        content_length: httpResult.content_length,
        last_modified: httpResult.last_modified,
        content_validation: contentResult,
        safety_status: safetyResult,
        domain_quota_ok: domainResult
      };
    } catch (error) {
      return {
        is_valid: false,
        final_url: url,
        error: error.message
      };
    }
  }

  // HTTP validation
  async validateHttp(url) {
    try {
      const response = await axios.head(url, {
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });

      return {
        is_valid: true,
        final_url: response.request.res.responseUrl || url,
        status_code: response.status,
        content_type: response.headers['content-type'],
        content_length: response.headers['content-length'],
        last_modified: response.headers['last-modified']
      };
    } catch (error) {
      return {
        is_valid: false,
        final_url: url,
        status_code: error.response?.status || 0,
        error: error.message
      };
    }
  }

  // Content validation
  async validateContent(url, title, description) {
    try {
      // Check if content is educational
      const isEducational = this.isEducationalContent(title, description);
      
      // Check for minimum content requirements
      const hasMinimumContent = title && description && title.length > 10 && description.length > 20;
      
      // Check for spam indicators
      const isSpam = this.detectSpam(title, description);
      
      return {
        is_valid: isEducational && hasMinimumContent && !isSpam,
        is_educational: isEducational,
        has_minimum_content: hasMinimumContent,
        is_spam: isSpam,
        content_quality_score: this.calculateContentQuality(title, description)
      };
    } catch (error) {
      return {
        is_valid: false,
        error: error.message
      };
    }
  }

  // Safety validation
  async validateSafety(url) {
    try {
      // Check Safe Browsing API
      const safeBrowsingResult = await AdvancedAIService.checkSafeBrowsing(url);
      
      // Check VirusTotal API
      const virusTotalResult = await AdvancedAIService.checkVirusTotal(url);
      
      // Check for suspicious patterns
      const suspiciousPatterns = this.detectSuspiciousPatterns(url);
      
      const isSafe = safeBrowsingResult.status === 'safe' && 
                    virusTotalResult.status === 'clean' && 
                    !suspiciousPatterns;
      
      return {
        is_safe: isSafe,
        safe_browsing_status: safeBrowsingResult.status,
        virus_total_status: virusTotalResult.status,
        virus_detections: virusTotalResult.detections,
        suspicious_patterns: suspiciousPatterns,
        last_safety_check: new Date()
      };
    } catch (error) {
      return {
        is_safe: true, // Default to safe if check fails
        error: error.message
      };
    }
  }

  // Domain quota validation
  async validateDomainQuota(url) {
    try {
      const domain = new URL(url).hostname;
      return await Link.findByDomainQuota(domain, 10); // Max 10% from same domain
    } catch (error) {
      return true; // Allow if check fails
    }
  }

  // Batch validation
  async validateBatch(linkIds) {
    const results = {
      total: linkIds.length,
      validated: 0,
      valid: 0,
      invalid: 0,
      errors: 0
    };

    for (const linkId of linkIds) {
      try {
        const result = await this.validateSingleLink(linkId);
        results.validated++;
        
        if (result.is_valid) {
          results.valid++;
        } else {
          results.invalid++;
        }
      } catch (error) {
        results.errors++;
        console.error(`Error validating link ${linkId}:`, error);
      }
    }

    return results;
  }

  // Find links that need validation
  async findLinksForValidation(limit = 100) {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    return Link.find({
      $or: [
        { lastChecked: { $lt: cutoffDate } },
        { lastChecked: { $exists: false } }
      ],
      validStatus: { $ne: false } // Don't re-validate known broken links
    })
    .sort({ lastChecked: 1 })
    .limit(limit);
  }

  // Cleanup broken links
  async cleanupBrokenLinks() {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const brokenLinks = await Link.find({
        validStatus: false,
        lastChecked: { $lt: cutoffDate }
      });

      console.log(`Found ${brokenLinks.length} old broken links to remove`);

      for (const link of brokenLinks) {
        // Try to find replacement
        const replacement = await this.findReplacementLink(link);
        
        if (replacement) {
          // Update references to point to replacement
          await this.updateLinkReferences(link._id, replacement._id);
        }
        
        // Remove the broken link
        await Link.findByIdAndDelete(link._id);
      }

      return brokenLinks.length;
    } catch (error) {
      console.error('Cleanup broken links error:', error);
      throw error;
    }
  }

  // Find replacement for broken link
  async findReplacementLink(brokenLink) {
    try {
      // Search for similar content
      const similarLinks = await Link.find({
        _id: { $ne: brokenLink._id },
        validStatus: true,
        'categories.primary': brokenLink.categories.primary,
        difficulty: brokenLink.difficulty,
        qualityScore: { $gte: 70 }
      })
      .sort({ qualityScore: -1 })
      .limit(5);

      return similarLinks[0] || null;
    } catch (error) {
      console.error('Find replacement error:', error);
      return null;
    }
  }

  // Update references to broken link
  async updateLinkReferences(oldLinkId, newLinkId) {
    try {
      const User = require('../models/User');
      const StudyPlan = require('../models/StudyPlan');
      
      // Update user bookmarks
      await User.updateMany(
        { bookmarkedLinks: oldLinkId },
        { $set: { 'bookmarkedLinks.$': newLinkId } }
      );
      
      // Update study plans
      await StudyPlan.updateMany(
        { 'learningPaths.links': oldLinkId },
        { $set: { 'learningPaths.$[].links.$': newLinkId } }
      );
      
      console.log(`Updated references from ${oldLinkId} to ${newLinkId}`);
    } catch (error) {
      console.error('Update references error:', error);
    }
  }

  // Helper methods
  isEducationalContent(title, description) {
    const educationalKeywords = [
      'learn', 'study', 'education', 'tutorial', 'guide', 'course',
      'lesson', 'training', 'academic', 'university', 'school',
      'knowledge', 'skill', 'development', 'programming', 'coding',
      'mathematics', 'science', 'physics', 'chemistry', 'biology',
      'history', 'literature', 'art', 'music', 'language'
    ];

    const text = `${title} ${description}`.toLowerCase();
    return educationalKeywords.some(keyword => text.includes(keyword));
  }

  detectSpam(title, description) {
    const spamIndicators = [
      'click here', 'buy now', 'free money', 'make money fast',
      'guaranteed', 'no risk', 'limited time', 'act now',
      'viagra', 'casino', 'lottery', 'winner'
    ];

    const text = `${title} ${description}`.toLowerCase();
    return spamIndicators.some(indicator => text.includes(indicator));
  }

  detectSuspiciousPatterns(url) {
    const suspiciousPatterns = [
      /bit\.ly/i,
      /tinyurl/i,
      /short\.link/i,
      /goo\.gl/i,
      /t\.co/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  calculateContentQuality(title, description) {
    let score = 0;
    
    // Title quality
    if (title && title.length > 10) score += 20;
    if (title && title.length < 200) score += 10;
    
    // Description quality
    if (description && description.length > 50) score += 20;
    if (description && description.length < 1000) score += 10;
    
    // Content indicators
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('tutorial') || text.includes('guide')) score += 15;
    if (text.includes('example') || text.includes('practice')) score += 10;
    if (text.includes('beginner') || text.includes('advanced')) score += 5;
    
    return Math.min(score, 100);
  }

  // Run validation job
  async runValidationJob() {
    try {
      console.log('Starting link validation job...');
      
      const linksToValidate = await this.findLinksForValidation(this.batchSize);
      console.log(`Found ${linksToValidate.length} links to validate`);
      
      if (linksToValidate.length === 0) {
        console.log('No links need validation');
        return;
      }

      const linkIds = linksToValidate.map(link => link._id);
      const results = await this.validateBatch(linkIds);
      
      console.log('Validation job completed:', results);
      
      // Cleanup old broken links
      const cleanedCount = await this.cleanupBrokenLinks();
      console.log(`Cleaned up ${cleanedCount} broken links`);
      
      return results;
    } catch (error) {
      console.error('Validation job error:', error);
      throw error;
    }
  }
}

module.exports = new LinkValidationService();

