const Link = require('../models/Link');
const UserHistory = require('../models/UserHistory');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const axios = require('axios');

class LinkValidator {
  constructor() {
    this.batchSize = 50;
    this.timeout = 5000; // 5 seconds timeout for each request
  }

  async validateLinks() {
    console.log('Starting link validation job...');
    
    try {
      // Get links that need validation (older than 24 hours or never checked)
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const links = await Link.find({
        $or: [
          { lastCheckedAt: { $lt: cutoffDate } },
          { lastCheckedAt: { $exists: false } }
        ],
        status: { $ne: 'broken' }
      }).limit(this.batchSize);

      console.log(`Found ${links.length} links to validate`);

      const results = {
        checked: 0,
        broken: 0,
        updated: 0,
        errors: 0
      };

      for (const link of links) {
        try {
          await this.validateSingleLink(link);
          results.checked++;
          results.updated++;
        } catch (error) {
          console.error(`Error validating link ${link._id}:`, error.message);
          results.errors++;
        }
      }

      // Update click counts from user history
      await this.updateClickCounts();

      console.log('Link validation job completed:', results);
      return results;
    } catch (error) {
      console.error('Link validation job failed:', error);
      throw error;
    }
  }

  async validateSingleLink(link) {
    try {
      // Make HEAD request to check if URL is alive
      const response = await axios.head(link.url, {
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 400 // Accept 2xx and 3xx status codes
      });

      // Update last checked time
      link.lastCheckedAt = new Date();
      link.status = 'active';
      await link.save();

      console.log(`✓ Link ${link._id} is alive (${response.status})`);
    } catch (error) {
      // Mark as broken if request fails
      link.status = 'broken';
      link.lastCheckedAt = new Date();
      await link.save();

      console.log(`✗ Link ${link._id} is broken: ${error.message}`);
    }
  }

  async updateClickCounts() {
    console.log('Updating click counts from user history...');

    try {
      // Get all links
      const links = await Link.find({});
      
      for (const link of links) {
        // Count clicks from user history
        const clickCount = await UserHistory.countDocuments({
          link: link._id,
          action: 'click'
        });

        // Count saves
        const saveCount = await UserHistory.countDocuments({
          link: link._id,
          action: 'save'
        });

        // Update link counts
        await Link.findByIdAndUpdate(link._id, {
          clickCount,
          savedByUsers: await UserHistory.distinct('user', {
            link: link._id,
            action: 'save'
          })
        });

        // Update topic click count
        await Topic.findByIdAndUpdate(link.topic, {
          clickCount: await UserHistory.countDocuments({
            link: { $in: await Link.find({ topic: link.topic }).distinct('_id') },
            action: 'click'
          })
        });
      }

      console.log('Click counts updated successfully');
    } catch (error) {
      console.error('Error updating click counts:', error);
      throw error;
    }
  }

  async cleanupBrokenLinks() {
    console.log('Cleaning up broken links...');

    try {
      // Find links that have been broken for more than 30 days
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const brokenLinks = await Link.find({
        status: 'broken',
        lastCheckedAt: { $lt: cutoffDate }
      });

      console.log(`Found ${brokenLinks.length} old broken links to remove`);

      // Delete broken links and update counts
      for (const link of brokenLinks) {
        await Subject.findByIdAndUpdate(link.subject, { $inc: { linkCount: -1 } });
        await Topic.findByIdAndUpdate(link.topic, { $inc: { linkCount: -1 } });
        await Link.findByIdAndDelete(link._id);
      }

      console.log(`Removed ${brokenLinks.length} broken links`);
    } catch (error) {
      console.error('Error cleaning up broken links:', error);
      throw error;
    }
  }

  async recategorizeLinks() {
    console.log('Recategorizing links with AI...');

    try {
      const openaiService = require('../services/openaiService');
      
      // Find links that might need recategorization
      const links = await Link.find({
        aiConfidence: { $lt: 0.8 },
        aiGenerated: true
      }).limit(20);

      console.log(`Found ${links.length} links to recategorize`);

      for (const link of links) {
        try {
          const categorization = await openaiService.categorizeLink(
            link.title, 
            link.description, 
            link.url
          );

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

          // Update link
          await Link.findByIdAndUpdate(link._id, {
            subject: subject._id,
            topic: topic._id,
            subtopic: categorization.subtopic,
            tags: categorization.tags,
            difficulty: categorization.difficulty,
            aiConfidence: categorization.confidence
          });

          console.log(`✓ Recategorized link ${link._id}`);
        } catch (error) {
          console.error(`Error recategorizing link ${link._id}:`, error.message);
        }
      }

      console.log('Link recategorization completed');
    } catch (error) {
      console.error('Error in recategorization job:', error);
      throw error;
    }
  }

  async runFullValidation() {
    console.log('Running full validation cycle...');
    
    try {
      await this.validateLinks();
      await this.updateClickCounts();
      await this.cleanupBrokenLinks();
      await this.recategorizeLinks();
      
      console.log('Full validation cycle completed successfully');
    } catch (error) {
      console.error('Full validation cycle failed:', error);
      throw error;
    }
  }
}

module.exports = new LinkValidator();
