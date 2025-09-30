import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  ExternalLink,
  Loader,
  Sparkles,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AITutor = () => {
  const { user } = require('../contexts/AuthContext');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: 'bot',
      content: `Hello! I'm your AI tutor. I'm here to help you learn and understand concepts. What would you like to know about?`,
      timestamp: new Date(),
      suggestedLinks: [],
      followUpQuestions: [
        "What programming languages should I learn?",
        "How do I get started with machine learning?",
        "Can you explain data structures?",
        "What are the best practices for web development?"
      ]
    };
    setMessages([welcomeMessage]);
    setSuggestedQuestions(welcomeMessage.followUpQuestions);
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => axios.post('/api/links/tutor', messageData),
    {
      onSuccess: (response) => {
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: response.data.answer,
          timestamp: new Date(),
          suggestedLinks: response.data.suggestedLinks || [],
          followUpQuestions: response.data.followUpQuestions || [],
          confidence: response.data.confidence,
          difficultyLevel: response.data.difficulty_level,
          relatedConcepts: response.data.related_concepts || []
        };
        
        setMessages(prev => [...prev, botMessage]);
        setSuggestedQuestions(botMessage.followUpQuestions);
        setIsTyping(false);
      },
      onError: (error) => {
        const errorMessage = {
          id: Date.now(),
          type: 'bot',
          content: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
          timestamp: new Date(),
          suggestedLinks: [],
          followUpQuestions: ["Can you help me with something else?"]
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }
  );

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Prepare context
    const recentMessages = messages.slice(-5).map(msg => 
      `${msg.type}: ${msg.content}`
    ).join('\n');

    const messageData = {
      question: message,
      context: recentMessages,
      skillLevel: user?.profile?.preferredDifficulty || 'Beginner',
      subjectArea: user?.profile?.subjects?.[0] || 'General'
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleSuggestedLink = (link) => {
    window.open(link.url, '_blank');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                  <Brain className="h-10 w-10 mr-3 text-purple-600" />
                  AI Tutor Mode
                </h1>
                <p className="text-xl text-gray-600">
                  Get personalized learning guidance and answers to your questions
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Your Skill Level</div>
                <div className="text-lg font-semibold text-gray-900">
                  {user?.profile?.preferredDifficulty || 'Beginner'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="coursehive-card p-6 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-purple-500 text-white'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.confidence && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                                {Math.round(message.confidence * 100)}% confident
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bot message extras */}
                      {message.type === 'bot' && (
                        <div className="mt-3 ml-11 space-y-3">
                          {/* Difficulty Level */}
                          {message.difficultyLevel && (
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-gray-500" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(message.difficultyLevel)}`}>
                                {message.difficultyLevel} Level
                              </span>
                            </div>
                          )}

                          {/* Related Concepts */}
                          {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-1" />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Related Concepts:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.relatedConcepts.map((concept, index) => (
                                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                      {concept}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Suggested Links */}
                          {message.suggestedLinks && message.suggestedLinks.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <BookOpen className="h-4 w-4 text-blue-500 mt-1" />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Suggested Resources:</p>
                                <div className="space-y-1">
                                  {message.suggestedLinks.slice(0, 3).map((link, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleSuggestedLink(link)}
                                      className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900 line-clamp-1">
                                          {link.title}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-blue-500" />
                                      </div>
                                      <p className="text-xs text-blue-700 line-clamp-1">
                                        {link.summary || link.description}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder="Ask me anything about learning..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={isTyping || !inputMessage.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Questions */}
            <div className="coursehive-card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    disabled={isTyping}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Tips */}
            <div className="coursehive-card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-500" />
                Learning Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900 mb-1">Ask Specific Questions</p>
                  <p>Be specific about what you want to learn or understand.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900 mb-1">Follow Up</p>
                  <p>Ask follow-up questions to deepen your understanding.</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-900 mb-1">Practice</p>
                  <p>Use the suggested resources to practice what you learn.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="coursehive-card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSendMessage("Help me create a learning plan")}
                  className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm font-medium"
                  disabled={isTyping}
                >
                  Create Learning Plan
                </button>
                <button
                  onClick={() => handleSendMessage("What should I learn next?")}
                  className="w-full p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium"
                  disabled={isTyping}
                >
                  Get Recommendations
                </button>
                <button
                  onClick={() => handleSendMessage("Explain a concept step by step")}
                  className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium"
                  disabled={isTyping}
                >
                  Step-by-Step Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;