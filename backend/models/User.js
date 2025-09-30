const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  sources: [String] // Links that contributed to this skill
});

const learningPathSchema = new mongoose.Schema({
  title: String,
  description: String,
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }],
  completed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }],
  progress: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const bookmarkSchema = new mongoose.Schema({
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  tags: [String],
  notes: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student'
  },
  badges: [{
    type: {
      type: String,
      enum: ['streak_7', 'streak_30', 'top_10_percent', 'fast_learner', 'forum_contributor', 'test_master', 'early_adopter', 'content_creator', 'mentor']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  profile: {
    avatar: String,
    bio: String,
    location: String,
    website: String,
    subjects: [String],
    grade: String,
    institution: String,
    learningGoals: [String],
    preferredDifficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    preferredContentTypes: [String],
    timeZone: String,
    language: {
      type: String,
      default: 'en'
    }
  },
  preferences: {
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      testReminders: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      newLinks: { type: Boolean, default: true },
      trending: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    },
    appearance: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      language: {
        type: String,
        enum: ['en', 'es', 'fr', 'de'],
        default: 'en'
      },
      sidebarCollapsed: { type: Boolean, default: false }
    },
        account: {
          twoFactorAuth: { type: Boolean, default: false },
          loginNotifications: { type: Boolean, default: true },
          sessionTimeout: { type: Number, default: 30 }
        },
        pushDevices: [{
          token: String,
          type: { type: String, enum: ['web', 'android', 'ios'] },
          registeredAt: { type: Date, default: Date.now }
        }],
    personalizedFeed: {
      type: Boolean,
      default: true
    },
    aiTutorEnabled: {
      type: Boolean,
      default: true
    }
  },
  skills: [skillSchema],
  learningPaths: [learningPathSchema],
  bookmarks: [bookmarkSchema],
  clickHistory: [{
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link'
    },
    clickedAt: {
      type: Date,
      default: Date.now
    },
    sessionId: String,
    referrer: String,
    timeSpent: Number // in seconds
  }],
  engagement: {
    totalClicks: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    favoriteCategories: [String],
    favoriteTopics: [String]
  },
  aiProfile: {
    embeddings: [Number], // User preference embeddings
    interests: [String],
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'reading'
    },
    pace: {
      type: String,
      enum: ['slow', 'medium', 'fast'],
      default: 'medium'
    },
    lastAnalyzed: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  twoFactorSecret: {
    type: String,
    select: false // Don't include in queries by default for security
  },
  tempTwoFactorSecret: {
    type: String,
    select: false // Temporary secret during setup
  },
  passwordResetToken: {
    type: String,
    select: false // Password reset token
  },
  passwordResetExpires: {
    type: Date,
    select: false // Password reset token expiration
  },
  bookmarkedLinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
}, {
  timestamps: true
});

// Indexes for performance (email index is already created by unique: true)
userSchema.index({ 'engagement.lastActivity': -1 });
userSchema.index({ 'engagement.streakDays': -1 });
userSchema.index({ 'skills.skill': 1 });
userSchema.index({ 'profile.subjects': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.clickHistory;
  delete userObject.aiProfile;
  return userObject;
};

// Update engagement metrics
userSchema.methods.updateEngagement = function(linkId, timeSpent = 0) {
  this.clickHistory.push({
    link: linkId,
    timeSpent
  });
  
  this.engagement.totalClicks += 1;
  this.engagement.totalTimeSpent += timeSpent;
  this.engagement.lastActivity = new Date();
  
  // Update streak
  const today = new Date();
  const lastActivity = new Date(this.engagement.lastActivity);
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    this.engagement.streakDays += 1;
  } else if (daysDiff > 1) {
    this.engagement.streakDays = 1;
  }
};

// Add skill or update existing
userSchema.methods.updateSkill = function(skillName, level, confidence, sourceLink) {
  const existingSkill = this.skills.find(skill => skill.skill === skillName);
  
  if (existingSkill) {
    existingSkill.level = level;
    existingSkill.confidence = confidence;
    existingSkill.lastUpdated = new Date();
    if (sourceLink && !existingSkill.sources.includes(sourceLink)) {
      existingSkill.sources.push(sourceLink);
    }
  } else {
    this.skills.push({
      skill: skillName,
      level,
      confidence,
      sources: sourceLink ? [sourceLink] : []
    });
  }
};

// Get personalized recommendations
userSchema.methods.getPersonalizedRecommendations = function() {
  const userInterests = this.aiProfile.interests || [];
  const userSkills = this.skills.map(skill => skill.skill);
  const favoriteCategories = this.engagement.favoriteCategories || [];
  
  return {
    interests: userInterests,
    skills: userSkills,
    categories: favoriteCategories,
    difficulty: this.profile.preferredDifficulty,
    contentType: this.profile.preferredContentTypes
  };
};

// Check and award badges
userSchema.methods.checkBadges = function() {
  const badges = [];
  
  // Streak badges
  if (this.engagement.streakDays >= 7 && !this.badges.find(b => b.type === 'streak_7')) {
    badges.push({
      type: 'streak_7',
      description: '7-day learning streak!'
    });
  }
  
  if (this.engagement.streakDays >= 30 && !this.badges.find(b => b.type === 'streak_30')) {
    badges.push({
      type: 'streak_30',
      description: '30-day learning streak!'
    });
  }
  
  // Skill-based badges
  if (this.skills.length >= 5 && !this.badges.find(b => b.type === 'fast_learner')) {
    badges.push({
      type: 'fast_learner',
      description: 'Learned 5+ skills!'
    });
  }
  
  if (badges.length > 0) {
    this.badges.push(...badges);
  }
  
  return badges;
};

module.exports = mongoose.model('User', userSchema);