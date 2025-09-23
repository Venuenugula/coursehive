const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async categorizeLink(title, description = '', url = '') {
    try {
      if (!this.apiKey) {
        console.warn('OpenAI API key not provided, using fallback categorization');
        return this.getFallbackCategorization(title, description);
      }

      const prompt = `
Analyze this learning resource and categorize it:

Title: ${title}
Description: ${description}
URL: ${url}

Please provide a JSON response with the following structure:
{
  "subject": "The main subject area (e.g., 'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Art', 'Music', 'Languages', 'Business', 'Economics', 'Psychology', 'Philosophy', 'Geography', 'Political Science', 'Sociology', 'Engineering', 'Medicine', 'Law')",
  "topic": "The specific topic within the subject (e.g., 'Algebra', 'Machine Learning', 'Thermodynamics', 'Organic Chemistry', 'Cell Biology', 'World War II', 'Poetry', 'Digital Art', 'Classical Music', 'Spanish Grammar', 'Marketing', 'Microeconomics', 'Cognitive Psychology', 'Ethics', 'Physical Geography', 'International Relations', 'Social Theory', 'Software Engineering', 'Anatomy', 'Constitutional Law')",
  "subtopic": "A more specific subtopic (optional, can be empty string)",
  "difficulty": "beginner, intermediate, or advanced",
  "tags": ["array", "of", "relevant", "tags"],
  "confidence": 0.95
}

Only return the JSON object, no other text.
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content categorizer. Analyze learning resources and categorize them accurately.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content.trim();
      const categorization = JSON.parse(content);

      return {
        subject: categorization.subject,
        topic: categorization.topic,
        subtopic: categorization.subtopic || '',
        difficulty: categorization.difficulty || 'beginner',
        tags: categorization.tags || [],
        confidence: categorization.confidence || 0.8
      };
    } catch (error) {
      console.error('OpenAI categorization error:', error);
      return this.getFallbackCategorization(title, description);
    }
  }

  getFallbackCategorization(title, description) {
    // Simple keyword-based fallback categorization
    const text = `${title} ${description}`.toLowerCase();
    
    let subject = 'General';
    let topic = 'General';
    let difficulty = 'beginner';
    let tags = [];

    // Subject detection
    if (text.includes('math') || text.includes('algebra') || text.includes('calculus') || text.includes('geometry')) {
      subject = 'Mathematics';
      topic = 'General Mathematics';
    } else if (text.includes('programming') || text.includes('code') || text.includes('software') || text.includes('computer')) {
      subject = 'Computer Science';
      topic = 'Programming';
    } else if (text.includes('physics') || text.includes('mechanics') || text.includes('thermodynamics')) {
      subject = 'Physics';
      topic = 'General Physics';
    } else if (text.includes('chemistry') || text.includes('organic') || text.includes('inorganic')) {
      subject = 'Chemistry';
      topic = 'General Chemistry';
    } else if (text.includes('biology') || text.includes('cell') || text.includes('genetics')) {
      subject = 'Biology';
      topic = 'General Biology';
    } else if (text.includes('history') || text.includes('historical')) {
      subject = 'History';
      topic = 'World History';
    } else if (text.includes('literature') || text.includes('poetry') || text.includes('novel')) {
      subject = 'Literature';
      topic = 'General Literature';
    } else if (text.includes('art') || text.includes('painting') || text.includes('design')) {
      subject = 'Art';
      topic = 'Visual Arts';
    } else if (text.includes('music') || text.includes('musical')) {
      subject = 'Music';
      topic = 'General Music';
    } else if (text.includes('language') || text.includes('grammar') || text.includes('vocabulary')) {
      subject = 'Languages';
      topic = 'Language Learning';
    } else if (text.includes('business') || text.includes('marketing') || text.includes('finance')) {
      subject = 'Business';
      topic = 'General Business';
    } else if (text.includes('economics') || text.includes('economic')) {
      subject = 'Economics';
      topic = 'General Economics';
    } else if (text.includes('psychology') || text.includes('psychological')) {
      subject = 'Psychology';
      topic = 'General Psychology';
    } else if (text.includes('philosophy') || text.includes('philosophical')) {
      subject = 'Philosophy';
      topic = 'General Philosophy';
    } else if (text.includes('geography') || text.includes('geographical')) {
      subject = 'Geography';
      topic = 'Physical Geography';
    } else if (text.includes('politics') || text.includes('political')) {
      subject = 'Political Science';
      topic = 'General Politics';
    } else if (text.includes('sociology') || text.includes('social')) {
      subject = 'Sociology';
      topic = 'General Sociology';
    } else if (text.includes('engineering') || text.includes('engineer')) {
      subject = 'Engineering';
      topic = 'General Engineering';
    } else if (text.includes('medicine') || text.includes('medical') || text.includes('health')) {
      subject = 'Medicine';
      topic = 'General Medicine';
    } else if (text.includes('law') || text.includes('legal')) {
      subject = 'Law';
      topic = 'General Law';
    }

    // Difficulty detection
    if (text.includes('advanced') || text.includes('expert') || text.includes('professional') || text.includes('master')) {
      difficulty = 'advanced';
    } else if (text.includes('intermediate') || text.includes('medium') || text.includes('moderate')) {
      difficulty = 'intermediate';
    }

    // Extract tags from title and description
    const words = text.split(/\s+/).filter(word => word.length > 3);
    tags = words.slice(0, 5); // Take first 5 words as tags

    return {
      subject,
      topic,
      subtopic: '',
      difficulty,
      tags,
      confidence: 0.6
    };
  }

  async generateRecommendations(userHistory, preferences = {}) {
    try {
      if (!this.apiKey) {
        return this.getFallbackRecommendations(userHistory, preferences);
      }

      const prompt = `
Based on this user's learning history and preferences, suggest relevant learning resources:

User History: ${JSON.stringify(userHistory)}
Preferences: ${JSON.stringify(preferences)}

Provide 5 personalized learning resource suggestions with:
- Subject and topic recommendations
- Difficulty level suggestions
- Specific tags to look for
- Learning path recommendations

Return as JSON array of recommendation objects.
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational advisor. Provide personalized learning recommendations based on user history and preferences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI recommendations error:', error);
      return this.getFallbackRecommendations(userHistory, preferences);
    }
  }

  getFallbackRecommendations(userHistory, preferences) {
    // Simple fallback recommendations based on user history
    const subjects = userHistory.map(h => h.subject).filter(Boolean);
    const topics = userHistory.map(h => h.topic).filter(Boolean);
    const difficulties = userHistory.map(h => h.difficulty).filter(Boolean);

    const mostCommonSubject = subjects.length > 0 ? 
      subjects.sort((a, b) => subjects.filter(v => v === a).length - subjects.filter(v => v === b).length).pop() : 
      'General';

    const mostCommonDifficulty = difficulties.length > 0 ?
      difficulties.sort((a, b) => difficulties.filter(v => v === a).length - difficulties.filter(v => v === b).length).pop() :
      'beginner';

    return [
      {
        subject: mostCommonSubject,
        topic: 'Advanced Topics',
        difficulty: mostCommonDifficulty,
        reason: 'Based on your learning history'
      },
      {
        subject: mostCommonSubject,
        topic: 'Practice Exercises',
        difficulty: mostCommonDifficulty,
        reason: 'Reinforce your knowledge'
      },
      {
        subject: mostCommonSubject,
        topic: 'Related Concepts',
        difficulty: mostCommonDifficulty,
        reason: 'Expand your understanding'
      }
    ];
  }
}

module.exports = new OpenAIService();
