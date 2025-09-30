const User = require('../models/User');
const Analytics = require('../models/Analytics');
const NotificationService = require('./notificationService');

class GamificationService {
  constructor() {
    this.badgeDefinitions = {
      // Streak badges
      streak_7: {
        name: '7-Day Streak',
        description: 'Maintained a 7-day learning streak',
        icon: '🔥',
        points: 100,
        condition: (analytics) => analytics.streaks.current >= 7
      },
      streak_30: {
        name: '30-Day Streak',
        description: 'Maintained a 30-day learning streak',
        icon: '🏆',
        points: 500,
        condition: (analytics) => analytics.streaks.current >= 30
      },
      streak_100: {
        name: 'Centurion',
        description: 'Maintained a 100-day learning streak',
        icon: '💯',
        points: 2000,
        condition: (analytics) => analytics.streaks.current >= 100
      },
      
      // Test badges
      test_master: {
        name: 'Test Master',
        description: 'Completed 50 tests',
        icon: '📝',
        points: 300,
        condition: (analytics) => analytics.totalTests >= 50
      },
      perfect_score: {
        name: 'Perfect Score',
        description: 'Achieved 100% on a test',
        icon: '💯',
        points: 200,
        condition: (analytics) => analytics.bestScore >= 100
      },
      speed_demon: {
        name: 'Speed Demon',
        description: 'Completed a test in under 5 minutes',
        icon: '⚡',
        points: 150,
        condition: (analytics) => analytics.fastestTest <= 300 // 5 minutes in seconds
      },
      
      // Learning badges
      knowledge_seeker: {
        name: 'Knowledge Seeker',
        description: 'Viewed 100 learning resources',
        icon: '📚',
        points: 200,
        condition: (analytics) => analytics.totalResourcesViewed >= 100
      },
      skill_builder: {
        name: 'Skill Builder',
        description: 'Learned 10 different skills',
        icon: '🛠️',
        points: 400,
        condition: (analytics) => analytics.skillsLearned >= 10
      },
      explorer: {
        name: 'Explorer',
        description: 'Explored 5 different subject areas',
        icon: '🗺️',
        points: 300,
        condition: (analytics) => analytics.subjectsExplored >= 5
      },
      
      // Community badges
      forum_contributor: {
        name: 'Forum Contributor',
        description: 'Made 25 forum posts',
        icon: '💬',
        points: 250,
        condition: (analytics) => analytics.forumPosts >= 25
      },
      helpful_member: {
        name: 'Helpful Member',
        description: 'Received 10 helpful votes',
        icon: '👍',
        points: 200,
        condition: (analytics) => analytics.helpfulVotes >= 10
      },
      mentor: {
        name: 'Mentor',
        description: 'Helped 5 other users',
        icon: '👨‍🏫',
        points: 500,
        condition: (analytics) => analytics.usersHelped >= 5
      },
      
      // Special badges
      early_adopter: {
        name: 'Early Adopter',
        description: 'Joined CourseHive in beta',
        icon: '🚀',
        points: 100,
        condition: (analytics) => analytics.isEarlyAdopter
      },
      content_creator: {
        name: 'Content Creator',
        description: 'Created 10 tests or resources',
        icon: '✍️',
        points: 400,
        condition: (analytics) => analytics.contentCreated >= 10
      },
      top_performer: {
        name: 'Top Performer',
        description: 'Ranked in top 10% of users',
        icon: '🥇',
        points: 1000,
        condition: (analytics) => analytics.leaderboardRank <= 10
      }
    };
  }

  // Check and award badges
  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId);
      const analytics = await Analytics.findOne({ userId });
      
      if (!user || !analytics) return [];

      const newBadges = [];
      const currentBadgeTypes = user.badges.map(badge => badge.type);

      for (const [badgeType, badgeDef] of Object.entries(this.badgeDefinitions)) {
        if (!currentBadgeTypes.includes(badgeType) && badgeDef.condition(analytics)) {
          const badge = {
            type: badgeType,
            name: badgeDef.name,
            description: badgeDef.description,
            icon: badgeDef.icon,
            points: badgeDef.points,
            earnedAt: new Date()
          };

          user.badges.push(badge);
          newBadges.push(badge);

          // Award points
          await this.awardPoints(userId, badgeDef.points, `Badge: ${badgeDef.name}`);

          // Send notification
          await NotificationService.checkAndSendNotifications(userId, 'achievement_unlocked', {
            achievementName: badgeDef.name,
            achievementDescription: badgeDef.description,
            points: badgeDef.points
          });
        }
      }

      if (newBadges.length > 0) {
        await user.save();
        await this.updateLeaderboard(userId);
      }

      return newBadges;
    } catch (error) {
      console.error('Check badges error:', error);
      return [];
    }
  }

  // Award points to user
  async awardPoints(userId, points, reason) {
    try {
      let analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        analytics = new Analytics({ userId });
      }

      analytics.totalPoints = (analytics.totalPoints || 0) + points;
      analytics.pointsHistory.push({
        points,
        reason,
        date: new Date()
      });

      // Keep only last 100 point transactions
      if (analytics.pointsHistory.length > 100) {
        analytics.pointsHistory = analytics.pointsHistory.slice(-100);
      }

      await analytics.save();
      return analytics.totalPoints;
    } catch (error) {
      console.error('Award points error:', error);
    }
  }

  // Update user streak
  async updateStreak(userId) {
    try {
      let analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        analytics = new Analytics({ userId });
      }

      const today = new Date();
      const lastActivity = analytics.lastActivity ? new Date(analytics.lastActivity) : null;
      
      if (lastActivity) {
        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          analytics.streaks.current = (analytics.streaks.current || 0) + 1;
          analytics.streaks.longest = Math.max(analytics.streaks.longest || 0, analytics.streaks.current);
        } else if (daysDiff > 1) {
          // Streak broken
          analytics.streaks.current = 1;
        }
        // If daysDiff === 0, same day, don't change streak
      } else {
        // First activity
        analytics.streaks.current = 1;
        analytics.streaks.longest = 1;
      }

      analytics.lastActivity = today;
      await analytics.save();

      // Check for streak milestones
      await this.checkStreakMilestones(userId, analytics.streaks.current);

      return analytics.streaks;
    } catch (error) {
      console.error('Update streak error:', error);
    }
  }

  // Check streak milestones
  async checkStreakMilestones(userId, currentStreak) {
    const milestones = [7, 14, 30, 60, 100];
    
    for (const milestone of milestones) {
      if (currentStreak === milestone) {
        await NotificationService.checkAndSendNotifications(userId, 'streak_milestone', {
          streakDays: milestone
        });
        
        // Award bonus points for milestones
        const bonusPoints = milestone * 10;
        await this.awardPoints(userId, bonusPoints, `${milestone}-day streak milestone`);
      }
    }
  }

  // Calculate user level based on points
  calculateLevel(points) {
    const levels = [
      { level: 1, points: 0, name: 'Beginner' },
      { level: 2, points: 500, name: 'Learner' },
      { level: 3, points: 1000, name: 'Student' },
      { level: 4, points: 2000, name: 'Scholar' },
      { level: 5, points: 4000, name: 'Expert' },
      { level: 6, points: 8000, name: 'Master' },
      { level: 7, points: 15000, name: 'Grandmaster' },
      { level: 8, points: 30000, name: 'Legend' }
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].points) {
        return levels[i];
      }
    }

    return levels[0];
  }

  // Update leaderboard
  async updateLeaderboard(userId) {
    try {
      const analytics = await Analytics.findOne({ userId });
      if (!analytics) return;

      // Calculate leaderboard score
      const streakScore = analytics.streaks.current * 10;
      const pointsScore = analytics.totalPoints || 0;
      const testScore = (analytics.totalTests || 0) * 5;
      const resourceScore = (analytics.totalResourcesViewed || 0) * 2;

      const leaderboardScore = streakScore + pointsScore + testScore + resourceScore;
      
      analytics.leaderboardScore = leaderboardScore;
      await analytics.save();

      // Update rankings
      await this.updateRankings();
    } catch (error) {
      console.error('Update leaderboard error:', error);
    }
  }

  // Update all user rankings
  async updateRankings() {
    try {
      const analytics = await Analytics.find({})
        .sort({ leaderboardScore: -1 })
        .select('userId leaderboardScore');

      for (let i = 0; i < analytics.length; i++) {
        analytics[i].leaderboardRank = i + 1;
        await analytics[i].save();
      }
    } catch (error) {
      console.error('Update rankings error:', error);
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 50, timeframe = 'all') {
    try {
      let matchStage = {};
      
      if (timeframe !== 'all') {
        const timeRanges = {
          'week': 7,
          'month': 30,
          'year': 365
        };
        
        if (timeRanges[timeframe]) {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - timeRanges[timeframe]);
          matchStage.lastActivity = { $gte: daysAgo };
        }
      }

      const leaderboard = await Analytics.aggregate([
        { $match: matchStage },
        { $sort: { leaderboardScore: -1 } },
        { $limit: limit },
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
            leaderboardScore: 1,
            'streaks.current': 1,
            'streaks.longest': 1,
            totalPoints: 1,
            totalTests: 1,
            totalResourcesViewed: 1,
            badges: '$user.badges'
          }
        }
      ]);

      return leaderboard;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  }

  // Get user's gamification stats
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId).select('badges');
      const analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        return {
          level: this.calculateLevel(0),
          totalPoints: 0,
          badges: [],
          streak: { current: 0, longest: 0 },
          leaderboardRank: 0,
          nextBadge: null
        };
      }

      const level = this.calculateLevel(analytics.totalPoints || 0);
      const nextBadge = this.getNextBadge(user.badges || [], analytics);

      return {
        level,
        totalPoints: analytics.totalPoints || 0,
        badges: user.badges || [],
        streak: analytics.streaks || { current: 0, longest: 0 },
        leaderboardRank: analytics.leaderboardRank || 0,
        leaderboardScore: analytics.leaderboardScore || 0,
        nextBadge,
        pointsToNextLevel: this.getPointsToNextLevel(analytics.totalPoints || 0)
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return null;
    }
  }

  // Get next achievable badge
  getNextBadge(userBadges, analytics) {
    const currentBadgeTypes = userBadges.map(badge => badge.type);
    
    for (const [badgeType, badgeDef] of Object.entries(this.badgeDefinitions)) {
      if (!currentBadgeTypes.includes(badgeType)) {
        // Check if user is close to achieving this badge
        if (this.isCloseToBadge(badgeDef, analytics)) {
          return {
            type: badgeType,
            name: badgeDef.name,
            description: badgeDef.description,
            icon: badgeDef.icon,
            points: badgeDef.points,
            progress: this.getBadgeProgress(badgeDef, analytics)
          };
        }
      }
    }

    return null;
  }

  // Check if user is close to achieving a badge
  isCloseToBadge(badgeDef, analytics) {
    // This is a simplified check - in reality, you'd have more sophisticated logic
    return Math.random() > 0.7; // 30% chance of being "close"
  }

  // Get badge progress
  getBadgeProgress(badgeDef, analytics) {
    // This would calculate actual progress towards the badge
    return Math.floor(Math.random() * 100); // Mock progress
  }

  // Get points needed for next level
  getPointsToNextLevel(currentPoints) {
    const levels = [
      { level: 1, points: 0 },
      { level: 2, points: 500 },
      { level: 3, points: 1000 },
      { level: 4, points: 2000 },
      { level: 5, points: 4000 },
      { level: 6, points: 8000 },
      { level: 7, points: 15000 },
      { level: 8, points: 30000 }
    ];

    for (let i = 0; i < levels.length - 1; i++) {
      if (currentPoints >= levels[i].points && currentPoints < levels[i + 1].points) {
        return levels[i + 1].points - currentPoints;
      }
    }

    return 0; // Max level reached
  }

  // Daily challenges
  async generateDailyChallenge(userId) {
    const challenges = [
      {
        type: 'complete_test',
        title: 'Test Taker',
        description: 'Complete 3 tests today',
        target: 3,
        points: 100,
        icon: '📝'
      },
      {
        type: 'view_resources',
        title: 'Resource Explorer',
        description: 'View 10 learning resources today',
        target: 10,
        points: 50,
        icon: '📚'
      },
      {
        type: 'forum_posts',
        title: 'Community Helper',
        description: 'Make 2 forum posts today',
        target: 2,
        points: 75,
        icon: '💬'
      },
      {
        type: 'study_time',
        title: 'Focused Learner',
        description: 'Study for 60 minutes today',
        target: 60,
        points: 80,
        icon: '⏰'
      }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    // Store challenge for user
    const Challenge = require('../models/Challenge');
    const challenge = new Challenge({
      userId,
      type: randomChallenge.type,
      title: randomChallenge.title,
      description: randomChallenge.description,
      target: randomChallenge.target,
      points: randomChallenge.points,
      icon: randomChallenge.icon,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      completed: false
    });

    await challenge.save();
    return challenge;
  }
}

module.exports = new GamificationService();

