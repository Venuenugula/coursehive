import React, { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Lightbulb,
  ArrowRight,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AITutor = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const tutorMutation = useMutation(
    (data) => axios.post('/api/links/tutor', data).then(res => res.data)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      const response = await tutorMutation.mutateAsync({
        question,
        context: context || user?.profile?.subjects?.join(', ') || '',
        skillLevel: user?.profile?.preferredDifficulty || 'Beginner',
        subjectArea: user?.profile?.subjects?.[0] || 'General'
      });

      const tutorMessage = {
        type: 'tutor',
        content: response.answer,
        suggestedLinks: response.suggestedLinks,
        followUpQuestions: response.followUpQuestions,
        learningSuggestions: response.learningSuggestions,
        confidence: response.confidence,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, tutorMessage]);
    } catch (error) {
      console.error('Error in tutor mode:', error);
      const errorMessage = {
        type: 'tutor',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    }
  };

  const handleFollowUpQuestion = (followUpQuestion) => {
    setQuestion(followUpQuestion);
    setIsExpanded(true);
  };

  const handleSuggestedLink = (linkUrl) => {
    window.open(linkUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isExpanded && (
        <div className="mb-4 w-96 h-[600px] bg-white rounded-2xl shadow-strong border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">AI Tutor</h3>
                  <p className="text-sm text-white/80">Your learning assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Ask me anything about your studies!</p>
                <p className="text-sm mt-2">I can help explain concepts, suggest resources, and guide your learning.</p>
              </div>
            ) : (
              conversation.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`p-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Tutor-specific content */}
                        {message.type === 'tutor' && message.suggestedLinks && (
                          <div className="mt-3 space-y-2">
                            {message.suggestedLinks.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-2 opacity-80">Suggested Resources:</p>
                                <div className="space-y-1">
                                  {message.suggestedLinks.slice(0, 3).map((link, linkIndex) => (
                                    <button
                                      key={linkIndex}
                                      onClick={() => handleSuggestedLink(link.url)}
                                      className="block w-full text-left text-xs p-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
                                    >
                                      <BookOpen className="h-3 w-3 inline mr-1" />
                                      {link.title}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-2 opacity-80">Follow-up Questions:</p>
                                <div className="space-y-1">
                                  {message.followUpQuestions.slice(0, 2).map((q, qIndex) => (
                                    <button
                                      key={qIndex}
                                      onClick={() => handleFollowUpQuestion(q)}
                                      className="block w-full text-left text-xs p-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
                                    >
                                      {q}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {message.learningSuggestions && message.learningSuggestions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-2 opacity-80">Learning Suggestions:</p>
                                <div className="space-y-1">
                                  {message.learningSuggestions.slice(0, 2).map((suggestion, sIndex) => (
                                    <div key={sIndex} className="text-xs p-2 bg-white/20 rounded">
                                      <Lightbulb className="h-3 w-3 inline mr-1" />
                                      {suggestion}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs opacity-60 mt-2">
                              Confidence: {Math.round(message.confidence * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {tutorMutation.isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Context (optional)
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="What subject or topic are you studying?"
                  className="input text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask your question..."
                  className="input flex-1 text-sm"
                  disabled={tutorMutation.isLoading}
                />
                <button
                  type="submit"
                  disabled={!question.trim() || tutorMutation.isLoading}
                  className="btn btn-primary p-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full shadow-strong hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        {isExpanded ? (
          <ArrowRight className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

export default AITutor;
