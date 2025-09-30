const mongoose = require('mongoose');
const Link = require('../models/Link');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coursehive', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const mockLinks = [
  // Programming Resources
  {
    title: "JavaScript MDN Documentation",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    description: "Comprehensive JavaScript documentation and guides from Mozilla Developer Network",
    categories: {
      primary: "Programming",
      secondary: ["JavaScript", "Web Development", "Documentation"]
    },
    difficulty: "Beginner",
    tags: ["javascript", "documentation", "web-development", "tutorial"],
    sourceDomain: "developer.mozilla.org",
    qualityScore: 95,
    popularityScore: 90,
    trendingScore: 85,
    estimatedReadTime: 45,
    language: "en",
    isFree: true,
    contentType: "article",
    targetAudience: ["students", "developers", "beginners"],
    prerequisites: [],
    learningOutcomes: [
      "Understand JavaScript fundamentals",
      "Learn modern ES6+ features",
      "Master DOM manipulation",
      "Understand asynchronous programming"
    ]
  },
  {
    title: "React Official Tutorial",
    url: "https://react.dev/learn",
    description: "Official React tutorial covering components, state, props, and hooks",
    categories: {
      primary: "Programming",
      secondary: ["React", "Frontend", "JavaScript"]
    },
    difficulty: "Intermediate",
    tags: ["react", "frontend", "javascript", "tutorial", "hooks"],
    sourceDomain: "react.dev",
    qualityScore: 98,
    popularityScore: 95,
    trendingScore: 90,
    estimatedReadTime: 120,
    language: "en",
    isFree: true,
    contentType: "tutorial",
    targetAudience: ["developers", "students"],
    prerequisites: ["JavaScript basics", "HTML", "CSS"],
    learningOutcomes: [
      "Build React components",
      "Manage component state",
      "Use React hooks",
      "Create interactive UIs"
    ]
  },
  {
    title: "Python for Data Science - Coursera",
    url: "https://www.coursera.org/learn/python-for-data-science",
    description: "Comprehensive Python course for data science and machine learning",
    categories: {
      primary: "Programming",
      secondary: ["Python", "Data Science", "Machine Learning"]
    },
    difficulty: "Intermediate",
    tags: ["python", "data-science", "machine-learning", "pandas", "numpy"],
    sourceDomain: "coursera.org",
    qualityScore: 92,
    popularityScore: 88,
    trendingScore: 82,
    estimatedReadTime: 180,
    language: "en",
    isFree: false,
    contentType: "course",
    targetAudience: ["students", "professionals", "data-scientists"],
    prerequisites: ["Basic programming knowledge"],
    learningOutcomes: [
      "Master Python for data analysis",
      "Learn pandas and numpy",
      "Understand data visualization",
      "Apply machine learning concepts"
    ]
  },

  // Government Exams Resources
  {
    title: "UPSC Civil Services Exam Guide",
    url: "https://www.upsc.gov.in/examinations/upsc-civil-services-examination-cse",
    description: "Official UPSC Civil Services Examination information and guidelines",
    categories: {
      primary: "Government Exams",
      secondary: ["UPSC", "Civil Services", "Exam Preparation"]
    },
    difficulty: "Advanced",
    tags: ["upsc", "civil-services", "government-exams", "preparation"],
    sourceDomain: "upsc.gov.in",
    qualityScore: 100,
    popularityScore: 95,
    trendingScore: 88,
    estimatedReadTime: 30,
    language: "en",
    isFree: true,
    contentType: "article",
    targetAudience: ["aspirants", "students"],
    prerequisites: ["Graduation"],
    learningOutcomes: [
      "Understand UPSC exam pattern",
      "Know eligibility criteria",
      "Plan preparation strategy",
      "Access official resources"
    ]
  },
  {
    title: "Indian Polity by Laxmikant - Complete Book",
    url: "https://www.amazon.in/Indian-Polity-M-Laxmikant/dp/9355323400",
    description: "Comprehensive book on Indian Polity and Constitution for UPSC preparation",
    categories: {
      primary: "Government Exams",
      secondary: ["Indian Polity", "Constitution", "UPSC"]
    },
    difficulty: "Intermediate",
    tags: ["indian-polity", "constitution", "upsc", "book", "laxmikant"],
    sourceDomain: "amazon.in",
    qualityScore: 96,
    popularityScore: 98,
    trendingScore: 85,
    estimatedReadTime: 600,
    language: "en",
    isFree: false,
    contentType: "article",
    targetAudience: ["upsc-aspirants", "law-students", "political-science"],
    prerequisites: ["Basic understanding of Indian history"],
    learningOutcomes: [
      "Master Indian Constitution",
      "Understand political system",
      "Learn about fundamental rights",
      "Know about governance structure"
    ]
  },

  // Engineering Resources
  {
    title: "Digital Electronics - MIT OpenCourseWare",
    url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-002-circuits-and-electronics-spring-2007/",
    description: "MIT's comprehensive course on digital circuits and electronics",
    categories: {
      primary: "Engineering",
      secondary: ["Electronics", "Digital Circuits", "ECE"]
    },
    difficulty: "Advanced",
    tags: ["digital-electronics", "circuits", "mit", "ece", "engineering"],
    sourceDomain: "ocw.mit.edu",
    qualityScore: 98,
    popularityScore: 92,
    trendingScore: 78,
    estimatedReadTime: 240,
    language: "en",
    isFree: true,
    contentType: "course",
    targetAudience: ["engineering-students", "professionals"],
    prerequisites: ["Basic physics", "Mathematics"],
    learningOutcomes: [
      "Understand digital circuit design",
      "Learn about logic gates",
      "Master sequential circuits",
      "Apply circuit analysis techniques"
    ]
  },
  {
    title: "Machine Learning Course - Stanford",
    url: "https://www.coursera.org/learn/machine-learning",
    description: "Andrew Ng's famous machine learning course covering algorithms and applications",
    categories: {
      primary: "Engineering",
      secondary: ["Machine Learning", "AI", "Computer Science"]
    },
    difficulty: "Intermediate",
    tags: ["machine-learning", "ai", "andrew-ng", "stanford", "algorithms"],
    sourceDomain: "coursera.org",
    qualityScore: 99,
    popularityScore: 96,
    trendingScore: 92,
    estimatedReadTime: 300,
    language: "en",
    isFree: true,
    contentType: "course",
    targetAudience: ["students", "professionals", "researchers"],
    prerequisites: ["Linear algebra", "Statistics", "Programming"],
    learningOutcomes: [
      "Master machine learning algorithms",
      "Understand supervised and unsupervised learning",
      "Apply ML to real-world problems",
      "Build predictive models"
    ]
  },

  // Science Resources
  {
    title: "Khan Academy Physics",
    url: "https://www.khanacademy.org/science/physics",
    description: "Free comprehensive physics courses covering mechanics, thermodynamics, and more",
    categories: {
      primary: "Science",
      secondary: ["Physics", "Mechanics", "Thermodynamics"]
    },
    difficulty: "Beginner",
    tags: ["physics", "mechanics", "thermodynamics", "khan-academy", "free"],
    sourceDomain: "khanacademy.org",
    qualityScore: 94,
    popularityScore: 90,
    trendingScore: 80,
    estimatedReadTime: 180,
    language: "en",
    isFree: true,
    contentType: "course",
    targetAudience: ["students", "beginners"],
    prerequisites: ["Basic mathematics"],
    learningOutcomes: [
      "Understand fundamental physics concepts",
      "Solve physics problems",
      "Apply physics principles",
      "Prepare for exams"
    ]
  },
  {
    title: "Chemistry LibreTexts",
    url: "https://chem.libretexts.org/",
    description: "Open-access chemistry textbooks and resources for all levels",
    categories: {
      primary: "Science",
      secondary: ["Chemistry", "Organic Chemistry", "Inorganic Chemistry"]
    },
    difficulty: "Intermediate",
    tags: ["chemistry", "organic-chemistry", "inorganic-chemistry", "textbook", "free"],
    sourceDomain: "libretexts.org",
    qualityScore: 91,
    popularityScore: 85,
    trendingScore: 75,
    estimatedReadTime: 200,
    language: "en",
    isFree: true,
    contentType: "article",
    targetAudience: ["students", "teachers", "researchers"],
    prerequisites: ["Basic chemistry knowledge"],
    learningOutcomes: [
      "Master chemical concepts",
      "Understand reaction mechanisms",
      "Learn about chemical bonding",
      "Apply chemistry principles"
    ]
  },

  // Language Learning Resources
  {
    title: "Duolingo - Learn Languages",
    url: "https://www.duolingo.com/",
    description: "Interactive language learning platform with gamified lessons",
    categories: {
      primary: "Language",
      secondary: ["English", "Spanish", "French", "German"]
    },
    difficulty: "Beginner",
    tags: ["language-learning", "english", "spanish", "french", "german", "interactive"],
    sourceDomain: "duolingo.com",
    qualityScore: 88,
    popularityScore: 95,
    trendingScore: 85,
    estimatedReadTime: 15,
    language: "en",
    isFree: true,
    contentType: "interactive",
    targetAudience: ["language-learners", "beginners"],
    prerequisites: [],
    learningOutcomes: [
      "Learn basic vocabulary",
      "Understand grammar rules",
      "Practice pronunciation",
      "Build conversation skills"
    ]
  },
  {
    title: "Grammarly - Writing Assistant",
    url: "https://www.grammarly.com/",
    description: "AI-powered writing assistant for grammar, style, and clarity",
    categories: {
      primary: "Language",
      secondary: ["English", "Writing", "Grammar"]
    },
    difficulty: "Beginner",
    tags: ["grammar", "writing", "english", "ai", "proofreading"],
    sourceDomain: "grammarly.com",
    qualityScore: 92,
    popularityScore: 88,
    trendingScore: 82,
    estimatedReadTime: 5,
    language: "en",
    isFree: true,
    contentType: "interactive",
    targetAudience: ["writers", "students", "professionals"],
    prerequisites: ["Basic English knowledge"],
    learningOutcomes: [
      "Improve writing skills",
      "Learn grammar rules",
      "Enhance clarity",
      "Avoid common mistakes"
    ]
  },

  // History Resources
  {
    title: "World History Encyclopedia",
    url: "https://www.worldhistory.org/",
    description: "Comprehensive online encyclopedia covering world history from ancient to modern times",
    categories: {
      primary: "History",
      secondary: ["World History", "Ancient History", "Medieval History"]
    },
    difficulty: "Intermediate",
    tags: ["world-history", "ancient-history", "medieval-history", "encyclopedia"],
    sourceDomain: "worldhistory.org",
    qualityScore: 93,
    popularityScore: 85,
    trendingScore: 70,
    estimatedReadTime: 60,
    language: "en",
    isFree: true,
    contentType: "article",
    targetAudience: ["students", "history-enthusiasts", "researchers"],
    prerequisites: ["Basic reading skills"],
    learningOutcomes: [
      "Understand historical events",
      "Learn about different civilizations",
      "Analyze historical patterns",
      "Develop critical thinking"
    ]
  },
  {
    title: "Crash Course World History",
    url: "https://www.youtube.com/playlist?list=PLBDA2E52FB1EF80C9",
    description: "Entertaining and educational YouTube series covering world history",
    categories: {
      primary: "History",
      secondary: ["World History", "Video", "Educational"]
    },
    difficulty: "Beginner",
    tags: ["world-history", "youtube", "crash-course", "video", "educational"],
    sourceDomain: "youtube.com",
    qualityScore: 95,
    popularityScore: 92,
    trendingScore: 88,
    estimatedReadTime: 45,
    language: "en",
    isFree: true,
    contentType: "video",
    targetAudience: ["students", "beginners", "visual-learners"],
    prerequisites: [],
    learningOutcomes: [
      "Learn history in an engaging way",
      "Understand historical context",
      "Develop historical thinking",
      "Remember key events"
    ]
  }
];

async function seedLinks() {
  try {
    console.log('Starting to seed mock links...');
    
    // Find or create a system user for links
    let systemUser = await User.findOne({ email: 'system@coursehive.com' });
    if (!systemUser) {
      systemUser = new User({
        name: 'CourseHive System',
        email: 'system@coursehive.com',
        passwordHash: 'system123', // This would be hashed in production
        role: 'admin',
        isVerified: true
      });
      await systemUser.save();
      console.log('Created system user');
    }

    // Clear existing system links (optional)
    await Link.deleteMany({ submittedBy: systemUser._id });
    console.log('Cleared existing system links');

    // Create links
    for (const linkData of mockLinks) {
      const link = new Link({
        ...linkData,
        submittedBy: systemUser._id,
        status: 'approved',
        isPublic: true,
        validStatus: true,
        lastChecked: new Date(),
        stats: {
          totalClicks: Math.floor(Math.random() * 1000),
          totalTimeSpent: Math.floor(Math.random() * 5000),
          averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          totalRatings: Math.floor(Math.random() * 100)
        }
      });
      
      await link.save();
      console.log(`Created link: ${link.title}`);
    }

    console.log(`Successfully seeded ${mockLinks.length} mock links!`);
    console.log('Link categories covered:');
    const categories = [...new Set(mockLinks.map(link => link.categories.primary))];
    categories.forEach(category => {
      const count = mockLinks.filter(link => link.categories.primary === category).length;
      console.log(`- ${category}: ${count} links`);
    });

  } catch (error) {
    console.error('Error seeding links:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedLinks();
