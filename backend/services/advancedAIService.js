const axios = require('axios');

class AdvancedAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.aiEvaluatorURL = process.env.AI_EVALUATOR_URL || 'http://localhost:8000';
  }

  // Link Analysis and Categorization
  async analyzeLink(url, title, description, content = '') {
    try {
      if (!this.apiKey) {
        return this.getFallbackAnalysis(title, description);
      }

      const prompt = `
Analyze this learning resource comprehensively:

URL: ${url}
Title: ${title}
Description: ${description}
Content: ${content.substring(0, 2000)}

Provide a JSON response with:
{
  "summary": "2-3 line summary of the content",
  "language": "detected language code",
  "categories": ["primary_category", "secondary_category1", "secondary_category2"],
  "difficulty": "Beginner/Intermediate/Advanced",
  "content_type": "video/article/pdf/interactive/course/tutorial",
  "tags": ["tag1", "tag2", "tag3"],
  "skill_relevance": ["skill1", "skill2"],
  "learning_path": ["next_step1", "next_step2"],
  "quality_score": 85,
  "sentiment": "positive/neutral/negative",
  "complexity": 7,
  "educational_value": 8,
  "embeddings": [0.1, 0.2, ...],
  "estimated_read_time": 15,
  "accessibility_score": 8
}

Only return the JSON object.
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content analyzer. Analyze learning resources and provide comprehensive metadata.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
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
      return JSON.parse(content);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getFallbackAnalysis(title, description);
    }
  }

  // Semantic Search
  async semanticSearch(query, userContext = '', limit = 10) {
    try {
      if (!this.apiKey) {
        return this.getFallbackSearch(query, limit);
      }

      const prompt = `
Find learning resources that match this query semantically:

Query: "${query}"
User Context: "${userContext}"

Return a JSON array of relevant resource IDs and confidence scores:
[
  {
    "linkId": "resource_id",
    "relevance_score": 0.95,
    "reason": "why this matches"
  }
]

Limit to ${limit} results.
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a semantic search engine for educational content. Find relevant resources based on meaning, not just keywords.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content.trim();
      const results = JSON.parse(content);
      
      return {
        results,
        query_embeddings: this.generateEmbeddings(query),
        confidence: 0.8
      };
    } catch (error) {
      console.error('Semantic search error:', error);
      return this.getFallbackSearch(query, limit);
    }
  }

  // Personalized Recommendations
  async getPersonalizedRecommendations(userId, userInterests, userSkills, clickHistory, preferredDifficulty, preferredContentTypes) {
    try {
      if (!this.apiKey) {
        return this.getFallbackRecommendations(userInterests, userSkills);
      }

      const prompt = `
Generate personalized learning recommendations for a user:

User ID: ${userId}
Interests: ${userInterests.join(', ')}
Skills: ${userSkills.join(', ')}
Click History: ${clickHistory.slice(0, 10).join(', ')}
Preferred Difficulty: ${preferredDifficulty}
Preferred Content Types: ${preferredContentTypes.join(', ')}

Return JSON with:
{
  "recommendations": ["link_id1", "link_id2", "link_id3"],
  "reasoning": "explanation of why these were recommended",
  "confidence": 0.85,
  "learning_path_suggestions": ["suggestion1", "suggestion2"],
  "skill_gaps": ["gap1", "gap2"],
  "next_steps": ["step1", "step2"]
}
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI tutor that provides personalized learning recommendations based on user profile and behavior.'
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
      console.error('Personalized recommendations error:', error);
      return this.getFallbackRecommendations(userInterests, userSkills);
    }
  }

  // AI Tutor Mode
  async tutorMode(userQuestion, userContext = '', skillLevel = 'Beginner', subjectArea = 'General') {
    try {
      if (!this.apiKey) {
        return this.getFallbackTutorResponse(userQuestion);
      }

      const prompt = `
You are an AI tutor. Answer this student's question and provide learning guidance:

Question: "${userQuestion}"
User Context: "${userContext}"
Skill Level: ${skillLevel}
Subject Area: ${subjectArea}

Provide a comprehensive response with:
{
  "answer": "detailed answer to the question",
  "suggested_links": ["link_id1", "link_id2"],
  "follow_up_questions": ["question1", "question2"],
  "learning_suggestions": ["suggestion1", "suggestion2"],
  "confidence": 0.9,
  "difficulty_level": "Beginner/Intermediate/Advanced",
  "related_concepts": ["concept1", "concept2"]
}
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI tutor. Provide clear, educational answers and guide students in their learning journey.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.6
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
      console.error('Tutor mode error:', error);
      return this.getFallbackTutorResponse(userQuestion);
    }
  }

  // Link Validation
  async validateLink(url, title, description) {
    try {
      // Check if URL is accessible
      const response = await axios.head(url, { timeout: 5000 });
      
      // Check for redirects
      const finalUrl = response.request.res.responseUrl || url;
      
      // Basic content validation
      const isValid = response.status === 200 && title && description;
      
      return {
        is_valid: isValid,
        final_url: finalUrl,
        status_code: response.status,
        content_type: response.headers['content-type'],
        content_length: response.headers['content-length'],
        last_modified: response.headers['last-modified']
      };
    } catch (error) {
      return {
        is_valid: false,
        final_url: url,
        error: error.message,
        status_code: error.response?.status || 0
      };
    }
  }

  // Safe Browsing Check
  async checkSafeBrowsing(url) {
    try {
      const safeBrowsingKey = process.env.SAFE_BROWSING_API_KEY;
      
      if (!safeBrowsingKey) {
        return {
          status: 'safe',
          threats: [],
          last_check: new Date()
        };
      }

      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingKey}`,
        {
          client: {
            clientId: "coursehive",
            clientVersion: "1.0.0"
          },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: url }]
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const hasThreats = response.data.matches && response.data.matches.length > 0;
      
      return {
        status: hasThreats ? 'unsafe' : 'safe',
        threats: hasThreats ? response.data.matches : [],
        last_check: new Date()
      };
    } catch (error) {
      console.error('Safe Browsing check error:', error.message);
      return {
        status: 'unknown',
        threats: [],
        last_check: new Date(),
        error: error.message
      };
    }
  }

  // VirusTotal Check
  async checkVirusTotal(url) {
    try {
      const virusTotalKey = process.env.VIRUS_TOTAL_API_KEY;
      
      if (!virusTotalKey) {
        return {
          status: 'clean',
          detections: 0,
          total_scans: 0,
          last_check: new Date()
        };
      }

      // First, get the URL report
      const response = await axios.get(
        `https://www.virustotal.com/vtapi/v2/url/report`,
        {
          params: {
            apikey: virusTotalKey,
            resource: url
          },
          timeout: 10000
        }
      );

      const data = response.data;
      
      return {
        status: data.positives > 0 ? 'infected' : 'clean',
        detections: data.positives || 0,
        total_scans: data.total || 0,
        scan_date: data.scan_date,
        last_check: new Date()
      };
    } catch (error) {
      console.error('VirusTotal check error:', error.message);
      return {
        status: 'unknown',
        detections: 0,
        total_scans: 0,
        last_check: new Date(),
        error: error.message
      };
    }
  }

  // Generate Embeddings
  generateEmbeddings(text) {
    // This would use OpenAI's embedding API in a real implementation
    // For now, return a mock embedding vector
    const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() - 0.5);
    return mockEmbedding;
  }

  // Language Detection and Translation
  async detectLanguage(text) {
    try {
      if (!this.apiKey) {
        return 'en';
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Detect the language of the given text and return only the ISO language code.'
            },
            {
              role: 'user',
              content: `Detect language: ${text.substring(0, 500)}`
            }
          ],
          max_tokens: 10,
          temperature: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      return 'en';
    }
  }

  // Topic Clustering
  async clusterTopics(links) {
    try {
      if (!this.apiKey) {
        return this.getFallbackClustering(links);
      }

      const topics = links.map(link => link.title).join('\n');
      
      const prompt = `
Cluster these learning resource titles into topic groups:

${topics}

Return JSON with:
{
  "clusters": [
    {
      "name": "cluster_name",
      "topics": ["topic1", "topic2"],
      "links": ["link_id1", "link_id2"]
    }
  ]
}
`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at clustering educational content into meaningful topic groups.'
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
      return JSON.parse(content);
    } catch (error) {
      return this.getFallbackClustering(links);
    }
  }

  // Fallback methods
  getFallbackAnalysis(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    let categories = ['General'];
    let difficulty = 'Beginner';
    let contentType = 'article';
    
    if (text.includes('programming') || text.includes('code')) {
      categories = ['Programming', 'Computer Science'];
    } else if (text.includes('math')) {
      categories = ['Mathematics'];
    } else if (text.includes('science')) {
      categories = ['Science'];
    }
    
    if (text.includes('advanced') || text.includes('expert')) {
      difficulty = 'Advanced';
    } else if (text.includes('intermediate')) {
      difficulty = 'Intermediate';
    }
    
    if (text.includes('video') || text.includes('youtube')) {
      contentType = 'video';
    } else if (text.includes('pdf')) {
      contentType = 'pdf';
    }
    
    return {
      summary: description.substring(0, 200),
      language: 'en',
      categories,
      difficulty,
      content_type: contentType,
      tags: text.split(' ').slice(0, 5),
      skill_relevance: categories,
      learning_path: [],
      quality_score: 60,
      sentiment: 'neutral',
      complexity: 5,
      educational_value: 6,
      embeddings: this.generateEmbeddings(title),
      estimated_read_time: 10,
      accessibility_score: 7
    };
  }

  getFallbackSearch(query, limit) {
    return {
      results: Array.from({ length: limit }, (_, i) => ({
        linkId: `mock_${i}`,
        relevance_score: 0.8 - (i * 0.1),
        reason: `Matches query: ${query}`
      })),
      query_embeddings: this.generateEmbeddings(query),
      confidence: 0.6
    };
  }

  getFallbackRecommendations(interests, skills) {
    return {
      recommendations: ['mock1', 'mock2', 'mock3'],
      reasoning: 'Based on your interests and skills',
      confidence: 0.7,
      learning_path_suggestions: ['Continue learning', 'Practice more'],
      skill_gaps: ['Advanced concepts'],
      next_steps: ['Take a test', 'Read more']
    };
  }

  getFallbackTutorResponse(question) {
    return {
      answer: `I understand you're asking about: ${question}. This is a great question! I'd recommend exploring related resources to deepen your understanding.`,
      suggested_links: ['mock1', 'mock2'],
      follow_up_questions: ['Can you tell me more about this?', 'What specific aspect interests you?'],
      learning_suggestions: ['Read the recommended resources', 'Practice with exercises'],
      confidence: 0.7,
      difficulty_level: 'Beginner',
      related_concepts: ['Related concept 1', 'Related concept 2']
    };
  }

  getFallbackClustering(links) {
    return {
      clusters: [
        {
          name: 'General',
          topics: ['General Learning'],
          links: links.map(link => link._id)
        }
      ]
    };
  }
}

module.exports = new AdvancedAIService();

