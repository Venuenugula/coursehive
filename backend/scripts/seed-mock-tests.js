const mongoose = require('mongoose');
const Test = require('../models/Test');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coursehive', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const mockTests = [
  // Government Exams - UPSC
  {
    title: "UPSC Civil Services Prelims - General Studies Paper 1",
    description: "Comprehensive mock test for UPSC Civil Services Preliminary Examination covering History, Geography, Polity, Economy, Science, and Current Affairs.",
    subject: "Government Exams",
    duration: 120, // 2 hours
    totalMarks: 200,
    passingMarks: 66, // 33%
    tags: ["UPSC", "Civil Services", "Prelims", "General Studies"],
    questions: [
      {
        question: "Which of the following is not a fundamental right under the Indian Constitution?",
        options: [
          "Right to Equality",
          "Right to Freedom",
          "Right to Property",
          "Right against Exploitation"
        ],
        correctAnswer: 2,
        explanation: "Right to Property was removed from fundamental rights by the 44th Amendment Act, 1978 and made a legal right under Article 300A.",
        topic: "Indian Polity",
        difficulty: "medium",
        points: 2
      },
      {
        question: "The Battle of Plassey was fought in which year?",
        options: ["1757", "1764", "1772", "1782"],
        correctAnswer: 0,
        explanation: "The Battle of Plassey was fought on 23rd June 1757 between the British East India Company and the Nawab of Bengal.",
        topic: "Indian History",
        difficulty: "easy",
        points: 2
      },
      {
        question: "Which of the following rivers is known as the 'Sorrow of Bengal'?",
        options: ["Ganga", "Brahmaputra", "Damodar", "Hooghly"],
        correctAnswer: 2,
        explanation: "The Damodar River is known as the 'Sorrow of Bengal' due to its frequent flooding in the past.",
        topic: "Indian Geography",
        difficulty: "medium",
        points: 2
      },
      {
        question: "The concept of 'Basic Structure' of the Constitution was propounded by the Supreme Court in which case?",
        options: [
          "Kesavananda Bharati v. State of Kerala",
          "Golak Nath v. State of Punjab",
          "Minerva Mills v. Union of India",
          "S.R. Bommai v. Union of India"
        ],
        correctAnswer: 0,
        explanation: "The Basic Structure doctrine was propounded in Kesavananda Bharati v. State of Kerala (1973).",
        topic: "Indian Polity",
        difficulty: "hard",
        points: 2
      },
      {
        question: "Which of the following is the largest planet in our solar system?",
        options: ["Earth", "Jupiter", "Saturn", "Neptune"],
        correctAnswer: 1,
        explanation: "Jupiter is the largest planet in our solar system, with a mass greater than all other planets combined.",
        topic: "General Science",
        difficulty: "easy",
        points: 2
      }
    ]
  },

  // Programming - JavaScript
  {
    title: "JavaScript Fundamentals - Complete Assessment",
    description: "Comprehensive JavaScript test covering ES6+, DOM manipulation, asynchronous programming, and modern JavaScript concepts.",
    subject: "Programming",
    duration: 90,
    totalMarks: 100,
    passingMarks: 60,
    tags: ["JavaScript", "ES6", "Web Development", "Frontend"],
    questions: [
      {
        question: "What will be the output of the following code?\n\nconsole.log(typeof null);",
        options: ["'object'", "'null'", "'undefined'", "Error"],
        correctAnswer: 0,
        explanation: "In JavaScript, typeof null returns 'object' due to a historical bug that has been preserved for compatibility.",
        topic: "JavaScript Basics",
        difficulty: "medium",
        points: 2
      },
      {
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: 0,
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length.",
        topic: "Array Methods",
        difficulty: "easy",
        points: 2
      },
      {
        question: "What is the difference between 'let' and 'var' in JavaScript?",
        options: [
          "No difference",
          "let has block scope, var has function scope",
          "var has block scope, let has function scope",
          "Both have global scope"
        ],
        correctAnswer: 1,
        explanation: "let has block scope (limited to the block in which it's declared), while var has function scope.",
        topic: "ES6+ Features",
        difficulty: "medium",
        points: 3
      },
      {
        question: "What will this code return?\n\nconst arr = [1, 2, 3];\nconst [a, ...rest] = arr;\nconsole.log(rest);",
        options: ["[1, 2, 3]", "[2, 3]", "[1, 2]", "Error"],
        correctAnswer: 1,
        explanation: "The rest operator (...) collects the remaining elements into an array. Here, 'a' gets 1, and 'rest' gets [2, 3].",
        topic: "Destructuring",
        difficulty: "medium",
        points: 3
      },
      {
        question: "Which of the following is NOT a valid way to create a Promise?",
        options: [
          "new Promise((resolve, reject) => {})",
          "Promise.resolve(value)",
          "Promise.reject(reason)",
          "Promise.create(resolve, reject)"
        ],
        correctAnswer: 3,
        explanation: "Promise.create() is not a valid method. The correct ways are new Promise(), Promise.resolve(), and Promise.reject().",
        topic: "Promises",
        difficulty: "hard",
        points: 3
      }
    ]
  },

  // Engineering - ECE
  {
    title: "Electronics and Communication Engineering - Core Concepts",
    description: "Comprehensive test covering digital electronics, analog circuits, communication systems, and signal processing.",
    subject: "Engineering",
    duration: 120,
    totalMarks: 150,
    passingMarks: 75,
    tags: ["ECE", "Electronics", "Communication", "Digital Circuits"],
    questions: [
      {
        question: "What is the output of a 2-input NAND gate when both inputs are HIGH?",
        options: ["HIGH", "LOW", "HIGH-Z", "Undefined"],
        correctAnswer: 1,
        explanation: "A NAND gate outputs LOW only when all inputs are HIGH. In all other cases, it outputs HIGH.",
        topic: "Digital Electronics",
        difficulty: "easy",
        points: 2
      },
      {
        question: "Which modulation technique is used in FM radio broadcasting?",
        options: ["AM", "FM", "PM", "QAM"],
        correctAnswer: 1,
        explanation: "FM (Frequency Modulation) is used in FM radio broadcasting due to its better noise immunity compared to AM.",
        topic: "Communication Systems",
        difficulty: "easy",
        points: 2
      },
      {
        question: "What is the Nyquist sampling theorem?",
        options: [
          "Sample rate must be at least twice the highest frequency",
          "Sample rate must be equal to the highest frequency",
          "Sample rate must be half the highest frequency",
          "Sample rate must be four times the highest frequency"
        ],
        correctAnswer: 0,
        explanation: "The Nyquist theorem states that to avoid aliasing, the sampling rate must be at least twice the highest frequency component of the signal.",
        topic: "Signal Processing",
        difficulty: "medium",
        points: 3
      },
      {
        question: "In a BJT, what happens when the base-emitter junction is forward biased and base-collector junction is reverse biased?",
        options: [
          "Cut-off mode",
          "Active mode",
          "Saturation mode",
          "Breakdown mode"
        ],
        correctAnswer: 1,
        explanation: "When BE junction is forward biased and BC junction is reverse biased, the BJT operates in active mode, allowing current amplification.",
        topic: "Analog Electronics",
        difficulty: "medium",
        points: 3
      },
      {
        question: "What is the purpose of a low-pass filter?",
        options: [
          "Pass high frequencies and block low frequencies",
          "Pass low frequencies and block high frequencies",
          "Pass all frequencies",
          "Block all frequencies"
        ],
        correctAnswer: 1,
        explanation: "A low-pass filter allows low-frequency signals to pass through while attenuating high-frequency signals.",
        topic: "Filters",
        difficulty: "easy",
        points: 2
      }
    ]
  },

  // History - World History
  {
    title: "World History - Major Events and Civilizations",
    description: "Comprehensive test covering ancient civilizations, medieval period, world wars, and modern history.",
    subject: "History",
    duration: 90,
    totalMarks: 100,
    passingMarks: 50,
    tags: ["World History", "Ancient Civilizations", "Medieval Period", "Modern History"],
    questions: [
      {
        question: "Which ancient civilization built the Great Pyramid of Giza?",
        options: ["Mesopotamian", "Egyptian", "Greek", "Roman"],
        correctAnswer: 1,
        explanation: "The Great Pyramid of Giza was built by the ancient Egyptians around 2580-2560 BCE during the Old Kingdom period.",
        topic: "Ancient Civilizations",
        difficulty: "easy",
        points: 2
      },
      {
        question: "The Renaissance period began in which country?",
        options: ["France", "Germany", "Italy", "Spain"],
        correctAnswer: 2,
        explanation: "The Renaissance began in Italy in the 14th century, particularly in Florence, and later spread to other parts of Europe.",
        topic: "Medieval Period",
        difficulty: "medium",
        points: 2
      },
      {
        question: "World War I started in which year?",
        options: ["1912", "1914", "1916", "1918"],
        correctAnswer: 1,
        explanation: "World War I started on July 28, 1914, when Austria-Hungary declared war on Serbia.",
        topic: "Modern History",
        difficulty: "easy",
        points: 2
      },
      {
        question: "Who was the leader of the Soviet Union during World War II?",
        options: ["Lenin", "Stalin", "Khrushchev", "Brezhnev"],
        correctAnswer: 1,
        explanation: "Joseph Stalin was the leader of the Soviet Union during World War II (1941-1945).",
        topic: "Modern History",
        difficulty: "medium",
        points: 2
      },
      {
        question: "The fall of the Berlin Wall occurred in which year?",
        options: ["1987", "1989", "1991", "1993"],
        correctAnswer: 1,
        explanation: "The Berlin Wall fell on November 9, 1989, marking the beginning of the end of the Cold War.",
        topic: "Modern History",
        difficulty: "medium",
        points: 2
      }
    ]
  },

  // Science - Physics
  {
    title: "Physics - Mechanics and Thermodynamics",
    description: "Comprehensive physics test covering classical mechanics, thermodynamics, and basic physics principles.",
    subject: "Science",
    duration: 90,
    totalMarks: 100,
    passingMarks: 60,
    tags: ["Physics", "Mechanics", "Thermodynamics", "Classical Physics"],
    questions: [
      {
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1,
        explanation: "The SI unit of force is the Newton (N), named after Sir Isaac Newton.",
        topic: "Units and Measurements",
        difficulty: "easy",
        points: 2
      },
      {
        question: "According to Newton's second law of motion, force equals:",
        options: [
          "Mass × Velocity",
          "Mass × Acceleration",
          "Velocity × Acceleration",
          "Mass × Distance"
        ],
        correctAnswer: 1,
        explanation: "Newton's second law states that F = ma, where F is force, m is mass, and a is acceleration.",
        topic: "Laws of Motion",
        difficulty: "easy",
        points: 2
      },
      {
        question: "What is the speed of light in vacuum?",
        options: [
          "3 × 10⁶ m/s",
          "3 × 10⁸ m/s",
          "3 × 10¹⁰ m/s",
          "3 × 10¹² m/s"
        ],
        correctAnswer: 1,
        explanation: "The speed of light in vacuum is approximately 3 × 10⁸ meters per second.",
        topic: "Light and Optics",
        difficulty: "medium",
        points: 2
      },
      {
        question: "Which law states that energy cannot be created or destroyed?",
        options: [
          "Newton's First Law",
          "Law of Conservation of Energy",
          "Ohm's Law",
          "Pascal's Law"
        ],
        correctAnswer: 1,
        explanation: "The Law of Conservation of Energy states that energy cannot be created or destroyed, only transformed from one form to another.",
        topic: "Energy",
        difficulty: "medium",
        points: 3
      },
      {
        question: "What is the relationship between pressure, volume, and temperature in an ideal gas?",
        options: [
          "PV = nRT",
          "PV = RT",
          "P = nRT/V",
          "V = nRT/P"
        ],
        correctAnswer: 0,
        explanation: "The ideal gas law is PV = nRT, where P is pressure, V is volume, n is moles, R is gas constant, and T is temperature.",
        topic: "Thermodynamics",
        difficulty: "hard",
        points: 3
      }
    ]
  },

  // Language - English
  {
    title: "English Grammar and Vocabulary - Advanced Level",
    description: "Comprehensive English test covering grammar, vocabulary, comprehension, and language skills.",
    subject: "Language",
    duration: 60,
    totalMarks: 80,
    passingMarks: 48,
    tags: ["English", "Grammar", "Vocabulary", "Comprehension"],
    questions: [
      {
        question: "Choose the correct form: 'Neither John nor his friends _____ going to the party.'",
        options: ["is", "are", "was", "were"],
        correctAnswer: 1,
        explanation: "When using 'neither...nor', the verb agrees with the subject closer to it. 'Friends' is plural, so use 'are'.",
        topic: "Subject-Verb Agreement",
        difficulty: "medium",
        points: 2
      },
      {
        question: "What is the meaning of 'ubiquitous'?",
        options: [
          "Very large",
          "Present everywhere",
          "Very expensive",
          "Very old"
        ],
        correctAnswer: 1,
        explanation: "Ubiquitous means present, appearing, or found everywhere.",
        topic: "Vocabulary",
        difficulty: "hard",
        points: 3
      },
      {
        question: "Identify the type of sentence: 'What a beautiful day it is!'",
        options: [
          "Declarative",
          "Interrogative",
          "Imperative",
          "Exclamatory"
        ],
        correctAnswer: 3,
        explanation: "This is an exclamatory sentence as it expresses strong emotion or surprise and ends with an exclamation mark.",
        topic: "Sentence Types",
        difficulty: "easy",
        points: 2
      },
      {
        question: "Choose the correct preposition: 'She is allergic _____ cats.'",
        options: ["to", "for", "with", "by"],
        correctAnswer: 0,
        explanation: "The correct preposition with 'allergic' is 'to'. We say 'allergic to cats', 'allergic to nuts', etc.",
        topic: "Prepositions",
        difficulty: "medium",
        points: 2
      },
      {
        question: "What is the passive voice of: 'They built this house in 1990.'",
        options: [
          "This house was built by them in 1990.",
          "This house is built by them in 1990.",
          "This house has been built by them in 1990.",
          "This house will be built by them in 1990."
        ],
        correctAnswer: 0,
        explanation: "The passive voice of past tense 'built' is 'was built'. The sentence becomes 'This house was built by them in 1990.'",
        topic: "Voice",
        difficulty: "medium",
        points: 3
      }
    ]
  },

  // Additional Government Exams - Banking
  {
    title: "Banking and Financial Awareness - IBPS PO Level",
    description: "Comprehensive test for banking exams covering financial awareness, banking terminology, and current affairs.",
    subject: "Government Exams",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    tags: ["Banking", "IBPS", "Financial Awareness", "Current Affairs"],
    questions: [
      {
        question: "What does RBI stand for?",
        options: [
          "Reserve Bank of India",
          "Regional Bank of India",
          "Rural Bank of India",
          "Revenue Bank of India"
        ],
        correctAnswer: 0,
        explanation: "RBI stands for Reserve Bank of India, which is the central bank of India.",
        topic: "Banking Basics",
        difficulty: "easy",
        points: 2
      },
      {
        question: "What is the current repo rate set by RBI?",
        options: ["6.25%", "6.50%", "6.75%", "7.00%"],
        correctAnswer: 1,
        explanation: "As of recent updates, the repo rate is 6.50%. (Note: This changes frequently, so check current rates)",
        topic: "Monetary Policy",
        difficulty: "medium",
        points: 3
      },
      {
        question: "Which of the following is not a public sector bank?",
        options: ["SBI", "PNB", "HDFC Bank", "Bank of Baroda"],
        correctAnswer: 2,
        explanation: "HDFC Bank is a private sector bank, while SBI, PNB, and Bank of Baroda are public sector banks.",
        topic: "Banking Structure",
        difficulty: "medium",
        points: 2
      },
      {
        question: "What does NPA stand for in banking?",
        options: [
          "Non-Performing Asset",
          "New Product Announcement",
          "National Payment Authority",
          "Net Profit Assessment"
        ],
        correctAnswer: 0,
        explanation: "NPA stands for Non-Performing Asset, which refers to loans or advances that are in default or overdue.",
        topic: "Banking Terminology",
        difficulty: "medium",
        points: 2
      },
      {
        question: "Which committee recommended the formation of NPA?",
        options: [
          "Narasimham Committee",
          "Raghuram Rajan Committee",
          "Urijit Patel Committee",
          "Shaktikanta Das Committee"
        ],
        correctAnswer: 0,
        explanation: "The Narasimham Committee recommended various banking sector reforms including the concept of NPA.",
        topic: "Banking History",
        difficulty: "hard",
        points: 3
      }
    ]
  }
];

async function seedTests() {
  try {
    console.log('Starting to seed mock tests...');
    
    // Find or create a system user for tests
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

    // Clear existing tests (optional)
    await Test.deleteMany({ createdBy: systemUser._id });
    console.log('Cleared existing system tests');

    // Create tests
    for (const testData of mockTests) {
      const test = new Test({
        ...testData,
        createdBy: systemUser._id,
        status: 'approved',
        isPublic: true,
        stats: {
          totalAttempts: Math.floor(Math.random() * 100),
          averageScore: Math.floor(Math.random() * 40) + 40,
          completionRate: Math.floor(Math.random() * 30) + 70
        }
      });
      
      await test.save();
      console.log(`Created test: ${test.title}`);
    }

    console.log(`Successfully seeded ${mockTests.length} mock tests!`);
    console.log('Test categories covered:');
    const categories = [...new Set(mockTests.map(test => test.subject))];
    categories.forEach(category => {
      const count = mockTests.filter(test => test.subject === category).length;
      console.log(`- ${category}: ${count} tests`);
    });

  } catch (error) {
    console.error('Error seeding tests:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedTests();
